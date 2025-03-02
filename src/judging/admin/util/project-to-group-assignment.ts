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

const populateGroups = (
  category: Category,
  categoryGroups: GroupDto[],
  groupPerProject: number,
  judgesPerGroup: number,
) => {
  Logger.log(`populateCategoryGroups() started`);

  const categoryGroupsPerProject = groupPerProject;
  const categoryJudgesPerGroup = judgesPerGroup;

  const categoryJudges = category.judges;
  const categorySubmissions = category.submissions;

  const groupCount = categoryGroups.length;
  const submissionCount = categorySubmissions.length;

  const projectsPerGroup = Math.ceil(
    (submissionCount / groupCount) * categoryGroupsPerProject,
  );

  // Shuffle the list of submissions
  const shuffledSubmissions = shuffleArray(categorySubmissions);

  // Start assignment with the first group
  let groupIndex = 0;

  // Start assigning submissions
  for (let i = 0; i < categoryGroupsPerProject; i++) {
    // Go through the list of submissions k times
    shuffledSubmissions.forEach((submission) => {
      // if the current group is full
      if (categoryGroups[groupIndex].submissions.length >= projectsPerGroup) {
        // Sort submissions by table number or something
        // groups[groupIndex].submissions = groups[groupIndex].submissions.sort();

        // Next group
        groupIndex++;
      }

      // Assign the submission to the current group
      categoryGroups[groupIndex].submissions.push(submission);
    });
  }

  // Shuffle the list of judges
  const shuffledJudges = shuffleArray(categoryJudges);

  // Start assignment with the first group again
  groupIndex = 0;

  // Go through the list of judges
  shuffledJudges.forEach((judge) => {
    // if the current group is full
    if (categoryGroups[groupIndex].judges.length >= categoryJudgesPerGroup) {
      // Next group
      groupIndex++;
    }

    // Assign the judge to the current group
    categoryGroups[groupIndex].judges.push(judge);
  });

  categoryGroups.forEach((group) => (group.category = category));

  Logger.log(`populateGroups() finished`);
};

export const assign = (categories: Category[], config: JudgingConfig) => {
  const categoryConfigLength = Object.keys(config.categoryConfig || {}).length;
  const categoryConfigGroupCount = Object.values(config.categoryConfig || {}).reduce(
    (sum, category) => sum + category.groupCount, 0
  );
  const groupCount = config.generalGroupCount + categoryConfigGroupCount + (categories.length - categoryConfigLength - 1);
  const groups = groupGenerator(groupCount);


  let groupIndex = 0;

  const generalGroups = groups.splice(0, config.generalGroupCount);

  Logger.log(
    `assign() created ${generalGroups.length} general groups, ${groups.length} category groups`,
  );

  const categorizedGroups: Record<string, GroupDto[]> = {};

  Object.entries(config.categoryConfig || {}).forEach(([categoryName, categoryCfg]) => {
    categorizedGroups[categoryName] = groups.splice(0, categoryCfg.groupCount);
    Logger.log(`Created ${categoryCfg.groupCount} groups for ${categoryName}`);
  });

  categories.forEach((category) => {
    if (category.name === `General`) {
      populateGroups(category, generalGroups, config.generalGroupsPerProject, config.generalJudgesPerGroup);
    } else if (config.categoryConfig?.[category.name]) {
      populateGroups(category, categorizedGroups[category.name], config.categoryConfig[category.name].groupsPerProject, config.categoryConfig[category.name].judgesPerGroup);
    } else {
      Logger.log(`assign() assignment for category ${category.name}`);

      const group = groups[groupIndex];
      group.category = category;
      group.judges = [...category.judges];
      group.submissions = [...category.submissions];
      groupIndex++;
    }
  });

  const finalCategorizedGroups = Object.values(categorizedGroups).reduce((acc, val) => acc.concat(val), []);
  return [...groups, ...generalGroups, ...finalCategorizedGroups];
};
