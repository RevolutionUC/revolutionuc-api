import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { RegistrantDto } from '../dtos/Registrant.dto';
import { Registrant, SortKey, SortOrder } from '../entities/registrant.entity';
import * as multer from 'multer';
import * as multers3 from 'multer-s3';
import { S3 } from 'aws-sdk';
import { environment } from 'src/environment';

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
    full: boolean,
  ): Promise<Pagination<Registrant>> {
    let query = this.registrantRepository
      .createQueryBuilder('user')
      .orderBy(`user.${sortKey}`, sortOrder);

    if (q) {
      query = query
        .where("user.firstName || ' ' || user.lastName ILIKE :query")
        .orWhere('user.email ILIKE :query')
        .setParameter('query', '%' + q + '%');
    }

    if (!full) {
      query = query.select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.createdAt',
        'user.emailVerfied',
        'user.checkedIn',
        'user.age',
      ]);
    }

    query.printSql();

    return paginate(query, { page, limit });
  }

  async getRegistrant(uuid: string): Promise<Registrant> {
    try {
      const registrant = await this.registrantRepository.findOneBy({
        id: uuid,
      });
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
      const oldRegistrant = await this.registrantRepository.findOneBy({
        id: uuid,
      });
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
      const registrant = await this.registrantRepository.findOneBy({
        id: uuid,
      });
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

  async confirmAttendance(uuid: string): Promise<void> {
    try {
      const count = await this.registrantRepository.countBy({
        confirmedAttendance: true,
      });
      console.log(`confirmAttendance()`, {
        count,
        threshold: environment.WAITLIST_THRESHOLD,
      });
      if (count >= environment.WAITLIST_THRESHOLD) {
        throw new HttpException(`error`, 400);
      }

      const result = await this.registrantRepository.update(uuid, {
        confirmedAttendance: true,
      });
      if (!result.affected) {
        throw new HttpException(`Invalid registrant id`, HttpStatus.NOT_FOUND);
      }
      return;
    } catch (err) {
      throw new HttpException(
        `Error confirming attendance: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkInRegistrant(uuid: string): Promise<void> {
    try {
      const registrant = await this.registrantRepository.findOneBy({
        id: uuid,
      });
      if (!registrant) {
        throw new HttpException(`Invalid registrant id`, HttpStatus.NOT_FOUND);
      }
      // If they have confirmed attendance and not in the waitlist, then we simply check them in
      if (registrant.confirmedAttendance && !registrant.isWaitlisted) {
        registrant.checkedIn = true;
        await this.registrantRepository.save(registrant);
      } else {
        // If haven't confirmed attendance or confirmed "NO", then we check in but also put into waitlist
        registrant.checkedIn = true;
        registrant.isWaitlisted = true;
        await this.registrantRepository.save(registrant);
      }

      return;
    } catch (err) {
      throw new HttpException(
        `Error checking in registrant: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkInRegistrantByEmail(email: string): Promise<Registrant> {
    try {
      const registrant = await this.registrantRepository.findOneBy({ email });
      if (!registrant) {
        throw new HttpException(
          `Invalid registrant email`,
          HttpStatus.NOT_FOUND,
        );
      }

      registrant.checkedIn = true;

      return this.registrantRepository.save(registrant);
    } catch (err) {
      throw new HttpException(
        `Error checking in registrant: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCheckedInCount(): Promise<number> {
    try {
      return await this.registrantRepository.count({
        where: { checkedIn: true },
      });
    } catch (err) {
      throw new HttpException(
        `Error getting checked in count: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getConfirmedCheckedInCount(): Promise<number> {
    try {
      return await this.registrantRepository.count({
        where: { checkedIn: true, confirmedAttendance: true },
      });
    } catch (err) {
      throw new HttpException(
        `Error getting confirmed checked in count: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
