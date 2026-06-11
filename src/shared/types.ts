export interface BaseProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  role: string;
  summary: string;
  competencies: string[];
}

export interface ResumeRules {
  profile: {
    candidate_name: string;
    output_naming_convention: string;
  };
  syntax_constraints: {
    latex_compatibility: string;
    forbidden_characters: Record<string, string>;
    bullet_styling: string;
  };
  tone_and_voice: {
    style: string;
    forbidden_words: Record<string, string>;
    buzzword_policy: string;
  };
  page_defense_layout: {
    absolute_page_limit: number;
    geometry_margins: string;
    section_spacing: string;
    list_spacing: string;
    forbidden_environments: string[];
    macro_content_limits: {
      summary_sentences_max: number;
      core_competencies_count: number;
    };
  };
  ats_target_block: {
    required: boolean;
    format_string: string;
  };
  file_naming: {
    output_dir: string;
  };
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  jobUrl: string;
  jobDescription: string;
  atsScore: number;
  analysis: string;
  summary: string;
  competencies: string;
  coverLetter: string;
  keywords: string[];
  date: string;
  status: JobStatus;
  error?: string;
  pdfPath?: string;
  clPdfPath?: string;
}

export interface UserSettings {
  geminiApiKey: string;
  resumeRulesJson: string;
}
