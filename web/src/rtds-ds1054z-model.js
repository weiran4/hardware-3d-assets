import * as THREE from 'three';

// Original geometry, based on exact-model DS1054Z photos (no photo texture).
// Millimetre front coordinates: +X right, +Y up, +Z out of the panel.
export const ds1054zPhoto='https://eleshop.eu/rigol-ds1054z.html';
export const ds1054zDatasheet='https://www.rigol.com/dam/global/downloads/brochures/en/data-sheet/oscilloscopes/DS1000Z_DataSheet_EN.pdf';
const S=.00078;
const v=(x,y,z)=>new THREE.Vector3(x*S,y*S,z*S);

export function createDS1054Z(){
 const group=new THREE.Group(),owned=[];
 group.name='rigol-ds1054z';
 const material=(color,options={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.57,...options});owned.push(m);return m;};
 const black=material(0x1c252b),charcoal=material(0x44484e),vent=material(0x2e343b),ivory=material(0xc3c0ba),pale=material(0xd5d1c8),edge=material(0xb1b2ad),lightblue=material(0x80aec8),blue=material(0x60849d),inset=material(0xb1aeaa),silver=material(0xbec2c3,{metalness:.65,roughness:.34}),steel=material(0xa4a9aa,{metalness:.52}),glass=material(0x101b21,{roughness:.32}),dielectric=material(0xf2e7cc),brass=material(0xe3b652,{metalness:.5}),keyGreen=material(0xa2c66d);
 const channelColors=[0xecc52c,0x51b9e4,0xd974cb,0x5269cb].map(c=>material(c));
 function add(g,m,parent=group,name){
  const o=new THREE.Mesh(g,m);if(name)o.name=name;parent.add(o);owned.push(g);return o;
 }
 function box(w,h,d,x,y,z,m,parent=group,name){
  const o=add(new THREE.BoxGeometry(w*S,h*S,d*S),m,parent,name);o.position.copy(v(x,y,z));return o;
 }
 function slab(points,rear,front,bevel,m,parent=group,name){
  const s=new THREE.Shape();points.forEach(([x,y],i)=>s[i?'lineTo':'moveTo'](x*S,y*S));s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:(front-rear-2*bevel)*S,steps:1,bevelEnabled:bevel>0,bevelThickness:bevel*S,bevelSize:bevel*S,bevelSegments:2,curveSegments:1});
  const o=add(g,m,parent,name);o.position.z=(rear+bevel)*S;return o;
 }
 function chamfer(x,y,w,h,c,rear,front,b,m,parent,name){
  const l=x-w/2,r=x+w/2,t=y+h/2,d=y-h/2;
  return slab([[l+c,t],[l,t-c],[l,d+c],[l+c,d],[r-c,d],[r,d+c],[r,t-c],[r-c,t]],rear,front,b,m,parent,name);
 }
 function cylinder(x,y,z,r1,r2,depth,m,parent=group,name){
  const o=add(new THREE.CylinderGeometry(r1*S,r2*S,depth*S,32),m,parent,name);
  o.rotation.x=Math.PI/2;o.position.copy(v(x,y,z));return o;
 }

 // Molded two-tone enclosure. Deep edge cheeks, stepped front perimeter and
 // two deployable support feet are separate silhouette geometry.
 chamfer(-2,2,289,137,9,-109,-9,3,charcoal,group,'rear-shell');
 chamfer(0,3,305,142,9,-99,-15,2,charcoal,group,'outer-wrap');
 for(const side of [-1,1]){
  const cheek=box(5,71,71,side*151,-15,-49,vent);
  cheek.rotation.z=side*.018;
  for(let i=0;i<9;i++)box(1.4,1.6,44,side*154,19-i*3.1,-48,black);
  chamfer(side*97,-75,39,8,3,-35,5,1.2,ivory,group,side<0?'foot-L':'foot-R');
 }
 slab([[-144,73],[-154,63],[-154,-64],[-145,-73],[144,-73],[153,-63],[153,62],[143,73]],-17,-1,2.5,ivory,group,'chamfered-front-fascia');
 slab([[-144,70],[-151,61],[-151,-62],[-144,-70],[137,-70],[147,-60],[150,54],[141,69]],-2,2,1.2,pale,group,'main-face');
 slab([[11,-41],[24,-36],[150,-36],[150,-62],[140,-68],[39,-68],[23,-55]],.8,3.4,.45,inset,group,'offset-lower-bnc-bay');

 // Recessed left display, side softkey banks and lower power/USB pocket.
 chamfer(-55,13,170,109,4,1,5,1,inset,group,'screen-pocket');
 chamfer(-55,12,155,94,2,4,6,.4,black,group,'screen-bezel');
 chamfer(-55,12,148,86,1.5,5.9,6.45,.1,glass,group,'screen-glass');
 for(const side of [-1,1])for(let i=0;i<8;i++){
  const x=side<0?-139:30,y=58-i*12.3,w=10,h=i===7?6.2:7;
  slab([[x-w/2,y+h/2],[x-w/2,y-h/2],[x+w/4,y-h/2],[x+w/2,y],[x+w/4,y+h/2]],2.6,5.4,.75,i===0||i===7?lightblue:blue,group,`softkey-${side}-${i}`);
 }
 slab([[-142,-49],[-136,-44],[-48,-44],[-36,-62],[-141,-64]],1,3.4,.6,inset,group,'power-usb-recess');
 chamfer(-131,-55,13,8,1,2.5,5.6,.65,pale,group,'power');
 box(5,13,2.1,-118,-55,4.9,steel,group,'USB-A');
 box(3.3,10,1.1,-118,-55,6,black);
 box(1,7.9,.35,-117.4,-55,6.6,inset);

 // Distinct DS1054Z control groups; buttons, colored channel rings and
 // six molded rotary knobs deliberately come from that photographed model.
 for(const [x,y,w,h] of [[83,39,57,24],[75,-3,38,53],[115,-3,32,53],[140,-3,18,58]])
  chamfer(x,y,w,h,4,2.2,3.65,.45,inset);
 function key(x,y,w,h,m=pale,name){return chamfer(x,y,w,h,1.15,3,6,.55,m,group,name);}
 for(let i=0;i<4;i++)key(57+i*26,61,17,7,i>=2?lightblue:pale);
 for(let j=0;j<2;j++)for(let i=0;i<3;i++)key(72+i*15,42-j*9,10,5);
 key(132,45,10,6,keyGreen);key(132,34,10,6,keyGreen);
 for(let i=0;i<4;i++){key(55,14-i*9,10,6,channelColors[i]);key(55,14-i*9,7.7,4.3);}
 key(74,-4,9,5);key(87,-4,8.5,5);key(109,-4,9,5);
 for(const y of [14,-18,-26])key(139,y,10,5);
 const knobs=[[53,39,5.3],[77,14,6.8],[108,14,6.8],[142,1,5.5],[76,-23,10],[108,-23,10]];
 knobs.forEach(([x,y,r],i)=>{
  const knob=new THREE.Group();knob.name=`knob-${i+1}`;knob.position.copy(v(x,y,0));group.add(knob);
  cylinder(0,0,4.8,r*.88,r*.88,1.6,edge,knob);
  cylinder(0,0,8.0,r*.88,r,6,pale,knob);
  cylinder(0,0,11.1,r*.84,r*.84,.9,ivory,knob);
  for(let j=0;j<16;j++){
   const a=j*Math.PI/8;
   box(.55,.67,4,Math.cos(a)*r*.87,Math.sin(a)*r*.87,8.1,ivory,knob).rotation.z=a;
  }
 });

 for(let i=0;i<4;i++){
  const x=51+i*28, y=-54;
  chamfer(x,y,22,21,3,3,5,.55,pale,group,`ch${i+1}-pocket`);
  box(2.2,9,.75,x-9,y+4,5.4,channelColors[i]);
  const p=new THREE.Group();p.name=`CH${i+1}`;p.position.copy(v(x,y,6));group.add(p);
  cylinder(0,0,.9,7,7,1.8,steel,p,'BNC-flange');
  const lathe=[[5.15,0],[5.15,1],[5.45,1.6],[5.45,6.8],[4.9,7.4],[3.72,7.4],[3.72,2.2]].map(([r,z])=>new THREE.Vector2(r*S,z*S));
  const collar=add(new THREE.LatheGeometry(lathe,36),silver,p,'bayonet-shell');
  collar.rotation.x=Math.PI/2;
  cylinder(0,0,2.3,3.7,3.7,.8,black,p);
  cylinder(0,0,2.85,2.5,2.5,.85,dielectric,p);
  cylinder(0,0,3.25,.65,.65,.48,brass,p,'coax-center');
  for(const sign of [-1,1])box(1.4,1.5,2.4,sign*5.3,.8,4.8,steel,p);
 }
 const screen={left:-124*S,right:14*S,bottom:-28*S,top:51*S,z:6.85*S};
 const text=typeof document==='undefined'?null:document.createElement('canvas');
 if(text){
  text.width=1024;text.height=512;
  const ctx=text.getContext('2d');
  if(ctx){
   ctx.scale(3.24,3.24);ctx.translate(157,79);
   const label=(s,x,y,font,color)=>{ctx.fillStyle=color;ctx.font=font;ctx.fillText(s,x,-y);};
   ctx.fillStyle='#f2c928';ctx.fillRect(-119,-69,25,6.7);
   label('RIGOL',-117.6,64,'bold 5.6px sans-serif','#171a1b');
   label('DS1054Z',-92,64,'bold 4.9px sans-serif','#23272b');
   label('DIGITAL OSCILLOSCOPE',-67,64,'3px sans-serif','#4d5559');
   for(let i=0;i<4;i++)label('CH'+(i+1),45+i*28,-43,'bold 3.4px sans-serif','#41494c');
   label('VERTICAL',53,25,'bold 3.2px sans-serif','#465151');
   label('HORIZONTAL',94,25,'bold 3.1px sans-serif','#465151');
   label('TRIGGER',131,25,'bold 3.0px sans-serif','#465151');
   label('MENU',-144,57,'bold 2.75px sans-serif','#314657');
   label('AUTO',78,60,'2.7px sans-serif','#444');
   label('RUN/STOP',99,60,'2.4px sans-serif','#444');
   const t=new THREE.CanvasTexture(text);t.colorSpace=THREE.SRGBColorSpace;owned.push(t);
   const m=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3});owned.push(m);
   const panel=add(new THREE.PlaneGeometry(316*S,158*S),m,group,'vector-dial-legends');panel.position.z=6.21*S;
  }
 }
 return {group,owned,screen,signal:v(51,-54,13.8),shield:v(46,-54,13.3)};
}
