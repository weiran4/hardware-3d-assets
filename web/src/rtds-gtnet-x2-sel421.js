import * as THREE from 'three';

export const SEL_421_PHOTO_URL = 'https://selinc.com/v3/assets/bltea08f3d94a418a1b/bltf84a4dda0c17e0c6/6a440c8abd407541798cb8fa/421_Front.png?content_type=image%2Fpng';

// Original, non-functional enclosure derived from the SEL-421 series horizontal
// 5U front photo. The rear and true enclosure depth are not modeled here.
export function buildSel421Exterior(own = resource => resource) {
 const unit=new THREE.Group();unit.name='sel-421-5u-photo-exterior';
 function group(name,parent=unit){const o=new THREE.Group();o.name=name;parent.add(o);return o;}
 function mat(color,metalness=0,roughness=.72){return own(new THREE.MeshStandardMaterial({color,metalness,roughness}));}
 const caseBlue=mat(0x101f31),navy=mat(0x122a43),blue=mat(0x203f62),key=mat(0x102f4f);
 const aluminum=mat(0xb2b8bb,.35),steel=mat(0xa3a6a8,.35,.48),dark=mat(0x11141a);
 const card=mat(0xf0f0ec),trim=mat(0xc4c9ce),gold=mat(0x71634b,.28,.46);
 const lens=mat(0x88857a,.22,.43),greenLens=mat(0x557955,.08,.46);
 const lcd=mat(0x6a9e27,.03,.48),lcdRim=mat(0x33431f,.11,.65);
 const px=n=>(n-750)*.4826/1500, py=n=>(697-n)*.2215/697;
 function mesh(g,m,x,y,z,p=unit,name=''){
  const o=new THREE.Mesh(own(g),m);o.position.set(x,y,z);o.name=name;p.add(o);return o;
 }
 function rounded(w,h,r,Type=THREE.Shape,x=0,y=0){
  const b=y-h/2,l=x-w/2,t=y+h/2,R=x+w/2,p=new Type();
  p.moveTo(l+r,b);p.lineTo(R-r,b);p.quadraticCurveTo(R,b,R,b+r);
  p.lineTo(R,t-r);p.quadraticCurveTo(R,t,R-r,t);p.lineTo(l+r,t);
  p.quadraticCurveTo(l,t,l,t-r);p.lineTo(l,b+r);p.quadraticCurveTo(l,b,l+r,b);p.closePath();return p;
 }
 function extrusion(s,d,m,x,y,z,p,name){
  return mesh(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:8}),m,x,y,z,p,name);
 }
 function rect(x,y,w,h,r,d,m,z,p=unit,name=''){
  return extrusion(rounded(w*.4826/1500,h*.2215/697,r*.000319),d,m,px(x),py(y),z,p,name);
 }
 function disc(x,y,r,d,m,z,p=unit){
  const o=mesh(new THREE.CylinderGeometry(r,r,d,24),m,px(x),py(y),z,p);o.rotation.x=Math.PI/2;return o;
 }
 const X=w=>w*.4826/1500,Y=h=>h*.2215/697;
 for(const [side,x,slotX] of [['left',23,27],['right',1477,1472]]){
  const ear=rounded(X(46),Y(666),X(12));
  for(const y of [122,576])ear.holes.push(rounded(X(32),Y(22),Y(10),THREE.Path,px(slotX)-px(x),py(y)-py(350)));
  extrusion(ear,.0025,aluminum,px(x),py(350),-.007,unit,side+'-rack-ear');
 }
 rect(750,348.5,1399,697,2,.080,caseBlue,-.105);
 rect(750,348.5,1410,693,5,.006,navy,-.022);
 rect(750,348.5,1405,692,6,.012,navy,-.016);
 const face=rounded(X(1184),Y(500),X(6));
 face.holes.push(rounded(X(234),Y(233),X(3),THREE.Path,px(396)-px(796),py(279)-py(284)));
 extrusion(face,.0045,blue,px(796),py(284),-.004,unit,'blue-control-fascia');
 rect(396,279,232,232,3,.0016,lcdRim,-.0037);
 rect(396,279,215,214,2,.001,lcd,-.0020,unit,'lcd-glass');

 const screws=group('face-fasteners');
 for(const [x,y] of [[89,193],[1409,193],[89,566],[1409,566]]){
  const p=group('phillips-head',screws);
  disc(x,y,.0037,.0015,dark,-.003,p);disc(x,y,.0034,.0015,trim,-.002,p);
  for(const a of [Math.PI/4,3*Math.PI/4]){
   const notch=mesh(new THREE.BoxGeometry(.0041,.00065,.00025),steel,px(x),py(y),-.00113,p);
   notch.rotation.z=a;
  }
 }
 const db9=group('front-db9-exterior');
 rect(140,100,96,16,8,.003,steel,-.004,db9);
 const shell=(w,h,m,z,d)=>{
  const s=new THREE.Shape();s.moveTo(-X(w/2),Y(h/2));s.lineTo(X(w/2),Y(h/2));s.lineTo(X(w*.37),-Y(h/2));s.lineTo(-X(w*.37),-Y(h/2));s.closePath();
  extrusion(s,d,m,px(139),py(100),z,db9);
 };
 shell(56,36,trim,-.001,.003);shell(47,27,dark,.002,.0008);
 const seat=group('socket-recesses',db9);
 for(const [y,n] of [[96,5],[104,4]])for(let i=0;i<n;i++)disc(139+7*(i-(n-1)/2),y,.00063,.0005,gold,.0029,seat);
 for(const x of [99,180])disc(x,100,.0016,.0009,dark,-.0005,db9);

 const nav=group('navigation-cluster');
 for(const [x,y,a] of [[622,198,0],[573,244,Math.PI/2],[669,244,-Math.PI/2],[622,290,Math.PI]]){
  const btn=group('direction-key',nav);
  const outline=rect(x,y,46,46,10,.002,card,.0007,btn);outline.rotation.z=Math.PI/4;
  const cap=rect(x,y,41,41,9,.0016,key,.00275,btn);cap.rotation.z=Math.PI/4;
  const shape=new THREE.Shape();shape.moveTo(-.0034,-.00165);shape.lineTo(.0034,-.00165);shape.lineTo(0,.0027);shape.closePath();
  const icon=extrusion(shape,.00035,card,px(x),py(y),.0046,btn);icon.rotation.z=a;
 }
 const keys=group('menu-keycaps');
 for(const x of [577,666]){
  const p=group('menu-key',keys);
  rect(x,372,46,46,10,.0015,card,.001,p);
  rect(x,372,41,41,8,.0015,key,.0026,p);
 }
 disc(873,116,.0085,.0017,card,.001);disc(873,116,.00776,.0014,key,.00275);
 for(const [y,color] of [[101,greenLens],[127,lens]])disc(728,y,.00145,.0012,color,.0016);
 const targetLenses=group('target-lens-columns');
 for(const x of [728,832]){
  const p=group('target-lens-column',targetLenses);
  rect(x+40,338,97,328,0,.0007,mat(0x2c3954),.0006,p);
  for(let i=0;i<12;i++)disc(x,186+i*26,.0013,.0012,lens,.0017,p);
 }
 const controls=group('local-control-columns');
 for(const x of [956,1100]){
  const p=group('local-control-column',controls);
  for(let i=0;i<6;i++){
   const y=105+i*72;
   const strip=group('pale-card-and-key',p);
   rect(x+69,y,138,55,8,.0016,card,.0006,strip);
   disc(x+26,y,.0082,.0018,card,.0014,strip);
   disc(x+26,y,.0075,.0023,key,.00265,strip);
   disc(x+55,y-18,.0014,.0011,dark,.0026,strip);
  }
 }
 for(const [x,w] of [[817,240],[1054,86],[1200,87]])rect(x,515,w,12,5,.0006,navy,.00055);
 addTypography();
 return unit;

 function addTypography(){
  const canvas=globalThis.document?.createElement('canvas');
  if(!canvas)return;
  canvas.width=1500;canvas.height=697;
  const c=canvas.getContext('2d');if(!c)return;
  const text=(s,x,y,size,{color='#f8f8f0',align='left',weight=600,font='sans-serif'}={})=>{
   c.fillStyle=color;c.font=`${weight} ${size}px ${font}`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);
  };
  const line=(pts,width=2)=>{
   c.beginPath();c.moveTo(...pts[0]);pts.slice(1).forEach(p=>c.lineTo(...p));
   c.strokeStyle='#f8f8f0';c.lineWidth=width;c.stroke();
  };
  const frame=(x,y,w,h,r,width=3)=>{
   c.beginPath();c.roundRect(x,y,w,h,r);c.strokeStyle='#f8f8f0';c.lineWidth=width;c.stroke();
  };
  frame(255,64,995,439,9);line([[711,65],[711,503]],3);line([[931,65],[931,503]],3);line([[711,169],[931,169]],3);
  line([[443,111],[697,111]],1.5);frame(273,92,58,33,5,3);text('SEL',302,109,25,{align:'center',weight:750});
  ['SCHWEITZER','ENGINEERING','LABORATORIES'].forEach((s,i)=>text(s,338,96+i*12,10));
  text('SEL-421',697,101,26,{align:'right'});text('PROTECTION AUTOMATION CONTROL',697,122,12,{align:'right'});
  text('PORT F',210,100,8);text('ENABLED',740,101,11);text('TRIP',740,128,11);
  for(const [s,y] of [['TARGET',111],['RESET',122]])text(s,873,y,9,{align:'center'});
  text('ESC',577,372,14,{align:'center'});text('↵',666,363,22,{align:'center'});text('ENT',666,380,13,{align:'center'});
  const left=['INST','TIME','COMM','SOTF','ZONE 1','ZONE 2','ZONE 3','ZONE 4','PHASE A','PHASE B','PHASE C','GROUND'];
  const right=['50','51','79 RESET','79 LOCKOUT','79 CYCLE','25 SYNCH','BKR CLOSE','BKR FAIL','OSB','LOP','PMCU OK','IRIG LOCK'];
  for(const [arr,x] of [[left,740],[right,845]])arr.forEach((s,i)=>text(s,x,186+i*26,11));
  for(const [x,y] of [[737,277],[840,225],[737,382],[840,355]])line([[x,y],[x+76,y]],1.25);
  const leftKeys=[['SPT','ENABLED'],['COMM','SCHEME','ENABLED'],['ALT','SETTINGS'],['RELAY','TEST','MODE'],['MANUAL','CLOSE','ENABLED'],['RECLOSE','ENABLED']];
  const rightKeys=[['AUX 1'],['AUX 2'],['AUX 3'],['AUX 4'],['BREAKER','CLOSED'],['BREAKER','OPEN']];
  for(const [arr,x] of [[leftKeys,1024],[rightKeys,1168]])arr.forEach((lines,i)=>lines.forEach((s,j)=>text(s,x,89+i*72+j*16,13,{color:'#152847'})));
  const print=own(new THREE.CanvasTexture(canvas));print.colorSpace=THREE.SRGBColorSpace;
  // Screen glyphs are drawn separately on the glass so they remain physically recessed.
  mesh(new THREE.PlaneGeometry(.4826,.2215),own(new THREE.MeshBasicMaterial({map:print,transparent:true,depthWrite:false})),0,.11075,.0054);
  const screen=document.createElement('canvas');screen.width=640;screen.height=640;
  const sc=screen.getContext('2d');if(!sc)return;
  sc.fillStyle='#2c481a';sc.strokeStyle='#2c481a';sc.font='45px monospace';sc.fillText('SEL-421',28,64);
  sc.lineWidth=4;sc.strokeRect(24,90,592,515);sc.strokeRect(592,95,20,504);sc.fillRect(592,275,20,156);
  sc.font='31px monospace';sc.fillText('MODEL PREVIEW',32,125);sc.font='40px monospace';sc.fillText('STATIC',107,300);
  sc.font='30px monospace';sc.fillText('NO LIVE MEASUREMENTS',92,360);sc.fillText('ILLUSTRATIVE EXTERIOR',32,590);
  const glassPrint=own(new THREE.CanvasTexture(screen));glassPrint.colorSpace=THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(X(215),Y(214)),own(new THREE.MeshBasicMaterial({map:glassPrint,transparent:true,depthWrite:false})),px(396),py(279),-.0009);
 }
}
