import summary from '../../../data/generated/summary.json';
export const master = summary;
export const APP_VERSION='0.9.0';
export const RELEASE_NAME='Construction & Logistics';
export const climateById=(id:string)=>master.climates.find(c=>c.id===id);
