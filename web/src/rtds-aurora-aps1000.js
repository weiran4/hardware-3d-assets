import * as THREE from 'three';

export const APS_1000_PHOTO_URL = 'https://www.spsimulation.com/uploads/documents/SPS-TD-APS-Overview-ver03-a25cf.pdf#page=1';

// Photo-backed exterior only. Manufacturer envelope: 483 × 178 × 650 mm.
// +Z is the front. Only front details and the two seen left grips are shown;
// the rear is a plain enclosure cap, not an interface or port reference.
export function createAps1000Exterior() {
 const group=new THREE.Group();group.name='aps1000-front-exterior';
 const owned=new Set();
 const own=r=>{owned.add(r);return r;};
 const mat=(color,metalness=0,roughness=.66)=>own(new THREE.MeshStandardMaterial({color,metalness,roughness}));
 const cover=mat(0xbfc1be,.23),fascia=mat(0xd9d9d4,.17),edge=mat(0xb2b3ab,.24);
 const seam=mat(0x444646),steel=mat(0xa0a09a,.39,.36),nickel=mat(0xb9bcb7,.43,.4);
 const ventPaint=mat(0x787673,.32,.46),ventFace=mat(0xa7a49d,.41,.44),shade=mat(0x332f2d);
 const black=mat(0x161918,.06,.45),voidMat=mat(0x0c0d0c);
 const brass=mat(0xb4956d,.48,.39),lcdBezel=mat(0x142743,.15,.5);
 const lcdGlass=mat(0x97beba,.16,.36),green=mat(0x67c542,.06,.41),amber=mat(0xdf791c,.16,.38);
 const x=p=>(p/1000-.5)*.483,y=p=>(.5-p/365)*.178;
 const wx=p=>p/1000*.483,hy=p=>p/365*.178;
 function sub(name,parent=group){const n=new THREE.Group();n.name=name;parent.add(n);return n;}
 function mesh(g,m,x=0,y=0,z=0,parent=group,name=''){
  const o=new THREE.Mesh(own(g),m);o.position.set(x,y,z);o.name=name;parent.add(o);return o;
 }
 function round(w,h,r,Type=THREE.Shape,cx=0,cy=0){
  const s=new Type(),L=cx-w/2,B=cy-h/2,R=cx+w/2,T=cy+h/2;
  s.moveTo(L+r,B);s.lineTo(R-r,B);s.quadraticCurveTo(R,B,R,B+r);
  s.lineTo(R,T-r);s.quadraticCurveTo(R,T,R-r,T);s.lineTo(L+r,T);
  s.quadraticCurveTo(L,T,L,T-r);s.lineTo(L,B+r);s.quadraticCurveTo(L,B,L+r,B);
  s.closePath();return s;
 }
 function solid(shape,d,m,x,y,z,p,name,bevel=0){
  return mesh(new THREE.ExtrudeGeometry(shape,{depth:d,curveSegments:6,bevelEnabled:!!bevel,
   bevelSize:bevel,bevelThickness:bevel,bevelSegments:2}),m,x,y,z,p,name);
 }
 const geoBox=(w,h,d,m,x,y,z,p,name)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,p,name);
 function panel(cx,cy,w,h,r,d,m,z,p,name,bevel=0){
  return solid(round(wx(w),hy(h),wx(r)),d,m,x(cx),y(cy),z,p,name,bevel);
 }
 function cylinder(r,d,m,cx,cy,z,p,segments=24){
  const n=mesh(new THREE.CylinderGeometry(r,r,d,segments),m,x(cx),y(cy),z,p);
  n.rotation.x=Math.PI/2;return n;
 }
 const torus=(r,d,m,cx,cy,z,p)=>mesh(new THREE.TorusGeometry(r,d,8,22),m,x(cx),y(cy),z,p);
 const squareSlot=(w,h,r)=>round(w,h,r);

 solid(round(.478,.173,.0025),.611,cover,0,0,-.625,group,'light-gray-enclosure',.002);
 panel(500,182.5,994,358,8,.013,edge,-.014,group,'rolled-front-frame',.001);
 panel(500,187,994,297,2,.0016,seam,-.002,group,'front-inset-perimeter');
 panel(500,186.5,984,292,2,.0013,fascia,-.0006,group,'control-fascia');
 // IEC mounting details are not inferred: only these photo-visible feet.
 for(const cx of [65,915])panel(cx,361,28,8,2,.019,black,-.038);
 const pins=[[62,55],[947,55],[63,318],[949,315],[28,105],[28,272],[557,157],[908,159],[926,270],[975,267]];
 for(const [cx,cy] of pins){
  cylinder(cx===28?.0058:.0032,.0017,steel,cx,cy,.0017,group,16);
  cylinder(cx===28?.0048:.0026,.0019,nickel,cx,cy,.0028,group,16);
  const cut=geoBox(cx===28?.0057:.0032,.0006,.0004,seam,x(cx),y(cy),.0038);
  cut.rotation.z=.41;
 }
 const handles=sub('front-pull-handles');
 for(const [index,cx] of [64,971].entries()){
  const handle=sub(index?'right-front-grip':'left-front-grip',handles);
  for(const cy of [95,283]){
   panel(cx,cy,38,28,4,.020,edge,.0005,handle);
   panel(cx,cy,33,23,4,.006,nickel,.015,handle);
  }
  panel(cx,188,25,218,4,.0064,steel,.015,handle,'upright',.0010);
  panel(cx-5,188,5,208,1,.0006,nickel,.022,handle);
 }
 const sideGrips=sub('photographed-left-recessed-grips');
 for(const [depth,cy] of [[-.17,-.007],[-.46,.002]]){
  const gr=sub('recessed-left-grip',sideGrips);
  gr.rotation.y=-Math.PI/2;gr.position.set(-.239,cy,depth);
  solid(squareSlot(.048,.080,.003),.0011,shade,0,0,0,gr);
  solid(squareSlot(.037,.063,.003),.0010,voidMat,0,0,.0012,gr);
  solid(squareSlot(.027,.009,.002),.0017,steel,0,-.010,.002,gr);
  solid(squareSlot(.032,.003,.001),.0011,edge,0,-.028,.0018,gr);
 }

 panel(310,178,453,193,3,.004,shade,-.001,group,'vent-recess');
 const louvers=sub('left-air-vent-louvers');louvers.position.set(x(310),0,0);
 for(let i=0;i<5;i++){
  const cy=100+i*37,louver=sub('formed-horizontal-louver',louvers);
  // Extrude side cross-section along X; sloped outer skirt is real geometry.
  const profile=new THREE.Shape();
  profile.moveTo(-.001,.006);profile.lineTo(.007,.006);profile.lineTo(.012,-.004);
  profile.lineTo(.011,-.006);profile.lineTo(.001,-.005);profile.closePath();
  const slat=solid(profile,wx(450),ventPaint,-wx(225),y(cy),0,louver);
  slat.rotation.y=-Math.PI/2;
  // The extrusion's side-profile is mirrored when rotated: near lip +Z.
  slat.position.x=wx(225);
  slat.position.z=.0128;
  geoBox(wx(448),.0026,.0010,ventFace,0,y(cy)-.0055,.0022,louver);
  geoBox(wx(448),.0030,.0010,steel,0,y(cy)+.005,.013,louver);
 }

 panel(734,159,315,157,2,.0014,lcdBezel,.0009,group,'touchscreen-bezel');
 panel(734,155,302,114,2,.00075,lcdGlass,.0022,group,'touchscreen-glass');
 const rounds=sub('paired-lower-round-details');
 for(const cx of [488,540]){
  const n=sub('round-detail',rounds);
  cylinder(.0083,.003,black,cx,298,.0017,n);
  torus(.0049,.0014,brass,cx,298,.0037,n);
  cylinder(.0024,.0015,voidMat,cx,298,.0036,n,16);
 }
 const usb=sub('circular-usb-bezel');
 cylinder(.0135,.0028,steel,618,287,.0016,usb);
 cylinder(.0101,.0015,edge,618,287,.0032,usb);
 panel(618,287,32,13,2,.0015,voidMat,.0042,usb);
 panel(617,288,22,4,1,.0008,fascia,.00575,usb);
 cylinder(.002,.0009,shade,667,285,.0016,group,14);
 panel(705,288,39,27,3,.0042,green,.0015,group,'green-square-button',.001);
 const knob=sub('black-rotary-selector');
 cylinder(.0178,.006,shade,785,289,.003,knob);
 cylinder(.0162,.013,black,785,289,.010,knob,40);
 torus(.0151,.0007,shade,785,289,.0170,knob);
 cylinder(.0013,.0007,nickel,802,304,.0178,knob,12);
 const mains=sub('amber-rocker-switch');
 panel(883,287,50,54,2,.0031,black,.001,mains);
 panel(883,287,36,43,5,.0044,amber,.0045,mains,'rocker',.001);
 panel(883,278,29,14,3,.00055,mat(0xf8962b),.0101,mains);

 addPrint();
 let disposed=false;
 return {group,dispose(){if(disposed)return;disposed=true;for(const r of owned)r.dispose();owned.clear();}};

 function addPrint(){
  if(!globalThis.document)return;
  const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=548;
  const c=canvas.getContext('2d');if(!c)return;
  c.scale(1.5,1.5);
  const text=(str,a,b,s,{color='#292c2b',align='left',weight=650}={})=>{
   c.font=`${weight} ${s}px sans-serif`;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.fillText(str,a,b);
  };
  c.strokeStyle='#d27730';c.lineWidth=3;c.beginPath();
  c.moveTo(158,49);c.lineTo(189,49);c.lineTo(189,55);c.lineTo(159,55);c.lineTo(159,61);c.lineTo(210,61);
  c.moveTo(178,66);c.lineTo(213,66);c.lineTo(213,72);c.lineTo(178,72);c.stroke();
  text('SPITZENBERGER',216,54,10,{weight:650});text('SPIES',216,67,10);
  text('4-QUADRANT AMPLIFIER',370,59,9);text('APS 1000',537,57,14);
  text('USB',618,252,8,{align:'center'});text('Output',702,251,8,{align:'center'});text('On/Off',702,261,8,{align:'center'});
  text('Power',882,252,8,{align:'center'});
  const print=own(new THREE.CanvasTexture(canvas));print.colorSpace=THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(.483,.178),own(new THREE.MeshBasicMaterial({map:print,transparent:true,depthWrite:false})),0,0,.011);
  const screen=document.createElement('canvas');screen.width=720;screen.height=300;
  const s=screen.getContext('2d');if(!s)return;
  s.fillStyle='#97beba';s.fillRect(0,0,720,300);
  s.fillStyle='#b0d0cb';s.fillRect(0,0,720,32);s.fillStyle='#335e70';s.fillRect(0,0,145,32);
  s.fillStyle='#264b58';s.font='18px sans-serif';s.fillText('FRONT PANEL PREVIEW',167,23);
  s.strokeStyle='#538587';s.lineWidth=2;
  for(let i=0;i<6;i++){s.strokeRect(26,53+i*35,188,27);s.strokeRect(229,53+i*35,88,27);}
  s.strokeRect(353,64,338,202);s.strokeRect(379,91,286,32);
  s.fillStyle='#2c5865';s.font='28px sans-serif';s.textAlign='center';s.fillText('STATIC DISPLAY',522,181);
  s.font='17px sans-serif';s.fillText('NO LIVE READOUT',522,216);
  const glass=own(new THREE.CanvasTexture(screen));glass.colorSpace=THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(wx(298),hy(110)),own(new THREE.MeshBasicMaterial({map:glass})),x(734),y(155),.00305);
 }
}
