import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import {
  RegistrantDto,
  VerifyAttendanceDto,
} from './dtos/Registrant.dto';
import { Registrant, UploadKeyDto } from './entities/registrant.entity';
import { environment } from './environment';
import * as crypto from 'crypto';
import * as multer from 'multer';
import * as multers3 from 'multer-s3';
import { S3 } from 'aws-sdk';
import { StatsDto } from './dtos/Stats.dto';
import { EmailService, EMAIL } from './email/email.service';
import { build, send } from 'revolutionuc-emails';
import { Attendee } from './entities/attendee.entity';

const currentInfoEmail: EMAIL = environment.CURRENT_INFO_EMAIL as EMAIL;

function getAge(birthDateString: string) {
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Registrant) private readonly registrantRepository: Repository<Registrant>,
    @InjectRepository(Attendee) private readonly attendeeRepository: Repository<Attendee>,
    private emailService: EmailService
  ) {}

  private userCryptoAlgorithm = 'aes-256-ctr';

  private async getRegistrantsConfirmedCount(): Promise<number> {
    return await this.registrantRepository.count({
      confirmedAttendance1: 'true',
    });
  }

  async register(registrant: RegistrantDto): Promise<UploadKeyDto> {
    let user: Registrant;
    if ((await this.getRegistrantsConfirmedCount()) >= environment.WAITLIST_THRESHOLD) {
      registrant.isWaitlisted = true;
    }
    try {
      user = await this.registrantRepository.save(registrant);
    } catch (err) {
      console.error(err);
      throw new HttpException(
        'There was an error inserting the user into the database',
        500,
      );
    }
    const payload = { uploadKey: null, isWaitlisted: null };
    const cipher = crypto.createCipher(
      this.userCryptoAlgorithm,
      environment.CRYPTO_KEY,
    );
    let encrypted = cipher.update(user.email, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const emailData = {
      subject: 'Verify Email',
      shortDescription: 'Please verify your email address for RevolutionUC',
      firstName: user.firstName,
      verificationUrl: `https://revolutionuc.com/registration/verify?user=${encrypted}`,
      waitlist: user.isWaitlisted,
    };
    build('verifyEmail', emailData)
      .then((html) => {
        send(
          environment.MAILGUN_API_KEY,
          environment.MAILGUN_DOMAIN,
          'RevolutionUC <info@revolutionuc.com>',
          user.email,
          emailData.subject,
          html,
        );
      })
      .catch((e) => {
        console.log('Email error:', e);
        throw new HttpException('Error while generating email', 500);
      });

    if(getAge(registrant.dateOfBirth) >= 18) {
      const attendee = this.attendeeRepository.create({
        email: registrant.email,
        name: `${registrant.firstName} ${registrant.lastName}`,
        role: `HACKER`
      });
      this.attendeeRepository.save(attendee).then(() => {
        console.log(`Created attendee for ${registrant.email}`);
      });
    }

    payload.uploadKey = encrypted;
    payload.isWaitlisted = user.isWaitlisted;
    return payload;
  }

  uploadResume(req, res, key: string) {
    const decipher = crypto.createDecipher(
      this.userCryptoAlgorithm,
      environment.CRYPTO_KEY,
    );
    let dec = decipher.update(key, 'hex', 'utf8');
    dec += decipher.final('utf8');
    const upload = multer({
      storage: multers3({
        s3: new S3(),
        bucket: 'revolutionuc-resumes-2020',
        key: function (_req, file, cb) {
          const fileArray = file.originalname.split('.');
          const extension = fileArray[fileArray.length - 1];
          cb(null, `${dec}.${extension}`);
        },
      }),
      limits: { fileSize: 20000000, files: 1 },
    });
    upload.single('resume')(req, res, (err) => {
      if (err) {
        throw new HttpException('There was an error uploading the resume', 500);
      } else {
        return res.status(HttpStatus.CREATED).send();
      }
    });
  }

  verify(encryptedKey: string): HttpStatus {
    const decipher = crypto.createDecipher(
      this.userCryptoAlgorithm,
      environment.CRYPTO_KEY,
    );
    let email = decipher.update(encryptedKey, 'hex', 'utf8');
    email += decipher.final('utf8');
    try {
      this.registrantRepository.update({ email: email }, { emailVerfied: true });
      if(currentInfoEmail !== 'infoEmail1') {
        this.emailService.sendEmail({
          template: currentInfoEmail,
          recipent: email,
        });
      }
      return HttpStatus.OK;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getStats(includedStats: string): Promise<StatsDto> {
    const stats = new StatsDto();
    if (includedStats == null) {
      stats.numRegistrants = await this.registrantRepository.count();
      stats.numConfirmed = await this.registrantRepository.count({
        confirmedAttendance1: 'true',
      });
      stats.numCheckedIn = await this.registrantRepository.count({
        checkedIn: true,
      });
      stats.last24hrs = await this.registrantRepository.count({
        createdAt: Raw((alias) => `${alias} >= NOW() - '1 day'::INTERVAL`),
      });
      stats.gender = await this.registrantRepository
        .query(`SELECT gender, COUNT(gender) FROM public.registrant
                                                            GROUP BY gender ORDER BY count DESC`);
      stats.top5schools = await this.registrantRepository
        .query(`SELECT school, COUNT(school) FROM public.registrant
                                                                GROUP BY school ORDER BY count DESC LIMIT 5`);
      stats.top5majors = await this.registrantRepository
        .query(`SELECT major, COUNT(major) FROM public.registrant
                                                                GROUP BY major ORDER BY count DESC LIMIT 5`);
      stats.ethnicities = await this.registrantRepository
        .query(`SELECT ethnicity, COUNT(ethnicity) FROM public.registrant
                                                                GROUP BY ethnicity ORDER BY count DESC`);
      stats.shirtSizes = await this.registrantRepository
        .query(`SELECT "shirtSize", COUNT("shirtSize") FROM public.registrant
                                                                GROUP BY "shirtSize" ORDER BY count DESC`);
      stats.educationLevels = await this.registrantRepository
        .query(`SELECT "educationLevel", COUNT("educationLevel") FROM public.registrant
                                                                    GROUP BY "educationLevel" ORDER BY count DESC`);
      stats.allergens = await this.registrantRepository
        .query(`SELECT "allergens", COUNT(*)
                                                              FROM (
                                                                SELECT UNNEST("allergens") AS allergens
                                                                FROM public.registrant
                                                              ) t
                                                              GROUP BY allergens
                                                              ORDER BY count DESC;`);
    } else {
      const incStats: string[] = includedStats.split(',');
      if (incStats.includes('numRegistrants')) {
        stats.numRegistrants = await this.registrantRepository.count();
      }
      if (incStats.includes('numConfirmed')) {
        stats.numConfirmed = await this.registrantRepository.count({
          confirmedAttendance1: 'true',
        });
      }
      if (incStats.includes('numCheckedIn')) {
        stats.numCheckedIn = {};
        stats.numCheckedIn.all = await this.registrantRepository.count({
          checkedIn: true,
        });
        stats.numCheckedIn.confirmed = await this.registrantRepository.count({
          checkedIn: true,
          confirmedAttendance1: 'true',
        });
      }
    }
    return await stats;
  }

  async confirmAttendance(payload: VerifyAttendanceDto) {
    const decipher = crypto.createDecipher(
      this.userCryptoAlgorithm,
      environment.CRYPTO_KEY,
    );
    let email = decipher.update(payload.uuid, 'hex', 'utf8');
    email += decipher.final('utf8');
    if ((await this.getRegistrantsConfirmedCount()) >= environment.WAITLIST_THRESHOLD) {
      try {
        this.registrantRepository.update(
          { email },
          { isWaitlisted: true },
        );
      } catch (error) {
        throw new HttpException(error, 500);
      }
      throw new HttpException({ error: 'ConfirmedQuotaReached' }, 500);
    } else {
      try {
        await this.registrantRepository.update(
          { email },
          { confirmedAttendance1: payload.isConfirmed.toString() }
        );

        if (payload.isConfirmed) {
          this.emailService.sendEmail({
            template: currentInfoEmail,
            recipent: email,
          });
        }
      } catch (error) {
        throw new HttpException(error, 500);
      }
    }
    return HttpStatus.OK;
  }
}
