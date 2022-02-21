import { Category } from '../entities/category.entity';
import { Judge } from '../entities/judge.entity';
import { Submission } from '../entities/submission.entity';

export class GroupDto {
  name: string;
  judges: Judge[];
  category: Category;
  submissions: Submission[];
}
