import summary from '../../../data/generated/summary.json';
export const master = summary;
export const APP_VERSION='0.6.0';
export const RELEASE_NAME='Survival & Food';
export const climateById=(id:string)=>master.climates.find(c=>c.id===id);
