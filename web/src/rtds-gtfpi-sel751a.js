import * as THREE from 'three';

export const sel751aSource='https://selinc.com/products/751a/';
const rounding=(x,y,w,h,r,Type=THREE.Shape)=>{
 const s=new Type(),l=x-w/2,b=y-h/2;
 s.moveTo(l+r,b);s.lineTo(l+w-r,b);s.quadraticCurveTo(l+w,b,l+w,b+r);
 s.lineTo(l+w,b+h-r);s.quadraticCurveTo(l+w,b+h,l+w-r,b+h);
 s.lineTo(l+r,b+h);s.quadraticCurveTo(l,b+h,l,b+h-r);
 s.lineTo(l,b+r);s.quadraticCurveTo(l,b,l+r,b);return s;
};

// The front is drawn in photo coordinates (face ratio 144:192). Nominal
// enclosure depth is from the SEL datasheet; side and rear are left blank.
export function createSel751aExterior({mesh,mat,materials,textures}){
 const g=new THREE.Group();g.name='sel-751a-photo-exterior';
 const navy=mat(0x1a2b55),face=mat(0x293c69),caseMat=mat(0x252c37),rim=mat(0x142242);
 const white=mat(0xe5eee9),insert=mat(0x25375f),ledOff=mat(0x6d7c7e),ledOn=mat(0x8fc635),silver=mat(0xa3a9af),bore=mat(0x121316);
 function group(name,parent=g){const n=new THREE.Group();n.name=name;parent.add(n);return n;}
 function slab(x,y,w,h,r,z,d,m,parent=g,hole=null){
  const shape=rounding(x,y,w,h,r);if(hole)shape.holes.push(rounding(...hole,THREE.Path));
  const n=mesh(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:5}),m,parent);n.position.z=z;return n;
 }
 function disc(x,y,r,z,d,m,parent=g){
  const n=mesh(new THREE.CylinderGeometry(r,r,d,16),m,parent);n.rotation.x=Math.PI/2;n.position.set(x,y,z);return n;
 }
 // Front at z=0. A true opening exposes the inset LCD and its shadow rim.
 slab(0,0,.708,.935,.021,-.742,.707,caseMat);
 slab(0,0,.75,1,.029,-.04,.026,navy);
 const lcd=[0,.34,.526,.122,.006];
 slab(0,0,.728,.977,.024,-.015,.015,face,g,lcd);
 slab(0,.34,.525,.121,.006,-.014,.009,mat(0x557526)).name='recessed-lcd-glass';
 slab(0,.34,.506,.104,.004,-.005,.001,mat(0x78b233));
 const keys=group('navigation-keys');
 for(const [x,y,w,h] of [[-.230,.16,.076,.076],[-.125,.16,.076,.076],[-.036,.16,.065,.068],[.055,.207,.07,.067],[.055,.115,.07,.067],[.147,.16,.065,.068],[.232,.16,.076,.076]]){
  const n=group('key',keys);slab(0,0,w,h,.016,.001,.004,white,n);slab(0,0,w-.004,h-.004,.014,.005,.003,navy,n);
  n.position.set(x,y,0);if(w<.075)n.rotation.z=Math.PI/4;
 }
 slab(-.14,-.141,.277,.369,.006,.0003,.0017,insert);
 const left=group('left-indicators');
 for(let i=0;i<8;i++)disc(-.30,.031-i*.048,.008,.005,.006,i?ledOff:ledOn,left);
 const controls=group('right-control-strips');
 for(let i=0;i<4;i++){
  const y=.009-i*.096,n=group('command-strip',controls);
  slab(.221,y,.214,.075,.009,.001,.003,white,n);disc(.141,y,.037,.003,.006,white,n);
  disc(.141,y,.033,.007,.006,navy,n);
  for(const dy of [-.024,.024])disc(.19,y+dy,.007,.006,.004,ledOff,n);
 }
 for(const [x,w] of [[-.14,.277],[.264,.127]])slab(x,-.339,w,.019,.004,.001,.004,rim);
 const port=group('port-f-serial-only');
 slab(-.234,-.423,.168,.034,.015,.003,.014,silver,port);
 slab(-.234,-.423,.102,.057,.015,.002,.016,silver,port);
 const socket=new THREE.Shape();socket.moveTo(-.273,-.408);socket.lineTo(-.195,-.408);socket.lineTo(-.201,-.441);socket.lineTo(-.267,-.441);socket.closePath();
 mesh(new THREE.ExtrudeGeometry(socket,{depth:.004,bevelEnabled:false}),bore,port).position.z=.017;
 const holes=group('port-f-serial-socket-holes',port);
 for(const [row,count] of [[0,5],[1,4]])for(let i=0;i<count;i++)disc(-.234+(i-(count-1)/2)*.014,-.416-row*.014,.0046,.023,.005,caseMat,holes);
 for(const x of [-.301,-.167])disc(x,-.423,.007,.018,.005,bore,port);

 const canvas=globalThis.document?.createElement('canvas');
 if(canvas){
  canvas.width=900;canvas.height=1200;
  const ctx=canvas.getContext('2d');
  if(ctx){
   const px=x=>(x/.75+.5)*900,py=y=>(.5-y)*1200;
   const ink=(content,x,y,size,{align='left',color='#eff4ff',weight=600,font='sans-serif'}={})=>{
    ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${font}`;ctx.textBaseline='middle';ctx.textAlign=align;ctx.fillText(content,px(x),py(y));
   };
   ink('SEL',-.328,.444,46);ink('SCHWEITZER',-.217,.458,16);ink('ENGINEERING',-.217,.437,16);ink('LABORATORIES',-.217,.417,16);
   ink('SEL-751A',.322,.455,42,{align:'right'});ink('FEEDER PROTECTION RELAY',.322,.419,23,{align:'right'});
   ctx.strokeStyle='#f0f5ff';ctx.lineWidth=3;ctx.strokeRect(px(-.328)-8,py(.473),112,57);
   ctx.fillStyle='#f0f5ff';ctx.fillRect(px(-.05),py(.436),447,2);
   for(const [str,y] of [['SEL-751A',.362],['FEEDER RELAY',.315]])ink(str,-.241,y,50,{color:'#243a12',font:'monospace'});
   for(const [str,x,y,size]of [['TARGET',-.230,.17,15],['RESET',-.230,.148,15],['ESC',-.125,.16,27],['↵',.232,.171,24],['ENT',.232,.143,22]])ink(str,x,y,size,{align:'center'});
   for(const [x,y,angle] of [[-.036,.16,-Math.PI/2],[.055,.207,0],[.055,.115,Math.PI],[.147,.16,Math.PI/2]]){
    ctx.save();ctx.translate(px(x),py(y));ctx.rotate(angle);ctx.fillStyle='#fff';
    ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(13,9);ctx.lineTo(-13,9);ctx.closePath();ctx.fill();ctx.restore();
   }
   ['ENABLED','TRIP','INSTANTANEOUS','PHASE OVERCURRENT','GND/NEUTRAL OVERCURRENT','NEG. SEQ. OVERCURRENT','OVER/UNDER FREQUENCY','BREAKER FAILURE'].forEach((str,i)=>ink(str,-.271,.031-i*.048,17));
   [['AUX 1','RECL RESET','RECL LOCKOUT'],['LOCK','ENABLED','DISABLED'],['CLOSE','BLOCK CLOSE','BREAKER CLOSED'],['TRIP','','BREAKER OPEN']].forEach(([name,high,low],i)=>{
    const y=.009-i*.096,style={color:'#304676'};
    ink(name,.213,y,36,style);ink(high,.213,y+.025,13,style);ink(low,.213,y-.024,13,style);
   });
   ink('PORT F',-.234,-.466,17,{align:'center'});
   const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;textures.add(tex);
   const print=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false});materials.add(print);
   mesh(new THREE.PlaneGeometry(.75,1),print,g).position.z=.012;
  }
 }
 return g;
}
