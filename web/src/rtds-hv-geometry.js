import * as THREE from 'three';
import {hvWires} from './rtds-hv-state.js';
// Original functional teaching geometry, not manufacturing CAD or connector pin mapping.
export function createHvAssembly(template){
 const group=new THREE.Group(),geometries=new Set(),materials=new Set(),textures=new Set(),anchors={},cables={};
 const mat=color=>{const m=new THREE.MeshStandardMaterial({color,roughness:.65});materials.add(m);return m;};
 const dark=mat(0x29424e),pale=mat(0xe0e8eb),red=mat(0xbf5757),black=mat(0x3b4850);
 const box=(size,pos,m=pale,parent=group)=>{const g=new THREE.BoxGeometry(...size);geometries.add(g);const n=new THREE.Mesh(g,m);n.position.fromArray(pos);parent.add(n);return n;};
 const node=(pos,parent=group)=>{const n=new THREE.Object3D();n.position.fromArray(pos);parent.add(n);return n;};
 const term=(id,pos,m,parent)=>{box([.009,.009,.006],pos,m,parent);anchors[id]=node([pos[0],pos[1],pos[2]+.005],parent);};
 const board=template.clone(true);board.rotation.x=Math.PI/2;board.position.set(.15,.008,-.015);group.add(board);
 // Reconstructed front geometry from RTDS's public 1600 × 328 photo.
 // The source does not show the rear or the mechanism under the blue cover.
 const panel=new THREE.Group();panel.name='rtds-hv-panel-photographed-front';panel.position.set(.001,.054,.035);group.add(panel);
 const schematic=new THREE.Group();schematic.name='functional-only';group.add(schematic);
 const graphite=mat(0x181a23),rim=mat(0x0c0e16),cover=mat(0x244dd8),coverEdge=mat(0x071334);
 const socketColors=[mat(0xa21128),mat(0x0077ae),mat(0x11101a)],well=mat(0x050508),contact=mat(0x73512f);
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
  const jack=new THREE.Group();jack.name=`ch${ch+1}-${['vdc','load-plus','load-minus'][row]}`;jack.position.set(x,y,.002);sockets.add(jack);
  frontCyl(.0029,.0012,[0,0,.0002],socketColors[row],jack);
  const collar=mesh(new THREE.TorusGeometry(.00235,.00045,6,20),socketColors[row],jack);collar.position.z=.001;
  frontCyl(.00185,.00055,[0,0,.00095],well,jack);
  const bore=mesh(new THREE.TorusGeometry(.00132,.00019,6,16),row===1?socketColors[row]:contact,jack);bore.position.z=.00124;
  if(ch===0)anchors[['vp','lp','lm'][row]]=node([0,0,.002],jack);
 }
 // Text drawn from geometry positions; no reference photograph is embedded.
 const ink=document.createElement('canvas');ink.width=2020;ink.height=355;const ctx=ink.getContext('2d');
 if(ctx){
  const lettering=(value,x,y,size,align='center')=>{
   ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle='#a9b5c3';ctx.font=`700 ${size}px sans-serif`;
   ctx.fillText(value,(.5+x/panelW)*2020,(.5-y/panelH)*355);
  };
  lettering('HIGH VOLTAGE INTERFACE PANEL',-.052,.0125,23);
  lettering('OUTPUT RANGE 0 – 250 VDC',.052,.0125,20);
  for(const [i,value] of ['+VDC','+LOAD','−LOAD'].entries())lettering(value,-.089,rows[i],17,'right');
  for(const [i,x] of xs.entries())lettering(String(i+1),x,-.0111,17);
  lettering('RTDS',.091,-.0122,21,'right');
  const tex=new THREE.CanvasTexture(ink);tex.colorSpace=THREE.SRGBColorSpace;textures.add(tex);
  const textMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false});materials.add(textMat);
  const print=mesh(new THREE.PlaneGeometry(panelW,panelH),textMat,panel);print.position.z=.0022;
 }
 // Receiver and supply are flat diagram cards, not named equipment or electrical ratings.
 const paper=mat(0xe3ecef);
 function diagram(parent){
  box([.09,.061,.001],[0,0,0],paper,parent);
  for(const x of [-.045,.045])box([.001,.061,.001],[x,0,.001],dark,parent);
  for(const y of [-.0305,.0305])box([.09,.001,.001],[0,y,.001],dark,parent);
 }
 const relay=new THREE.Group();relay.position.set(-.122,-.065,.03);schematic.add(relay);diagram(relay);
 const lampMat=mat(0x6d7f85);frontCyl(.008,.0012,[-.012,0,.002],lampMat,relay);
 frontCyl(.005,.0012,[-.012,0,.003],paper,relay);
 box([.024,.0013,.001],[.013,0,.002],dark,relay);
 term('rp',[.037,.014,.005],red,relay);term('rm',[.037,-.014,.005],black,relay);
 const supply=new THREE.Group();supply.position.set(-.133,.075,.03);schematic.add(supply);diagram(supply);
 box([.024,.0018,.001],[-.006,.004,.003],dark,supply);
 box([.014,.0018,.001],[-.006,-.005,.003],dark,supply);
 term('sp',[.033,-.012,.006],red,supply);term('sn',[-.021,-.018,.006],black,supply);
 anchors.boardLabel=node([.15,.125,.03]);anchors.panelLabel=node([0,.091,.03]);anchors.relayLabel=node([-.122,-.119,.03]);anchors.supplyLabel=node([0,.048,0],supply);
 group.updateMatrixWorld(true);
 const world=n=>n.getWorldPosition(new THREE.Vector3());
 function cable(a,b,color,r=.0013){const curve=new THREE.CatmullRomCurve3([a,new THREE.Vector3(a.x-.012,a.y,.085),new THREE.Vector3(b.x+.012,b.y,.08),b]);const g=new THREE.TubeGeometry(curve,40,r,6,false);geometries.add(g);const mesh=new THREE.Mesh(g,mat(color));schematic.add(mesh);return {mesh,curve};}
 for(const [key,w]of Object.entries(hvWires)){const c=cable(world(anchors[w.ends[0]]),world(anchors[w.ends[1]]),['return','common','dryB'].includes(key)?0x405561:0xb65050);const g=new THREE.SphereGeometry(.0025,8,6);geometries.add(g);c.pulse=new THREE.Mesh(g,mat(0xf2c55d));schematic.add(c.pulse);cables[key]=c;}
 const lookup=new Map();board.traverse(n=>{if(n.userData.sid)lookup.set(n.userData.sid,n);});const hv=lookup.get('gtfpi-v2-2.01-capped.hv');
 // Use actual semantic port if present; never guess a pin location.
 if(!hv)throw Error('GTFPI HV语义接口缺失');
 cable(world(hv),world(node([.075,0,0],panel)),0x90999d,.004);
 const hv5=lookup.get('gtfpi-v2-2.01-capped.hv5v');if(!hv5)throw Error('GTFPI HV5V语义接口缺失');
 cable(world(hv5),world(node([.075,-.025,0],panel)),0x7f929c,.002);
 box([.44,.009,.17],[0,-.14,.005],mat(0xe9eeee),schematic);
 let disposed=false;
 return {group,board,panel,sockets,schematic,relay,supply,anchors,cables,update(s,r,phase=null){if(disposed)return;supply.visible=s.mode==='wet'||s.external;lampMat.color.setHex(r.receiver==='asserted'?0x36b282:0x6d7f85);for(const [key,c]of Object.entries(cables)){c.mesh.visible=s.wires.includes(key);c.pulse.visible=c.mesh.visible&&s.mode==='wet'&&r.flow&&Number.isFinite(phase);if(c.pulse.visible)c.pulse.position.copy(c.curve.getPoint(['return','common'].includes(key)?1-phase:phase));}group.userData.closed=s.closed;group.userData.flow=Object.values(cables).some(c=>c.pulse.visible);group.updateMatrixWorld(true);},dispose(){if(disposed)return;disposed=true;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
