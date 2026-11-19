import summary from '../../../data/generated/summary.json';
export const master = summary;
export const APP_VERSION='0.7.0';
export const RELEASE_NAME='Workforce & Training';
export const climateById=(id:string)=>master.climates.find(c=>c.id===id);
