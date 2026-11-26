import * as THREE from 'three';

const selAssets = 'https://selinc.com/v3/assets/bltea08f3d94a418a1b/';
export const SEL_2488_FRONT_URL = selAssets + 'bltd411d8ecc3f3e830/6a27315bbf682b7ab98dd617/2488_Front.png?content_type=image%2Fpng';
export const SEL_2488_REAR_URL = selAssets + 'blt4428eeaab4b043f3/6a27315d07c3e9f8539d697f/2488_Back.png?content_type=image%2Fpng';
export const SEL_2488_DIMENSIONS_URL = 'https://selinc.com/api/download/105748/';

// Original geometry, in millimeters. SEL datasheet figure 8, 19-inch rack
// chassis. Rear option is exactly the photo with F1–F6 and two SEL-9330-C
// power supplies. Panel artwork is rendered from original text and lines.
export function createSel2488Exterior(own = resource => resource) {
 const root = new THREE.Group();
 root.name = 'sel-2488-photo-exterior';
 const group = (parent,name,x=0,y=0,z=0) => {
  const g = new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;
 };
 const mat = (color,metalness=0,roughness=.59) => own(new THREE.MeshStandardMaterial({color,metalness,roughness}));
 const navy=mat(0x10345a),rearBlue=mat(0x163e64),lid=mat(0xa8afb3,.19),rim=mat(0xb5bdc0,.35,.42);
 const silver=mat(0xbcb9b1,.34,.33),dark=mat(0x21272a),brown=mat(0x28251f),brass=mat(0xb09b62,.50,.38);
 const green=mat(0x446d3a),lightGreen=mat(0x57824e),ivory=mat(0xbdb9a7),key=mat(0x344c60);
 const black=mat(0x121513),ceramic=mat(0x9a9681),displayRecess=mat(0x183248);
 const lens=(color)=>own(new THREE.MeshBasicMaterial({color}));
 const dim=lens(0x7e918d),on=lens(0x53e54b),amber=lens(0xc4c05e);
 function mesh(parent,geo,m,x=0,y=0,z=0,name=''){
  const o=new THREE.Mesh(own(geo),m);o.name=name;o.position.set(x,y,z);parent.add(o);return o;
 }
 const box=(g,w,h,d,m,x=0,y=0,z=0,name='')=>mesh(g,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);
 function round(w,h,r,K=THREE.Shape,x=0,y=0){
  const s=new K(),l=x-w/2,b=y-h/2,R=x+w/2,t=y+h/2;
  s.moveTo(l+r,b);s.lineTo(R-r,b);s.quadraticCurveTo(R,b,R,b+r);s.lineTo(R,t-r);s.quadraticCurveTo(R,t,R-r,t);
  s.lineTo(l+r,t);s.quadraticCurveTo(l,t,l,t-r);s.lineTo(l,b+r);s.quadraticCurveTo(l,b,l+r,b);s.closePath();return s;
 }
 const extr=(g,s,d,m,x=0,y=0,z=0,name='')=>mesh(g,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:8}),m,x,y,z,name);
 const rounded=(g,w,h,r,d,m,x,y,z,name='')=>extr(g,round(w,h,r),d,m,x,y,z,name);
 function frame(g,w,h,r,wi,hi,d,m,x,y,z){
  const s=round(w,h,r);s.holes.push(round(wi,hi,Math.max(.25,r-.7),THREE.Path));
  return extr(g,s,d,m,x,y,z);
 }
 function cyl(g,r,d,m,x,y,z,n=24){
  const o=mesh(g,new THREE.CylinderGeometry(r,r,d,n),m,x,y,z);o.rotation.x=Math.PI/2;return o;
 }
 function ring(g,outer,inner,depth,m,x,y,z,n=28){
  const s=new THREE.Shape();s.absarc(0,0,outer,0,Math.PI*2,false);
  const p=new THREE.Path();p.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(p);
  return mesh(g,new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:n/2}),m,x,y,z);
 }
 function screw(g,x,y,z,r=2,m=silver){
  cyl(g,r,.68,m,x,y,z);const slot=box(g,r*1.4,.47,.18,dark,x,y,z+.4);slot.rotation.z=(x+y)*.14;
 }
 function led(g,x,y,z,m=dim,r=1.03){cyl(g,r+0.33,.36,dark,x,y,z);cyl(g,r,.44,m,x,y,z+.24);}
 function jack(g,name,x,y,z){
  const p=group(g,name,x,y,z);
  frame(p,17.4,15.9,.9,14.7,12.9,1.6,rim,0,0,.7);
  const shape=round(14.85,13.15,.55);
  const hole=new THREE.Path();for(const [i,[px,py]] of [[-5.7,-3.4],[-3.1,-3.4],[-3.1,-5.6],[3.1,-5.6],[3.1,-3.4],[5.7,-3.4],[5.7,5.05],[-5.7,5.05]].entries()) i?hole.lineTo(px,py):hole.moveTo(px,py);hole.closePath();
  shape.holes.push(hole);extr(p,shape,.8,dark,0,0,1.13);
  box(p,14.5,12.5,.55,black,0,0,-.07);
  for(let i=0;i<8;i++){const contact=box(p,.51,3.1,.33,brass,-3.87+i*1.105,2.5,.44);contact.rotation.x=.36;}
  box(p,1.75,1.1,.31,on,-5.8,5.45,2.05);box(p,1.75,1.1,.31,amber,5.8,5.45,2.05);
  return p;
 }
 function terminal(g,name,x,y,z,pins,step){
  const p=group(g,name,x,y,z);const spread=step*(pins-1);
  rounded(p,spread+7.2,12.4,1.3,3.3,green,0,0,.5);
  box(p,spread+5.6,6.5,2.1,lightGreen,0,2.7,3.1);
  for(let i=0;i<pins;i++){
   const xx=-spread/2+i*step;box(p,step*.59,3.5,.25,dark,xx,-2.8,3.83);
   box(p,step*.45,1.65,.22,ivory,xx,-3.05,4);
   if(pins===3)screw(p,xx,2.4,5.3,1.75,ivory);
  }
  for(const xx of [-spread/2-3.05,spread/2+3.05])screw(p,xx,-2.65,4,1.6);
  return p;
 }
 function coax(g,name,x,y,z,kind){
  const p=group(g,name,x,y,z),bnc=kind==='bnc',r=bnc?6.6:4.4;
  const nut=cyl(p,r+.9,1.25,silver,0,0,.15,6);nut.rotation.y=.24;
  cyl(p,r-.5,.65,ivory,0,0,.94);
  ring(p,r,r-1.24,bnc?3.8:2.15,kind==='sma'?brass:silver,0,0,1.05);
  ring(p,r-1.35,r-2.04,.30,kind==='sma'?brass:rim,0,0,bnc?3.38:2.42);
  cyl(p,r-2.03,.56,ceramic,0,0,bnc?2.88:2.03);
  cyl(p,bnc?1.22:.92,.35,brown,0,0,bnc?3.2:2.34);
  cyl(p,bnc?.48:.33,.44,brass,0,0,bnc?3.34:2.48);
  if(bnc)for(const xx of [-r,r])box(p,1.1,1.45,1.22,silver,xx,0,3.2);
  return p;
 }
 // The natural-metal top and differing front and rear bezels remain real thickness.
 box(root,451,40.2,237,lid,0,0,1,'folded-chassis');
 for(const side of [-1,1]){
  box(root,1.15,39.8,232,rim,side*225.4,0,1,'side-fold');
  for(const z of [-81,80]){
   const o=group(root,'lid-screw',side*198,20.2,z);o.rotation.x=-Math.PI/2;screw(o,0,0,0,1.85);
  }
 }
 const ears=group(root,'rack-ears');
 for(const side of [-1,1]){
  const plate=round(23.3,43.7,3.1);
  for(const y of [-15.4,15.4])plate.holes.push(round(10.4,6.7,3.27,THREE.Path,side*2.5,y));
  extr(ears,plate,3,rim,side*229.65,0,118.9,side===1?'right-slotted-ear':'left-slotted-ear');
 }
 const front=group(root,'front',0,0,120),rear=group(root,'rear',0,0,-117.3);rear.rotation.y=Math.PI;
 rounded(front,448,40.5,2.8,2.2,navy,0,0,0,'front-blue-panel');
 frame(front,448,40.5,2.8,445.6,38,1.15,rim,0,0,1.82);
 const fx=p=>(p-710)*.339;
 const by=p=>(68-p)*(43.7/136);
 rounded(front,100,19,1.35,1.2,displayRecess,fx(691),1.65,2.23,'lcd-inset');
 const lcd=own(new THREE.MeshBasicMaterial({color:0x91b4d9}));
 rounded(front,94.3,15.6,.82,.29,lcd,fx(691),1.56,3.19,'lcd-glass');
 cyl(front,5.15,.91,silver,fx(135),by(88),2.46);cyl(front,4.37,1.15,key,fx(135),by(88),3.65);
 for(const [i,p] of [931,987].entries()){
  rounded(front,14.1,14.0,2.5,1.03,rim,fx(p),by(88),2.5,'navigation-key-rim');
  rounded(front,12.95,12.9,2.16,1.24,key,fx(p),by(88),3.08,'navigation-key');
  const path=new THREE.Shape(),fl=i?-1:1;path.moveTo(0,3.4*fl);path.lineTo(-2.5,-3.25*fl);path.lineTo(2.5,-3.25*fl);path.closePath();
  mesh(front,new THREE.ShapeGeometry(path),lens(0xe4eaf2),fx(p),by(88),4.34);
 }
 for(const [p,y,lit] of [[196,83,1],[196,98,0],[289,83,0],[289,98,0],[1030,83,1],[1030,99,1],[1087,82,0],[1087,99,1],[1142,82,0],[1142,97,0]])led(front,fx(p),by(y),2.31,lit?on:dim,.88);
 for(const p of [345,364,383,402])for(const y of [83,98])led(front,fx(p),by(y),2.31,dim,.8);
 jack(front,'front-eth-f',fx(1293),-7.5,2.05);

 const rx=p=>(p-708)*.325;
 rounded(rear,455,42.8,1.15,2.6,rearBlue,0,0,-.4,'rear-blue-panel');
 for(const y of [-20.25,20.25])box(rear,454,1.55,1.8,rim,0,y,1.55);
 for(const p of [174,420,707,911,1123,1388])box(rear,.48,40,.27,rim,rx(p),0,2.32);
 terminal(rear,'rear-alarm-block',rx(81),-9.55,2.1,5,5.2);
 const bnc=group(rear,'rear-bnc-bank');
 for(const [row,y] of [8.1,-8].entries())for(const [i,p] of [213,272,331,391].entries())coax(bnc,'T0'+(row*4+i+1),rx(p),y,2.1,'bnc');
 const sma=group(rear,'rear-sma-bank');
 [443,488,534,579,624,670].forEach((p,i)=>coax(sma,'F'+(i+1),rx(p),12.05,2.1,'sma'));
 const eth=group(rear,'rear-ethernet-bank');
 [463,528,593,658].forEach((p,i)=>jack(eth,'ETH-'+(i+1),rx(p),-8.5,2.03));
 const db=group(rear,'rear-com1',rx(755),-9.4,2.13);
 rounded(db,30.8,8.5,3.1,1.45,rim,0,0,0);for(const x of [-12.7,12.7])cyl(db,1.38,.53,dark,x,0,1.48);
 const D=new THREE.Shape();D.moveTo(-9.1,4.9);D.lineTo(9.1,4.9);D.quadraticCurveTo(10.8,4.9,10.4,2.7);D.lineTo(7.4,-4.4);D.lineTo(-7.4,-4.4);D.lineTo(-10.4,2.7);D.quadraticCurveTo(-10.8,4.9,-9.1,4.9);D.closePath();
 extr(db,D,1.37,rim,0,0,1.29);const dbInner=extr(db,D,.52,black,0,0,2.69);dbInner.scale.set(.81,.72,1);
 for(const [n,y] of [[5,1.47],[4,-1.40]])for(let i=0;i<n;i++)cyl(db,.52,.37,brass,(i-(n-1)/2)*2.8,y,3.2,12);
 coax(rear,'rear-irig-b-in',rx(848),-8.5,.6,'bnc');
 coax(rear,'rear-gnss-antenna',rx(848),9.3,2.1,'tnc');
 const supplies=group(rear,'rear-power-supplies');
 for(const p of [1017,1251]){
  const supply=group(supplies,'SEL-9330-C',rx(p),0,0);
  rounded(supply,65.6,39.5,.8,.88,navy,0,0,2.17);
  box(supply,5.6,42.0,2.1,rim,-35.4,0,2.0);
  screw(supply,-35.4,-7.2,4.1,2.65,ivory);screw(supply,-35.4,13.2,4.1,2.65,ivory);
  terminal(supply,'removable-three-position-plug',-7.9,-8.0,-.10,3,7.45);
  led(supply,18,-12.6,3.05,on);
 }
 screw(rear,rx(1382),-14.7,2.75,3.9,green);
 for(const p of [466,692])led(rear,rx(p),6.2,2.25,on,1.02);

 // Print derived from the visible panel layout; no vendor pixels are shipped.
 function print(parent,w,h,z,draw){
  const canvas=globalThis.document?.createElement('canvas');if(!canvas)return;
  canvas.width=2048;canvas.height=256;const c=canvas.getContext('2d');if(!c)return;
  c.scale(2048/1420,256/136);
  const white='#dbe6f0', ink=(s,x,y,sz=11,col=white,align='left',family='sans-serif')=>{
   c.fillStyle=col;c.font=`600 ${sz}px ${family}`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);
  };
  const outline=(x,y,w,h,r=5)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.stroke();};
  const line=(x,y,x2,y2)=>{c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
  c.lineWidth=1.35;c.strokeStyle=white;draw(ink,outline,line);
  const map=own(new THREE.CanvasTexture(canvas));map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  mesh(parent,new THREE.PlaneGeometry(w,h),own(new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false})),0,0,z);
 }
 print(front,482.6,43.7,4.38,(t,r,l)=>{
  r(105,39,376,79,8);for(const x of [170,277,340])l(x,39,x,118);
  r(902,39,437,79,7);for(const x of [1018,1246])l(x,39,x,118);
  r(133,16,33,18,2);t('SEL',149.5,25,14,undefined,'center');
  t('SEL-2488 SATELLITE SYNCHRONIZED NETWORK CLOCK',1338,26,12,undefined,'right');
  t('LAMP',122,53,10);t('TEST',124,65,10);t('ENABLED',206,86,10);t('ALARM',206,101,10);
  t('PWR A',299,86,10);t('PWR B',299,101,10);t('100 Mbps',414,86,10);t('LNK/ACT',414,101,10);
  for(const [i,p] of [345,364,383,402].entries())t(String(i+1),p,111,9,undefined,'center');
  r(389,49,12,6,1);r(379,59,9,6,1);r(402,59,9,6,1);l(394,55,394,59);l(384,58,407,58);
  t('GPS <100ns',556,51,13,'#40578e','left','monospace');t('−08:00',821,51,13,'#40578e','right','monospace');
  t('12:46:18 PM',681,71,27,'#445895','center','monospace');
  for(const [s,x,y] of [['SATELLITE',1035,77],['LOCK',1035,86],['TIME',1035,100],['QUALITY',1035,109],['OUT 1',1092,85],['ANTENNA',1092,100],['STATUS',1092,110],['PTP',1148,85],['NTP',1148,100],['ETH F',1277,50]])t(s,x,y,9.6);
 });
 print(rear,461.5,43.1,5.32,(t,r,l)=>{
  t('OUT 1  ALARM',45,29,12);t('C1 C2 C3 C4 C5',44,62,10);
  for(const x of [53,59,71,87,102])l(x,40,x,54);
  for(const [i,p] of [208,267,326,386].entries()){t('T0'+(i+1),p,70,10,undefined,'center');t('T0'+(i+5),p,119,10,undefined,'center');}
  [443,488,534,579,624,670].forEach((p,i)=>t('F'+(i+1),p+15,17,10));
  t('10 MHz',562,55,10);l(431,52,451,52);l(646,52,690,52);
  [463,528,593,658].forEach((p,i)=>t('ETH '+(i+1),p,66,11,undefined,'center'));
  t('COM 1',753,76,11,undefined,'center');t('IRIG-B',800,74,10);t('IN',818,86,10);t('ANT',809,19,11);t('C6',863,73,9);t('C7',863,121,9);
  for(const p of [930,1164]){
   r(p,15,23,12,2);t('SEL',p+11.5,21,10,undefined,'center');
   t('SEL-9330-C',p+116,19,12);t('POWER SUPPLY',p+116,31,8);
   t('IN 24–48V',p+117,47,9);t('OUT 12.5V',p+117,58,9);t('PWR',p+159,98,8);
   t('+     −    GND',p+33,61,10);
  }
  t('GND',1370,64,9);
 });
 return root;
}
