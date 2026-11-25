import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const listing='https://vb-steuerungstechnik.de/media/image/product/13953/lg/moxa-eds-g308---rev150---gigabit-ethernet-device-switch';
export const g308Reference=Object.freeze({
 model:'Moxa EDS-G308 Rev. 1.5.0',
 front:listing+'.jpg',
 rear:listing+'~3.jpg',
 spec:'https://moxa.com/en/products/industrial-network-infrastructure/ethernet-switches/unmanaged-switches/eds-g308-series'
});

// Original detached exterior, based on the photographed 8-RJ45 Rev. 1.5.0.
// Face details are visual only; no power, signal or port-mating anchors.
export function createG308Exterior(){
 const group=new THREE.Group(),owned=new Set();group.name='moxa-eds-g308-rev-1-5-0';
 const keep=x=>(owned.add(x),x),unit=.001;
 const mat=(color,metalness=0,roughness=.58)=>keep(new THREE.MeshStandardMaterial({color,metalness,roughness}));
 const charcoal=mat(0x303132),bezel=mat(0x424344),black=mat(0x12191a),plate=mat(0x9ba6ad,.26),rib=mat(0xaab8c1,.18),rail=mat(0xaebbc5,.30),
  teal=mat(0x179899),jackFrame=mat(0x916126,.28),jackDark=mat(0x18211d),contact=mat(0xc2ab63,.32),green=mat(0x228e63),greenInset=mat(0x124835),blue=mat(0x126abc),pale=mat(0xd5e8ec),off=mat(0x687069);
 function mesh(geometry,material,x,y,z,name){
  const o=new THREE.Mesh(keep(geometry),material);o.position.set(x*unit,y*unit,z*unit);o.name=name;group.add(o);return o;
 }
 function box(name,x,y,z,w,h,d,m,r=0){
  const ds=[w*unit,h*unit,d*unit];
  return mesh(r?new RoundedBoxGeometry(...ds,2,r*unit):new THREE.BoxGeometry(...ds),m,x,y,z,name);
 }
 function disk(name,x,y,z,r,d,m,axis='z'){
  const o=mesh(new THREE.CylinderGeometry(r*unit,r*unit,d*unit,16),m,x,y,z,name);
  if(axis==='z')o.rotation.x=Math.PI/2;else if(axis==='x')o.rotation.z=Math.PI/2;return o;
 }
 function stamp(name,text,x,y,z,w,h,side=false){
  const c=document.createElement('canvas');c.width=384;c.height=Math.round(c.width*h/w);
  const ctx=c.getContext('2d');if(!ctx)return;
  ctx.font='600 '+Math.round(c.height*.64)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=side?'#273032':'#d8e7e5';
  ctx.fillText(text,c.width/2,c.height*.51,c.width-7);
  const t=keep(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;
  const o=mesh(new THREE.PlaneGeometry(w*unit,h*unit),keep(new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})),x,y,z,name);
  if(side)o.rotation.y=Math.PI/2;
 }
 box('enclosure',0,0,-3,51.8,135,94,charcoal,.65);
 box('front-rim',0,0,49.5,53,134,5.8,bezel,1);
 box('inset-face',0,0,52.46,46.1,124,.9,black,.32);
 box('turquoise-front-stripe',11,-15,53.00,18.0,92,.29,teal);
 box('manufacturer-lozenge',11,53.5,53.1,17,10,.42,teal,1.3);
 stamp('manufacturer-mark','MOXA',11,53.4,53.39,15,7);
 stamp('model-mark','EDS-G308',10,-58.1,53.4,19,4.8);
 for(const [i,name] of ['PWR1','PWR2','FAULT'].entries()){
  const y=48-i*6.7;disk('inactive-status-lens',-14.9,y,53.01,1.55,.62,off);
  stamp('status-mark',name,-6.6,y,53.45,12.2,4.7);
 }
 // Warm metal outer cage and two columns of keyed, recessed sockets.
 box('socket-bank-backing',0,-26.0,53.45,36.1,62.6,.8,jackFrame,.9);
 for(let row=0;row<4;row++)for(let col=0;col<2;col++){
  const x=col?8.63:-8.63,y=-3.15-row*15.24,id=8-2*row-(col?0:1),sign=col?1:-1;
  box('rj45-cavity-'+id,x,y,54.02,15.58,13.26,.42,black,.38);
  box('rj45-inner-'+id,x+sign*.55,y+.05,54.20,12.65,11.01,.32,jackDark);
  box('rj45-keyed-void-'+id,x+sign*5.30,y,54.32,4.09,5.3,.39,black);
  for(let j=0;j<8;j++)box('contact-visual',x-sign*5.0,y-4.06+j*1.16,54.70,2.0,.36,1.08,contact,.12);
  box('inactive-port-lens',x+sign*6.0,y-4.64,54.47,1.51,1.05,.65,off,.15);
  stamp('port-mark',String(id),sign*20.6,y,53.54,3.4,4.35);
 }
 // Ribbed aluminum flanks and distinct pale label area. Do not duplicate serial/approval marks.
 for(const side of [-1,1]){
  box('aluminum-flank',side*25.7,0,-2,1.6,134,98,plate,.65);
  for(let i=0;i<52;i++){
   const y=-61+i*2.39;
   const patternedRight=side===1&&Math.abs(y+1)<19;
   box('extruded-rib',side*26.8,y,patternedRight?-46.8:-2,1.34,1.05,patternedRight?5.9:91.5,rib,.40);
   if(patternedRight)box('short-rib',side*26.8,y,43,1.34,1.05,5.9,rib,.40);
  }
  for(const y of [-56,56])for(const z of [-43,42]){
   disk('flank-fastener',side*27.35,y,z,2.25,.72,rail,'x');
   box('flank-fastener-slot',side*27.76,y,z,.2,.50,2.25,bezel);
  }
 }
 box('matte-identification-plate',27.29,-1,-1,.42,37,83,pale,.18);
 stamp('visual-id','MOXA     EDS-G308',27.55,6,-1,72,8,true);
 stamp('visual-revision','Rev. 1.5.0',27.55,-8,-1,72,5.8,true);
 // The observed top tier: six-position terminal and two blue banks.
 box('green-terminal-body',0,73.4,-26,34,12.4,15.8,green,1.05);
 box('terminal-base',0,67.75,-26,34.8,1,17.2,greenInset,.38);
 for(let i=0;i<6;i++){
  const x=-13.6+i*5.44;
  disk('terminal-recess-front',x,73.1,-17.91,1.67,1.1,greenInset);
  box('terminal-top-recess',x,79.67,-22.5,2.38,.65,2.4,greenInset,.2);
 }
 for(const [z,count] of [[10,4],[34,8]]){
  box('blue-dip-body',0,68.0,z,count===8?27:15,1.9,8.4,blue,.38);
  for(let i=0;i<count;i++)box('dip-toggle-visual',(i-(count-1)/2)*3.08,69.24,z+.72,1.52,.65,3.5,pale,.15);
 }
 // The observed silver clip and rail lips on the rear, not an installation drawing.
 box('rear-panel',0,0,-50.6,52,134,2.3,charcoal,.55);
 box('rear-rail-plate',0,0,-53.06,47,43,3.0,rail,1);
 box('rolled-upper-rail-lip',0,21.2,-55.4,47.8,5.1,4.8,rail,1.35);
 box('rolled-lower-rail-lip',0,-21.2,-55.3,47.8,4.4,5.0,rail,1.08);
 for(const x of [-12.2,12.2])disk('rear-clip-screw',x,6.0,-54.83,2.3,.85,bezel);
 return {group,dispose(){for(const r of owned)r.dispose();owned.clear();}};
}
