import { militarizeText } from 'military-speak';
import { GroupDto } from 'src/judging/dtos/group.dto';
import { Category } from 'src/judging/entities/category.entity';
import { JudgingConfig } from 'src/judging/entities/config.entity';

// Fisher-Yates shuffle
function shuffleArray<T = any>(array: T[]): T[] {
  const newArray = [ ...array ];

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

  return names.map(name => ({ name: `Judging Group ${name}`, submissions: [] }));
}

export const assigner = (categories: Category[], config: JudgingConfig): GroupDto[] => {
  const groups: GroupDto[] = [];

  categories.forEach(category => {
    if(category.name === `General`) {
      const g = config.generalGroupCount;
      const k = config.generalGroupsPerProject;
      const submissions = category.submissions;
      const p = submissions.length;
      const generalGroups = groupGenerator(g);

      const projectsPerGroup = Math.ceil((p / g) * k);

      // Shuffle the list of submissions
      const shuffledSubmissions = shuffleArray(submissions);

      // Start assignment with the first group
      let groupIndex = 0;

      for (let i = 0; i < k; i++) {
        
        // Go through the list of submissions k times
        shuffledSubmissions.forEach(submission => {

          // if the current group is full
          if (generalGroups[groupIndex].submissions.length >= projectsPerGroup) {
            // Sort submissions by table number or something
            // groups[groupIndex].submissions = groups[groupIndex].submissions.sort();

            // Next group
            groupIndex++;
          }

          // Assign the submission to the current group
          generalGroups[groupIndex].submissions.push(submission);
        })
      }

      groups.push(...generalGroups);
    } else {
      groups.push({ name: category.name, judges: category.judges, submissions: category.submissions });
    }
  });

  return groups;
}
