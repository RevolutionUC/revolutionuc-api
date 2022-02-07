import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { validateOrReject } from 'class-validator';
import { AuthService } from '../../auth/auth.service';
import { Swipe } from '../entities/swipe.entity';
import { Hacker, Tour } from '../entities/hacker.entity';
import { ScoreService } from './score.service';
import { ProfileDTO, ScoredProfileDTO, ProfileWithEmail } from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Hacker) private hackerRepository: Repository<Hacker>,
    @InjectRepository(Swipe) private swipeRepository: Repository<Swipe>,
    private scoreService: ScoreService,
    private authService: AuthService,
  ) {}

  private async getSwipes(from: Hacker): Promise<Array<Swipe>> {
    return this.swipeRepository.find({ from: from.id });
  }

  private async getUnscoredProfiles(from: Hacker): Promise<Array<Hacker>> {
    const swipes = await this.getSwipes(from);
    const swipedHackers = swipes.map((swipe) => swipe.to);

    return this.hackerRepository.find({
      where: {
        visible: true,
        id: Not(In([...swipedHackers, from.id])),
      },
    });
  }

  async getScoredProfiles(userId: string): Promise<Array<ScoredProfileDTO>> {
    const from = await this.hackerRepository.findOne({ userId });
    if (!from.visible) {
      throw new HttpException(
        `Profile must be visible`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const unscoredProfiles = await this.getUnscoredProfiles(from);
    const scoredProfiles = this.scoreService.scoreAndSortProfiles(
      from,
      unscoredProfiles,
    );
    scoredProfiles.splice(10);
    return scoredProfiles.reverse();
  }

  async getProfile(userId: string): Promise<ProfileWithEmail> {
    const hacker = await this.hackerRepository.findOne(
      { userId },
      {
        select: [
          `name`,
          `skills`,
          `idea`,
          `lookingFor`,
          `discord`,
          `inPerson`,
          `started`,
          `completed`,
          `visible`,
          `completedTours`,
        ],
      },
    );

    const { username: email } = await this.authService.getUserDetails(userId, [
      `HACKER`,
    ]);

    if (!hacker) {
      Logger.error(`Hacker profile for user ${userId} not found`);
      throw new HttpException(
        `Hacker profile for user ${userId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return { ...hacker, email };
  }

  async getProfileByEmail(email: string): Promise<ProfileDTO> {
    const { id: userId } = await this.authService.findUser(email, [`HACKER`]);

    const hacker = await this.hackerRepository.findOne(
      { userId },
      {
        select: [
          `name`,
          `skills`,
          `idea`,
          `lookingFor`,
          `discord`,
          `inPerson`,
          `started`,
          `completed`,
          `visible`,
          `completedTours`,
        ],
      },
    );

    if (!hacker) {
      Logger.error(`Hacker profile for user ${email} not found`);
      throw new HttpException(
        `Hacker profile for user ${email} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return hacker;
  }

  async startProfile(userId: string): Promise<void> {
    const profile = await this.hackerRepository.findOne({ userId });
    if (profile.started) {
      throw new HttpException(
        `Profile already started`,
        HttpStatus.BAD_REQUEST,
      );
    }

    profile.started = true;
    await this.hackerRepository.save(profile);
  }

  async updateProfile(
    userId: string,
    updates: ProfileDTO,
  ): Promise<ProfileWithEmail> {
    const profile = await this.hackerRepository.findOne({ userId });
    if (!profile) {
      Logger.error(`Hacker profile for user ${userId} not found`);
      throw new HttpException(
        `Hacker profile for user ${userId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const newProfile: Hacker = Object.assign(profile, updates);

    try {
      await validateOrReject(newProfile);
    } catch (err) {
      Logger.error(`Validation error`);
      Logger.error(err);
      throw new HttpException(`Invalid profile fields`, HttpStatus.BAD_REQUEST);
    }

    if (!newProfile.completed) {
      newProfile.completed = true;
    }

    try {
      await this.hackerRepository.save(newProfile);
    } catch (err) {
      Logger.error(err);
      throw new HttpException(
        `Error updating hacker profile: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.getProfile(userId);
  }

  async setVisible(
    userId: string,
    visible: boolean,
  ): Promise<ProfileWithEmail> {
    const profile = await this.hackerRepository.findOne({ userId });
    profile.visible = !!visible;
    await this.hackerRepository.save(profile);
    return this.getProfile(userId);
  }

  async completeTour(userId: string, tour: Tour): Promise<void> {
    const profile = await this.hackerRepository.findOne({ userId });

    if (!profile.completedTours) {
      profile.completedTours = [];
    }

    if (profile.completedTours.includes(tour)) {
      return;
    }

    profile.completedTours.push(tour);
    await this.hackerRepository.save(profile);
  }
}
