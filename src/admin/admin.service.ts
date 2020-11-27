import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import * as crypto from 'crypto';
import { RegistrantDto, SendEmailDto } from '../dtos/Registrant.dto';
import { Registrant, SortKey, SortOrder } from '../entities/registrant.entity';
import * as multer from 'multer';
import * as multers3 from 'multer-s3';
import { S3 } from 'aws-sdk';
import { environment } from '../environment';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { build, send } = require('revolutionuc-emails');

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Registrant)
    private readonly registrantRepository: Repository<Registrant>,
  ) {}

  async searchRegistrants(
    { page = 1, limit = 10 }: IPaginationOptions,
    sortKey: SortKey = 'createdAt',
    sortOrder: SortOrder = 'DESC',
    q: string,
  ): Promise<Pagination<Registrant>> {
    console.log({ options: { page, limit }, sortKey, sortOrder, q });

    let query = this.registrantRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.createdAt',
        'user.emailVerfied',
        'user.checkedIn',
      ])
      .orderBy(`user.${sortKey}`, sortOrder);

    if (q) {
      query = query
        .where("user.firstName || ' ' || user.lastName ILIKE :query")
        .orWhere('user.email ILIKE :query')
        .setParameter('query', '%' + q + '%');
    }

    query.printSql();

    return paginate(query, { page, limit });
  }

  async getRegistrant(uuid: string): Promise<Registrant> {
    try {
      const registrant = await this.registrantRepository.findOne(uuid);
      if (!registrant) {
        throw new HttpException(`Invalid registrant id`, HttpStatus.NOT_FOUND);
      }
      return registrant;
    } catch (err) {
      throw new HttpException(
        `Error fetching registrant: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateRegistrant(
    uuid: string,
    data: Partial<RegistrantDto>,
  ): Promise<Registrant> {
    try {
      const oldRegistrant = await this.registrantRepository.findOne(uuid);
      if (!oldRegistrant) {
        throw new HttpException(`Invalid registrant id`, HttpStatus.NOT_FOUND);
      }
      const newRegistrant = Object.assign(oldRegistrant, data);
      return this.registrantRepository.save(newRegistrant);
    } catch (err) {
      throw new HttpException(
        `Error updating registrant: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadResume(req, res, uuid: string) {
    try {
      const registrant = await this.registrantRepository.findOne(uuid);
      if (!registrant) {
        throw new HttpException(`Invalid registrant id`, HttpStatus.NOT_FOUND);
      }
      const upload = multer({
        storage: multers3({
          s3: new S3(),
          bucket: 'revolutionuc-resumes-2020',
          key: function (_req, file, cb) {
            const fileArray = file.originalname.split('.');
            const extension = fileArray[fileArray.length - 1];
            cb(null, `${registrant.email}.${extension}`);
          },
        }),
        limits: { fileSize: 20000000, files: 1 },
      });
      upload.single('resume')(req, res, (err) => {
        if (err) {
          throw new HttpException(
            `Error uploading resume: ${err.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        return res.status(HttpStatus.CREATED).send();
      });
    } catch (err) {
      throw new HttpException(
        `Error updating registrant: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyRegistrant(uuid: string): Promise<void> {
    try {
      const result = await this.registrantRepository.update(uuid, {
        emailVerfied: true,
      });
      if (!result.affected) {
        throw new HttpException(`Invalid registrant id`, HttpStatus.NOT_FOUND);
      }
      return;
    } catch (err) {
      throw new HttpException(
        `Error verifying registrant: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkInRegistrant(uuid: string): Promise<void> {
    try {
      const result = await this.registrantRepository.update(uuid, {
        checkedIn: true,
      });
      if (!result.affected) {
        throw new HttpException(`Invalid registrant id`, HttpStatus.NOT_FOUND);
      }
      return;
    } catch (err) {
      throw new HttpException(
        `Error checking in registrant: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendEmail(payload: SendEmailDto) {
    if (payload.dryRun === undefined) {
      payload.dryRun = false;
    }
    if (payload.template === 'confirmAttendance') {
      const emailData = {
        subject: 'Confirm Your Attendance for RevolutionUC!',
        shortDescription: 'Please confirm your attendance for RevolutionUC',
        firstName: null,
        yesConfirmationUrl: '',
        noConfirmationUrl: '',
        offWaitlist: null,
      };
      if (payload.recipent === 'all') {
        const user: Registrant[] = await this.registrantRepository
          .createQueryBuilder('user')
          .where('user.emailVerfied = true')
          .andWhere('user.isWaitlisted = false')
          .andWhere('user.confirmedAttendance1 IS NULL')
          .getMany();
        console.log(`Sending emails to ${user.length}`);
        let numSent = 0;
        const usersToUpdate: Registrant[] = [];
        user.forEach((el) => {
          const emailDataCopy = { ...emailData };
          const cipher = crypto.createCipher(
            `aes-256-ctr`,
            environment.CRYPTO_KEY,
          );
          let encrypted = cipher.update(el.email, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          emailDataCopy.firstName = el.firstName;
          emailDataCopy.yesConfirmationUrl = `https://revolutionuc.com/attendance?confirm=true&id=${encrypted}`;
          emailDataCopy.noConfirmationUrl = `https://revolutionuc.com/attendance?confirm=false&id=${encrypted}`;
          emailDataCopy.offWaitlist = false;
          sendHelper(
            'confirmAttendance',
            emailDataCopy,
            el.email,
            payload.dryRun,
          );
          numSent++;
          console.log(`Sending ${numSent} emails`);
          if (!el.emailsReceived.includes('confirmAttendance')) {
            el.emailsReceived.push('confirmAttendance');
            usersToUpdate.push(el);
          }
        });
        if (!payload.dryRun) {
          this.registrantRepository.save(usersToUpdate);
        }
        console.log(`Sent emails to ${user.length}`);
      } else {
        const user: Registrant = await this.registrantRepository.findOneOrFail({
          where: { email: payload.recipent },
        });
        if (user.isWaitlisted === true) {
          emailData.offWaitlist = true;
          user.isWaitlisted = false;
        } else {
          emailData.offWaitlist = false;
        }
        emailData.firstName = user.firstName;
        const cipher = crypto.createCipher(
          `aes-256-ctr`,
          environment.CRYPTO_KEY,
        );
        let encrypted = cipher.update(user.email, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        emailData.yesConfirmationUrl = `https://revolutionuc.com/attendance?confirm=true&id=${encrypted}`;
        emailData.noConfirmationUrl = `https://revolutionuc.com/attendance?confirm=false&id=${encrypted}`;
        sendHelper('confirmAttendance', emailData, user.email, payload.dryRun);
        user.emailsReceived.push('confirmAttendance');
        if (!payload.dryRun) {
          this.registrantRepository.save(user);
        }
      }
    } else if (payload.template === 'confirmAttendanceFollowUp') {
      if (payload.recipent === 'all') {
        throw new HttpException(
          'This template cannot be sent in bulk, please specify an email addrese',
          500,
        );
      }
      const emailData = {
        subject: 'Thank you for confirming your attendance at RevolutionUC',
        shortDescription: 'Please read this email for important information.',
        firstName: null,
        offWaitlist: null,
      };
      const user: Registrant = await this.registrantRepository.findOneOrFail({
        where: { email: payload.recipent },
      });
      if (user.isWaitlisted === true) {
        emailData.offWaitlist = true;
        user.isWaitlisted = false;
        user.confirmedAttendance1 = 'true';
      } else {
        emailData.offWaitlist = false;
      }
      emailData.firstName = user.firstName;
      user.emailsReceived.push('confirmAttendanceFollowUp');
      sendHelper(
        'confirmAttendanceFollowUp',
        emailData,
        user.email,
        payload.dryRun,
      );
      if (!payload.dryRun) {
        this.registrantRepository.save(user);
      }
    } else if (payload.template === 'infoEmail4') {
      const emailData = {
        subject: 'RevolutionUC Is Tomorrow!',
        shortDescription:
          "RevolutionUC is here. Here's some important information for the event",
        firstName: null,
      };
      if (payload.recipent === 'all') {
        const user: Registrant[] = await this.registrantRepository
          .createQueryBuilder('user')
          .where('user.emailVerfied = true')
          .andWhere("user.confirmedAttendance1 = 'true'")
          .getMany();
        console.log(`Sending emails to ${user.length}`);
        let numSent = 0;
        user.forEach((el) => {
          const emailDataCopy = { ...emailData };
          emailDataCopy.firstName = el.firstName;
          sendHelper('infoEmail4', emailDataCopy, el.email, payload.dryRun);
          numSent++;
          console.log(`Sent ${numSent} emails`);
        });
      } else {
        const user: Registrant = await this.registrantRepository.findOneOrFail({
          where: { email: payload.recipent },
        });
        emailData.firstName = user.firstName;
        sendHelper('infoEmail4', emailData, user.email, payload.dryRun);
      }
    } else if (payload.template === 'infoEmailMinors') {
      const emailData = {
        subject: 'Important information for minors going to RevolutionUC',
        shortDescription:
          'Additional information for minors going to RevolutionUC',
        firstName: null,
      };
      if (payload.recipent === 'all') {
        const user: Registrant[] = await this.registrantRepository.query(
          'SELECT * FROM registrant WHERE "dateOfBirth"::date > \'2002-02-22\'::date AND "confirmedAttendance1" = \'true\'',
        );
        console.log(`Sending emails to ${user.length}`);
        let numSent = 0;
        user.forEach((el) => {
          const emailDataCopy = { ...emailData };
          emailDataCopy.firstName = el.firstName;
          sendHelper('infoEmail3', emailDataCopy, el.email, payload.dryRun);
          numSent++;
          console.log(`Sent ${numSent} emails`);
        });
      } else {
        const user: Registrant = await this.registrantRepository.findOneOrFail({
          where: { email: payload.recipent },
        });
        emailData.firstName = user.firstName;
        sendHelper('infoEmailMinors', emailData, user.email, payload.dryRun);
      }
    }
    function sendHelper(
      template: string,
      emailData,
      recipent: string,
      dryRun: boolean,
    ) {
      if (dryRun) {
        console.log({ template, emailData, recipent });
      } else {
        build(template, emailData)
          .then((html) => {
            send(
              environment.MAILGUN_API_KEY,
              environment.MAILGUN_DOMAIN,
              'RevolutionUC <info@revolutionuc.com>',
              recipent,
              emailData.subject,
              html,
            );
          })
          .catch((e) => {
            console.log('Email error:', e);
            throw new HttpException('Error while generating email', 500);
          });
      }
    }
  }
}
