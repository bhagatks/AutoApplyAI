export interface AppConfig {
  DASHBOARD_URL: string;
}

export interface BasicUserConfig {
  uid: string;
  token: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CustomerConfig {
  customerId: string;
  geminiApiKey: string;
  outputDir: string;
  candidateProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    resume: string;
  };
}
