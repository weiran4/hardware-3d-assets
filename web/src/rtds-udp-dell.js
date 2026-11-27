import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export const dell7080Photo='https://cdn11.bigcommerce.com/s-r4tr0/images/stencil/1280x1280/products/262912/456571/dell-optiplex-7080-micro-i5-10th-gen-windows-11-pro-business-computer-1d__11967.1751156567.jpg?c=2';
export const dell7080Ports='https://www.dell.com/support/manuals/en-ca/optiplex-7080-micro/optiplex7080_micro_specs/ports-and-connectors?guid=guid-8cecb1fe-2dec-44f4-9c25-a771c75b8d8b&lang=en-us';

// Original exterior, referenced to photographed standard 7080 Micro without optional rear modules.
export function createDell7080(){
 const group=new THREE.Group(),owned=new Set();group.name='dell-optiplex-7080-micro';
 const keep=o=>(owned.add(o),o),s=.001;
 const mat=(color,metalness=0)=>keep(new THREE.MeshStandardMaterial({color,metalness,roughness:.62}));
 const shell=mat(0x2a2e31),edge=mat(0x26292a),panel=mat(0x2d3031),rearMetal=mat(0x3d4041,.17),slot=mat(0x090b0d),rib=mat(0x343638),silver=mat(0x9fa3a1,.49),inox=mat(0x626965,.24),blue=mat(0x1c4d7d),warm=mat(0xb29d6b,.4),darkLed=mat(0x535c57);
 function item(parent,name,geometry,material,x,y,z){
  const o=new THREE.Mesh(keep(geometry),material);o.name=name;o.position.set(x*s,y*s,z*s);parent.add(o);return o;
 }
 function box(p,n,x,y,z,w,h,d,m,r=0){
  return item(p,n,r?new RoundedBoxGeometry(w*s,h*s,d*s,2,r*s):new THREE.BoxGeometry(w*s,h*s,d*s),m,x,y,z);
 }
 function disk(p,n,x,y,z,r,d,m){
  const q=item(p,n,new THREE.CylinderGeometry(r*s,r*s,d*s,24),m,x,y,z);q.rotation.x=Math.PI/2;return q;
 }
 function ring(p,n,x,y,z,r,t,m){
  return item(p,n,new THREE.TorusGeometry(r*s,t*s,6,32),m,x,y,z);
 }
 function text(p,words,x,y,z,w,h,fill='#e1e3e2',background=null){
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.width=220;c.height=Math.max(32,Math.ceil(220*h/w));const ctx=c.getContext('2d');if(background){ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);}
  ctx.fillStyle=fill;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold '+Math.floor(c.height*.73)+'px Arial';ctx.fillText(words,c.width/2,c.height/2,c.width*.95);
  const t=keep(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;
  item(p,'original-type-'+words,new THREE.PlaneGeometry(w*s,h*s),keep(new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})),x,y,z);
 }
 box(group,'chassis-envelope',0,0,0,36,182,178.56,shell,3);
 for(const y of [-70,70])for(const z of [-61,61])box(group,'pad',-18,y,z,2.2,7,5,slot,.7);
 const front=new THREE.Group(),rear=new THREE.Group();front.name='bezel-front';rear.name='standard-rear';group.add(front,rear);rear.rotation.y=Math.PI;
 box(front,'matte-front-face',0,0,88.8,35.6,181.1,2.7,panel,3);
 box(front,'right-grille-recess',10.7,0,90.3,11.7,175,1,slot,1.5);
 box(front,'lower-left-grille-recess',-5.3,-50,90.3,20,73,1,slot,.5);
 for(const [cx,top,count] of [[10.7,82,29],[-10.3,-15,13],[-.45,-14,13]]){
  for(let i=0;i<count;i++){const b=box(front,'front-diagonal-rib',cx,top-i*5.8,91,9.5,1.18,.82,rib);b.rotation.z=.58;}
 }
 disk(front,'power-well',-6.7,79,90.7,5.6,.9,slot);disk(front,'power-disc',-6.7,79,91.25,5.05,.6,panel);
 box(front,'power-mark',-6.7,80.65,91.6,.8,3.6,.12,silver);
 disk(front,'activity-unlit',-6.7,66.3,91,0.62,.22,darkLed);
 for(const y of [55,44.3]){disk(front,'3.5-mm-recess',-6.7,y,90.8,3.08,1,slot);ring(front,'audio-bezel',-6.7,y,91.32,2.94,.25,inox);}
 box(front,'usb-c-surround',-6.7,26.8,91.1,4.4,10.4,.7,inox,1.3);
 box(front,'usb-c-well',-6.7,26.8,91.52,3.2,9.35,.15,slot,1);
 box(front,'usb-c-tongue',-6.7,26.8,91.61,.65,6.8,.08,inox);
 function usb(p,x,y,z,n){
  box(p,n+'-shell',x,y,z,5.95,13.3,.72,inox,.25);
  box(p,n+'-recess',x,y,z+.39,4.75,12.15,.21,slot,.23);
  box(p,n+'-blue-tongue',x-.8,y,z+.5,1.3,9.75,.16,blue);
 }
 usb(front,-6.7,6.8,91,'front-type-a');
 text(front,'OptiPlex 7080',-4.8,-11.1,91.65,18.8,6.2,'#181a1b','#a5a6a6');
 ring(front,'badge-ring',0,-49,92,9.65,.45,silver);text(front,'DELL',0,-49,92.25,15,5.8);
 // Back panel: one inset RJ45 above four USB-A; dual DisplayPort lower right.
 box(rear,'rear-panel-frame',0,0,88.7,35.4,181,2.5,edge,3);
 box(rear,'rear-dark-metal',0,0,90.1,32.8,174.8,.85,rearMetal,1.3);
 for(const x of [-13,-5,7,14])box(rear,'top-retention-slot',x,82.5,90.62,2.3,6.3,.3,slot,.4);
 box(rear,'option-cover',-7.8,58,90.72,10.8,18.1,.43,edge,.7);
 box(rear,'option-cover-vertical',-7.8,58,91,2.95,8.8,.2,slot,.5);
 box(rear,'option-cover-horizontal',-7.8,58,91,8.1,2.95,.2,slot,.5);
 const jack=new THREE.Group();jack.name='rear-rj45-visual-only';rear.add(jack);jack.position.set(0,0,.0003);
 box(jack,'rj45-metal-outline',10.1,63,90.85,9.65,15,.8,silver,.2);
 box(jack,'rj45-dark-well',10.28,63,91.28,7.45,12.7,.22,slot,.4);
 const mouth=new THREE.Object3D();mouth.name='rear-rj45-mouth';mouth.position.set(10.28*s,63*s,91.72*s);jack.add(mouth);
 box(jack,'rj45-latch-step',6.25,63,91.42,1.65,6.1,.16,slot);
 for(const y of [57.9,68])box(jack,'unlit-status-window',6.5,y,91.48,1.25,1.45,.18,darkLed);
 for(let i=0;i<8;i++)box(jack,'rj45-contact',12.8,58.9+i*1.1,91.45,1.0,.22,.06,warm);
 for(const x of [-2.7,6.1])for(const y of [28.2,11.1])usb(rear,x,y,90.7,'rear-type-a');
 disk(rear,'thumbscrew-edge',-11.3,-12.8,90.85,4.8,1,edge);
 box(rear,'screw-cross-a',-11.3,-12.8,91.46,6.7,.74,.17,slot);
 box(rear,'screw-cross-b',-11.3,-12.8,91.46,.74,6.7,.17,slot);
 for(let i=0;i<11;i++)for(const x of [-12.6,-7.8,-3.2])
  box(rear,'lower-vent-cutout',x,-20.4-i*5.76,90.64,3.6,4.27,.29,slot,.25);
 for(const y of [-39.7,-62.5]){
  box(rear,'displayport-outline',7.65,y,90.82,5.75,17.8,.8,inox,.7);
  box(rear,'displayport-recess',7.65,y,91.26,4.4,15.7,.35,slot,.65);
  box(rear,'displayport-key',8.65,y+5.4,91.47,1.4,2.85,.22,inox);
 }
 disk(rear,'dc-surround',6.1,-78.9,90.85,3.73,.65,inox);
 disk(rear,'dc-recess',6.1,-78.9,91.25,2.87,.6,slot);disk(rear,'dc-center',6.1,-78.9,91.65,.66,.24,inox);
 return {group,dispose(){for(const r of owned)r.dispose();owned.clear();}};
}
