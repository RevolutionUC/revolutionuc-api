import { Logger } from '@nestjs/common';
import { JudgingConfig } from '../../entities/config.entity';
import { ProjectDto } from '../../dtos/project.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const csvToJson = require('csvjson-csv2json');

export const devpostParser = (csv: string, config: JudgingConfig) => {
  const projects: { [key: string]: ProjectDto } = {};
  console.log({ csvToJson });
  const json = csvToJson(csv);

  json.forEach((submission: { [key: string]: string }) => {
    const title = submission[config.titleColumn];
    const category = submission[config.categoryColumn];
    
    Logger.log(`Searching for project "${title}"`);
    const project = projects[title];

    if (project) {
      Logger.log(`project "${title}" already exists`);
      project.categories.push(category);
    } else {
      Logger.log(`project "${title}" does not exist, creating now`);
      projects[title] = {
        title,
        url: submission[config.urlColumn],
        tagline: submission[config.taglineColumn],
        description: submission[config.descriptionColumn],
        submitterEmail: submission[config.submitterEmailColumn],
        submitterName: submission[config.submitterNameColumn],
        categories: [`General`, category]
      };
    }
  });

  Logger.log(`Total projects: ${Object.keys(projects).length}`);

  return Object.values(projects);
};
