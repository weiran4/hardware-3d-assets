import {Box3,Vector3} from 'three';
export function createGalleryState(){return{variantId:'novacor-2.0',group:null,portId:null,inspectionMode:null,subtypeId:null,playing:false};}
export function galleryTransition(state,action){
 switch(action.type){
 case 'variant':return{variantId:action.variantId,group:null,portId:null,inspectionMode:null,subtypeId:null,playing:false};
 case 'group':return{...state,group:action.group,portId:action.firstPortId||null,inspectionMode:'group',subtypeId:null};
 case 'subtype':return{...state,subtypeId:action.subtypeId,portId:action.portId,inspectionMode:'subtype'};
 case 'port':return{...state,portId:action.portId,inspectionMode:'port'};
 case 'tour':return{...state,playing:action.playing};
 case 'reset':return{...state,group:null,portId:null,inspectionMode:null,subtypeId:null,playing:false};
 default:return state;
 }
}
const names={analogue:'前部 · 模拟输出',ground:'前部 · 接地孔',gtio:'GT 1–20 · I/O',aurora:'GT 21–24 · Aurora',irc:'IRC 1–6 · 机箱互联',gtsync:'GTSYNC · 同步',udp:'ETH · UDP',wif:'WIF · 工作站网络',gbh:'GBH · 光连接',front_led_power:'前面板 LED 供电',ac_power:'交流电源入口',digital_input:'数字输入端子',digital_output:'数字输出端子',analogue_input:'差分模拟输入',analog_output:'模拟输出端子',power:'供电连接',optical:'光传输接口',service_unresolved:'辅助 / 服务区域 · 待核对',ribbon_header:'HV / LV · 外接面板排针',aux_power:'HV 面板 · 辅助 5 V',front_sfp:'前部 16 铜 SFP · SV 配置',service:'监视 / 测试 / 编程服务',rear_optical:'后部 4 个双工光链路',rear_eth:'后部 ETH · MMC 监测'};
export function portGroups(metadata){
 const groups=new Map();
 for(const p of metadata?.ports||[]){if(!groups.has(p.group))groups.set(p.group,{id:p.group,label:names[p.group]||p.group,ports:[],interactive:false});const group=groups.get(p.group);group.ports.push(p);group.interactive ||= p.interactive!==false;}
 return [...groups.values()];
}
export function gltfDirection([x,y,z]){return[x,z,-y||0];}
export function inspectionFrame(size,width,height){const aspect=Math.max(.1,width/height),diameter=Math.hypot(...size)*1.15,span=Math.max(diameter,diameter/aspect);return{left:-span*aspect/2,right:span*aspect/2,top:span/2,bottom:-span/2};}
export function galleryModeFromHash(hash){return hash==='#rtds'||hash.startsWith('#rtds-')?'rtds':'generic';}
export function isPortFacingCamera(nativeNormal,camera,point){const normal=gltfDirection(nativeNormal),toward=camera.map((v,i)=>v-point[i]),length=Math.hypot(...toward)||1;return normal.reduce((sum,v,i)=>sum+v*toward[i],0)/length>.04;}

// Inspection UI bounds, not connector compatibility or physical mating geometry.
export function highlightSelection(groupIds,portId,nodes){
 const ids=[...new Set(portId?[portId]:groupIds)].filter(id=>nodes.has(id));
 const box=new Box3();for(const id of ids)box.expandByObject(nodes.get(id));
 return{ids,box:box.isEmpty()?null:box};
}
export function projectHighlightBounds(box,camera,width,height,padding=8){
 if(!box||box.isEmpty()||width<11||height<11)return null;
 const points=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new Vector3(x,y,z).project(camera));
 if(points.some(p=>!Number.isFinite(p.x+p.y+p.z)))return null;
 if(points.every(p=>p.z< -1)||points.every(p=>p.z>1))return null;
 const left=(Math.min(...points.map(p=>p.x))*.5+.5)*width,right=(Math.max(...points.map(p=>p.x))*.5+.5)*width;
 const top=(-Math.max(...points.map(p=>p.y))*.5+.5)*height,bottom=(-Math.min(...points.map(p=>p.y))*.5+.5)*height;
 if(right<0||left>width||bottom<0||top>height)return null;
 const x=Math.max(5,left-padding),y=Math.max(5,top-padding),r=Math.min(width-5,right+padding),b=Math.min(height-5,bottom+padding);
 return r>x&&b>y?{x,y,width:r-x,height:b-y}:null;
}

export function highlightCornerPath({x,y,width,height}){
 const length=Math.min(22,width/3,height/3),right=x+width,bottom=y+height;
 return`M${x} ${y+length}V${y}H${x+length} M${right-length} ${y}H${right}V${y+length} M${right} ${bottom-length}V${bottom}H${right-length} M${x+length} ${bottom}H${x}V${bottom-length}`;
}
