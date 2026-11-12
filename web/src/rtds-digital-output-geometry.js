import * as THREE from 'three';
import {outputWires} from './rtds-digital-output-state.js';
export function createOutputAssembly(template){
 const board=template.clone(true),lookup=new Map();board.traverse(n=>{if(n.userData.sid)lookup.set(n.userData.sid,n);});
 const sources={};
 for(const [name,port,label]of [['output','bank1_odd','1'],['vplus','bank1_odd','V+'],['vminus','bank1_even','V-']]){
  const bank=lookup.get('gtdo-v2-2.00.'+port);if(!bank)throw Error('GTDO 模型缺少接口 '+port);
  let record;try{record=JSON.parse(bank.userData.port_record);}catch{throw Error('GTDO 接口缺少元数据');}
  const index=record.contact_labels?.indexOf(label),source=lookup.get(`gtdo-v2-2.00.${port}.wire_recess${index}`);
  if(index<0||!Number.isInteger(index)||!source)throw Error('GTDO 接口缺少已核对触点 '+label);sources[name]={source,portId:record.id,contactLabel:label};
 }
 const group=new THREE.Group(),ownedGeometry=new Set(),ownedMaterials=new Set(),anchors={};group.name='digital-output-lab';
 const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.65,...extra});ownedMaterials.add(m);return m;};
 const paint=material(0xe0e6e3),ink=material(0x263741),metal=material(0x9ba8ab,{metalness:.55,roughness:.38}),green=material(0x25724f),blue=material(0x32647e),red=material(0xc85143),ceramic=material(0xd5bb83);
 function mesh(geo,mat,parent=group){ownedGeometry.add(geo);const m=new THREE.Mesh(geo,mat);parent.add(m);return m;}
 function box(size,pos,mat=paint,parent=group){const m=mesh(new THREE.BoxGeometry(...size),mat,parent);m.position.fromArray(pos);return m;}
 function node(pos,parent=group,name=''){const n=new THREE.Object3D();n.position.fromArray(pos);n.name=name;parent.add(n);return n;}
 function cylinder(r,depth,pos,mat,parent){const m=mesh(new THREE.CylinderGeometry(r,r,depth,20),mat,parent);m.rotation.x=Math.PI/2;m.position.fromArray(pos);return m;}
 function device(name,pos){const g=new THREE.Group();g.name=name;g.position.fromArray(pos);g.rotation.y=-.10;g.userData={origin:'original-illustrative',mechanicalAccuracy:'functional teaching equipment; no manufacturer rating or mating claim'};group.add(g);return g;}
 board.rotation.set(Math.PI/2,0,0);board.position.set(.102,.005,0);group.add(board);
 for(const [name,{source,portId,contactLabel}]of Object.entries(sources)){anchors[name]=node([0,0,0],source,name);anchors[name].userData={portId,contactLabel,sourceSid:source.userData.sid,mapping:'functional-illustration'};}
 box([.43,.009,.20],[0,-.118,.012],material(0xdce4e1));for(const x of [.065,.14]){box([.014,.013,.064],[x,-.106,.008],metal);box([.006,.065,.007],[x,-.074,-.008],metal);}
 const devices={load:device('resistive-load-box',[-.112,.037,.024]),supply:device('external-dc-supply',[-.112,-.075,.024])};
 const load=devices.load,supply=devices.supply;
 box([.096,.087,.044],[0,0,0],paint,load);box([.084,.071,.003],[0,.002,.024],ink,load);
 // Open-window resistor module, guarded terminal strip, and illustrative ammeter.
 box([.073,.020,.012],[-.002,-.018,.031],ceramic,load);for(let i=0;i<9;i++)box([.001,.022,.013],[-.03+i*.007,-.018,.032],metal,load);
 for(const x of [-.040,.040]){box([.009,.003,.003],[x,-.018,.032],metal,load);cylinder(.002,.003,[x,-.018,.035],metal,load);}
 box([.048,.028,.004],[-.009,.022,.029],paint,load);box([.042,.021,.002],[-.009,.022,.032],material(0xdbe6d6),load);
 for(let i=0;i<5;i++)box([.001,.004,.001],[-.027+i*.009,.029,.034],ink,load);
 const needle=new THREE.Group();needle.position.set(-.009,.014,.036);load.add(needle);box([.0012,.017,.001],[0,.0085,0],red,needle);
 const indicator=cylinder(.004,.002,[.031,.025,.032],material(0x657b70),load);
 for(const x of [-.043,.043])for(const y of [-.038,.040])cylinder(.002,.002,[x,y,.025],metal,load);
 box([.096,.060,.044],[0,0,0],metal,supply);box([.015,.061,.046],[-.041,0,.001],ink,supply);box([.071,.048,.002],[.006,0,.024],paint,supply);
 box([.039,.016,.003],[-.003,.009,.026],ink,supply);box([.027,.008,.001],[-.003,.009,.028],material(0x719e8d,{emissive:0x173b2c,emissiveIntensity:.2}),supply);
 const supplyLed=cylinder(.0025,.002,[.026,.010,.027],material(0x657b70),supply);
 for(let i=0;i<7;i++)box([.036,.0012,.002],[.002,-.004-i*.0026,.026],metal,supply);
 function terminal(parent,pos,color,name){box([.014,.015,.013],[pos[0]-.003,pos[1],pos[2]-.005],green,parent);cylinder(.0032,.002,pos,metal,parent);box([.004,.0008,.0008],[pos[0],pos[1],pos[2]+.0011],ink,parent);const ring=mesh(new THREE.TorusGeometry(.005,.001,6,20),color,parent);ring.position.fromArray([pos[0],pos[1],pos[2]+.001]);const a=node([pos[0],pos[1],pos[2]+.002],parent,name);a.userData.mapping='functional-illustration';return a;}
 anchors.loadIn=terminal(load,[.048,.015,.034],blue,'loadIn');anchors.loadReturn=terminal(load,[.048,-.025,.034],ink,'loadReturn');anchors.plus=terminal(supply,[.048,.014,.029],red,'plus');anchors.minus=terminal(supply,[.048,-.016,.029],ink,'minus');
 anchors.loadLabel=node([-.112,.110,.024]);anchors.supplyLabel=node([-.112,-.108,.024]);anchors.boardLabel=node([.102,.123,.015]);
 group.updateMatrixWorld(true);const world=n=>n.getWorldPosition(new THREE.Vector3()),cables={};
 for(const [id,def]of Object.entries(outputWires)){
  const [start,end]=def.ends,a=world(anchors[start]),b=world(anchors[end]),h={supply:-.064,reference:-.099,signal:.052,return:.006,conflict:.078}[id];
  const curve=new THREE.CatmullRomCurve3([a,new THREE.Vector3(a.x+.020,a.y,.080),new THREE.Vector3(.005,h,.092),new THREE.Vector3(b.x+.022,b.y,.075),b]);
  const line=mesh(new THREE.TubeGeometry(curve,64,.0014,8,false),material(def.color));line.visible=false;
  const pulse=mesh(new THREE.SphereGeometry(.0032,12,8),material(0xffeab5,{emissive:0xffbb55,emissiveIntensity:.8}));pulse.visible=false;
  cables[id]={mesh:line,pulse,curve,start,end};
 }
 let disposed=false;
 function update(state,result,phase=null){
  if(disposed)return;const wires=new Set(state.wires||[]),complete=['supply','reference','signal','return'].every(k=>wires.has(k))&&!wires.has('conflict');
  const current=state.power===true&&state.logic===true&&complete&&result?.status==='ready'&&result?.flow===true;
  const animate=current&&Number.isFinite(phase)&&phase>=0&&phase<=1;
  for(const [id,c]of Object.entries(cables)){c.mesh.visible=wires.has(id);c.pulse.visible=animate&&c.mesh.visible&&id!=='conflict';if(c.pulse.visible)c.pulse.position.copy(c.curve.getPoint(id==='reference'?1-phase:phase));}
  needle.rotation.z=current?-.7:.7;
  indicator.material.color.setHex(current?0x44b779:0x657b70);indicator.material.emissive.setHex(current?0x24824f:0);indicator.material.emissiveIntensity=.65;
  supplyLed.material.color.setHex(state.power?0x44b779:0x657b70);supplyLed.material.emissive.setHex(state.power?0x24824f:0);supplyLed.material.emissiveIntensity=.45;
  group.userData.loadActive=current;group.userData.flow=animate;group.userData.logic=!!state.logic;group.updateMatrixWorld(true);
 }
 update({power:false,logic:false,wires:[]},{flow:false},null);
 return {group,board,devices,anchors,cables,update,dispose(){if(disposed)return;disposed=true;for(const g of ownedGeometry)g.dispose();for(const m of ownedMaterials)m.dispose();}};
}
