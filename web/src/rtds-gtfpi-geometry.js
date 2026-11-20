import * as THREE from 'three';
import {wires} from './rtds-gtfpi-state.js';
// Original functional panel and external equipment; not mechanical CAD or IDC pinout.
export function createGtfpiAssembly(template){
 const group=new THREE.Group(),geometries=new Set(),materials=new Set(),textures=new Set(),anchors={},cables={};
 const mat=(color)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.6});materials.add(m);return m;};
 const pale=mat(0xdce6e7),dark=mat(0x29424e),metal=mat(0x99a8ae),blue=mat(0x28799d),gold=mat(0xcba45c),green=mat(0x247758);
 function box(size,pos,m=pale,parent=group){const g=new THREE.BoxGeometry(...size);geometries.add(g);const n=new THREE.Mesh(g,m);n.position.fromArray(pos);parent.add(n);return n;}
 function node(pos,parent=group){const n=new THREE.Object3D();n.position.fromArray(pos);parent.add(n);return n;}
 function terminal(key,pos,parent=group){box([.009,.009,.006],pos,green,parent);anchors[key]=node([pos[0],pos[1],pos[2]+.004],parent);}
 const board=template.clone(true);board.rotation.x=Math.PI/2;board.position.set(.145,.005,-.012);group.add(board);
 // Reconstructed front geometry from RTDS's public 1600 × 327 photo.
 // The source does not show the rear or the mechanism under the blue cover.
 const panel=new THREE.Group();panel.name='rtds-lv-panel-photographed-front';panel.position.set(.009,.008,.035);group.add(panel);
 const graphite=mat(0x181a23),rim=mat(0x0c0e16),cover=mat(0x244dd8),coverEdge=mat(0x071334);
 const red=mat(0xa21128),black=mat(0x11101a),socketColors=[red,black,red],well=mat(0x050508),contact=mat(0x73512f);
 const steel=new THREE.MeshStandardMaterial({color:0x9aa3ad,metalness:.48,roughness:.38});materials.add(steel);
 const mesh=(geometry,material,parent)=>{geometries.add(geometry);const n=new THREE.Mesh(geometry,material);parent.add(n);return n;};
 const frontCyl=(radius,depth,pos,material,parent=panel)=>{const n=mesh(new THREE.CylinderGeometry(radius,radius,depth,20),material,parent);n.rotation.x=Math.PI/2;n.position.fromArray(pos);return n;};
 const panelW=.202,panelH=.0355;
 box([panelW,panelH,.004],[0,0,0],graphite,panel);
 box([.0266,.0314,.0014],[-.0002,0,.0021],coverEdge,panel);
 box([.0255,.0305,.0016],[-.0002,0,.0027],cover,panel);
 for(const x of [-.098,.098])for(const y of [-.0154,.0154]){
  frontCyl(.0026,.001,[x,y,.0023],rim);
  frontCyl(.00205,.0013,[x,y,.0031],steel);
  for(const angle of [0,Math.PI/2])box([.0021,.00035,.0002],[x,y,.0038],black,panel).rotation.z=angle;
 }
 const sockets=new THREE.Group();sockets.name='48-recessed-front-jacks';panel.add(sockets);
 const rows=[.0071,0,-.0068],xs=Array.from({length:16},(_,i)=>(i<8?-.0825+(i*.00802):.0257+((i-8)*.00802)));
 for(const [ch,x] of xs.entries())for(const [row,y] of rows.entries()){
  const jack=new THREE.Group();jack.name=`ch${ch+1}-${['in','ground','out'][row]}`;jack.position.set(x,y,.002);sockets.add(jack);
  frontCyl(.0029,.0012,[0,0,.0002],socketColors[row],jack);
  const collar=mesh(new THREE.TorusGeometry(.00235,.00045,6,20),socketColors[row],jack);collar.position.z=.001;
  frontCyl(.00185,.00055,[0,0,.00095],well,jack);
  const bore=mesh(new THREE.TorusGeometry(.00132,.00019,6,16),row===1?contact:socketColors[row],jack);bore.position.z=.00124;
  if(ch===0)anchors[['input','ground','output'][row]]=node([0,0,.002],jack);
 }
 // Text drawn from geometry positions; no reference photograph is embedded.
 const ink=globalThis.document?.createElement('canvas');
 if(ink){ink.width=2020;ink.height=355;}
 const ctx=ink?.getContext('2d');
 if(ctx){
  const lettering=(value,x,y,size,align='center')=>{
   ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle='#a9b5c3';ctx.font=`700 ${size}px sans-serif`;
   ctx.fillText(value,(.5+x/panelW)*2020,(.5-y/panelH)*355);
  };
  lettering('DIGITAL INTERFACE PANEL',-.0545,.0125,23);
  for(const [i,value] of ['DIGITAL IN','GROUND','DIGITAL OUT'].entries())lettering(value,-.089,rows[i],17,'right');
  for(const [i,x] of xs.entries())lettering(String(i+1),x,-.0111,17);
  lettering('RTDS',.091,-.0122,21,'right');
  const tex=new THREE.CanvasTexture(ink);tex.colorSpace=THREE.SRGBColorSpace;textures.add(tex);
  const textMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false});materials.add(textMat);
  const print=mesh(new THREE.PlaneGeometry(panelW,panelH),textMat,panel);print.position.z=.0022;
 }
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
 anchors.boardLabel=node([.145,.12,.015]);anchors.panelLabel=node([.009,.044,.035]);anchors.relayLabel=node([-.133,.111,.03]);anchors.receiverLabel=node([-.133,-.11,.03]);
 group.updateMatrixWorld(true);
 const diagram=new THREE.Group();group.add(diagram);
 const world=n=>n.getWorldPosition(new THREE.Vector3());
 const cable=(key,a,b,color,radius=.0013)=>{const curve=new THREE.CatmullRomCurve3([a,new THREE.Vector3(a.x+.025,a.y,.085),new THREE.Vector3(b.x-.02,b.y,.08),b]);const geo=new THREE.TubeGeometry(curve,48,radius,8,false);geometries.add(geo);const mesh=new THREE.Mesh(geo,mat(color));diagram.add(mesh);return {mesh,curve};};
 for(const [key,def]of Object.entries(wires)){const c=cable(key,world(anchors[def.ends[0]]),world(anchors[def.ends[1]]),key.includes('Ground')||key==='common'?0x405561:0x267fba);const g=new THREE.SphereGeometry(.0028,10,8);geometries.add(g);const pulse=new THREE.Mesh(g,mat(0xfbc451));diagram.add(pulse);c.pulse=pulse;cables[key]=c;}
 const ribbon=cable('ribbon',world(lv),world(node([.100,0,-.002],panel)),0x929a9c,.004);ribbon.mesh.userData.kind='ribbon-category-only';
 const floor=box([.44,.009,.17],[0,-.13,.005],mat(0xe6ecec),diagram);
 let disposed=false;
 function update(s,r,phase=null){if(disposed)return;arm.rotation.z=s.closed?0:.45;lampMat.color.setHex(r.receiver===5?0x36b282:r.receiver===0?0x9a5e48:0x668078);for(const [key,c]of Object.entries(cables)){c.mesh.visible=s.wires?.includes(key)??false;c.pulse.visible=!!(c.mesh.visible&&s.power&&r.status==='ready'&&Number.isFinite(phase)&&phase>=0&&phase<=1&&(key==='trip'||key==='common'?s.closed:r.output===5));if(c.pulse.visible)c.pulse.position.copy(c.curve.getPoint(key==='trip'||key==='feedbackGround'?1-phase:phase));}group.userData.closed=s.closed;group.userData.flow=Object.values(cables).some(c=>c.pulse.visible);group.updateMatrixWorld(true);}
 return {group,board,panel,sockets,diagram,relay,receiver,arm,anchors,cables,floor,update,dispose(){if(disposed)return;disposed=true;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
