import * as THREE from 'three';

export const DP832_PHOTO_URL='https://commons.wikimedia.org/wiki/File:Rigol_DP832_Power_Supply_Teardown_SAM_9875_(9604552327).jpg';
export const DP832_GUIDE_URL='https://www.rigol.com/dam/global/downloads/brochures/en/user-manual/dc-powers/DP800_UserGuide_EN.pdf#page=22';

// Complete exterior, not the removed panels in the credited teardown photo.
// Front details are independent of the GTDO lesson electrical model. The back is unmarked.
export function createDp832Exterior(){
 const group=new THREE.Group(),resources=new Set();group.name='rigol-dp832-photo-exterior';
 const own=r=>{resources.add(r);return r;};
 const mat=(color,metalness=0,roughness=.62)=>own(new THREE.MeshStandardMaterial({color,metalness,roughness}));
 const caseGray=mat(0xa4a6a3,.21),pale=mat(0xd8d3c2,.08),panel=mat(0xe2ddcd,.07),trim=mat(0xb0ad9f,.17);
 const rubber=mat(0x3d403e),bumperEdge=mat(0x555953),dark=mat(0x323a3e,.04);
 const glass=mat(0x192629,.20,.31),shade=mat(0x101819,.05),keys=mat(0xe2ddce),graphite=mat(0x5e6261);
 const red=mat(0xbf2926,.07,.45),black=mat(0x202125),green=mat(0x258954,.06,.45),metal=mat(0xaea99b,.40);
 const x=p=>(p-520)*.239/764;
 // Manual artwork coordinates in the front panel crop (Y normalized separately below).
 const Y=p=>(388-p)*.157/496;
 const W=p=>p*.239/764,H=p=>p*.157/496;
 function sub(name,p=group){const o=new THREE.Group();o.name=name;p.add(o);return o;}
 function mesh(g,m,x=0,y=0,z=0,p=group,n=''){const o=new THREE.Mesh(own(g),m);o.position.set(x,y,z);o.name=n;p.add(o);return o;}
 function round(w,h,r){const L=-w/2,R=w/2,B=-h/2,T=h/2,s=new THREE.Shape();s.moveTo(L+r,B);s.lineTo(R-r,B);s.quadraticCurveTo(R,B,R,B+r);s.lineTo(R,T-r);s.quadraticCurveTo(R,T,R-r,T);s.lineTo(L+r,T);s.quadraticCurveTo(L,T,L,T-r);s.lineTo(L,B+r);s.quadraticCurveTo(L,B,L+r,B);s.closePath();return s;}
 function slab(w,h,r,d,m,x,y,z,p=group,name='',b=0){
  return mesh(new THREE.ExtrudeGeometry(round(w,h,r),{depth:d,curveSegments:6,bevelEnabled:!!b,bevelSize:b,bevelThickness:b,bevelSegments:2}),m,x,y,z,p,name);
 }
 const rect=(cx,cy,w,h,r,d,m,z,p,n,b)=>slab(W(w),H(h),W(r),d,m,x(cx),Y(cy),z,p,n,b);
 const box=(w,h,d,m,x,y,z,p,n)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,p,n);
 const disc=(r,d,m,cx,cy,z,p,n,s=28)=>{
  const o=mesh(new THREE.CylinderGeometry(r,r,d,s),m,x(cx),Y(cy),z,p,n);
  o.rotation.x=Math.PI/2;return o;
 };
 slab(.207,.124,.005,.373,caseGray,0,0,-.396,group,'closed-chassis',.0015);
 slab(.216,.132,.007,.024,pale,0,0,-.024,group,'light-front-fascia',.0015);
 slab(.207,.125,.005,.0012,panel,0,0,.0002,group,'control-face');
 const bumpers=sub('four-corner-rubber-guards');
 for(const ax of [-1,1])for(const ay of [-1,1]){
  const o=sub('curved-corner-bumper',bumpers);
  o.position.set(ax*.105,ay*.057,0);o.scale.set(ax,ay,1);
  const s=new THREE.Shape();
  s.moveTo(-.056,.008);s.quadraticCurveTo(-.041,.012,-.035,.020);
  s.lineTo(.001,.020);s.quadraticCurveTo(.014,.019,.014,.005);
  s.lineTo(.014,-.022);s.quadraticCurveTo(.014,-.029,.006,-.032);
  s.lineTo(-.001,-.033);s.lineTo(-.002,.000);s.closePath();
  const extrude=(material,sz,z)=>mesh(new THREE.ExtrudeGeometry(s,{depth:sz,bevelEnabled:true,bevelSegments:2,
   bevelSize:.0009,bevelThickness:.0012,curveSegments:7}),material,0,0,z,o);
  extrude(rubber,.044,-.051);
  const lip=extrude(bumperEdge,.003,-.009);lip.scale.set(.97,.96,1);
 }
 // The ribbed corners blend into the assembled center-edge protection.
 for(const direction of [-1,1]){
  const edge=new THREE.Shape();
  edge.moveTo(-.079,.004);edge.quadraticCurveTo(-.047,-.004,-.024,-.004);edge.lineTo(.024,-.004);
  edge.quadraticCurveTo(.046,-.004,.079,.004);edge.lineTo(.079,.011);
  edge.quadraticCurveTo(.044,.003,.024,.003);edge.lineTo(-.024,.003);
  edge.quadraticCurveTo(-.044,.003,-.079,.011);edge.closePath();
  const p=mesh(new THREE.ExtrudeGeometry(edge,{depth:.009,bevelEnabled:true,bevelSize:.0006,bevelThickness:.0005,bevelSegments:2,curveSegments:5}),rubber,0,direction*.065,-.011,bumpers);
  p.scale.y=direction;
 }
 // Visible side construction follows the OEM side elevation, not the bare teardown.
 const side=sub('right-side-carry-handle-and-vent-banks');
 for(const y of [-.035,.035]){
  const bank=sub('staggered-vent-bank',side);
  const holes=own(new THREE.CircleGeometry(.0015,10));
  const inset=new THREE.InstancedMesh(holes,graphite,13*6);bank.add(inset);
  const mark=new THREE.Object3D();mark.rotation.y=Math.PI/2;
  for(let row=0;row<6;row++)for(let col=0;col<13;col++){
   mark.position.set(.105,y+(row-2.5)*.0047,-.070-col*.010-(row%2)*.005);
   mark.updateMatrix();inset.setMatrixAt(row*13+col,mark.matrix);
  }
  inset.instanceMatrix.needsUpdate=true;
 }
 box(.004,.017,.244,graphite,.106,0,-.206,side);
 box(.006,.013,.207,rubber,.109,0,-.206,side);
 for(const z of [-.083,-.327])box(.008,.024,.029,bumperEdge,.107,0,z,side);
 for(const x of [-.097,.097])for(const y of [-.057,.057]){
  slab(.031,.037,.006,.037,rubber,x,y,-.410);
  for(const z of [-.403,-.396,-.389])slab(.035,.040,.006,.0028,bumperEdge,x,y,z);
 }
 for(const x of [-.076,.076])for(const z of [-.385,-.062])
  slab(.025,.010,.003,.022,rubber,x,-.071,z);
 rect(330,352,252,232,9,.003,trim,.001,group,'display-recess');
 rect(331,335,230,173,5,.002,dark,.004,group,'unlit-lcd-frame');
 rect(332,335,216,158,3,.0009,glass,.0062,group,'static-lcd-glass');
 const soft=sub('five-screen-soft-keys');
 for(const cx of [241,285,331,375,420])rect(cx,455,37,16,3,.003,graphite,.004,soft);
 const channels=sub('three-channel-controls');
 for(const cx of [481,519,556]){
  rect(cx,275,29,34,4,.002,graphite,.0016,channels);
  rect(cx,275,23,27,3,.002,keys,.0038,channels);
  rect(cx,328,28,30,4,.002,graphite,.0016,channels);
  rect(cx,328,22,24,3,.002,keys,.0038,channels);
 }
 const square=sub('right-function-keys');
 for(const [cx,cy,w,h]of [[651,275,47,34],[802,275,44,34],[660,441,31,28],[795,441,31,28],
  ...[510,550,601].flatMap(cx=>[[cx,410,33,25],[cx,454,33,25]])]){
  rect(cx,cy,w,h,3,.0014,graphite,.002,square);
  rect(cx,cy,w-6,h-6,3,.002,keys,.0038,square);
 }
 const dial=sub('large-rotary-encoder');
 const xc=727,yc=361;
 disc(.0249,.003,trim,xc,yc,.003,dial);
 disc(.0136,.004,graphite,xc,yc,.0055,dial);
 for(let n=0;n<10;n++){
  const a=(n/10)*Math.PI*2;
  const o=rect(xc+Math.sin(a)*63,yc-Math.cos(a)*63,30,24,3,.0028,graphite,.005,dial);
  o.rotation.z=-a;
 }
 for(const [dx,dy]of [[-97,0],[97,0],[0,-95],[0,95]])rect(xc+dx,yc+dy,26,27,4,.0032,dark,.005,dial);
 const knob=disc(.0117,.014,keys,xc,yc,.013,dial,'knurled-encoder',40);
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8,p=box(.00135,.00165,.0077,trim,knob.position.x+Math.cos(a)*.0118,knob.position.y+Math.sin(a)*.0118,.014,dial);
  p.rotation.z=a;
 }
 const power=sub('front-power-rocker');
 rect(262,535,45,64,3,.002,graphite,.0018,power);
 rect(262,535,33,49,2,.003,keys,.004,power);
 const posts=sub('seven-binding-posts');
 for(const [i,cx]of [369,429,490,550,611,672,732].entries()){
  const n=sub('visual-binding-post',posts),color=[red,black,green,red,black,red,black][i];
  disc(.0072,.0032,trim,cx,541,.003,n);
  // Annular front rim with a dark recessed center, not a wire target.
  disc(.0060,.0155,keys,cx,541,.011,n);
  mesh(new THREE.TorusGeometry(.0046,.00125,10,24),color,x(cx),Y(541),.019,n);
  disc(.0037,.0018,shade,cx,541,.0178,n);
  for(let j=0;j<14;j++){
   const a=j*Math.PI/7,g=box(.00042,.00050,.011,trim,x(cx)+Math.cos(a)*.00590,Y(541)+Math.sin(a)*.00590,.0113,n);
   g.rotation.z=a;
  }
 }
 addPrint();
 let disposed=false;
 return {group,dispose(){if(disposed)return;disposed=true;for(const r of resources)r.dispose();resources.clear();}};

 function addPrint(){
  const canvas=globalThis.document?.createElement('canvas');if(!canvas)return;
  canvas.width=1528;canvas.height=992;
  const c=canvas.getContext('2d');if(!c)return;
  c.scale(2,2);c.translate(-138,-140);
  const t=(s,a,b,n,color='#2d3636',weight=650)=>{
   c.font=`${weight} ${n}px sans-serif`;c.fillStyle=color;c.textBaseline='middle';c.textAlign='center';c.fillText(s,a,b);
  };
  t('RIGOL',419,202,25,'#173968',800);t('DP832',528,199,17);
  t('Programmable DC Power Supply',570,214,8);
  t('PRESET',802,275,8);t('ALL',650,273,10);t('OK',796,440,10);t('BACK',661,440,8);
  for(const [i,cx]of [481,519,556].entries()){t('ON / OFF',cx,275,6);t(String(i+1),cx,328,15);}
  for(const [i,cx]of [510,550,601].entries()){t(['DISPLAY','STORE','UTILITY'][i],cx,410,6);t(['MENU','TIMER','HELP'][i],cx,454,6);}
  for(let i=0;i<10;i++){const a=i*Math.PI*2/10;t(String(i),(727+Math.sin(a)*63),(361-Math.cos(a)*63),11,'#ece9dd');}
  t('I',262,527,10);t('O',262,546,10);
  const tex=own(new THREE.CanvasTexture(canvas));tex.colorSpace=THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(.239,.157),own(new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false})),0,0,.022);
 }
}
