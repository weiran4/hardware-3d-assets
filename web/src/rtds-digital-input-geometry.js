import * as THREE from 'three';
import {placePhoenixDevices} from './rtds-digital-input-devices.js';

const ASSET='gtdi-v2-2.01';
const PAIRS={signal:['out','input'],return:['common','ground'],wetPlus:['plus','wet'],wetReturn:['minus','ground']};

// Preserve the published GTDI geometry. External enclosures are visual references only.
export function createDigitalAssembly(template){
 const board=template.clone(true),lookup=new Map();
 board.traverse(node=>{if(node.userData.sid)lookup.set(node.userData.sid,node);});
 const contacts={};
 for(const [name,port,label]of [['input','bank1_odd','1'],['wet','bank1_odd','V+(WET)'],['ground','bank1_even','GND']]){
  const bank=lookup.get(`${ASSET}.${port}`);if(!bank)throw Error(`GTDI 模型缺少接口 ${port}`);
  let record;try{record=JSON.parse(bank.userData.port_record);}catch{throw Error(`GTDI ${port} 缺少端子元数据`);}
  const index=record.contact_labels?.indexOf(label),source=lookup.get(`${ASSET}.${port}.wire_recess${index}`);
  if(index<0||!Number.isInteger(index)||!source)throw Error(`GTDI ${port} 缺少已核对触点 ${label==='1'?'CH1':label}`);
  contacts[name]={source,portId:record.id,contactLabel:label};
 }
 const group=new THREE.Group(),ownedGeometry=new Set(),ownedMaterials=new Set(),ownedTextures=new Set();
 group.name='digital-input-lab';
 const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.65,...extra});ownedMaterials.add(m);return m;};
 const paint=material(0xe0e5df),ink=material(0x263741),metal=material(0x9ba8ab,{metalness:.55,roughness:.38}),green=material(0x25724f),blue=material(0x32647e),red=material(0xc85143);
 function mesh(geometry,mat,parent=group){ownedGeometry.add(geometry);const m=new THREE.Mesh(geometry,mat);parent.add(m);return m;}
 function box(size,pos,mat=paint,parent=group){const m=mesh(new THREE.BoxGeometry(...size),mat,parent);m.position.fromArray(pos);return m;}
 function node(pos,parent=group,name=''){const n=new THREE.Object3D();n.name=name;n.position.fromArray(pos);parent.add(n);return n;}
 function cylinder(radius,depth,pos,mat,parent=group){const m=mesh(new THREE.CylinderGeometry(radius,radius,depth,16),mat,parent);m.rotation.x=Math.PI/2;m.position.fromArray(pos);return m;}
 function mark(text,pos,size,parent,align='center'){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=192;canvas.height=Math.max(28,Math.round(192*size[1]/size[0]));
  const context=canvas.getContext('2d');if(!context)return;
  context.fillStyle='#293534';context.textAlign=align;context.textBaseline='middle';context.font='600 '+Math.round(canvas.height*.76)+'px sans-serif';
  context.fillText(text,align==='left'?1:align==='right'?canvas.width-1:canvas.width/2,canvas.height/2,canvas.width-2);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;ownedTextures.add(texture);
  const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});ownedMaterials.add(m);
  const stamp=mesh(new THREE.PlaneGeometry(...size),m,parent);
  stamp.position.set(pos[0]+(align==='left'?size[0]/2:align==='right'?-size[0]/2:0),pos[1],pos[2]);stamp.name='original-face-marking';
 }
 function device(name,pos){const g=new THREE.Group();g.name=name;g.position.fromArray(pos);g.rotation.y=-.12;g.userData={origin:'original-illustrative',mechanicalAccuracy:'functional illustration, not a branded device'};group.add(g);return g;}
 board.rotation.set(Math.PI/2,0,0);board.position.set(.102,.005,0);group.add(board);
 const anchors={};
 for(const [name,{source,portId,contactLabel}]of Object.entries(contacts)){
  const a=node([0,0,0],source,`functional-${name}`);a.userData={portId,contactLabel,sourceSid:source.userData.sid,mapping:'functional-illustration'};anchors[name]=a;
 }
 // Independent stands and neutral benchtop, without modifying the board clone.
 const floor=box([.43,.009,.20],[0,-.118,.012],material(0xdce4e1));
 for(const x of [.065,.14]){box([.014,.013,.064],[x,-.106,.008],metal);box([.006,.065,.007],[x,-.074,-.008],metal);}
 const devices={relay:device('dry-contact-relay',[-.112,.035,.024]),source:device('active-output-controller',[-.112,.027,.023]),supply:device('dc-field-supply',[-.105,-.066,.012])};
 const relay=devices.relay,source=devices.source,supply=devices.supply;
 // Product relay and supply use an observed face and independently named
 // interface anchors, not the generic pedagogical terminal overlays.
 relay.rotation.set(.05,-.26,-.018);
 supply.rotation.set(.05,-.54,0);
 const actual=placePhoenixDevices(relay,supply,{box,node,mesh,material,cylinder,mark});
 // PLC/controller source: front display, ventilation, status LEDs, terminal strip.
 box([.096,.097,.04],[0,0,0],paint,source);box([.017,.097,.043],[-.0395,0,.001],blue,source);
 box([.057,.025,.003],[.007,.022,.022],ink,source);box([.042,.010,.001],[.007,.023,.024],material(0x6b9d94,{emissive:0x2a4d44,emissiveIntensity:.12}),source);
 for(let i=0;i<7;i++)box([.038,.0015,.002],[.003,-.012-i*.004,.022],metal,source);
 const sourceLed=cylinder(.0024,.001,[.026,.042,.023],material(0x697b72),source);
 for(let i=0;i<3;i++)cylinder(.0024,.001,[-.002+i*.01,.042,.023],ink,source);
 function terminal(parent,pos,color,name){
  box([.013,.014,.013],[pos[0]-.003,pos[1],pos[2]-.005],green,parent);
  const screw=cylinder(.0032,.002,[pos[0],pos[1],pos[2]],metal,parent);
  box([.004,.0008,.0008],[pos[0],pos[1],pos[2]+.0011],ink,parent);
  const ring=mesh(new THREE.TorusGeometry(.005,.001,6,20),color,parent);ring.position.set(pos[0],pos[1],pos[2]+.001);
  const anchor=node([pos[0],pos[1],pos[2]+.002],parent,name);anchor.userData.mapping='functional-illustration';return {anchor,ring,screw};
 }
 const relayTerminals={out:{anchor:actual.no},common:{anchor:actual.com}};
 const sourceTerminals={out:terminal(source,[.048,.028,.029],blue,'source-out'),common:terminal(source,[.048,-.019,.029],ink,'source-common')};
 anchors.plus=actual.plus;anchors.minus=actual.minus;
 // Stable public nodes are reparented to the currently active device.
 anchors.out=node(relayTerminals.out.anchor.position.toArray(),relay,'out');anchors.common=node(relayTerminals.common.anchor.position.toArray(),relay,'common');
 anchors.relayLabel=node([0,.060,.02],relay);anchors.sourceLabel=node([0,.066,.02],source);anchors.supplyLabel=node([0,-.050,.025],supply);anchors.boardLabel=node([.102,.123,.015]);
 group.updateMatrixWorld(true);
 const world=n=>n.getWorldPosition(new THREE.Vector3());
 const colors={signal:0x397e9b,return:0x384b53,wetPlus:0xc65f45,wetReturn:0x6a7780},cables={};
 for(const [name,[start,end]]of Object.entries(PAIRS)){
  const wire=mesh(new THREE.BufferGeometry(),material(colors[name],{roughness:.48}));wire.visible=false;
  const pulse=mesh(new THREE.SphereGeometry(.0032,12,8),material(0xffeab5,{emissive:0xffbb55,emissiveIntensity:.8}));pulse.visible=false;
  cables[name]={mesh:wire,pulse,curve:null,start,end};
 }
 let lastMode=null,disposed=false;
 function buildCables(){
  group.updateMatrixWorld(true);
  for(const [name,c]of Object.entries(cables)){
   const a=world(anchors[c.start]),b=world(anchors[c.end]);
   const h={signal:.047,return:-.016,wetPlus:-.065,wetReturn:-.097}[name];
   // Deliberately separated, gently bowed paths reveal each complete conductor.
   c.curve=new THREE.CatmullRomCurve3([a,new THREE.Vector3(a.x+.030,a.y,.074),new THREE.Vector3(.006,h,.082),new THREE.Vector3(b.x+.024,b.y,.066),b]);
   const old=c.mesh.geometry;ownedGeometry.delete(old);old.dispose();c.mesh.geometry=new THREE.TubeGeometry(c.curve,64,.00135,8,false);ownedGeometry.add(c.mesh.geometry);
  }
 }
 function update(state,result,phase=null){
  if(disposed)return;
  const dry=state.mode==='dry',wet=state.mode==='wet';
  devices.relay.visible=dry;devices.source.visible=wet;
  if(lastMode!==state.mode){
   const target=dry?relay:source,terminals=dry?relayTerminals:sourceTerminals;
   for(const name of ['out','common']){target.add(anchors[name]);anchors[name].position.copy(terminals[name].anchor.position);}
   lastMode=state.mode;buildCables();
  }
  const wires=new Set(Array.isArray(state.wires)?state.wires:[]);
  const circuit=dry?state.closed===true&&['signal','return','wetPlus','wetReturn'].every(n=>wires.has(n)):wet&&wires.has('signal')&&wires.has('return')&&!wires.has('wetPlus');
  const animate=state.power===true&&result?.flow===true&&result?.status==='ready'&&circuit&&Number.isFinite(phase)&&phase>=0&&phase<=1;
  for(const [name,c]of Object.entries(cables)){
   c.mesh.visible=wires.has(name);c.pulse.visible=!!animate&&c.mesh.visible&&(dry||name==='signal'||name==='return');
   // Conventional current: dry input flows CH1 → NO → COM → GND;
   // an active source flows OUT → CH1, then GND → source common.
   // The phase illustrates direction only, not calibrated current or speed.
   const reverse=dry?(name==='signal'||name==='wetReturn'):name==='return';
   if(c.pulse.visible)c.pulse.position.copy(c.curve.getPoint(reverse?1-phase:phase));
  }
  for(const light of [sourceLed,actual.supplyLed]){light.material.color.setHex(state.power?0x3b9b76:0x687a6b);light.material.emissive.setHex(state.power?0x15573c:0);light.material.emissiveIntensity=.4;}
  group.userData.mode=state.mode;group.userData.closed=state.closed===true;group.userData.flow=!!animate;
  group.updateMatrixWorld(true);
 }
 update({mode:'dry',wires:[],power:false,closed:false},{flow:false,status:'off'},null);
 return{group,board,devices,anchors,cables,floor,update,dispose(){if(disposed)return;disposed=true;for(const geometry of ownedGeometry)geometry.dispose();for(const mat of ownedMaterials)mat.dispose();for(const t of ownedTextures)t.dispose();}};
}
