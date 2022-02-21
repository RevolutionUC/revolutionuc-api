import { Injectable } from '@nestjs/common';
import { ScoredProfileDTO, ProfileDTO } from './profile.dto';

@Injectable()
export class ScoreService {
  private scoreProfileOneWay(a: ProfileDTO, b: ProfileDTO): number {
    return a.skills.reduce(
      (currentScore, skill) =>
        b.lookingFor.includes(skill) ? ++currentScore : currentScore,
      0,
    );
  }

  private scoreProfileBothWays(
    from: ProfileDTO,
    to: ProfileDTO,
  ): ScoredProfileDTO {
    const score =
      this.scoreProfileOneWay(from, to) + this.scoreProfileOneWay(to, from);
    return { ...to, score };
  }

  private scoreProfiles(
    from: ProfileDTO,
    profiles: Array<ProfileDTO>,
  ): Array<ScoredProfileDTO> {
    return profiles.map((to) => this.scoreProfileBothWays(from, to));
  }

  private sortProfilesByScore(
    profiles: Array<ScoredProfileDTO>,
  ): Array<ScoredProfileDTO> {
    return profiles.sort((a, b) => b.score - a.score);
  }

  scoreAndSortProfiles(
    from: ProfileDTO,
    profiles: Array<ProfileDTO>,
  ): Array<ScoredProfileDTO> {
    return this.sortProfilesByScore(this.scoreProfiles(from, profiles));
  }
}
