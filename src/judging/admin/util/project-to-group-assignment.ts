import { Logger } from '@nestjs/common';
import { militarizeText } from 'military-speak';
import { GroupDto } from '../../dtos/group.dto';
import { Category } from '../../entities/category.entity';
import { JudgingConfig } from '../../entities/config.entity';

function shuffleArray<T = any>(array: T[]): T[] {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

const groupGenerator = (length: number): GroupDto[] => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const limit = alphabet.substr(0, length);
  const names: string[] = militarizeText(limit).split(' ');

  return names.map((name) => ({
    name: `Judging Group ${name}`,
    judges: [],
    submissions: [],
    category: null,
  }));
};

const populateGeneralGroups = (
  category: Category,
  generalGroups: GroupDto[],
  config: JudgingConfig,
) => {
  Logger.log(`populateGeneralGroups() started`);

  const generalGroupsPerProject = config.generalGroupsPerProject;
  const generalJudgesPerGroup = config.generalJudgesPerGroup;

  const generalJudges = category.judges;
  const generalSubmissions = category.submissions;

  const groupCount = generalGroups.length;
  const submissionCount = generalSubmissions.length;

  const projectsPerGroup = Math.ceil(
    (submissionCount / groupCount) * generalGroupsPerProject,
  );

  // Shuffle the list of submissions
  const shuffledSubmissions = shuffleArray(generalSubmissions);

  // Start assignment with the first group
  let groupIndex = 0;

  // Start assigning submissions
  for (let i = 0; i < generalGroupsPerProject; i++) {
    // Go through the list of submissions k times
    shuffledSubmissions.forEach((submission) => {
      // if the current group is full
      if (generalGroups[groupIndex].submissions.length >= projectsPerGroup) {
        // Sort submissions by table number or something
        // groups[groupIndex].submissions = groups[groupIndex].submissions.sort();

        // Next group
        groupIndex++;
      }

      // Assign the submission to the current group
      generalGroups[groupIndex].submissions.push(submission);
    });
  }

  // Shuffle the list of judges
  const shuffledJudges = shuffleArray(generalJudges);

  // Start assignment with the first group again
  groupIndex = 0;

  // Go through the list of judges
  shuffledJudges.forEach((judge) => {
    // if the current group is full
    if (generalGroups[groupIndex].judges.length >= generalJudgesPerGroup) {
      // Next group
      groupIndex++;
    }

    // Assign the judge to the current group
    generalGroups[groupIndex].judges.push(judge);
  });

  generalGroups.forEach((group) => (group.category = category));

  Logger.log(`populateGeneralGroups() finished`);
};

export const assign = (categories: Category[], config: JudgingConfig) => {
  const groupCount = config.generalGroupCount + (categories.length - 1);
  const groups = groupGenerator(groupCount);

  let groupIndex = 0;

  const generalGroups = groups.splice(0, config.generalGroupCount);

  Logger.log(
    `assign() created ${generalGroups.length} general groups, ${groups.length} category groups`,
  );

  categories.forEach((category) => {
    if (category.name === `General`) {
      populateGeneralGroups(category, generalGroups, config);
    } else {
      Logger.log(`assign() assignment for category ${category.name}`);

      const group = groups[groupIndex];
      group.category = category;
      group.judges = [...category.judges];
      group.submissions = [...category.submissions];
      groupIndex++;
    }
  });

  return [...groups, ...generalGroups];
};
