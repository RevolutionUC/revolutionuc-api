import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { RegistrantDto } from './dtos/Registrant.dto';
import { Registrant, UploadKeyDto } from './entities/registrant.entity';
import { environment } from '../environments/environment';
import * as crypto from 'crypto';
import * as multer from 'multer';
import * as multers3 from 'multer-s3';
import * as aws from 'aws-sdk';
import { StatsDto } from 'dtos/Stats.dto';

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
    const payload: UploadKeyDto = {uploadKey: null};
    const cipher = crypto.createCipher(this.userCryptoAlgorithm, environment.CRYPTO_KEY);
    let encrypted = cipher.update(user.email, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const emailData = {
      subject: 'Verify Email',
      shortDescription: 'Please verify your email address for RevolutionUC',
      firstName: user.firstName,
      verificationUrl: `https://revolutionuc.com/registration/verify?user=${encrypted}`,
      waitlist: false
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
  async getUser(uuid: string): Promise<Registrant> {
    return await this.registrantRepository.findOneOrFail({id: uuid});
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
  async getRegistrants(): Promise<Registrant[]> {
    return await this.registrantRepository.find();
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
    stats.allergens = await this.registrantRepository.query(`select "allergens", count(*)
                                                            from (
                                                              select unnest("allergens") as allergens
                                                              from public.registrant
                                                            ) t
                                                            group by allergens
                                                            order by count ASC;`);
    return await(stats);
  }
  checkInRegistrant(uuid: string): any {
    this.registrantRepository.update({id: uuid}, {checkedIn: true});
  }
}
