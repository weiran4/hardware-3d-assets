import * as THREE from 'three';

export const rh25Reference=Object.freeze({
 model:'Vishay Dale RH-25',
 sku:'RH025100R0FE02',
 photo:'https://i.ebayimg.com/images/g/tzYAAeSwFztopgyP/s-l1600.webp',
 oblique:'https://i.ebayimg.com/images/g/GJAAAeSw3mxopgv0/s-l1600.webp',
 document:'https://www.vishay.com/docs/30201/rhnh.pdf#page=2',
});

// Original visual specimen: no electrical endpoint, mounting claim or load rating.
export function buildRh25Exterior(){
 const group=new THREE.Group(),owned=new Set();
 group.name='vishay-dale-rh25';
 const own=r=>{owned.add(r);return r;};
 const mat=(color,metalness=0,roughness=.55)=>own(new THREE.MeshStandardMaterial({color,metalness,roughness}));
 const gold=mat(0xb89c47,.47,.49),tabGold=mat(0xc5a95a,.46,.47);
 const sideGold=mat(0x977734,.52,.53),potting=mat(0x393e38,.04,.76),endRim=mat(0x8f7135,.46,.54);
 const nickel=mat(0xb3ae99,.53,.39),contact=mat(0xcec5a6,.53,.37);
 const sub=(name,parent=group)=>{const o=new THREE.Group();o.name=name;parent.add(o);return o;};
 const mesh=(geometry,material,parent=group,name='')=>{const o=new THREE.Mesh(own(geometry),material);o.name=name;parent.add(o);return o;};
 function rounded(w,h,r){
  const b=-h/2,t=h/2,l=-w/2,R=w/2,s=new THREE.Shape();
  s.moveTo(l+r,b);s.lineTo(R-r,b);s.quadraticCurveTo(R,b,R,b+r);
  s.lineTo(R,t-r);s.quadraticCurveTo(R,t,R-r,t);s.lineTo(l+r,t);
  s.quadraticCurveTo(l,t,l,t-r);s.lineTo(l,b+r);s.quadraticCurveTo(l,b,l+r,b);s.closePath();
  return s;
 }
 function flat(shape,thickness,material,parent,name='',bevel=.00013){
  const o=mesh(new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:bevel>0,bevelSegments:2,
   bevelSize:bevel,bevelThickness:bevel,curveSegments:12}),material,parent,name);
  o.rotation.x=-Math.PI/2;return o;
 }
 function bore(radius){
  const p=new THREE.Path();p.absarc(0,0,radius,0,2*Math.PI,true);return p;
 }
 const ears=sub('diagonal-mounting-ears');
 for(const sign of [-1,1]){
  const ear=rounded(.0085,.0084,.0013);ear.holes.push(bore(.00159));
  const tab=flat(ear,.00169,tabGold,ears,'through-drilled-tab');
  tab.position.set(sign*.00913,.00013,-sign*.00939);
 }
 // Broad low mounting saddle stays behind both drilled openings.
 const saddle=flat(rounded(.02675,.0140,.0007),.00166,sideGold,group,'mounting-saddle');
 saddle.position.y=.00015;
 const ribs=[
  [.0036,.01370],[.0056,.01216],[.0058,.01144],
  [.00656,.01105],[.00665,.01047],[.00564,.01001],
  [.00582,.00944],[.00680,.00918],[.00688,.00862],[.00581,.00813],
  [.00601,.00764],[.00697,.00735],[.00702,.00672],[.00603,.00625],
  [.00606,.00579],[.00702,.00553],[.00704,.00491],[.00605,.00441],
  [.00602,.00392],[.00695,.00359],[.00692,.00303],[.00598,.00264],
  [.00580,.00172],
 ];
 // Constant cross-section extrusion along the part, not fake painted stripes.
 const section=new THREE.Shape([[-ribs[0][0],ribs[0][1]],...ribs,
  ...ribs.slice().reverse().map(([x,y])=>[-x,y])].map(([a,b])=>new THREE.Vector2(a,b)));
 const core=mesh(new THREE.ExtrudeGeometry(section,{depth:.02675,bevelEnabled:true,bevelSize:.00011,
  bevelThickness:.00011,bevelSegments:2,curveSegments:7}),gold,group,'ribbed-anodized-profile');
 core.rotation.y=Math.PI/2;core.position.x=-.013375;
 // Darkened filled annulus and metallic solder lugs on the two end centers.
 const ends=sub('opposing-visual-solder-ends');
 for(const sign of [-1,1]){
  const end=sub('solder-eye-and-potting',ends);
  function cylinder(radius,depth,material,x){
   const o=mesh(new THREE.CylinderGeometry(radius,radius,depth,24),material,end);
   o.rotation.z=Math.PI/2;o.position.set(x,.00586,0);return o;
  }
  cylinder(.00334,.00030,endRim,sign*.01348);
  cylinder(.00293,.00046,potting,sign*.01363);
  cylinder(.00108,.00688,nickel,sign*.01706);
  const blade=rounded(.00572,.00285,.00085);blade.holes.push(bore(.00066));
  const lug=flat(blade,.00064,contact,end,'opposing-eye-terminal',.00009);
  lug.position.set(sign*.02169,.00550,0);
 }
 if(globalThis.document){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=254;
  const c=canvas.getContext('2d');
  if(c){
   c.fillStyle='#382a17';c.font='700 124px monospace';c.textAlign='center';c.textBaseline='middle';
   // Original identity marking only: the photographed resistance/rating are not a lesson input.
   c.fillText('DALE RH-25',512,130);
   const texture=own(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;
   const text=mesh(new THREE.PlaneGeometry(.0234,.0058),own(new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false})),group,'original-part-mark');
   text.rotation.x=-Math.PI/2;text.position.set(0,.01384,0);
  }
 }
 let disposed=false;
 return {group,dispose(){if(disposed)return;disposed=true;for(const r of owned)r.dispose();owned.clear();}};
}
