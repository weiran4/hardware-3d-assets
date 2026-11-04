import {catalog} from './rtds-catalog.js';
const powerHardware=new Set(['gtao-v2','gtai-v2','gtdi-v2','gtdo-v2']);
export function lessonForHardware(id){return id==='novacor-2.0'?'analog':powerHardware.has(id)?'power':id==='cubicle-v2'?'cabinet':id==='cubicle-v1'?'cabinetV1':null;}
export function hardwareHash(id){return '#rtds-hardware-'+id;}
export function lessonHash(lesson){return {analog:'#rtds-analog',power:'#rtds-power',cabinet:'#rtds-chapter-1a',cabinetV1:'#rtds-chapter-1b'}[lesson]||'#rtds';}
export function parseTeachingRoute(hash){
 const interfaceGroups={'novacor-2.0':['gtio','aurora','irc','gtsync','wif','udp','gbh','analogue'],'gtai-v2':['analogue_input'],'gtao-v2':['analog_output'],'gtdo-v2':['digital_output']};
 if(hash.startsWith('#rtds-interface:')){const [,hardware,group]=hash.split(':');return Object.hasOwn(interfaceGroups,hardware)&&interfaceGroups[hardware].includes(group)?{hardware,group}:null;}
 if(['#rtds-analog','#rtds-analog-lesson'].includes(hash))return {hardware:'novacor-2.0',lesson:'analog'};
 if(['#rtds-power','#rtds-power-lesson'].includes(hash))return {hardware:'gtao-v2',lesson:'power'};
 if(hash==='#rtds-chapter-2a')return {hardware:'novacor-2.0',lesson:'analog',chapter:'2a'};
 if(hash==='#rtds-chapter-1b')return {hardware:'cubicle-v1',lesson:'cabinetV1'};
 if(hash==='#rtds-chapter-1a')return {hardware:'cubicle-v2',lesson:'cabinet'};
 const hardware=hash.startsWith('#rtds-hardware-')?hash.slice(15):null;
 return hardware&&catalog.some(c=>c.id===hardware)?{hardware,lesson:lessonForHardware(hardware)}:null;
}
// Yield while a lesson occupies the upper reading band, not when its preview
// merely peeks below interface facts. No gutter, new renderer or preference reset.
export function teachingOwnsViewport(rect,height){return rect.top<height/3&&rect.bottom>height/3;}
