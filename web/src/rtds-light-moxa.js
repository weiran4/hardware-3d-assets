import * as THREE from 'three';

export const moxaReference=Object.freeze({
 model:'Moxa EDS-205A',
 photo:'https://moxa.com/en/getattachment/Products/INDUSTRIAL-NETWORK-INFRASTRUCTURE/Ethernet-Switches/Unmanaged-Switches/EDS-205A-Series/EDS-205A/moxa-eds-205a-image.jpg',
 used:'https://cdn11.bigcommerce.com/s-1ygf19te2/images/stencil/1280x1280/products/74385/328634/y19h016-5__31801.1716382979.jpg?c=2%3Fimbypass%3Don',
 document:'https://moxa.com/getmedia/0f707f3f-3b4f-4c58-a772-6f1424bd5cb2/moxa-eds-205a-series-datasheet-v3.0.pdf#page=4'
});

// Current teal 4+1 face. Original geometry, metres; not a mating or powered model.
export function buildMoxaExterior(){
 const group=new THREE.Group(),owned=new Set();group.name='moxa-eds-205a';
 const keep=r=>(owned.add(r),r);
 const mat=(color,metalness=0,roughness=.65)=>keep(new THREE.MeshStandardMaterial({color,metalness,roughness}));
 const aluminum=mat(0xa9b5b8,.36,.51),edge=mat(0xd9e0de,.28),dark=mat(0x1e2729),teal=mat(0x139c95),steel=mat(0xc4cac1,.4),cavity=mat(0x080d0e),plastic=mat(0x151c1e),brass=mat(0xaa8955,.48),green=mat(0x4e8c64),greenDark=mat(0x2b5540),blue=mat(0x2764ae),light=mat(0xc2d2cf),lens=mat(0x435152,0,.48);
 function mesh(name,geometry,material,x,y,z){const obj=new THREE.Mesh(keep(geometry),material);obj.name=name;obj.position.set(x,y,z);group.add(obj);return obj;}
 const box=(name,x,y,z,w,h,d,m)=>mesh(name,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 function faceShape(w,h,r=.001){
  const s=new THREE.Shape(),x=w/2,y=h/2;
  s.moveTo(-x+r,-y);s.lineTo(x-r,-y);s.quadraticCurveTo(x,-y,x,-y+r);s.lineTo(x,y-r);s.quadraticCurveTo(x,y,x-r,y);s.lineTo(-x+r,y);s.quadraticCurveTo(-x,y,-x,y-r);s.lineTo(-x,-y+r);s.quadraticCurveTo(-x,-y,-x+r,-y);return s;
 }
 const sheet=(name,s,x,y,z,d,m)=>mesh(name,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:3}),m,x,y,z);
 function ring(name,x,y,z,r,d,m){const a=mesh(name,new THREE.CylinderGeometry(r,r,d,16),m,x,y,z);a.rotation.x=Math.PI/2;return a;}
 function mark(str,x,y,z,w,h,color='#e8f3f1',side=false){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=160;canvas.height=Math.max(24,Math.round(160*h/w));const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold '+Math.round(canvas.height*.82)+'px sans-serif';ctx.fillText(str,80,canvas.height/2,156);
  const tex=keep(new THREE.CanvasTexture(canvas));tex.colorSpace=THREE.SRGBColorSpace;
  const m=keep(new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
  const p=mesh('face-mark-'+str,new THREE.PlaneGeometry(w,h),m,x,y,z);if(side)p.rotation.y=-Math.PI/2;
 }
 // Bulk metal ends before the socket faces: real openings enter a dark front recess.
 const body=new THREE.Group();body.name='housing';group.add(body);
 for(const o of [
  box('folded-body',0,0,-.003,.030,.115,.064,aluminum),
  box('left-front-fold',-.01435,0,.032,.0013,.115,.006,edge),
  box('right-front-fold',.01435,0,.032,.0013,.115,.006,edge),
  box('upper-front-fold',0,.0565,.032,.0287,.002,.006,edge),
  box('lower-front-fold',0,-.0565,.032,.0287,.002,.006,edge)
 ])body.attach(o);
 box('socket-well-back',0,0,.02925,.0275,.111,.0005,cavity);
 const ys=[.0319,.0174,.0029,-.0116,-.0325],px=-.00235;
 function rectangularHole(s,x,y,w,h){
  const p=new THREE.Path();p.moveTo(x-w/2,y-h/2);p.lineTo(x-w/2,y+h/2);p.lineTo(x+w/2,y+h/2);p.lineTo(x+w/2,y-h/2);p.closePath();s.holes.push(p);
 }
 const fascia=faceShape(.0252,.1102,.0018);
 rectangularHole(fascia,px,.01015,.015,.0608);rectangularHole(fascia,px,ys[4],.015,.0151);
 sheet('charcoal-rounded-face',fascia,0,0,.03365,.00035,dark);
 const stripe=new THREE.Shape();
 stripe.moveTo(-.01255,.0412);stripe.lineTo(.0056,.0412);stripe.lineTo(.0056,-.0550);stripe.lineTo(-.01075,-.0550);stripe.quadraticCurveTo(-.01255,-.0550,-.01255,-.0532);stripe.closePath();
 rectangularHole(stripe,px,.01015,.015,.0608);rectangularHole(stripe,px,ys[4],.015,.0151);
 sheet('teal-main-panel-and-footer',stripe,0,0,.03405,.00012,teal);
 const badge=new THREE.Shape();badge.moveTo(-.0116,.0537);badge.lineTo(.0046,.0537);badge.lineTo(.0046,.0491);badge.lineTo(.00245,.0471);badge.lineTo(-.0116,.0471);badge.closePath();
 sheet('teal-logo-plaque',badge,0,0,.03415,.00014,teal);
 mark('MOXA',-.0034,.05055,.03435,.015,.0031);
 mark('EDS-205A',-.00355,-.0511,.03433,.0148,.0027);
 // Repeating notched opening at viewer-right, within steel shields and no exposed connectors/wires.
 function socketKey(s){
  const p=new THREE.Path(),x=-.00125;
  p.moveTo(x-.0043,-.0056);p.lineTo(x-.0043,.0056);p.lineTo(x+.0042,.0056);p.lineTo(x+.0042,.0032);p.lineTo(x+.0060,.0032);p.lineTo(x+.0060,.0019);p.lineTo(x+.0070,.0019);p.lineTo(x+.0070,-.0019);p.lineTo(x+.0060,-.0019);p.lineTo(x+.0060,-.0032);p.lineTo(x+.0042,-.0032);p.lineTo(x+.0042,-.0056);p.closePath();s.holes.push(p);
 }
 const common=faceShape(.0146,.0603,.00015);rectangularHole(common,0,0,.01365,.0592);
 sheet('four-port-continuous-shield',common,px,.01015,.03418,.00042,steel);
 ys.forEach((y,i)=>{
  const n=5-i, s=faceShape(.01382,.0145,.00018);socketKey(s);
  sheet('rj45-recess-'+n,s,px,y,.0302,.00422,steel);
  box('dark-contact-carrier-'+n,px-.00365,y,.0300,.0025,.009,.00135,plastic);
  for(let k=0;k<8;k++)box('recessed-contact-'+n+'-'+k,px-.0043,y-.00385+k*.0011,.03075,.0015,.00023,.00034,brass);
  ring('status-lens-'+n,.00825,y-.003,.03415,.00103,.00051,lens);
  mark(String(n),.00825,y+.0013,.03448,.0029,.00265);
 });
 [[.0519,'P1'],[.0449,'P2']].forEach(([y,name])=>{
  ring('status-lens-'+name,.0083,y,.03415,.00107,.00051,lens);
  mark(name,.00835,y-.0031,.03448,.0037,.0023);
 });
 // Top termination and configuration pieces are inert exterior geometry.
 box('top-green-four-position-block',0,.0620,-.010,.0148,.0090,.0143,green);
 box('terminal-block-base',0,.0582,-.010,.0161,.0020,.0152,greenDark);
 for(const x of [-.0055,-.00183,.00183,.0055]){
  box('terminal-cavity',x,.06654,-.010,.0027,.00025,.0030,greenDark);
  box('terminal-side-cavity',x,.0627,-.0028,.0023,.0024,.00020,greenDark);
 }
 box('top-dip-carrier',.002,.0582,.006,.008,.0012,.0045,blue);
 for(const x of [.001,.0035])box('inert-dip-actuator',x,.0591,.0062,.0012,.0008,.0024,light);
 const ground=ring('case-ground-fastener',.006,.058,.018,.00155,.0010,steel);ground.rotation.x=0;
 for(const x of [-.0108,-.0073,.0090,.0122])for(const z of [.019,.023,.027])box('top-vent-square',x,.05754,z,.00118,.00016,.00118,cavity);
 for(const x of [-.01503,.01503])for(const y of [-.049,.049])for(const z of [-.028,.027]){
  const head=ring('silver-side-fastener',x,y,z,.00114,.00032,steel);head.rotation.y=Math.PI/2;head.rotation.x=0;head.rotation.z=Math.PI/2;
  const slot=box('side-fastener-slot',x+Math.sign(x)*.00017,y,z,.00011,.00125,.00018,dark);slot.rotation.x=.6;
 }
 box('side-label-stock',-.01511,.003,-.002,.00014,.055,.027,edge);
 mark('MOXA',-.0152,.023,-.002,.021,.0040,'#293534',true);
 mark('EDS-205A',-.0152,.0175,-.002,.020,.0031,'#293534',true);
 for(let j=0;j<5;j++)box('side-label-layout',-.01522,.010-j*.004,-.001,.00012,.00055,.018-j*.001,dark);
 box('rear-din-rail-clip',0,.0001,-.0394,.018,.0484,.0088,aluminum);
 box('upper-din-hook',0,.021,-.0431,.0185,.0043,.0014,edge);
 box('lower-din-spring-tab',0,-.021,-.0431,.0165,.0061,.0014,steel);
 return {group,dispose(){for(const r of owned)r.dispose();owned.clear();}};
}
