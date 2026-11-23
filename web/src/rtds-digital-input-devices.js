import * as THREE from 'three';

export const phoenixReferences=Object.freeze({
 relay:Object.freeze({model:'PLC-RSC-24DC/21AU',sku:'2966265',url:'https://www.phoenixcontact.com/en-us/products/relay-module-plc-rsc-24dc21au-2966265',photo:'https://caas.phoenixcontact.com/caas/v1/stable/media/27958/full/b1500?format=jpg'}),
 supply:Object.freeze({model:'UNO-PS/1AC/24DC/30W',sku:'2902991',url:'https://www.phoenixcontact.com/en-gb/products/power-supply-uno-ps1ac24dc-30w-2902991',photo:'https://caas.phoenixcontact.com/caas/v1/stable/media/120484/full/b1500?format=jpg'})
});

function phoenixProfile(mesh,name,points,depth,z,m,parent,bevel=.00035,holes=[]){
  const s=new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y)));
  for(const [x,y,r] of holes){const hole=new THREE.Path();hole.absarc(x,y,r,0,2*Math.PI,true);s.holes.push(hole);}
  const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:12,steps:1});
  const obj=mesh(g,m,parent);obj.name=name;obj.position.z=z;return obj;
 }

// Original geometry from the published product silhouettes and connector
// faces. No manufacturer photography is used as a texture.
export function placePhoenixDevices(relay,supply,{box,node,mesh,material,cylinder,mark}){
 const caseGrey=material(0xb5bab9),cover=material(0xd0d4d3),seam=material(0x525a5a),bore=material(0x313a39),clip=material(0xa5b0ae,{metalness:.55}),orange=material(0xe17f36),lens=material(0xb4a248);
 const profile=(...args)=>phoenixProfile(mesh,...args);
 relay.userData={...phoenixReferences.relay,origin:'original-photo-grounded',mechanicalAccuracy:'visual reference only'};
 // Side-display orientation allows the characteristic deep but only 6.2 mm
 // wide housing to be recognized; this is not a mounting-orientation diagram.
 profile('relay-stepped-shell',[
  [-.045,-.032],[-.036,-.036],[-.017,-.035],[-.012,-.032],[.016,-.032],[.022,-.036],[.041,-.037],[.046,-.035],
  [.044,-.027],[.045,-.019],[.039,-.015],[.039,-.009],[.044,-.006],[.044,.004],[.038,.009],[.034,.008],
  [.031,.009],[.031,.014],[.036,.017],[.036,.027],[.030,.029],[.027,.032],[.027,.037],[.021,.040],
  [-.029,.040],[-.033,.032],[-.032,.024],[-.036,.023],[-.037,.015],[-.033,.007],[-.038,.004],[-.041,.001],
  [-.041,-.010],[-.037,-.017],[-.042,-.017],[-.046,-.021]
 ],.0051,-.00255,caseGrey,relay,.00055);
 profile('plug-in-relay-insert',[[-.027,.038],[.019,.038],[.021,.035],[.015,.024],[-.026,.024]],.0055,-.00275,cover,relay);
 box([.045,.0006,.0057],[-.005,.0236,0],seam,relay);
 profile('orange-release-latch',[[-.033,.036],[-.026,.036],[-.024,.041],[-.023,.045],[-.025,.046],[-.029,.042],[-.031,.042],[-.034,.044],[-.035,.042]],.0057,-.00285,orange,relay);
 profile('rail-clip',[[-.016,-.032],[.018,-.032],[.016,-.036],[.010,-.039],[-.012,-.039]],.0049,-.00245,clip,relay);
 profile('rail-foot',[[.028,-.028],[.040,-.027],[.041,-.036],[.045,-.038],[.047,-.036],[.047,-.039],[.042,-.040],[.028,-.040]],.0049,-.00245,caseGrey,relay,.0004);
 cylinder(.0016,.00045,[.024,.036,.0032],lens,relay).name='coil-state-lens';
 const rTerm=(key,role,x,y,l)=>{
  const port=node([x,y,.0039],relay,key);port.userData={role,mapping:'visual terminal group, not mating geometry'};
  const housing=profile(key+'-shoulder',[[x-.0038,y-.0023],[x+.0038,y-.0023],[x+.0038,y+.0023],[x-.0038,y+.0023]],.001,.0028,cover,relay,.00025,[[x,y,.00155]]);
  housing.rotation.z=0;
  cylinder(.0014,.00045,[x,y,.00265],bore,relay);
  box([.0026,.00038,.0005],[x,y,.00302],clip,relay);
  mark(l,[x<0?x+.005:x-.005,y-.0043,.0041],[.010,.0035],relay,x<0?'left':'right');
  return port;
 };
 const com=rTerm('terminal-11-COM','COM',-.033,.019,'11 COM');
 const no=rTerm('terminal-14-NO','NO',-.037,-.001,'14 NO');
 rTerm('terminal-12-NC','NC',-.042,-.022,'12 NC');
 rTerm('terminal-A2','coil',.031,.025,'A2−');rTerm('terminal-A1','coil',.039,.001,'A1+');
 mark('PLC-RSC 24DC/21AU',[-.024,-.016,.0037],[.057,.0045],relay,'left');
 mark('2966265  |  24 V DC COIL',[-.024,-.022,.0037],[.053,.0032],relay,'left');

 const supplyLed=placePhoenixSupplyExterior(supply,{box,mesh,material,cylinder,mark});
 const dx=.0037,dy=.0325;
 const plus=node([-dx,dy,.043],supply,'output-2.1-plus'),minus=node([dx,dy,.043],supply,'output-2.2-minus');
 plus.userData={role:'DC+',mapping:'visual terminal group, not mating geometry'};
 minus.userData={role:'DC−',mapping:'visual terminal group, not mating geometry'};
 return {com,no,plus,minus,supplyLed};
}

// The exterior never creates terminals or substitutes for logical anchors.
export function placePhoenixSupplyExterior(supply,{box,mesh,material,cylinder,mark},{photoDetail=false}={}){
 const profile=(...args)=>phoenixProfile(mesh,...args);
 const seam=material(0x525a5a),bore=material(0x313a39),clip=material(0xa5b0ae,{metalness:.55}),unlit=material(photoDetail?0x5a6260:0x6b775d);
 supply.userData={...phoenixReferences.supply,origin:'original-photo-grounded',mechanicalAccuracy:'visual reference only'};
 const psS=material(0xbabfba),psF=material(0xd5d9d2);
 // True 22.5 mm width is maintained, not expanded into a benchtop display.
 if(photoDetail){
  // Right-hand side silhouette visible in the photo, including the rear step.
  const shell=profile('psu-din-shell',[[-.039,.044],[.037,.044],[.037,.010],[.0354,.007],
   [.0354,-.009],[.039,-.011],[.039,-.043],[-.035,-.044],[-.039,-.040]],.022,0,psS,supply);
  shell.rotation.y=Math.PI/2;shell.position.x=-.011;
 }else {
 profile('psu-din-shell',[[-.011,-.038],[-.008,-.044],[.009,-.044],[.011,-.039],[.011,.044],[-.011,.044]],.078,-.039,psS,supply);
 }
 const dx=.0037,dy=.0325,by=-.039;
 profile('psu-faceplate',[[-.0109,-.039],[-.0085,-.044],[.0085,-.044],[.0109,-.039],[.0109,.043],[-.0109,.043]],.0023,.0395,psF,supply,.00016,
  [[-dx,dy,.00205],[dx,dy,.00205],[-dx,by,.0018],[dx,by,.0018]]);
 for(const [i,x]of [-dx,dx].entries()){
  cylinder(.00185,.0006,[x,dy,.039],bore,supply);
  cylinder(.00145,.0006,[x,by,.039],bore,supply);
  box([.0024,.0004,.0006],[x,dy,.03965],clip,supply);
  box([.0022,.0004,.0006],[x,by,.03965],clip,supply);
  mark(i?'−':'+',[x,.0368,.0422],[.006,.0032],supply);
  if(photoDetail)mark(i?'2.2':'2.1',[x,.0404,.0423],[.006,.0025],supply);
  mark(i?'N':'L',[x,-.043,.0423],[.006,.0025],supply);
 }
 if(photoDetail){
  // The exact photo has two full-depth rows and a continuous center spine.
  const rib=material(0xb0b5af),recess=material(0x6d766f),sideRib=material(0x9ea69e);
  box([.0196,.0005,.075],[0,.04435,-.0005],recess,supply);
  box([.0022,.0011,.076],[0,.0450,-.0001],psS,supply);
  for(let i=0;i<17;i++){
   const z=.035-i*.00443;
   box([.0205,.0015,.00163],[0,.04515,z],rib,supply);
   for(const y of [.035,-.033])box([.00065,.010,.00160],[.01142,y,z],sideRib,supply);
  }
 }else{
 for(let i=0;i<13;i++){
  const z=.022-i*.0042;
  for(const x of [-.0055,.0055])box([.0084,.0006,.0022],[x,.04425,z],seam,supply);
  box([.0006,.010,.00135],[.01142,.034,z-.008],seam,supply);
  box([.0006,.008,.00135],[.01142,-.033,z-.008],seam,supply);
 }
 }
 if(photoDetail){
  const side=mark('UNO POWER  Ord.No.2902991',[-.00845,.018,.04225],[.042,.0020],supply);
  if(side)side.rotation.z=Math.PI/2;
  mark('Output DC',[.002,.027,.0422],[.015,.0032],supply);
  mark('24 V 30 W',[.002,.022,.0422],[.015,.0032],supply);
  mark('UNO',[0,-.016,.0422],[.015,.007],supply);
 }else{
  mark('24 V DC', [0,.024,.0422],[.017,.004],supply);
  mark('30 W',[0,.0195,.0422],[.013,.0033],supply);
 }
 const supplyLed=cylinder(.00125,.0005,[-.006,.001,.042],unlit,supply);
 mark('DC OK',[.002,.001,.0422],[.012,.0033],supply);
 if(!photoDetail){
  mark('UNO POWER',[0,-.011,.0422],[.018,.004],supply);
  mark('2902991',[0,-.017,.0422],[.016,.0035],supply);
 }
 mark('AC INPUT',[0,-.034,.0422],[.018,.003],supply);
 return supplyLed;
}
