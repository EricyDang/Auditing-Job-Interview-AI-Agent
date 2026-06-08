export type CandidateStage =
  | "internship"
  | "campus"
  | "experienced"
  | "unknown";

export type CandidateInput = {
  resumeText?: string;
  targetIndustries?: string[];
  targetRoles?: string[];
  targetJDs?: string[];
  candidateStage?: CandidateStage;
  applicationHistory?: {
    count?: number;
    platforms?: string[];
    roles?: string[];
    cities?: string[];
    referralUsed?: boolean;
    resumeCustomized?: boolean;
    feedback?: string;
  };
  constraints?: {
    cities?: string[];
    remoteAccepted?: boolean;
    availableDaysPerWeek?: number;
    startDate?: string;
    salaryExpectation?: string;
    longTermAvailable?: boolean;
    travelAccepted?: boolean;
    rotationAccepted?: boolean;
  };
  materials?: {
    portfolio?: string;
    github?: string;
    linkedin?: string;
    certificates?: string[];
    transcript?: string;
    recommendation?: string;
  };
};

export type RoleModel = {
  hardSkills: string[];
  tools: string[];
  industryKnowledge: string[];
  experienceSignals: string[];
  measurableOutcomes: string[];
  softSkills: string[];
  credentials: string[];
  portfolioNeeds: string[];
};

export type AuditState = {
  infoCompletenessScore: number;
  missingCriticalFields: string[];
  assumptions: string[];
  candidateStage: CandidateStage;
  roleFamily: string;
  inferredTargets: {
    primaryRole: string;
    secondaryRoles: string[];
    notRecommendedRoles: string[];
  };
  roleModel: RoleModel;
  keywordMap: {
    required: string[];
    covered: string[];
    missing: string[];
    strengthen: string[];
    removeOrWeaken: string[];
  };
  riskFlags: string[];
};

export type AuditReport = {
  completenessJudgment: string;
  zeroResponseDiagnosis: string;
  targetClarification: string;
  roleCapabilityModel: string;
  resumeKeywordReview: string;
  recruiterStyleRewrite: string;
  credibilityAndResultOptimization: string;
  fourWeekApplicationStrategy: string;
  outreachTemplates: string;
  interviewSimulation: string;
  finalJobSearchSystem: string;
};
