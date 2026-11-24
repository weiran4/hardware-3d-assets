import {acquirePhotoBenchAsset,instantiatePhotoDevice} from './rtds-photo-bench-assets.js';
import * as THREE from 'three';
import {createDS1054Z,ds1054zDatasheet} from './rtds-ds1054z-model.js';
import {placeSiemensPlc,siemensReference} from './rtds-digital-input-plc.js';
import {placePhoenixSupplyExterior,phoenixReferences} from './rtds-digital-input-devices.js';
import {buildRh25Exterior,rh25Reference} from './rtds-light-rh25.js';
import {buildMoxaExterior,moxaReference} from './rtds-light-moxa.js';
import {create81150AExterior} from './rtds-gtai-81150a.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const generatorReference={photo:'https://i.ebayimg.com/images/g/COcAAOSwPu9mNu6u/s-l1600.webp',document:'https://www.keysight.com/us/en/assets/9018-06622/quick-start-guides/9018-06622.pdf#page=11'};
const ds1054zFrontPhoto='https://cdn-reichelt.de/bilder/web/xxl_ws/D100/DS1054Z_01.png';

// Original Light-specific teaching arrangement. No borrowed NovaCor2.0 geometry or physical pin coordinates.
const colors={sync:0xa16929,data:0x2178b4,power:0x7650a2,signal:0xb45749,return:0x425b78,optical:0x9a6330,copper:0xc64b40,fiber:0x9a6330,gt:0x9a6330,'gt-fiber':0x9a6330,'st-timing-fiber':0xc18b34,'st-ethernet-fiber':0x2478ac,coax:0x60717f,ethernet:0x2478ac};
export async function createLightBenchScene(container,project){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xffffff,1);renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),group=new THREE.Group(),wireGroup=new THREE.Group(),camera=new THREE.PerspectiveCamera(36,1,.01,30);scene.add(group,wireGroup);scene.add(new THREE.HemisphereLight(0xffffff,0x7a9293,2.7));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-1,2,4);scene.add(light);
 const leases=new Map();let photoAssets={assets:{},errors:{}},photoSlots=[],deviceTargets=new Map(),focusedDevice=null,toolbarSignature='',scopeModel=null,plcModel=null,unoModel=null,rh25Model=null,moxaModel=null,generatorModel=null;
 const toolbar=document.createElement('div');toolbar.className='lightbench-photo-tools';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','设备观察与模型状态');container.insertAdjacentElement('afterend',toolbar);
 const owned=new Set();let compact=container.clientWidth<600,anchors={},cables=[],state=null,phase=null,layout=0,signature='',active=true,disposed=false,frame=0,frames=0;
 container.append(renderer.domElement);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=.3;controls.maxDistance=12;controls.addEventListener('change',invalidate);
 function own(x){owned.add(x);return x;}
 function box(parent,size,pos,color){const m=new THREE.Mesh(own(new THREE.BoxGeometry(...size)),own(new THREE.MeshStandardMaterial({color,roughness:.62})));m.position.fromArray(pos);parent.add(m);return m;}
 function label(text,pos,width=.24,parent=group,tight=false){const canvas=document.createElement('canvas');canvas.width=tight?Math.max(128,text.length*40):768;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,canvas.width,96);c.fillStyle='#193a4c';c.font='bold 56px sans-serif';c.textAlign='center';c.fillText(text,canvas.width/2,61,canvas.width-12);const texture=own(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:texture,depthTest:false})));sprite.scale.set(width,width*96/canvas.width,1);sprite.position.fromArray(pos);sprite.renderOrder=20;parent.add(sprite);return sprite;}
 // Reuse the original P13 and P14 device geometry; no borrowed wire anchors.
 // These resources are owned by this scene, not the shared photo-asset cache.
 function createExterior(name,place){
  const exterior=new THREE.Group(),resources=new Set();
  exterior.name=name;
  const keepExterior=r=>{resources.add(r);return r;};
  const material=(color,extra={})=>keepExterior(new THREE.MeshStandardMaterial({color,roughness:.65,...extra}));
  const mesh=(geometry,material,parent)=>{const o=new THREE.Mesh(keepExterior(geometry),material);parent.add(o);return o;};
  const box=(size,pos,material,parent)=>{const o=mesh(new THREE.BoxGeometry(...size),material,parent);o.position.fromArray(pos);return o;};
  const cylinder=(r,d,pos,mat,parent)=>{const o=mesh(new THREE.CylinderGeometry(r,r,d,16),mat,parent);o.rotation.x=Math.PI/2;o.position.fromArray(pos);return o;};
  function mark(text,pos,size,parent,align='center',color='#293534'){
   const canvas=document.createElement('canvas');canvas.width=192;canvas.height=Math.max(28,Math.round(192*size[1]/size[0]));
   const c=canvas.getContext('2d');if(!c)return;
   c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.font='600 '+Math.round(canvas.height*.76)+'px sans-serif';
   c.fillText(text,align==='left'?1:align==='right'?191:96,canvas.height/2,190);
   const t=keepExterior(new THREE.CanvasTexture(canvas));t.colorSpace=THREE.SRGBColorSpace;
   const stamp=mesh(new THREE.PlaneGeometry(...size),keepExterior(new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})),parent);
   stamp.position.set(pos[0]+(align==='left'?size[0]/2:align==='right'?-size[0]/2:0),pos[1],pos[2]);stamp.name='original-face-marking';return stamp;
  }
  place(exterior,{box,mesh,material,cylinder,mark});
  return {group:exterior,resources};
 }
 function port(parent,key,pos,color){anchors[key]=box(parent,[.012,.009,.008],pos,color);}
 function clearWires(){for(const c of cables){c.mesh.geometry.dispose();c.mesh.material.dispose();c.dot.geometry.dispose();c.dot.material.dispose();}cables=[];wireGroup.clear();signature='';}
 function clearLayout(){clearWires();group.clear();for(const r of owned)r.dispose();owned.clear();anchors={};photoSlots=[];deviceTargets.clear();}

 function rebuild(){
 clearLayout();layout=1;delete container.dataset.scopeModel;delete container.dataset.plcModel;delete container.dataset.unoModel;delete container.dataset.rh25Model;delete container.dataset.moxaModel;delete container.dataset.generatorModel;
 if(state?.mode==='udp'){rebuildUdp();return;}
 if(state?.mode==='network'){rebuildNetwork();return;}
 const digital=['di','do'].includes(state?.mode);
 const lx=compact?0:-.36,ly=compact?.32:.10,ex=compact?0:.36,ey=compact?-.30:.10;
 const chassis=new THREE.Group();chassis.position.set(lx,ly,0);group.add(chassis);photoSlots.push({kind:'light',host:chassis,id:'L',name:'Light后面板',width:.44});box(chassis,[.44,.25,.14],[0,0,0],0xd0dade);box(chassis,[.43,.24,.008],[0,0,.075],0x2b414b);
 label('NOVACOR LIGHT · SCHEMATIC',[0,.18,.08],.56,chassis);
 // Layout is a functional teaching arrangement, not a pin-coordinate or mating model.
 const upper=digital?'do':'ao',lower=digital?'di':'ai',loop=digital?'I1':'I2';
 box(chassis,[.13,.025,.009],[.13,.075,.085],0xaab8c2);box(chassis,[.13,.025,.009],[.13,.015,.085],0xaab8c2);
 port(chassis,'L.'+upper,[.13,.075,.10],0xd2a15c);port(chassis,'L.'+lower,[.13,.015,.10],0x6aa2c3);label(upper.toUpperCase(),[.13,.11,.10],.08,chassis);label(lower.toUpperCase(),[.13,-.02,.10],.08,chassis);
 port(chassis,'L.top'+loop,[-.035,.07,.10],0x54a9bd);port(chassis,'L.bottom'+loop,[-.035,-.08,.10],0x54a9bd);label(loop,[-.08,.07,.10],.07,chassis);label(loop,[-.08,-.08,.10],.07,chassis);
 if(digital){
 port(chassis,'L.topI2',[-.17,.075,.10],0x929da5);port(chassis,'L.bottomI2',[-.17,-.08,.10],0x929da5);label('I2',[-.21,.075,.10],.05,chassis);label('I2',[-.21,-.08,.10],.05,chassis);
 port(chassis,'L.ai',[-.14,-.005,.10],0x929da5);label('AI',[-.18,-.005,.10],.05,chassis);
 }else label('DI / DO · REFERENCE',[-.13,-.01,.10],.16,chassis);
 const terminal=new THREE.Group();terminal.position.set(lx,ly-.20,.12);group.add(terminal);box(terminal,[.23,.045,.04],[0,0,0],0x557e71);port(terminal,'T.signal',[-.07,0,.03],0xcb6c51);port(terminal,'T.return',[.07,0,.03],0x4c6177);label(digital?'CH1          COMMON':'SIGNAL       RETURN',[0,-.048,.03],.30,terminal);
 const device=new THREE.Group();group.add(device);
 if(state?.mode==='ao'){
  // Real exterior is independent of the logical measurement node. Its
  // physical connectors never serve as wire anchors in this course.
  scopeModel??=createDS1054Z();
  const scope=scopeModel.group;scope.position.set(compact?.245:ex,ey+.045,0);scope.scale.setScalar(1.34);group.add(scope);
  container.dataset.scopeModel=scope.name;
  photoSlots.push({kind:'scope',host:scope,id:'scope',name:'Rigol DS1054Z 外观'});
  device.position.set(compact?-.155:ex,ey-.145,.02);
  box(device,[.25,.032,.042],[0,0,.065],0xa2bcbf);
  port(device,'E.signal',[-.055,0,.10],0xcb6c51);port(device,'E.return',[.055,0,.10],0x4c6177);
  label('LOGICAL INPUT · '+(state.reading||'NO SIGNAL'),[0,.032,.095],.30,device,true);
  label('SIGNAL        RETURN',[0,-.033,.105],.23,device,true);
 }else if(state?.mode==='ai'){
  // Restore the historical logical E anchors, independent of the photographed enclosure.
  device.name='ideal-ai-source-nodes';device.position.set(ex,ey,0);
  box(device,[.234,.030,.010],[0,-.06,.085],0xa2bcbf);
  port(device,'E.signal',[-.055,-.06,.10],0xcb6c51);port(device,'E.return',[.055,-.06,.10],0x4c6177);
  label('IDEAL SOURCE · '+(state.reading||'NO SIGNAL'),[0,-.023,.108],.29,device,true);
  label('SIGNAL        RETURN',[0,-.093,.108],.23,device,true);
  if(!generatorModel){
   const model=create81150AExterior({width:.426}),resources=new Set();
   model.traverse(node=>{
    if(node.geometry)resources.add(node.geometry);
    if(node.material){resources.add(node.material);if(node.material.map)resources.add(node.material.map);}
    if(node.isInstancedMesh)resources.add(node);
   });
   generatorModel={group:model,resources};
  }
  const specimen=generatorModel.group,gx=compact?.057:.419,gy=compact?-.565:-.234;
  specimen.position.set(gx,gy,.065);specimen.scale.setScalar(compact?.90:1);
  specimen.rotation.set(0,.13,0);group.add(specimen);
  label('81150A · 未接线',[gx,gy-(compact?.079:.087),.10],compact?.258:.273,group,true);
  container.dataset.generatorModel=specimen.name;
  photoSlots.push({kind:'generator',host:specimen,id:'generator',name:'Agilent 81150A Option 002 外观'});
 }else if(state?.mode==='di'){
  // The DI link still terminates on the same independent educational anchors,
  // never on the photographed enclosure or its visible terminal-row geometry.
  plcModel??=createExterior('siemens-s7-1200-cpu-1212c',placeSiemensPlc);
  const plc=plcModel.group;
  const plcX=ex+(compact?0:.27),plcY=ey-(compact?.25:.29);
  plc.position.set(plcX,plcY,0);plc.scale.setScalar(2.04);plc.rotation.set(-.025,-.23,0);group.add(plc);
  container.dataset.plcModel=plc.name;
  photoSlots.push({kind:'plc',host:plc,id:'plc',name:'Siemens S7-1200 CPU 1212C 外观'});
  label('SIEMENS 1212C · NO WIRES',[plcX,plcY-.114,.095],.245,group,true);
  device.name='ideal-plc-output-nodes';device.position.set(ex,ey,0);
  box(device,[.245,.032,.041],[0,-.06,.065],0xa2bcbf);
  port(device,'E.signal',[-.055,-.06,.10],0xcb6c51);port(device,'E.return',[.055,-.06,.10],0x4c6177);
  label('LOGICAL PLC OUTPUT · '+(state.reading||'NO SIGNAL'),[0,-.026,.095],.34,device,true);
  label('SIGNAL        RETURN',[0,-.095,.105],.23,device,true);
 }else if(state?.mode==='do'){
  // This plate is the ideal resistor abstraction; the specimen has no anchors.
  device.name='ideal-do-load-nodes';device.position.set(ex,ey,0);
  box(device,[.233,.031,.012],[0,-.06,.085],0xa2bcbf);
  port(device,'E.signal',[-.055,-.06,.10],0xcb6c51);port(device,'E.return',[.055,-.06,.10],0x4c6177);
  label('IDEAL RESISTIVE LOAD · '+(state.reading||'NO SIGNAL'),[0,-.023,.107],.355,device,true);
  label('SIGNAL         RETURN',[0,-.092,.108],.21,device,true);
  rh25Model??=buildRh25Exterior();
  const rh25=rh25Model.group,rx=compact?.228:.578,ry=compact?-.193:.202;
  rh25.position.set(rx,ry,0);rh25.scale.setScalar(4.15);rh25.rotation.set(.63,-.21,-.09);group.add(rh25);
  container.dataset.rh25Model=rh25.name;
  photoSlots.push({kind:'rh25',host:rh25,id:'rh25',name:'Vishay Dale RH-25 外观'});
  label('RH-25 · 未接线',[rx,ry-.067,.12],.215,group,true);
 }
 if(state?.mode==='do'){
 // Preserve both original logic anchors exactly, on a separate flat teaching plate.
 const supply=new THREE.Group();supply.name='ideal-do-bank-power-nodes';supply.position.set(ex,ey-.25,0);group.add(supply);
 box(supply,[.19,.028,.011],[0,0,.046],0xa2bcbf);
 port(supply,'P.plus',[-.065,0,.06],0xcb6c51);port(supply,'P.common',[.065,0,.06],0x4c6177);
 label('IDEAL BANK SUPPLY', [0,.031,.072],.22,supply,true);
 label('+                 RETURN', [0,-.028,.073],.185,supply,true);
 unoModel??=createExterior('phoenix-uno-ps-2902991',(model,helpers)=>placePhoenixSupplyExterior(model,helpers,{photoDetail:true}));
 const uno=unoModel.group,sx=compact?.245:.568,sy=compact?-.525:-.19;
 uno.position.set(sx,sy,0);uno.scale.setScalar(2.25);uno.rotation.set(0,-.255,0);group.add(uno);
 container.dataset.unoModel=uno.name;
 photoSlots.push({kind:'uno',host:uno,id:'uno',name:'Phoenix UNO-PS 2902991 外观'});
 label('UNO 24 V · 未接线',[sx,sy-.125,.105],.265,group,true);
 port(terminal,'T.supply',[0,0,.03],0x7650a2);label('BANK +',[0,.05,.03],.10,terminal);
 }
 applyPhotoDevices();group.updateMatrixWorld(true);container.dataset.modelCount=state?.mode==='do'?'6':['di','ao','ai'].includes(state?.mode)?'4':'3';container.dataset.mode=state?.mode||'ao';container.dataset.anchorScope='logical-groups-no-pin-coordinates';fit();
 }
 function rebuildUdp(){
 const lx=compact?0:-.36,ly=compact?.32:.10,ex=compact?0:.36,ey=compact?-.30:.10;
 const chassis=new THREE.Group();chassis.position.set(lx,ly,0);group.add(chassis);photoSlots.push({kind:'light',host:chassis,id:'L',name:'Light后面板',width:.44});box(chassis,[.44,.25,.14],[0,0,0],0xd0dade);box(chassis,[.43,.24,.008],[0,0,.075],0x2b414b);label('NOVACOR LIGHT · SCHEMATIC',[0,.18,.08],.56,chassis);
 // Functional anchors, not exact mechanical locations. ETH and WIF are separate interfaces.
 box(chassis,[.065,.035,.02],[-.09,0,.09],0xb9c5ca);port(chassis,'L.eth',[-.09,0,.11],0x41b3b9);label('ETH · UDP',[-.09,.045,.11],.18,chassis);
 port(chassis,'L.wif',[.10,0,.10],0x969ea4);label('WIF · MGMT',[.10,.045,.11],.18,chassis);
 label('COPPER SFP / RJ45',[-.08,-.07,.11],.23,chassis);
 const pc=new THREE.Group();pc.position.set(ex,ey,0);group.add(pc);box(pc,[.30,.19,.035],[0,0,.02],0x324f5c);box(pc,[.27,.15,.008],[0,.007,.045],0x9dc9c8);box(pc,[.03,.045,.025],[0,-.12,.01],0x657c86);box(pc,[.18,.015,.08],[0,-.15,.02],0x657c86);port(pc,'PC.eth',[.13,-.07,.055],0x41b3b9);label('PC · UDP RECEIVER',[0,.15,.07],.40,pc);label(state?.reading||'NO SAMPLES',[0,.01,.06],.24,pc);
 if(state?.topology==='switch'){
 const sw=new THREE.Group();sw.position.set(0,compact?.025:-.15,.01);group.add(sw);
 // Preserve both logical cable anchors independently of the displayed device.
 box(sw,[.20,.036,.004],[0,0,.045],0x557683);port(sw,'SW.a',[-.07,0,.05],0x41b3b9);port(sw,'SW.b',[.07,0,.05],0x41b3b9);label('LOGICAL SWITCH',[0,.036,.055],.185,sw,true);
 moxaModel??=buildMoxaExterior();
 const item=moxaModel.group,mx=compact?.244:.545,my=compact?.003:-.232;
 item.position.set(mx,my,0);item.scale.setScalar(compact?2.34:2.06);item.rotation.set(.12,.45,0);group.add(item);
 label('EDS-205A · 未接线',[mx+(compact?.014:0),my-(compact?.209:.157),.016],compact?.255:.251,group,true);
 container.dataset.moxaModel=item.name;
 photoSlots.push({kind:'moxa',host:item,id:'moxa',name:'Moxa EDS-205A 外观'});
 }
 applyPhotoDevices();group.updateMatrixWorld(true);container.dataset.modelCount=state?.topology==='switch'?'4':'2';container.dataset.mode='udp';container.dataset.anchorScope='logical-groups-no-pin-coordinates';fit();
 }
 function rebuildNetwork(){
 for(const [i,key] of ['A','B'].entries()){
 const chassis=new THREE.Group();chassis.position.set(compact?0:(i===0?-.36:.36),compact?(i===0?.34:-.34):.10,0);group.add(chassis);photoSlots.push({kind:'light',host:chassis,id:key,name:'Light '+key+' 后面板',width:.44});
 box(chassis,[.44,.25,.14],[0,0,0],0xd0dade);box(chassis,[.43,.24,.008],[0,0,.075],0x2b414b);label('LIGHT '+key+' · SCHEMATIC',[0,.18,.08],.48,chassis);
 for(let c=0;c<4;c++){box(chassis,[.065,.045,.01],[-.135+c*.09,.065,.087],0x6a9c99);label('C'+(c+1),[-.135+c*.09,.065,.10],.055,chassis,true);}
 for(const [j,k] of ['gb','irc','wif'].entries()){const x=-.14+j*.14;port(chassis,key+'.'+k,[x,-.035,.10],k==='gb'?colors.sync:k==='irc'?colors.data:0x969ea4);label(k==='gb'?'GB SYNC':k.toUpperCase(),[x,-.075,.10],.12,chassis,true);}
 }
 if(state.topology!=='direct'){
 const hub=new THREE.Group();hub.position.set(compact?-.18:-.20,compact?0:-.22,0);group.add(hub);photoSlots.push({kind:'gbh',host:hub,id:'H',name:'GBH V3 同步设备',width:.26});box(hub,[.26,.085,.08],[0,0,0],0x697b85);port(hub,'H.a',[-.075,0,.05],colors.sync);port(hub,'H.b',[.075,0,.05],colors.sync);label('GBH · SYNC',[0,.075,.06],.27,hub);
 }
 if(state.topology==='switch'){
 const sw=new THREE.Group();sw.position.set(compact?.18:.20,compact?0:-.22,0);group.add(sw);photoSlots.push({kind:'irc',host:sw,id:'S',name:'IRC Switch V2',width:.26});box(sw,[.26,.085,.08],[0,0,0],0x697b85);port(sw,'S.a',[-.075,0,.05],colors.data);port(sw,'S.b',[.075,0,.05],colors.data);label('IRC SWITCH · DATA',[0,-.075,.06],.30,sw);
 }
 applyPhotoDevices();group.updateMatrixWorld(true);container.dataset.modelCount=state.topology==='switch'?'4':state.topology==='hub'?'3':'2';container.dataset.mode='network';container.dataset.anchorScope='logical-groups-no-pin-coordinates';fit();
 }
 function requestPhotoAsset(kind,retry=false){if(leases.has(kind))return;const lease=acquirePhotoBenchAsset(kind,retry);leases.set(kind,lease);lease.ready.then(result=>{if(disposed)return;if(result.asset)photoAssets.assets[kind]=result.asset;else photoAssets.errors[kind]=result.error;rebuild();invalidate();});}
 function applyPhotoDevices(){
 const statuses=[],representations={};
 for(const slot of photoSlots){
  if(['scope','plc','uno','rh25','moxa','generator'].includes(slot.kind)){
   representations[slot.id]='photo';statuses.push(slot.name+'：照片参考外观');
   deviceTargets.set(slot.id,{...slot,replaced:true});continue;
  }
  requestPhotoAsset(slot.kind);
  const keys=Object.keys(anchors).filter(key=>{let node=anchors[key];while(node){if(node===slot.host)return true;node=node.parent;}return false;});
  let replaced=false;const asset=photoAssets.assets[slot.kind];
  if(asset)try{const item=instantiatePhotoDevice(asset,keys,slot.width);slot.host.clear();slot.host.add(item.group);for(const key of keys)anchors[key]=item.anchors[key];replaced=true;}catch{photoAssets.errors[slot.kind]='当前练习所需端点缺失';/* Keep the entire schematic; never invent anchors. */}
  const pending=!asset&&!photoAssets.errors[slot.kind];representations[slot.id]=replaced?'photo':pending?'loading':'schematic';statuses.push(slot.name+'：'+(replaced?'照片参考外观':pending?'外观加载中，暂用示意':'示意回退（模型或端点不可用）'));
  deviceTargets.set(slot.id,{...slot,replaced});
 }
 container.dataset.deviceRepresentations=JSON.stringify(representations);container.dataset.asset=Object.values(representations).includes('photo')?'original-photo-bench-with-schematic-peripherals':'original-light-only-schematic';container.dataset.photoStatus=Object.values(representations).every(x=>x==='photo')?'ready':Object.values(representations).includes('loading')?'loading':'fallback';
 if(!deviceTargets.has(focusedDevice))focusedDevice=null;
 const nextToolbarSignature=JSON.stringify([representations,photoSlots.map(slot=>[slot.id,slot.name])]);if(nextToolbarSignature===toolbarSignature)return;toolbarSignature=nextToolbarSignature;
 const toolbarHadFocus=toolbar.contains(document.activeElement),previousFocus=document.activeElement?.dataset?.deviceFocus;
 toolbar.replaceChildren();const status=document.createElement('p');status.className='lightbench-photo-status';status.setAttribute('role','status');status.textContent=statuses.join('；')+'。设备可分别放大，显示比例不统一；放大时隐藏其他设备和连线。'+(state?.mode==='ao'?'DS1054Z 仅供外观对照；信号及配对 Return 接到独立的逻辑输入，不对应示波器实体端口。等效负载仅用于仿真计算，不是 DS1054Z 的设置。':state?.mode==='ai'?'Agilent 81150A Option 002 仅作静态外观参考，未接线。信号与配对 Return 来自独立理想源节点，不对应实物 BNC；不验证实际输出、负载、共模限制或设备兼容性。':state?.mode==='di'?'Siemens 仅作静态外观参考，未接线，背面未还原。外设连线终止于独立逻辑节点，不对应 PLC 实体端子，也不确认设备兼容性。':state?.mode==='do'?'Phoenix UNO-PS 2902991 额定 24 V，外观模型未接线，指示灯静态。实验的 5–30 V 参数只改变独立的理想电源，不控制该实物，也不表示端子或兼容性。Vishay Dale RH-25 也是静态外观参考，未接线；不代表实验阻值、功率、散热条件或实物适用性。':state?.mode==='udp'&&state?.topology==='switch'?'Moxa EDS-205A 只供外观对照，未接线、指示灯静态；网线终止于逻辑交换节点，不对应实物端口，也不验证实机兼容性。':'外设连线是功能指示，不是插入动作。GBH/IRC若显示防尘帽，端点只标示帽位。');toolbar.append(status);
 const sources={light:['NovaCor Light','22241195047959-NovaCor-Light'],gbh:['GBH V3','360034815313-Global-Bus-Hub'],irc:['IRC Switch V2','360034814853-IRC-Switch']};const refs=document.createElement('p');refs.className='lightbench-photo-status';refs.append('外观参考：');for(const kind of new Set(photoSlots.map(slot=>slot.kind))){const link=document.createElement('a');if(kind==='plc'){
  link.href=siemensReference.document;link.textContent='Siemens '+siemensReference.sku+' 官方实物照片（PDF 封面）';link.target='_blank';link.rel='noopener';refs.append(link);continue;
 }if(kind==='uno'){
  link.href=phoenixReferences.supply.photo;link.textContent='Phoenix Contact 2902991 厂家实物照片';link.target='_blank';link.rel='noopener noreferrer';refs.append(link);
  const details=link.cloneNode();details.href=phoenixReferences.supply.url;details.textContent=' · 厂家规格';refs.append(details);continue;
 }if(kind==='rh25'){
  link.href=rh25Reference.photo;link.textContent=rh25Reference.model+' 同型号实物照片';link.target='_blank';link.rel='noopener noreferrer';refs.append(link);
  const drawing=link.cloneNode();drawing.href=rh25Reference.document;drawing.textContent=' · RH-25 厂家尺寸资料';refs.append(drawing);continue;
 }if(kind==='moxa'){
  link.href=moxaReference.photo;link.textContent=moxaReference.model+' 厂家实物照片';link.target='_blank';link.rel='noopener noreferrer';refs.append(link);
  const used=link.cloneNode();used.href=moxaReference.used;used.textContent=' · 同型号实物近照';refs.append(used);
  const data=link.cloneNode();data.href=moxaReference.document;data.textContent=' · 厂家尺寸';refs.append(data);continue;
 }if(kind==='generator'){
  link.href=generatorReference.photo;link.textContent='Agilent 81150A Option 002 同型号实物照片';link.target='_blank';link.rel='noopener noreferrer';refs.append(link);
  const guide=link.cloneNode();guide.href=generatorReference.document;guide.textContent=' · 厂家快速指南';refs.append(guide);continue;
 }link.href=kind==='scope'?ds1054zFrontPhoto:'https://knowledge.rtds.com/hc/en-us/articles/'+sources[kind][1];link.textContent=kind==='scope'?'Rigol DS1054Z 同型号正面实物照（Reichelt）':sources[kind][0]+' 官方资料 ';link.target='_blank';link.rel='noopener';refs.append(link);if(kind==='scope'){const alt=link.cloneNode();alt.href=ds1054zDatasheet;alt.textContent=' · Rigol 系列规格表';refs.append(alt);}}toolbar.append(refs);
 if(photoSlots.some(slot=>photoAssets.errors[slot.kind])){const retry=document.createElement('button');retry.textContent='重试外观模型';retry.onclick=()=>{for(const kind of new Set(photoSlots.map(slot=>slot.kind))){if(!photoAssets.errors[kind])continue;leases.get(kind)?.release();leases.delete(kind);delete photoAssets.errors[kind];delete photoAssets.assets[kind];requestPhotoAsset(kind,true);}rebuild();};toolbar.append(retry);}
 const all=document.createElement('button');all.textContent='查看全部';all.onclick=()=>{focusedDevice=null;fit();};toolbar.append(all);
 for(const target of deviceTargets.values()){const button=document.createElement('button');button.textContent='放大 '+target.name;button.dataset.deviceFocus=target.id;button.setAttribute('aria-pressed',String(focusedDevice===target.id));button.onclick=()=>{focusedDevice=target.id;fit();};toolbar.append(button);}
 if(toolbarHadFocus)([...toolbar.querySelectorAll('[data-device-focus]')].find(button=>button.dataset.deviceFocus===previousFocus)||all).focus({preventScroll:true});
 }
 // Notify only real focus transitions; reading/asset/viewport rebuilds do not restart the host.
 function reportDeviceView(id){
  if(container.dataset.focusedDevice===id)return;
  container.dataset.focusedDevice=id;
  container.dispatchEvent(new CustomEvent('lightbench-device-view',{detail:{id}}));
 }
 function focusDevice(){const target=deviceTargets.get(focusedDevice);if(!target)return false;for(const child of group.children)child.visible=child===target.host;wireGroup.visible=false;container.dataset.wiresVisible='false';group.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(target.host),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());const distance=Math.max(size.y,size.x/Math.max(.3,camera.aspect))/(2*Math.tan(THREE.MathUtils.degToRad(18)))*1.08+size.z/2;controls.target.copy(center);const scope=target.kind==='scope',plc=target.kind==='plc',uno=target.kind==='uno',rh25=target.kind==='rh25',moxa=target.kind==='moxa',generator=target.kind==='generator';camera.position.set(center.x+(scope?distance*.10:plc?distance*.15:uno?distance*.091:rh25?distance*.105:moxa?-distance*.035:generator?-distance*.05:0),center.y+(scope?distance*.12:plc?distance*.48:uno?distance*.474:rh25?distance*1.14:moxa?distance*.19:generator?distance*.12:.025),center.z+distance*(plc?1.08:uno?1.05:moxa?.94:generator?1.06:1));controls.update();for(const button of toolbar.querySelectorAll('[data-device-focus]'))button.setAttribute('aria-pressed',String(button.dataset.deviceFocus===focusedDevice));reportDeviceView(focusedDevice);invalidate();return true;}
 function world(key){return anchors[key]?.getWorldPosition(new THREE.Vector3());}
 function buildWires(){const sig=JSON.stringify(state.links);if(sig===signature)return;clearWires();signature=sig;group.updateMatrixWorld(true);
  state.links.forEach((link,i)=>{const a=world(link.a),b=world(link.b);if(!a||!b)return;const color=colors[link.network]||0xc64b40;const lift=Math.max(a.z,b.z)+.10+(i%7)*.012;const curve=new THREE.CatmullRomCurve3([a,a.clone().add(new THREE.Vector3(0,0,.045)),new THREE.Vector3((a.x+b.x)/2+(state.mode==='network'&&state.topology==='direct'&&compact?(link.network==='sync'?-.10:.10):0),(a.y+b.y)/2+(state.mode==='network'&&state.topology==='direct'&&!compact?(link.network==='sync'?.08:-.08):0),lift),b.clone().add(new THREE.Vector3(0,0,.045)),b]);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.0018,5,false),new THREE.MeshStandardMaterial({color,roughness:.6}));wireGroup.add(mesh);const dot=new THREE.Mesh(new THREE.SphereGeometry(.005,10,7),new THREE.MeshBasicMaterial({color:0xffc22b}));wireGroup.add(dot);cables.push({mesh,dot,curve,network:link.network,index:i,signal:link.signal,reverse:link.reverse,returnPath:link.returnPath});});container.dataset.wires=String(cables.length);container.dataset.links=JSON.stringify(state.links);container.dataset.wireEndpoints=JSON.stringify(state.links.filter(l=>world(l.a)&&world(l.b)).map(l=>({a:l.a,b:l.b,start:world(l.a).toArray(),end:world(l.b).toArray()})));
 }
 function render(force=false){frame=0;if(disposed||(!active&&!force)||document.hidden||!state||!container.clientWidth||!container.clientHeight)return;buildWires();for(const c of cables){const on=!!state.enabled[c.network];c.mesh.material.opacity=on?1:.24;c.mesh.material.transparent=!on;c.dot.visible=on&&Number.isFinite(phase);if(c.dot.visible){const f=((phase%1)+1)%1;c.dot.position.copy(c.curve.getPoint((c.reverse||(c.returnPath&&Math.floor(phase)===2))?1-f:f));}}

  renderer.render(scene,camera);container.dataset.anchorWorld=JSON.stringify(Object.fromEntries(Object.keys(anchors).map(key=>[key,world(key).toArray()])));const points={};for(const key of Object.keys(anchors)){const v=world(key).project(camera);points[key]={x:(v.x*.5+.5)*container.clientWidth,y:(.5-v.y*.5)*container.clientHeight,visible:Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z>-1&&v.z<1};}project(points);container.dataset.phase=String(phase);container.dataset.loaded='true';container.dataset.frames=String(++frames);container.dataset.triangles=String(renderer.info.render.triangles);container.dataset.cameraPosition=JSON.stringify(camera.position.toArray());
 }
 function invalidate(){if(!disposed&&active&&!document.hidden&&!frame)frame=requestAnimationFrame(()=>render());}
 function fit(){if(focusDevice())return;for(const child of group.children)child.visible=true;wireGroup.visible=true;container.dataset.wiresVisible='true';for(const button of toolbar.querySelectorAll('[data-device-focus]'))button.setAttribute('aria-pressed','false');const width=compact?.75:1.35,height=compact?1.25:.70;const centerY=compact?.02:state?.mode==='udp'&&state.topology==='switch'?-.032:state?.mode==='ai'?.009:.06;const distance=Math.max(height,width/Math.max(.3,camera.aspect))/(2*Math.tan(THREE.MathUtils.degToRad(18)))*1.2;controls.target.set(-.02,centerY,.035);camera.position.set(-.02,centerY+.12,distance);controls.update();reportDeviceView('all');invalidate();}
 function resize(){if(disposed)return;const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;const nextCompact=w<600;if(nextCompact!==compact){compact=nextCompact;if(layout)rebuild();}renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();fit();}
 const ro=new ResizeObserver(resize);ro.observe(container);resize();const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};document.addEventListener('visibilitychange',visibility);
 const lost=e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;container.dataset.loaded='false';container.dispatchEvent(new CustomEvent('lightbench-scene-error'));};renderer.domElement.addEventListener('webglcontextlost',lost);
 // A single static readiness frame is independent of stale intersection delivery.
 // It does not start animation, and is requested only for the selected lesson.
 return {paintStatic(){cancelAnimationFrame(frame);frame=0;render(true);},update(s,p=null){const changed=state?.mode!==s.mode||state?.reading!==s.reading||state?.topology!==s.topology;state=s;phase=p;if(!layout||changed)rebuild();invalidate();},setActive(v){active=!!v;controls.enabled=active;if(!active){cancelAnimationFrame(frame);frame=0;}else invalidate();},fit,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);controls.dispose();clearLayout();scopeModel?.owned.forEach(resource=>resource.dispose());scopeModel=null;plcModel?.resources.forEach(resource=>resource.dispose());plcModel=null;unoModel?.resources.forEach(resource=>resource.dispose());unoModel=null;rh25Model?.dispose();rh25Model=null;moxaModel?.dispose();moxaModel=null;generatorModel?.resources.forEach(resource=>resource.dispose());generatorModel=null;delete container.dataset.scopeModel;delete container.dataset.plcModel;delete container.dataset.unoModel;delete container.dataset.rh25Model;delete container.dataset.moxaModel;delete container.dataset.generatorModel;delete container.dataset.wiresVisible;for(const lease of leases.values())lease.release();toolbar.remove();renderer.dispose();renderer.domElement.remove();container.dataset.loaded='false';}};
}

