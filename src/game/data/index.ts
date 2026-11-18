import summary from '../../../data/generated/summary.json';
export const master = summary;
export const APP_VERSION='0.2.0';
export const RELEASE_NAME='Isometric World & Camera';
export const climateById=(id:string)=>master.climates.find(c=>c.id===id);
