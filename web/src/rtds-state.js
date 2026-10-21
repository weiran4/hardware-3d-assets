export function createGalleryState(){return{variantId:'novacor-2.0',group:null,portId:null,playing:false};}
export function galleryTransition(state,action){
 switch(action.type){
 case 'variant':return{variantId:action.variantId,group:null,portId:null,playing:false};
 case 'group':return{...state,group:action.group,portId:null};
 case 'port':return{...state,portId:action.portId};
 case 'tour':return{...state,playing:action.playing};
 case 'reset':return{...state,group:null,portId:null,playing:false};
 default:return state;
 }
}
const names={analogue:'前部 · 模拟输出',ground:'前部 · 接地孔',gtio:'GT 1–20 · I/O',aurora:'GT 21–24 · Aurora',irc:'IRC 1–6 · 机箱互联',gtsync:'GTSYNC · 同步',udp:'ETH · UDP',wif:'WIF · 工作站网络',gbh:'GBH · 光连接',front_led_power:'前面板 LED 供电',ac_power:'交流电源入口',digital_input:'数字输入端子',power:'供电连接',optical:'光传输接口',service_unresolved:'辅助 / 服务区域 · 待核对'};
export function portGroups(metadata){
 const groups=new Map();
 for(const p of metadata?.ports||[]){if(!groups.has(p.group))groups.set(p.group,{id:p.group,label:names[p.group]||p.group,ports:[],interactive:false});const group=groups.get(p.group);group.ports.push(p);group.interactive ||= p.interactive!==false;}
 return [...groups.values()];
}
export function gltfDirection([x,y,z]){return[x,z,-y||0];}
export function inspectionFrame(size,width,height){const aspect=Math.max(.1,width/height),diameter=Math.hypot(...size)*1.15,span=Math.max(diameter,diameter/aspect);return{left:-span*aspect/2,right:span*aspect/2,top:span/2,bottom:-span/2};}
export function galleryModeFromHash(hash){return hash==='#rtds'||hash.startsWith('#rtds-')?'rtds':'generic';}
export function isPortFacingCamera(nativeNormal,camera,point){const normal=gltfDirection(nativeNormal),toward=camera.map((v,i)=>v-point[i]),length=Math.hypot(...toward)||1;return normal.reduce((sum,v,i)=>sum+v*toward[i],0)/length>.04;}
