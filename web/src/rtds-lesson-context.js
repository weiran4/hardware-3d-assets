import {catalog} from './rtds-catalog.js';
const powerHardware=new Set(['gtao-v2','gtai-v2','gtdi-v2','gtdo-v2']);
export function lessonForHardware(id){return id==='gtfpi-v2'?'gtfpi':id==='gtnet-x2'?'gtnetX2':id==='gtnet-v3'?'gtnetV3':id==='gbh-v2'?'gbhV2':id==='gbh-v3'?'gbh':id==='irc-switch-v2'?'irc':id==='novacor-2.0'?'analog':id==='novacor-1.0'?'one':id==='novacor-light'?'light':powerHardware.has(id)?'power':id==='cubicle-v2'?'cabinet':id==='cubicle-v1'?'cabinetV1':null;}
export function hardwareHash(id){return '#rtds-hardware-'+id;}
export function lessonHash(lesson){return {gtaoScope:'#rtds-gtao-scope',gtaiLab:'#rtds-analog-input',ioChain:'#rtds-io-chain',hv:'#rtds-hv-panel',gtfpi:'#rtds-gtfpi-protection',digitalOutput:'#rtds-digital-output',digitalInput:'#rtds-digital-input',gtnetX2:'#rtds-chapter-5b',gtnetV3:'#rtds-chapter-5a',gbhV2:'#rtds-chapter-4b',gbh:'#rtds-chapter-4a',irc:'#rtds-chapter-3',one:'#rtds-chapter-2c',light:'#rtds-chapter-2b',analog:'#rtds-analog',power:'#rtds-power',cabinet:'#rtds-chapter-1a',cabinetV1:'#rtds-chapter-1b'}[lesson]||'#rtds';}
export function parseTeachingRoute(hash){
 if(['#rtds-gtao-scope','#rtds-presentation-8','#rtds-presentation-9'].includes(hash))return {hardware:'gtao-v2',lesson:'gtaoScope'};
 if(['#rtds-analog-input','#rtds-presentation-10','#rtds-presentation-12'].includes(hash))return {hardware:'gtai-v2',lesson:'gtaiLab'};
 if(['#rtds-io-chain','#rtds-presentation-21','#rtds-presentation-22','#rtds-presentation-23'].includes(hash))return {hardware:'novacor-2.0',lesson:'ioChain'};
 if(['#rtds-hv-panel','#rtds-presentation-20'].includes(hash))return {hardware:'gtfpi-v2',lesson:'hv'};
 if(['#rtds-gtfpi-protection','#rtds-presentation-18','#rtds-presentation-19'].includes(hash))return {hardware:'gtfpi-v2',lesson:'gtfpi'};
 if(['#rtds-digital-output','#rtds-presentation-15','#rtds-presentation-16','#rtds-presentation-17'].includes(hash))return {hardware:'gtdo-v2',lesson:'digitalOutput'};
 if(['#rtds-digital-input','#rtds-presentation-13','#rtds-presentation-14'].includes(hash))return {hardware:'gtdi-v2',lesson:'digitalInput'};
 const interfaceGroups={'novacor-2.0':['gtio','aurora','irc','gtsync','wif','udp','gbh','analogue'],'gtai-v2':['analogue_input'],'gtao-v2':['analog_output'],'gtdo-v2':['digital_output']};
 if(hash.startsWith('#rtds-interface:')){const [,hardware,group]=hash.split(':');return Object.hasOwn(interfaceGroups,hardware)&&interfaceGroups[hardware].includes(group)?{hardware,group}:null;}
 if(['#rtds-analog','#rtds-analog-lesson'].includes(hash))return {hardware:'novacor-2.0',lesson:'analog'};
 if(['#rtds-power','#rtds-power-lesson'].includes(hash))return {hardware:'gtao-v2',lesson:'power'};
 if(hash==='#rtds-chapter-5b')return {hardware:'gtnet-x2',lesson:'gtnetX2'};
 if(hash==='#rtds-chapter-5a')return {hardware:'gtnet-v3',lesson:'gtnetV3'};
 if(hash==='#rtds-chapter-4b')return {hardware:'gbh-v2',lesson:'gbhV2'};
 if(hash==='#rtds-chapter-4a')return {hardware:'gbh-v3',lesson:'gbh'};
 if(hash==='#rtds-chapter-3')return {hardware:'irc-switch-v2',lesson:'irc'};
 if(hash==='#rtds-chapter-2c')return {hardware:'novacor-1.0',lesson:'one'};
 if(hash==='#rtds-chapter-2b')return {hardware:'novacor-light',lesson:'light'};
 if(hash==='#rtds-chapter-2a')return {hardware:'novacor-2.0',lesson:'analog',chapter:'2a'};
 if(hash==='#rtds-chapter-1b')return {hardware:'cubicle-v1',lesson:'cabinetV1'};
 if(hash==='#rtds-chapter-1a')return {hardware:'cubicle-v2',lesson:'cabinet'};
 const hardware=hash.startsWith('#rtds-hardware-')?hash.slice(15):null;
 return hardware&&catalog.some(c=>c.id===hardware)?{hardware,lesson:lessonForHardware(hardware)}:null;
}
// Yield while a lesson occupies the upper reading band, not when its preview
// merely peeks below interface facts. No gutter, new renderer or preference reset.
export function teachingOwnsViewport(rect,height){return rect.top<height/3&&rect.bottom>height/3;}
