import csvToJson from 'csvjson-csv2json';
import { JudgingConfig } from '../../entities/config.entity';
import { ProjectDto } from '../../dtos/project.dto';

export const devpostParser = (csv: string, config: JudgingConfig) => {
  const projects: { [key: string]: ProjectDto } = {};

  const json = csvToJson(csv);

  json.forEach((submission: { [key: string]: string }) => {
    const title = submission[config.titleColumn];
    const category = submission[config.categoryColumn];

    const project = projects[title];

    if (project) {
      project.categories.push(category);
    } else {
      projects[title] = {
        title,
        url: submission[config.urlColumn],
        tagline: submission[config.taglineColumn],
        description: submission[config.descriptionColumn],
        submitterEmail: submission[config.submitterEmailColumn],
        submitterName: submission[config.submitterNameColumn],
        categories: [category]
      };
    }
  });

  return Object.values(projects);
};
