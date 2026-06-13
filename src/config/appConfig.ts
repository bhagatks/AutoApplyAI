import { AppConfig } from './types';

const getIsDev = (): boolean => {
  return typeof import.meta !== 'undefined' && import.meta.env && !!import.meta.env.DEV;
};

export const appConfig: AppConfig = {
  DASHBOARD_URL: getIsDev() ? 'http://localhost:3000/login' : 'https://autoapplyai-3e61d.web.app/login'
};
