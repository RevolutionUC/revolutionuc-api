import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Registrant } from '../entities/registrant.entity';
import { build, send } from 'revolutionuc-emails';
import { environment } from '../environment';

export type EMAIL = 'confirmAttendance' | 'infoEmail1' | 'infoEmail2' | 'infoEmail3' | 'infoEmail4' | 'waiverUpdate';

export class SendEmailDto {
  template: EMAIL;
  recipent: string;
  dryRun?: boolean;
}

class EmailDataDto {
  subject: string
  shortDescription: string
  firstName: string
  registrantId?: string
  yesConfirmationUrl?: string
  noConfirmationUrl?: string
  offWaitlist?: boolean
}

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(Registrant) private readonly registrantRepository: Repository<Registrant>,
  ) {}

  emailData: {[key in EMAIL]: EmailDataDto} = {
    confirmAttendance: {
      subject: 'Confirm Your Attendance for RevolutionUC!',
      shortDescription: 'Please confirm your attendance for RevolutionUC',
      firstName: '',
      yesConfirmationUrl: '',
      noConfirmationUrl: '',
      offWaitlist: false
    },
    infoEmail1: {
      subject: 'RevolutionUC is this month!',
      shortDescription: `RevolutionUC is coming this month. Here's some important information for the event`,
      firstName: '',
    },
    infoEmail2: {
      subject: 'RevolutionUC is next weekend!',
      shortDescription: `RevolutionUC is coming up next week. Here's some important information for the event`,
      firstName: '',
      registrantId: ''
    },
    infoEmail3: {
      subject: 'RevolutionUC is this weekend!',
      shortDescription: `RevolutionUC is almost here. Here's some important information for the event`,
      firstName: '',
      registrantId: ''
    },
    infoEmail4: {
      subject: 'RevolutionUC is tomorrow!',
      shortDescription: `RevolutionUC is here. Here's some important information for the event`,
      firstName: '',
      registrantId: ''
    },
    waiverUpdate: {
      subject: `RevolutionUC waiver has been updated`,
      shortDescription: `Thank you for registering for RevolutionUC. We have updated our waiver.`,
      firstName: ``
    }
  }

  private getConfirmationLinks(email: string) {
    const cipher = crypto.createCipher(
      `aes-256-ctr`,
      environment.CRYPTO_KEY,
    );
    let encrypted = cipher.update(email, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const yesConfirmationUrl = `https://revolutionuc.com/attendance?confirm=true&id=${encrypted}`;
    const noConfirmationUrl = `https://revolutionuc.com/attendance?confirm=false&id=${encrypted}`;

    return { yesConfirmationUrl, noConfirmationUrl }
  }

  private async sendHelper(template: EMAIL, emailData: EmailDataDto, recipentEmail: string, dryRun: boolean) {
    if (dryRun) {
      console.log({ template, emailData, recipentEmail });
      return;
    } else {
      if(template === 'confirmAttendance') {
        const { yesConfirmationUrl, noConfirmationUrl } = this.getConfirmationLinks(recipentEmail);
        emailData.yesConfirmationUrl = yesConfirmationUrl;
        emailData.noConfirmationUrl = noConfirmationUrl;
      }
      return build(template, emailData)
        .then(html => {
          return send(
            environment.MAILGUN_API_KEY,
            environment.MAILGUN_DOMAIN,
            'RevolutionUC <info@revolutionuc.com>',
            recipentEmail,
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

  async sendEmail(payload: SendEmailDto) {
    if (payload.dryRun === undefined) {
      payload.dryRun = false;
    }

    const emailData = this.emailData[payload.template];

    if (payload.recipent === 'all') {
      const registrants = await this.registrantRepository.find({ emailVerfied: true });

      Logger.log(`Sending ${payload.template} to ${registrants.length}`);

      registrants.forEach(async reg => {
        try {
          const emailDataCopy = { ...emailData, firstName: reg.firstName, registrantId: reg.id };

          await this.sendHelper(payload.template, emailDataCopy, reg.email, payload.dryRun);

          if (!payload.dryRun) {
            if(!reg.emailsReceived.includes(payload.template)) {
              reg.emailsReceived.push(payload.template);
              await this.registrantRepository.save(reg);
            }
          }

          Logger.log(`Successfully sent ${payload.template} to ${reg.email}`);
        } catch(err) {
          Logger.error(`Could not send ${payload.template} to ${reg.email}: ${err.message}`);
        }
      });
    } else {
      try {
        const registrant = await this.registrantRepository.findOneOrFail({ email: payload.recipent });
        emailData.firstName = registrant.firstName;
        emailData.registrantId = registrant.id;
        await this.sendHelper(payload.template, emailData, registrant.email, payload.dryRun);
        if (!payload.dryRun) {
          if(!registrant.emailsReceived.includes(payload.template)) {
            registrant.emailsReceived.push(payload.template);
            await this.registrantRepository.save(registrant);
          }
        }

        Logger.log(`Successfully sent ${payload.template} to ${registrant.email}`);
      } catch(err) {
        Logger.error(`Could not send ${payload.template} to ${payload.recipent}: ${err.message}`);
      }
    }
  }
}
