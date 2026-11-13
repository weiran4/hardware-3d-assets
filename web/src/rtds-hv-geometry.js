import * as THREE from 'three';
import {hvWires} from './rtds-hv-state.js';
// Original functional teaching geometry, not manufacturing CAD or connector pin mapping.
export function createHvAssembly(template){
 const group=new THREE.Group(),geometries=new Set(),materials=new Set(),anchors={},cables={};
 const mat=color=>{const m=new THREE.MeshStandardMaterial({color,roughness:.65});materials.add(m);return m;};
 const dark=mat(0x29424e),pale=mat(0xe0e8eb),red=mat(0xbf5757),blue=mat(0x357ea6),black=mat(0x3b4850),green=mat(0x27816a);
 const box=(size,pos,m=pale,parent=group)=>{const g=new THREE.BoxGeometry(...size);geometries.add(g);const n=new THREE.Mesh(g,m);n.position.fromArray(pos);parent.add(n);return n;};
 const node=(pos,parent=group)=>{const n=new THREE.Object3D();n.position.fromArray(pos);parent.add(n);return n;};
 const term=(id,pos,m,parent)=>{box([.009,.009,.006],pos,m,parent);anchors[id]=node([pos[0],pos[1],pos[2]+.005],parent);};
 const board=template.clone(true);board.rotation.x=Math.PI/2;board.position.set(.15,.008,-.015);group.add(board);
 const panel=new THREE.Group();panel.position.set(0,.04,.03);group.add(panel);box([.16,.078,.022],[0,0,0],dark,panel);
 for(let ch=0;ch<16;ch++)for(let row=0;row<3;row++)box([.005,.007,.004],[-.067+ch*.009,.022-row*.022,.015],[red,blue,black][row],panel);
 term('vp',[-.067,.022,.019],red,panel);term('lp',[-.067,0,.019],blue,panel);term('lm',[-.067,-.022,.019],black,panel);
 const switchMat=mat(0x85959b);box([.025,.014,.012],[.012,-.052,.002],switchMat,panel);
 const relay=new THREE.Group();relay.position.set(-.122,-.065,.03);group.add(relay);box([.105,.07,.034],[0,0,0],pale,relay);box([.086,.047,.004],[0,.007,.02],dark,relay);
 const lampMat=mat(0x6d7f85);box([.045,.016,.004],[-.005,.012,.024],lampMat,relay);term('rp',[.043,.018,.025],red,relay);term('rm',[.043,-.018,.025],black,relay);
 const supply=new THREE.Group();supply.position.set(-.133,.075,.03);group.add(supply);box([.09,.064,.035],[0,0,0],pale,supply);box([.059,.023,.004],[-.006,.012,.021],dark,supply);term('sp',[.033,-.012,.025],red,supply);term('sn',[-.017,-.018,.025],black,supply);
 anchors.boardLabel=node([.15,.125,.03]);anchors.panelLabel=node([0,.105,.03]);anchors.relayLabel=node([-.122,-.119,.03]);anchors.supplyLabel=node([0,.048,0],supply);anchors.switchLabel=node([.04,-.055,.03],panel);
 group.updateMatrixWorld(true);
 const world=n=>n.getWorldPosition(new THREE.Vector3());
 function cable(a,b,color,r=.0013){const curve=new THREE.CatmullRomCurve3([a,new THREE.Vector3(a.x-.012,a.y,.085),new THREE.Vector3(b.x+.012,b.y,.08),b]);const g=new THREE.TubeGeometry(curve,40,r,6,false);geometries.add(g);const mesh=new THREE.Mesh(g,mat(color));group.add(mesh);return {mesh,curve};}
 for(const [key,w]of Object.entries(hvWires)){const c=cable(world(anchors[w.ends[0]]),world(anchors[w.ends[1]]),['return','common','dryB'].includes(key)?0x405561:0xb65050);const g=new THREE.SphereGeometry(.0025,8,6);geometries.add(g);c.pulse=new THREE.Mesh(g,mat(0xf2c55d));group.add(c.pulse);cables[key]=c;}
 const lookup=new Map();board.traverse(n=>{if(n.userData.sid)lookup.set(n.userData.sid,n);});const hv=lookup.get('gtfpi-v2-2.01-capped.hv');
 // Use actual semantic port if present; never guess a pin location.
 if(!hv)throw Error('GTFPI HV语义接口缺失');
 cable(world(hv),world(node([.075,0,0],panel)),0x90999d,.004);
 const hv5=lookup.get('gtfpi-v2-2.01-capped.hv5v');if(!hv5)throw Error('GTFPI HV5V语义接口缺失');
 cable(world(hv5),world(node([.075,-.025,0],panel)),0x7f929c,.002);
 box([.44,.009,.17],[0,-.14,.005],mat(0xe9eeee));
 let disposed=false;
 return {group,board,panel,relay,supply,anchors,cables,update(s,r,phase=null){if(disposed)return;supply.visible=s.mode==='wet'||s.external;switchMat.color.setHex(s.closed?0x2caa79:0x85959b);lampMat.color.setHex(r.receiver==='asserted'?0x36b282:0x6d7f85);for(const [key,c]of Object.entries(cables)){c.mesh.visible=s.wires.includes(key);c.pulse.visible=c.mesh.visible&&s.mode==='wet'&&r.flow&&Number.isFinite(phase);if(c.pulse.visible)c.pulse.position.copy(c.curve.getPoint(['return','common'].includes(key)?1-phase:phase));}group.userData.closed=s.closed;group.userData.flow=Object.values(cables).some(c=>c.pulse.visible);group.updateMatrixWorld(true);},dispose(){if(disposed)return;disposed=true;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
