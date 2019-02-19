import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw, getRepository } from 'typeorm';
import { RegistrantDto, SendEmailDto, VerifyAttendanceDto } from './dtos/Registrant.dto';
import { Registrant, UploadKeyDto } from './entities/registrant.entity';
import { environment } from '../environments/environment';
import * as crypto from 'crypto';
import * as multer from 'multer';
import * as multers3 from 'multer-s3';
import * as aws from 'aws-sdk';
import { StatsDto } from './dtos/Stats.dto';

const { build, send } = require('revolutionuc-emails');


@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Registrant) private readonly registrantRepository: Repository<Registrant>,
  ) {}
  private userCryptoAlgorithm = 'aes-256-ctr';
  async register(registrant: RegistrantDto): Promise<UploadKeyDto> {
    let user: Registrant;
    try {
      user =  await this.registrantRepository.save(registrant);
    }
    catch (err) {
      console.error(err);
      throw new HttpException('There was an error inserting the user into the database', 500);
    }
    if (environment.WAITLIST_ENABLED) {
      user.isWaitlisted = true;
      this.registrantRepository.save(user);
    }
    const payload = {uploadKey: null, isWaitlisted: null};
    const cipher = crypto.createCipher(this.userCryptoAlgorithm, environment.CRYPTO_KEY);
    let encrypted = cipher.update(user.email, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const emailData = {
      subject: 'Verify Email',
      shortDescription: 'Please verify your email address for RevolutionUC',
      firstName: user.firstName,
      verificationUrl: `https://revolutionuc.com/registration/verify?user=${encrypted}`,
      waitlist: environment.WAITLIST_ENABLED
    };
    build('verifyEmail', emailData)
    .then(html => {
      send(environment.MAILGUN_API_KEY, environment.MAILGUN_DOMAIN, 'RevolutionUC <info@revolutionuc.com>',
           user.email, emailData.subject, html);
    })
    .catch((e) => {
      console.log('Email error:', e);
      throw new HttpException('Error while generating email', 500);
    });
    payload.uploadKey = encrypted;
    payload.isWaitlisted = environment.WAITLIST_ENABLED;
    return payload;
  }
  uploadResume(req, res, key: string) {
    const decipher = crypto.createDecipher(this.userCryptoAlgorithm, environment.CRYPTO_KEY);
    let dec = decipher.update(key, 'hex', 'utf8');
    dec += decipher.final('utf8');
    const email = dec;
    const upload = multer({
      storage: multers3({
        s3: new aws.S3(),
        bucket: 'revolutionuc-resumes-2019',
        key: function (_req, file, cb) {
          const fileArray = file.originalname.split('.');
          const extension = fileArray[fileArray.length - 1];
          cb(null, `${dec}.${extension}`);
        },
      }),
      limits: { fileSize: 20000000, files: 1 }
    });
    upload.single('resume')(req, res, err => {
      if (err) {
        throw new HttpException('There was an error uploading the resume', 500);
      }
      else {
        return res.status(HttpStatus.CREATED).send();
      }
    });
  }

  verify(encryptedKey: string): HttpStatus {
    const decipher = crypto.createDecipher(this.userCryptoAlgorithm, environment.CRYPTO_KEY);
    let dec = decipher.update(encryptedKey, 'hex', 'utf8');
    dec += decipher.final('utf8');
    try {
      this.registrantRepository.update({ email: dec }, { emailVerfied: true });
      return HttpStatus.OK;
    }
    catch (error) {
      throw new HttpException(error, 500);
    }
  }
  async getRegistrants(searchQuery: string, id: string, limit: number = null): Promise<Registrant[] | Registrant> {
    if (searchQuery) {
      return await this.registrantRepository
        .createQueryBuilder('user')
        .where('user.firstName || \' \' || user.lastName ILIKE :query')
        .orWhere('user.email ILIKE :query')
        .setParameter('query', '%' + searchQuery + '%')
        .take(limit)
        .orderBy('user.createdAt', 'DESC')
        .printSql()
        .getMany();
    }

    else if (id) {
      const decipher = crypto.createDecipher(this.userCryptoAlgorithm, environment.CRYPTO_KEY);
      let dec = decipher.update(id, 'hex', 'utf8');
      dec += decipher.final('utf8');
      try {
        return await this.registrantRepository.findOneOrFail({ email: dec });
      }
      catch (e) {
        if (e.name === 'EntityNotFound') {
          throw new HttpException('Could not find a user by that id', 404);
        }
        throw new HttpException(e.name, 500);
      }
    }
    else {
      return await this.registrantRepository.find(
        {
          take: limit,
          order: {
            createdAt: 'DESC'
          }
        });
    }
  }
  async getStats(): Promise<StatsDto> {
    const stats = new StatsDto;
    stats.numRegistrants = await this.registrantRepository.count();
    stats.last24hrs = await this.registrantRepository.count({ createdAt: Raw(alias => `${alias} >= NOW() - '1 day'::INTERVAL`)});
    stats.gender = await this.registrantRepository.query(`SELECT gender, COUNT(gender) FROM public.registrant
                                                          GROUP BY gender ORDER BY count DESC`);
    stats.top5schools = await this.registrantRepository.query(`SELECT school, COUNT(school) FROM public.registrant
                                                               GROUP BY school ORDER BY count DESC LIMIT 5`);
    stats.top5majors = await this.registrantRepository.query(`SELECT major, COUNT(major) FROM public.registrant
                                                              GROUP BY major ORDER BY count DESC LIMIT 5`);
    stats.ethnicities = await this.registrantRepository.query(`SELECT ethnicity, COUNT(ethnicity) FROM public.registrant
                                                               GROUP BY ethnicity ORDER BY count DESC`);
    stats.shirtSizes = await this.registrantRepository.query(`SELECT "shirtSize", COUNT("shirtSize") FROM public.registrant
                                                              GROUP BY "shirtSize" ORDER BY count DESC`);
    stats.educationLevels = await this.registrantRepository.query(`SELECT "educationLevel", COUNT("educationLevel") FROM public.registrant
                                                                   GROUP BY "educationLevel" ORDER BY count DESC`);
    stats.allergens = await this.registrantRepository.query(`SELECT "allergens", COUNT(*)
                                                            FROM (
                                                              SELECT UNNEST("allergens") AS allergens
                                                              FROM public.registrant
                                                            ) t
                                                            GROUP BY allergens
                                                            ORDER BY count DESC;`);
    return await(stats);
  }
  async confirmAttendance(payload: VerifyAttendanceDto) {
    const decipher = crypto.createDecipher(this.userCryptoAlgorithm, environment.CRYPTO_KEY);
    let dec = decipher.update(payload.uuid, 'hex', 'utf8');
    dec += decipher.final('utf8');
    try {
      this.registrantRepository.update({ email: dec }, { confirmedAttendance1: payload.isConfirmed.toString() });
    }
    catch (error) {
      throw new HttpException(error, 500);
    }
    if (payload.isConfirmed) {
      this.sendEmail({ template: 'confirmAttendanceFollowUp', recipent: dec});
    }
    return HttpStatus.OK;
  }
  checkInRegistrant(uuid: string): any {
    this.registrantRepository.update({id: uuid}, {checkedIn: true});
  }
  async sendEmail(payload: SendEmailDto) {
    if (payload.template === 'confirmAttendance') {
      const emailData = {
        subject: 'Confirm Your Attendance for RevolutionUC!',
        shortDescription: 'Please confirm your attendance for RevolutionUC',
        firstName: null,
        yesConfirmationUrl: '',
        noConfirmationUrl: '',
        offWaitlist: null
      };
      if (payload.recipent === 'all') {
        const user: Registrant[] = await this.registrantRepository.createQueryBuilder('user')
                                              .where('user.emailVerfied = true')
                                              .andWhere('user.isWaitlisted = false')
                                              .andWhere('user.confirmedAttendance1 IS NULL')
                                              .getMany();
        user.forEach(el => {
          const cipher = crypto.createCipher(this.userCryptoAlgorithm, environment.CRYPTO_KEY);
          let encrypted = cipher.update(el.email, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          emailData.firstName = el.firstName;
          emailData.yesConfirmationUrl = `https://revolutionuc.com/attendance?confirm=true&id=${encrypted}`;
          emailData.noConfirmationUrl = `https://revolutionuc.com/attendance?confirm=false&id=${encrypted}`;
          emailData.offWaitlist = false;
          sendHelper('confirmAttendance', emailData, el.email);
          el.emailsReceived.push('confirmAttendance');
          this.registrantRepository.save(el);
        });
      }
      else {
        const user: Registrant = await this.registrantRepository.findOneOrFail({ where: { email: payload.recipent } });
        if (user.isWaitlisted === true) {
          emailData.offWaitlist = true;
          user.isWaitlisted = false;
        }
        else {
          emailData.offWaitlist = false;
        }
        emailData.firstName = user.firstName;
        const cipher = crypto.createCipher(this.userCryptoAlgorithm, environment.CRYPTO_KEY);
        let encrypted = cipher.update(user.email, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        emailData.yesConfirmationUrl = `https://revolutionuc.com/attendance?confirm=true&id=${encrypted}`;
        emailData.noConfirmationUrl = `https://revolutionuc.com/attendance?confirm=false&id=${encrypted}`;
        sendHelper('confirmAttendance', emailData, user.email);
        user.emailsReceived.push('confirmAttendance');
        this.registrantRepository.save(user);
      }
    }
    else if (payload.template === 'confirmAttendanceFollowUp') {
      if (payload.recipent === 'all') {
        throw new HttpException('This template cannot be sent in bulk, please specify an email addrese', 500);
      }
      const emailData = {
        subject: 'Thank you for confirming your attendance at RevolutionUC',
        shortDescription: 'Please read this email for important information.',
        firstName: null,
        qrImageSrc: null
      };
      console.log(payload);
      const user: Registrant = await this.registrantRepository.findOneOrFail({ where: { email: payload.recipent} });
      const cipher = crypto.createCipher(this.userCryptoAlgorithm, environment.CRYPTO_KEY);
      let encrypted = cipher.update(user.email, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      emailData.firstName = user.firstName;
      emailData.qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encrypted}`;
      user.emailsReceived.push('confirmAttendanceFollowUp');
      sendHelper('confirmAttendanceFollowUp', emailData, user.email);
    }
  function sendHelper(template: string, emailData, recipent) {
    build(template, emailData)
      .then(html => {
        send(environment.MAILGUN_API_KEY, environment.MAILGUN_DOMAIN, 'RevolutionUC <info@revolutionuc.com>',
          recipent, emailData.subject, html);
      })
      .catch((e) => {
        console.log('Email error:', e);
        throw new HttpException('Error while generating email', 500);
      });
    }
  }
}

