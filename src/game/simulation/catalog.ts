/** Small verified adapter; data:check verifies these values against Frozen workbook. */
export const CLOCK={realSecondsPerDay:180,daysPerSeason:30,daysPerYear:120,maxSpeed:4,tickMs:100,ticksPerDay:1800} as const;
export const SEASONS=[{id:'S1',name:'Xuân',from:1,to:30},{id:'S2',name:'Hạ',from:31,to:60},{id:'S3',name:'Thu',from:61,to:90},{id:'S4',name:'Đông',from:91,to:120}] as const;
