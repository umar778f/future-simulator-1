export interface SimulationInput {
  name: string;
  educationLevel: string;
  currentSkills: string;
  careerGoals: string;
  dailyStudyHours: number;
  productivityLevel: string;
  consistencyLevel: string;
  technologies: string;
  futureDecision: string;
  timeframe: string;
}

export interface FutureCase {
  title: string;
  career_status: string;
  salary_estimate: string;
  skills_gained: string[];
  opportunities: string[];
  risks: string[];
  timeline: string;
  summary: string;
}

export interface SimulationOutput {
  best_case: FutureCase;
  average_case: FutureCase;
  worst_case: FutureCase;
  probabilities: {
    best_case: string;
    average_case: string;
    worst_case: string;
  };
  recommendation: string;
  motivation: string;
}

export interface SimulationRecord {
  id: string;
  userId: string;
  input: SimulationInput;
  output: SimulationOutput;
  createdAt: number;
}
