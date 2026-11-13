import * as THREE from 'three';
import {wires} from './rtds-gtfpi-state.js';
// Original functional panel and external equipment; not mechanical CAD or IDC pinout.
export function createGtfpiAssembly(template){
 const group=new THREE.Group(),geometries=new Set(),materials=new Set(),anchors={},cables={};
 const mat=(color)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.6});materials.add(m);return m;};
 const pale=mat(0xdce6e7),dark=mat(0x29424e),metal=mat(0x99a8ae),blue=mat(0x28799d),gold=mat(0xcba45c),green=mat(0x247758);
 function box(size,pos,m=pale,parent=group){const g=new THREE.BoxGeometry(...size);geometries.add(g);const n=new THREE.Mesh(g,m);n.position.fromArray(pos);parent.add(n);return n;}
 function node(pos,parent=group){const n=new THREE.Object3D();n.position.fromArray(pos);parent.add(n);return n;}
 function terminal(key,pos,parent=group){box([.009,.009,.006],pos,green,parent);anchors[key]=node([pos[0],pos[1],pos[2]+.004],parent);}
 const board=template.clone(true);board.rotation.x=Math.PI/2;board.position.set(.145,.005,-.012);group.add(board);
 const panel=new THREE.Group();panel.position.set(.015,0,.03);group.add(panel);
 box([.126,.106,.025],[0,0,0],pale,panel);box([.116,.096,.003],[0,0,.014],dark,panel);
 for(let row=0;row<3;row++)for(let ch=0;ch<16;ch++){box([.004,.009,.004],[-.052+ch*.007,.03-row*.03,.018],metal,panel);}
 terminal('input',[-.052,.03,.021],panel);terminal('ground',[-.052,0,.021],panel);terminal('output',[-.052,-.03,.021],panel);
 const relay=new THREE.Group();relay.position.set(-.133,.059,.03);group.add(relay);
 box([.096,.074,.032],[0,0,0],pale,relay);box([.083,.06,.004],[0,0,.018],dark,relay);
 // Visible dry contact mechanism, distinct from supply terminals.
 const arm=new THREE.Group();arm.position.set(-.03,.01,.023);relay.add(arm);box([.05,.004,.004],[.025,0,0],gold,arm);box([.012,.005,.005],[.026,.01,.023],gold,relay);
 for(let i=0;i<8;i++)box([.003,.019,.01],[-.025+i*.006,-.018,.024],gold,relay);
 terminal('no',[.043,.018,.024],relay);terminal('com',[.043,-.018,.024],relay);
 const receiver=new THREE.Group();receiver.position.set(-.133,-.062,.03);group.add(receiver);
 box([.096,.07,.035],[0,0,0],pale,receiver);box([.072,.045,.004],[0,.004,.020],dark,receiver);
 const lampMat=mat(0x668078);const lamp=box([.028,.018,.004],[-.012,.008,.024],lampMat,receiver);
 terminal('sense',[.043,.018,.025],receiver);terminal('zero',[.043,-.018,.025],receiver);
 // GTFPI panel linkage illustrates documented cable class only, not connector pin mating.
 const lookup=new Map();board.traverse(n=>{if(n.userData.sid)lookup.set(n.userData.sid,n);});
 const lv=lookup.get('gtfpi-v2-2.01-capped.lv');if(!lv)throw Error('GTFPI LV接口标识缺失');
 anchors.boardLabel=node([.145,.12,.015]);anchors.panelLabel=node([.015,.070,.035]);anchors.relayLabel=node([-.133,.111,.03]);anchors.receiverLabel=node([-.133,-.11,.03]);
 group.updateMatrixWorld(true);
 const world=n=>n.getWorldPosition(new THREE.Vector3());
 const cable=(key,a,b,color,radius=.0013)=>{const curve=new THREE.CatmullRomCurve3([a,new THREE.Vector3(a.x+.025,a.y,.085),new THREE.Vector3(b.x-.02,b.y,.08),b]);const geo=new THREE.TubeGeometry(curve,48,radius,8,false);geometries.add(geo);const mesh=new THREE.Mesh(geo,mat(color));group.add(mesh);return {mesh,curve};};
 for(const [key,def]of Object.entries(wires)){const c=cable(key,world(anchors[def.ends[0]]),world(anchors[def.ends[1]]),key.includes('Ground')||key==='common'?0x405561:0x267fba);const g=new THREE.SphereGeometry(.0028,10,8);geometries.add(g);const pulse=new THREE.Mesh(g,mat(0xfbc451));group.add(pulse);c.pulse=pulse;cables[key]=c;}
 const ribbon=cable('ribbon',world(lv),world(node([.06,0,0],panel)),0x929a9c,.004);ribbon.mesh.userData.kind='ribbon-category-only';
 const floor=box([.44,.009,.17],[0,-.13,.005],mat(0xe6ecec));
 let disposed=false;
 function update(s,r,phase=null){if(disposed)return;arm.rotation.z=s.closed?0:.45;lampMat.color.setHex(r.receiver===5?0x36b282:r.receiver===0?0x9a5e48:0x668078);for(const [key,c]of Object.entries(cables)){c.mesh.visible=s.wires?.includes(key)??false;c.pulse.visible=!!(c.mesh.visible&&s.power&&r.status==='ready'&&Number.isFinite(phase)&&phase>=0&&phase<=1&&(key==='trip'||key==='common'?s.closed:r.output===5));if(c.pulse.visible)c.pulse.position.copy(c.curve.getPoint(key==='trip'||key==='feedbackGround'?1-phase:phase));}group.userData.closed=s.closed;group.userData.flow=Object.values(cables).some(c=>c.pulse.visible);group.updateMatrixWorld(true);}
 return {group,board,panel,relay,receiver,arm,anchors,cables,floor,update,dispose(){if(disposed)return;disposed=true;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
