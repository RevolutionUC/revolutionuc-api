import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { build, send } from 'revolutionuc-emails';
import { Registrant } from '../entities/registrant.entity';
import { environment } from '../environment';
import { AuthService } from '../auth/auth.service';
import { Judge } from '../judging/entities/judge.entity';

export type EMAIL =
  | 'welcome'
  | 'dateChange'
  | 'confirmAttendance'
  | 'confirmAttendanceFollowUp'
  | 'infoEmail1'
  | 'infoEmail2'
  | 'infoEmail3'
  | 'infoEmail4'
  | 'infoEmailMinors'
  | 'infoEmailJudges'
  | 'waiverUpdate'
  | 'latticeResetPassword'
  | 'submissionReminder'
  | 'postEventEmail'
  | 'postEventJudgeEmail'
  | 'postEventSurveyReminder';

const DISCORD_INVITE = process.env.DISCORD_INVITE;
const HOPIN_INVITE = process.env.HOPIN_INVITE;
const HOPIN_INVITE_MINOR = process.env.HOPIN_INVITE_MINOR;

export class SendEmailDto {
  template: EMAIL;
  recipent: string;
  dryRun?: boolean;
  resetToken?: string;
}

class EmailDataDto {
  subject: string;
  shortDescription: string;
  firstName: string;
  registrantId?: string;
  yesConfirmationUrl?: string;
  noConfirmationUrl?: string;
  offWaitlist?: boolean;
  judgingLoginLink?: string;
  resetToken?: string;
  discordLink?: string;
  hopinLink?: string;
}

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(Registrant)
    private readonly registrantRepository: Repository<Registrant>,
    @InjectRepository(Judge)
    private readonly judgeRepository: Repository<Judge>,
    private authService: AuthService,
  ) {}

  emailData: { [key in EMAIL]: EmailDataDto } = {
    welcome: {
      subject: 'Welcome to RevolutionUC!',
      shortDescription: 'Thanks for registering for RevolutionUC!',
      firstName: '',
    },
    dateChange: {
      subject: 'Important Update: RevolutionUC Schedule and Format',
      shortDescription: 'Important update regarding RevolutionUC schedule and format',
      firstName: '',
    },
    confirmAttendance: {
      subject: 'Confirm Your Attendance for RevolutionUC!',
      shortDescription: 'Please confirm your attendance for RevolutionUC',
      firstName: '',
      yesConfirmationUrl: '',
      noConfirmationUrl: '',
      offWaitlist: false,
    },
    confirmAttendanceFollowUp: {
      subject: 'Your Attendance Has Been Confirmed!',
      shortDescription: 'Your attendance has been confirmed for RevolutionUC',
      firstName: '',
    },
    infoEmail1: {
      subject: 'RevolutionUC is 3 weeks away!',
      shortDescription: `RevolutionUC is coming in less than 3 weeks. Here's some important information for the event`,
      firstName: '',
    },
    infoEmail2: {
      subject: 'RevolutionUC is next weekend!',
      shortDescription: `RevolutionUC is coming up next week. Here's some important information for the event`,
      firstName: '',
      registrantId: '',
    },
    infoEmail3: {
      subject: 'RevolutionUC is this weekend!',
      shortDescription: `RevolutionUC is almost here. Here's some important information for the event`,
      firstName: '',
      registrantId: '',
    },
    infoEmail4: {
      subject: 'Final Reminder for RevolutionUC!',
      shortDescription: `RevolutionUC is here. Here's some important information for the event`,
      firstName: '',
      registrantId: '',
      discordLink: ``,
      hopinLink: ``,
    },
    infoEmailMinors: {
      subject: 'Important information regarding RevolutionUC!',
      shortDescription: `You registered for RevolutionUC as a minor. Here's some important information for you.`,
      firstName: '',
    },
    infoEmailJudges: {
      subject: `RevolutionUC Judging`,
      shortDescription: `Thank you for signing up to judge at RevolutionUC. Here is some important information regarding the event.`,
      firstName: ``,
      judgingLoginLink: ``,
    },
    waiverUpdate: {
      subject: `RevolutionUC waiver of liability has been updated`,
      shortDescription: `Thank you for registering for RevolutionUC. We have updated our waiver of liability.`,
      firstName: ``,
    },
    latticeResetPassword: {
      subject: `Reset password request for Lattice`,
      shortDescription: `Reset your Lattice password, RevolutionUC Hacker matching app.`,
      firstName: ``,
      resetToken: ``,
    },
    submissionReminder: {
      subject: `Hacking time is about to end!`,
      shortDescription: `Thank you for participating in RevolutionUC. Please submit your project to our Devpost.`,
      firstName: ``,
    },
    postEventEmail: {
      subject: `Thank you for participating in RevolutionUC 2025!`,
      shortDescription: `Thank you for participating in RevolutionUC. Below is important information on the post event survey and prize information.`,
      firstName: ``,
    },
    postEventJudgeEmail: {
      subject: `Thank you for participating in RevolutionUC 2025!`,
      shortDescription: `Thank you for participating in RevolutionUC. Below is important information on the post event survey and prize information.`,
      firstName: ``,
    },
    postEventSurveyReminder: {
      subject: `We would love your feedback on your experience at RevolutionUC!`,
      shortDescription: `Thank you for participating in RevolutionUC. We would love your feedback on your experience at RevolutionUC.`,
      firstName: ``,
    },
  };

  private getConfirmationLinks(email: string) {
    const cipher = crypto.createCipher(`aes-256-ctr`, environment.CRYPTO_KEY);
    let encrypted = cipher.update(email, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const yesConfirmationUrl = `https://revolutionuc.com/registration/attendance?confirm=true&id=${encrypted}`;
    const noConfirmationUrl = `https://revolutionuc.com/registration/attendance?confirm=false&id=${encrypted}`;

    return { yesConfirmationUrl, noConfirmationUrl };
  }

  private async getJudgingLoginLink(email: string) {
    const { token } = await this.authService.trustedLogin(email);
    return `https://judging.revolutionuc.com/login?token=${token}`;
  }

  private getAge(birthDateString: string): number {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private getInviteLinks(registrant: Registrant) {
    const discordLink = DISCORD_INVITE;
    const isMinor = registrant.age < 18;
    const hopinLink = isMinor ? HOPIN_INVITE_MINOR : HOPIN_INVITE;
    return { discordLink, hopinLink };
  }

  private async sendHelper(
    template: EMAIL,
    emailData: EmailDataDto,
    recipentEmail: string,
    dryRun: boolean,
    reg?: Registrant,
  ) {
    if (dryRun) {
      // console.log({ template, emailData, recipentEmail });
      return;
    } else {
      if (template === 'confirmAttendance') {
        const { yesConfirmationUrl, noConfirmationUrl } =
          this.getConfirmationLinks(recipentEmail);
        emailData.yesConfirmationUrl = yesConfirmationUrl;
        emailData.noConfirmationUrl = noConfirmationUrl;
      }
      if (template === 'infoEmailJudges') {
        const judgingLoginLink = await this.getJudgingLoginLink(recipentEmail);
        emailData.judgingLoginLink = judgingLoginLink;
      }
      if (template === 'infoEmail4') {
        const { discordLink, hopinLink } = this.getInviteLinks(reg);
        emailData.discordLink = discordLink;
        emailData.hopinLink = hopinLink;
      }
      if (template.includes('post')) {
        if (!reg?.checkedIn) return;
      }
      return build(template, emailData)
        .then((html) => {
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

    const emailData = { ...this.emailData[payload.template] };

    if (payload.recipent === 'all') {
      const registrants = await this.registrantRepository.find({
        // Should NOT email people who have confirm false attendance
        where: [
          { confirmedAttendance: IsNull() },
          { confirmedAttendance: true },
        ],
      });
      Logger.log(`Sending ${payload.template} to ${registrants.length}`);

      registrants.forEach(async (reg) => {
        try {
          const emailDataCopy = {
            ...emailData,
            firstName: reg.firstName,
            registrantId: reg.id,
          };

          await this.sendHelper(
            payload.template,
            emailDataCopy,
            reg.email,
            payload.dryRun,
            reg,
          );

          if (!payload.dryRun) {
            if (!reg.emailsReceived.includes(payload.template)) {
              reg.emailsReceived.push(payload.template);
              await this.registrantRepository.save(reg);
            }
          }

          Logger.log(`Successfully sent ${payload.template} to ${reg.email}`);
        } catch (err) {
          Logger.error(
            `Could not send ${payload.template} to ${reg.email}: ${err.message}`,
          );
        }
      });
    } else {
      try {
        if (payload.template.includes(`Judge`)) {
          // email meant for judge
          const judge = await this.judgeRepository.findOneByOrFail({
            email: payload.recipent,
          });
          emailData.firstName = judge.name;
          await this.sendHelper(
            payload.template,
            emailData,
            judge.email,
            payload.dryRun,
          );
        } else {
          // email meant for registrant
          const registrant = await this.registrantRepository.findOneByOrFail({
            email: payload.recipent,
          });
          emailData.firstName = registrant.firstName;
          emailData.registrantId = registrant.id;

          emailData.resetToken = payload.resetToken;

          await this.sendHelper(
            payload.template,
            emailData,
            registrant.email,
            payload.dryRun,
            registrant,
          );
          if (!payload.dryRun) {
            if (!registrant.emailsReceived.includes(payload.template)) {
              registrant.emailsReceived.push(payload.template);
              await this.registrantRepository.save(registrant);
            }
          }

          Logger.log(
            `Successfully sent ${payload.template} to ${registrant.email}`,
          );
        }
      } catch (err) {
        Logger.error(
          `Could not send ${payload.template} to ${payload.recipent}: ${err.message}`,
        );
      }
    }
  }
}
