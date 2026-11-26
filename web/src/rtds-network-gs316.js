import * as THREE from 'three';

export const gs316v3Spec=Object.freeze({
 model:'NETGEAR GS316v3',dimensionsMm:Object.freeze([286,27,102]),
 product:'https://www.netgear.com/business/wired/switches/unmanaged/gs316/',
 front:'https://assets.netgear.com/transform/pdp-desktop/42cf7a0a-d43f-48be-b3a7-a8332aaee2cc/gs316v3_wshadow_topfront_image',
 rear:'https://assets.netgear.com/transform/pdp-desktop/c688a1f1-bfaa-4049-9ab4-8e5bb9db3186/gs316v3_wshadow_backright_image',
 guide:'https://www.downloads.netgear.com/files/GDC/GS316v3/GS316v3_IG_EN.pdf'
});

// Teaching convention, not a physical restriction of this unmanaged switch.
export function gs316v3LanPort(key){const match=/^LAN\.p([0-8])$/.exec(key);return match?Number(match[1])+1:null;}

export function buildGs316v3(own){
 const model=new THREE.Group();model.name='GS316v3';model.scale.setScalar(.001);
 const mat=(color,metalness=0,roughness=.68)=>own(new THREE.MeshStandardMaterial({color,metalness,roughness}));
 const lid=mat(0x2b2d30,.06,.92),panel=mat(0x222428,.14),back=mat(0x343538,.08,.91),dark=mat(0x07090b),steel=mat(0xaab0b0,.28),gold=mat(0x746240,.25),plastic=mat(0x101216),led=mat(0x619439,.05,.40);
 const mesh=(parent,name,geometry,material,x,y,z)=>{
  const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(x,y,z);parent.add(m);return m;
 };
 const box=(parent,name,dims,m,x,y,z)=>mesh(parent,name,own(new THREE.BoxGeometry(...dims)),m,x,y,z);
 const rect=(x,y,w,h,path=new THREE.Shape())=>{
  path.moveTo(x-w/2,y-h/2);path.lineTo(x+w/2,y-h/2);path.lineTo(x+w/2,y+h/2);path.lineTo(x-w/2,y+h/2);path.closePath();return path;
 };
 const round=(x,y,r)=>{const p=new THREE.Path();p.absarc(x,y,r,0,Math.PI*2,false);return p;};
 function sheet(name,shape,material,depth,x,y,z,rotation=0,bevel=0){
  const geo=own(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSegments:1,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:7}));
  const m=mesh(model,name,geo,material,x,y,z);m.rotation.y=rotation;return m;
 }
 const front=rect(0,0,284,25);
 // Steel shielding surrounds four separate banks of four sockets.
 const centers=Array.from({length:16},(_,i)=>-111+i*15.85+Math.floor(i/4)*1.15);
 for(let bank=0;bank<4;bank++){
  const groupCenter=(centers[bank*4]+centers[bank*4+3])/2;
  front.holes.push(rect(groupCenter,-.45,62.5,13.3,new THREE.Path()));
  const frame=rect(groupCenter,-.45,62.4,13.2);
  for(let i=bank*4;i<bank*4+4;i++)frame.holes.push(rect(centers[i],-.45,13.15,11.2,new THREE.Path()));
  sheet('shield-bank-'+(bank+1),frame,steel,.85,0,0,50.05);
 }
 sheet('front-apertures',front,panel,1.45,0,0,48.6,0,.36);
 box(model,'top-cover',[286,1.7,101],lid,0,12.65,0);
 box(model,'lower-tray',[285,1.3,101],panel,0,-12.7,0);
 box(model,'interior-shadow',[281,23,94],dark,0,0,-.5);
 const rear=rect(0,0,285,25);
 // Rows are offset like the photographed back, not painted grey dots.
 for(let row=0;row<5;row++)for(let col=0;col<44;col++)rear.holes.push(round(-66+3.48*col+(row%2)*1.74,-6.7+3.0*row,.87));
 rear.holes.push(rect(-99,2.6,7.3,3.2,new THREE.Path()),round(109,-.55,3.6));
 sheet('rear-perforated-panel',rear,back,1.45,0,0,-49.1,Math.PI,.25);
 box(model,'security-slot',[7.6,3.3,1.6],dark,99,2.6,-48.5);
 box(model,'dc-recess',[10.2,10.8,.7],plastic,-109,-.55,-50.05);
 const barrel=mesh(model,'dc-barrel',own(new THREE.TorusGeometry(3.02,.59,8,20)),dark,-109,-.55,-50.7);
 barrel.rotation.y=Math.PI;
 const pin=mesh(model,'dc-center-pin',own(new THREE.CylinderGeometry(.56,.56,1.5,10)),steel,-109,-.55,-50.75);
 pin.rotation.x=Math.PI/2;
 for(const [i,x] of [-136,136].entries()){
  const m=mesh(model,'rear-fastener-'+i,own(new THREE.CylinderGeometry(2.25,2.25,.48,14)),steel,x,-6,-50.8);
  m.rotation.x=Math.PI/2;
 }
 const right=rect(0,0,99.8,25);
 for(let row=0;row<6;row++)for(let col=0;col<10;col++)right.holes.push(round(-38+3.34*col+1.67*(row%2),-7.1+2.85*row,.70));
 sheet('right-perforated-panel',right,lid,.8,142.1,0,0,Math.PI/2);
 box(model,'left-cover',[.8,25,99.8],lid,-142.5,0,0);
 for(const x of [-130,130])for(const z of [-39,39]){
  mesh(model,'rubber-foot',own(new THREE.CylinderGeometry(4,4.2,1.18,14)),dark,x,-13.62,z);
 }

 const contact=own(new THREE.BoxGeometry(.53,1.72,3.5));
 const ledGeo=own(new THREE.BoxGeometry(3.3,1.9,.48));
 for(let i=0;i<16;i++){
  const n=i+1,group=new THREE.Group();group.name='rj45-'+n;group.position.set(centers[i],-.45,49.1);model.add(group);
  box(group,'socket-shadow',[13.1,11.15,1],dark,0,0,-2.6);
  // The jack has a higher shoulder on each side and a central bottom notch.
  for(const side of [-1,1])box(group,'latch-shoulder',[2.65,2.45,2.3],plastic,4.97*side,-4.5,.26);
  for(let k=0;k<8;k++)mesh(group,'contact-'+n+'-'+k,contact,gold,-3.12+k*.89,-3.35,-1.04).rotation.x=-.27;
  for(const side of [-1,1])mesh(group,'link-led-'+n+'-'+side,ledGeo,led,side*4.18,4.6,2.03);
  const anchor=new THREE.Object3D();anchor.name='jack-anchor-'+n;anchor.position.set(centers[i],-.45,51.15);model.add(anchor);
 }
 box(model,'power-led',[4.7,2.2,.52],led,-134,-4.15,50.94);
 if(typeof document!=='undefined'){
  function print(name,w,h,res,draw,x,y,z,rx=0,ry=0){
   const c=document.createElement('canvas');c.width=Math.ceil(w*res);c.height=Math.ceil(h*res);
   const ctx=c.getContext('2d');ctx.scale(res,res);draw(ctx,w,h);
   const t=own(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
   const m=mesh(model,name,own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})),x,y,z);
   m.rotation.set(rx,ry,0);
  }
  print('front-screenprinting',284,25,6,(c)=>{
   c.fillStyle='#dadcdb';c.textAlign='left';c.textBaseline='middle';c.font='bold 3.4px sans-serif';
   c.fillText('NETGEAR',2.1,3.7);c.textAlign='right';c.fillText('GS316',278,3.7);
   c.textAlign='center';c.font='2.3px sans-serif';
   for(let i=0;i<16;i++)c.fillText(String(i+1),142+centers[i],21.5);
   c.font='1.7px sans-serif';c.fillText('Power',8,20);
   c.textAlign='left';c.font='1.38px sans-serif';
   c.fillText('Both = 1G',27.5,2.9);c.fillText('Left = 100M',27.5,5.0);c.fillText('Right = 10M',41,3.9);
  },0,0,51.09);
  print('lid-wordmark',200,31,5,(c,w,h)=>{
   c.textAlign='center';c.textBaseline='middle';c.font='bold 27px sans-serif';c.fillStyle='#232528';
   c.fillText('N E T G E A R',w/2,h*.49,w*.96);
  },0,13.54,0,-Math.PI/2);
  print('rear-screenprinting',282,24,6,c=>{
   c.fillStyle='#d0d2d3';c.font='2.4px sans-serif';c.textAlign='center';
   c.fillText('12V ⎓ 1.5A',250,5);c.fillText('−  ⊙  +',250,21);
   c.strokeStyle='#bfc2c4';c.lineWidth=.5;c.strokeRect(29,7.1,2.4,2);c.beginPath();c.arc(30.2,7.0,.88,Math.PI,0);c.stroke();
  },0,0,-50.95,0,Math.PI);
 }
 return model;
}
