import * as THREE from 'three';

export const SEL_2407_PHOTO_URL = 'https://selinc.com/v3/assets/bltea08f3d94a418a1b/bltda2bddc41f85bb6e/67fd924b57f5c84ab357ae7e/2407-Front.png?content_type=image%2Fpng';
export const SEL_2407_TOP_URL = 'https://selinc.com/api/download/2909/#page=1';

// Original geometry, proportions from the manufacturer front and front/top
// photos. Units are normalized to face height, not installation dimensions.
// Nothing in this specimen is used as an electrical anchor.
export function createSel2407Exterior(own = resource => resource) {
 const unit=new THREE.Group();
 unit.name='sel-2407-photo-exterior';
 function group(name){const o=new THREE.Group();o.name=name;unit.add(o);return o;}
 const mat=(color,metalness=0,roughness=.64)=>own(new THREE.MeshStandardMaterial({color,metalness,roughness}));
 const plain=color=>own(new THREE.MeshBasicMaterial({color}));
 const navy=mat(0x07365c),edge=mat(0x184769),lid=mat(0xc7cbce,.16),aluminum=mat(0xc4ccce,.14);
 const fastener=mat(0xb8b8b0,.42,.37),slot=mat(0x3b4247,.2),recess=mat(0x1e181f),window=mat(0x131117);
 const ledOff=mat(0x25312d),red=plain(0xf9191d),dimRed=plain(0x250c13);
 function mesh(geometry,material,x=0,y=0,z=0,parent=unit,name=''){
  const o=new THREE.Mesh(own(geometry),material);o.position.set(x,y,z);o.name=name;parent.add(o);return o;
 }
 function round(w,h,r,Like=THREE.Shape,x=0,y=0){
  const l=x-w/2,b=y-h/2,R=x+w/2,t=y+h/2,s=new Like();
  s.moveTo(l+r,b);s.lineTo(R-r,b);s.quadraticCurveTo(R,b,R,b+r);
  s.lineTo(R,t-r);s.quadraticCurveTo(R,t,R-r,t);s.lineTo(l+r,t);
  s.quadraticCurveTo(l,t,l,t-r);s.lineTo(l,b+r);s.quadraticCurveTo(l,b,l+r,b);s.closePath();return s;
 }
 const extrude=(shape,depth,m,x,y,z,p,e)=>mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:8}),m,x,y,z,p,e);
 const box=(w,h,d,m,x,y,z,p,e)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,p,e);
 const disc=(r,d,m,x,y,z,p)=>{const o=mesh(new THREE.CylinderGeometry(r,r,d,24),m,x,y,z,p);o.rotation.x=Math.PI/2;return o;};

 box(4.96,.96,1.76,lid,0,.508,-.936,unit,'folded-light-metal-lid');
 for(const x of [-2.43,2.43])box(.035,.045,1.76,edge,x,.979,-.936);
 // Only features observable from the corroborating front/top photo.
 for(const x of [-2.10,2.10])for(const z of [-.25,-1.55]){
  mesh(new THREE.CylinderGeometry(.035,.035,.008,16),fastener,x,.992,z);
  box(.035,.005,.009,slot,x,.998,z);
 }
 for(const [side,x] of [['left',-2.765],['right',2.765]]){
  const ear=round(.44,.98,.067);
  for(const y of [-.355,.355])ear.holes.push(round(.213,.151,.075,THREE.Path,0,y));
  extrude(ear,.038,aluminum,x,.5,-.065,unit,side+'-slotted-ear');
  box(.045,.92,.095,aluminum,x-Math.sign(x)*.18,.5,-.105);
 }
 const face=round(5.10,1,.035);
 face.holes.push(round(2.91,.366,.027,THREE.Path,.42,.458-.5));
 extrude(face,.052,navy,0,.5,-.053,unit,'navy-front-face');
 extrude(round(2.91,.366,.027),.009,recess,.42,.458,-.049);
 extrude(round(2.87,.329,.022),.007,window,.42,.458,-.039);

 const screws=group('front-fasteners');
 for(const x of [-2.315,2.315])for(const y of [.178,.812]){
  const o=new THREE.Group();o.position.set(x,y,0);screws.add(o);
  disc(.098,.014,slot,0,0,.003,o);disc(.089,.028,fastener,0,0,.021,o);
  const notch=box(.128,.021,.004,slot,0,0,.037,o);notch.rotation.z=.58+(x+y)*.14;
 }
 const status=group('front-status-lenses');
 for(const y of [.77,.59,.41]){
  const o=new THREE.Group();status.add(o);
  disc(.034,.006,recess,-2.045,y,.003,o);disc(.025,.007,ledOff,-2.045,y,.008,o);
 }

 const display=group('static-seven-segment-display');
 // Static illustrative time-like pattern. All three status lenses remain off;
 // no state or simulator clock is connected to this display.
 const activeSegments={0:[0,1,2,3,4,5],1:[1,2],2:[0,1,6,4,3]};
 const segmentWidth=.185, segmentHeight=.029;
 const segments=[[0,.12,0],[.093,.066,1],[.093,-.066,1],[0,-.12,0],[-.093,-.066,1],[-.093,.066,1],[0,0,0]];
 const segment=new THREE.Shape();
 segment.moveTo(-segmentWidth/2,0);segment.lineTo(-segmentWidth/2+.017,-segmentHeight/2);
 segment.lineTo(segmentWidth/2-.017,-segmentHeight/2);segment.lineTo(segmentWidth/2,0);
 segment.lineTo(segmentWidth/2-.017,segmentHeight/2);segment.lineTo(-segmentWidth/2+.017,segmentHeight/2);segment.closePath();
 const segmentGeo=new THREE.ShapeGeometry(segment);
 let x=-.89;
 for(const char of '001:12:00:00'){
  if(char===':'){
   for(const dy of [-.063,.063])disc(.023,.002,red,x-.049,.458+dy,-.024,display);
   x+=.130;continue;
  }
  const digit=new THREE.Group();digit.name='static-digit';digit.position.set(x,.458,-.024);display.add(digit);
  segments.forEach(([sx,sy,vertical],i)=>{
   const o=mesh(segmentGeo,activeSegments[char].includes(i)?red:dimRed,sx+sy*.16,sy,0,digit);
   if(vertical){o.rotation.z=Math.PI/2-.16;o.scale.x=.59;}
  });
  x+=.270;
 }

 const canvas=globalThis.document?.createElement('canvas');
 if(canvas){
  canvas.width=1536;canvas.height=300;
  const c=canvas.getContext('2d');
  if(c){
   c.strokeStyle='#f3f6f7';c.lineWidth=3.2;c.beginPath();c.roundRect(121,33,237,190,10);c.stroke();
   c.lineWidth=5;c.beginPath();c.roundRect(461,22,123,68,9);c.stroke();
   const ink=(value,x,y,size,weight=500,align='left')=>{
    c.font=`${weight} ${size}px sans-serif`;c.fillStyle='#f3f6f7';c.textAlign=align;c.textBaseline='middle';c.fillText(value,x,y);
   };
   ink('SEL',523,57,47,750,'center');
   ink('SCHWEITZER',597,29,20);ink('ENGINEERING',597,50,20);ink('LABORATORIES',597,71,20);
   ink('SEL-2407',1331,42,42,650,'right');ink('SATELLITE SYNCHRONIZED CLOCK',1331,79,21,550,'right');
   ink('ENABLED',179,69,22);ink('SATELLITE',181,117,22);ink('LOCK',181,144,22);ink('HOLDOVER',181,176,22);
   const tex=own(new THREE.CanvasTexture(canvas));tex.colorSpace=THREE.SRGBColorSpace;
   mesh(new THREE.PlaneGeometry(5.1,1),own(new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false})),0,.5,.001);
  }
 }
 return unit;
}
