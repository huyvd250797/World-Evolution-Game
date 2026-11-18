import summary from '../../../data/generated/summary.json';
export const master = summary;
export const APP_VERSION='0.1.1';
export const RELEASE_NAME='Vercel Deployment Hotfix';
export const climateById=(id:string)=>master.climates.find(c=>c.id===id);
