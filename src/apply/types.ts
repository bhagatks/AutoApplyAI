export interface ApplicationQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file' | 'unknown';
  required?: boolean;
  options?: string[];
}

export interface AssistApplyPayload {
  jobId: string;
  jobTitle: string;
  companyName: string;
  jobUrl: string;
  jobDescription: string;
  platform: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
  };
  customAnswers: Record<string, string>;
  resumePdfPath?: string;
  coverLetterPdfPath?: string;
  summary?: string;
  coverLetter?: string;
}

export interface AssistApplyResult {
  success: boolean;
  prefilledCount: number;
  highlightedFields: string[];
  unansweredQuestions: ApplicationQuestion[];
  message?: string;
  error?: string;
}
