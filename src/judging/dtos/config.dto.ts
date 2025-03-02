export class JudgingConfigDto {
  year: number;
  generalGroupCount: number;
  generalJudgesPerGroup: number;
  generalGroupsPerProject: number;
  titleColumn: string;
  urlColumn: string;
  categoryColumn: string;
  tableNumberColumn: string;
  categoryConfig?: Record<string, { groupCount: number; judgesPerGroup: number; groupsPerProject: number }>;
}
