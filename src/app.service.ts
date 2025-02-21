import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as multer from 'multer';
import * as multers3 from 'multer-s3';
import { build, send } from 'revolutionuc-emails';
import { Repository } from 'typeorm';
import { RegistrantDto, VerifyAttendanceDto } from './dtos/Registrant.dto';
import { EMAIL, EmailService } from './email/email.service';
import { Attendee } from './entities/attendee.entity';
import { Registrant, UploadKeyDto } from './entities/registrant.entity';
import { environment } from './environment';

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
}

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Registrant)
    private readonly registrantRepository: Repository<Registrant>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private emailService: EmailService,
  ) {}

  private userCryptoAlgorithm = 'aes-256-ctr';

  private async getRegistrantsConfirmedCount(): Promise<number> {
    return await this.registrantRepository.countBy({
      confirmedAttendance: true,
    });
  }

  async register(registrant: RegistrantDto): Promise<UploadKeyDto> {
    let user: Registrant;
    if (
      (await this.getRegistrantsConfirmedCount()) >=
      environment.WAITLIST_THRESHOLD
    ) {
      registrant.isWaitlisted = true;
    }
    const existingRegistrant = await this.registrantRepository.findOneBy({
      email: registrant.email,
    });
    if (existingRegistrant) {
      throw new HttpException(
        'You are already registered. Please check your email for the confirmation link.',
        409,
      );
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

    if (registrant.age >= 18) {
      const attendee = this.attendeeRepository.create({
        email: registrant.email,
        name: `${registrant.firstName} ${registrant.lastName}`,
        role: `HACKER`,
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
        s3: new S3Client({ region: 'us-east-2' }),
        bucket: 'revolutionuc-resume-2025',
        key: function (_req, file, cb) {
          const researchConsent = _req.body.researchConsent === 'on';
          const fileArray = file.originalname.split('.');
          const extension = fileArray[fileArray.length - 1];
          const folder = researchConsent ? 'research-consent' : '';
          const filePath = folder ? `${folder}/${dec}.${extension}` : `${dec}.${extension}`;
          cb(null, filePath);
        },
      }),
      limits: { fileSize: 20000000, files: 1 },
    });
    upload.single('resume')(req, res, (err) => {
      if (err) {
        throw new HttpException('There was an error uploading the resume', 500);
      } else {
        return res
          .header('Access-Control-Allow-Origin', '*')
          .status(HttpStatus.CREATED)
          .send();
      }
    });
  }

  async verify(encryptedKey: string) {
    const decipher = crypto.createDecipher(
      this.userCryptoAlgorithm,
      environment.CRYPTO_KEY,
    );
    let email = decipher.update(encryptedKey, 'hex', 'utf8');
    email += decipher.final('utf8');
    try {
      const response = await this.registrantRepository.update(
        { email: email, emailVerfied: false },
        { emailVerfied: true },
      );
      // Only send email if an actual change from false to true was made
      // --> Prevent sending duplicates email if user click Verify multiple times
      // Also, should not send "infoEmail1" as it would be too many emails in one day
      if (response.affected === 1 && currentInfoEmail !== 'infoEmail1') {
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

  async confirmAttendance(payload: VerifyAttendanceDto) {
    const decipher = crypto.createDecipher(
      this.userCryptoAlgorithm,
      environment.CRYPTO_KEY,
    );
    let email = decipher.update(payload.uuid, 'hex', 'utf8');
    email += decipher.final('utf8');
    if (
      (await this.getRegistrantsConfirmedCount()) >=
      environment.WAITLIST_THRESHOLD
    ) {
      try {
        await this.registrantRepository.update({ email }, { isWaitlisted: true });
      } catch (error) {
        throw new HttpException(error, 400);
      }
      throw new HttpException({ error: 'ConfirmedQuotaReached' }, 500);
    } else {
      try {
        const registrant = await this.registrantRepository.findOneBy({ email: email });
        if (!registrant) {
          throw new HttpException(`Registrant not found`, HttpStatus.NOT_FOUND);
        }
        const prevStatus = registrant.confirmedAttendance;
        if (prevStatus !== payload.isConfirmed) {
          const response = await this.registrantRepository.update(
            { email },
            { confirmedAttendance: payload.isConfirmed },
          );

          if (response.affected === 1 && payload.isConfirmed) {
            this.emailService.sendEmail({
              template: 'confirmAttendanceFollowUp',
              recipent: email,
            });
          }
        }
      } catch (error) {
        throw new HttpException(error, 500);
      }
    }
    return HttpStatus.OK;
  }
}
