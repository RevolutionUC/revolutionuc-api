export class ProfileDTO {
  name: string
  skills: string[]
  idea: string
  lookingFor: string[]
  discord: string
  started: boolean
  completed: boolean
  visible: boolean
}

export class ScoredProfileDTO extends ProfileDTO {
  score: number
}
