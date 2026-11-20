import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {publishedModels} from './rtds-models.js';

// Existing GLBs are visual exteriors. Floating group plaques do not specify socket mapping or mating.
const colors={optical:0x9a6330,copper:0xc64b40,fiber:0x9a6330,gt:0x9a6330,'gt-fiber':0x9a6330,'st-timing-fiber':0xc18b34,'st-ethernet-fiber':0x2478ac,coax:0x60717f,ethernet:0x2478ac};
export async function createBlackboxScene(container,project){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xffffff,1);renderer.domElement.setAttribute('aria-hidden','true');
 let template,nova;const loader=new GLTFLoader();try{template=(await loader.loadAsync(new URL(publishedModels['gtsoc-v2'].glb,document.baseURI).href)).scene;nova=(await loader.loadAsync(new URL(publishedModels['novacor-2.0'].glb,document.baseURI).href)).scene;}catch(e){renderer.dispose();throw e;}
 const scene=new THREE.Scene(),group=new THREE.Group(),wireGroup=new THREE.Group(),camera=new THREE.PerspectiveCamera(36,1,.01,30);const overlays=new THREE.Group();scene.add(group,overlays,wireGroup);scene.add(new THREE.HemisphereLight(0xffffff,0x7a9293,2.7));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-1,2,4);scene.add(light);
 const owned=new Set();let view='overview',models={},chassis={},compact=container.clientWidth<600,anchors={},cables=[],state=null,phase=null,layout=0,signature='',active=true,disposed=false,frame=0,frames=0;
 container.append(renderer.domElement);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=.3;controls.maxDistance=12;controls.addEventListener('change',invalidate);
 function own(x){owned.add(x);return x;}
 function box(parent,size,pos,color){const m=new THREE.Mesh(own(new THREE.BoxGeometry(...size)),own(new THREE.MeshStandardMaterial({color,roughness:.62})));m.position.fromArray(pos);parent.add(m);return m;}
 function label(text,pos,width=.24,parent=overlays){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,768,96);c.fillStyle='#193a4c';c.font='bold 56px sans-serif';c.textAlign='center';c.fillText(text,384,61,740);const texture=own(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:texture,depthTest:false})));sprite.scale.set(width,width/8,1);sprite.position.fromArray(pos);sprite.renderOrder=20;parent.add(sprite);return sprite;}
 function port(parent,key,pos,color){anchors[key]=box(parent,[.012,.009,.008],pos,color);}
 function clearWires(){for(const c of cables){c.mesh.geometry.dispose();c.mesh.material.dispose();c.dot.geometry.dispose();c.dot.material.dispose();}cables=[];wireGroup.clear();signature='';}
 function clearLayout(){clearWires();group.clear();overlays.clear();models={};chassis={};for(const r of owned)r.dispose();owned.clear();anchors={};}


 function rebuild(){
 clearLayout();layout=1;
 function model(source,x,y,caption){const m=source.clone(true);m.rotation.y=Math.PI;const bounds=new THREE.Box3().setFromObject(m),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());const scale=.55/Math.max(size.x,size.y,size.z);m.scale.setScalar(scale);m.position.set(x-center.x*scale,y-center.y*scale,-center.z*scale);group.add(m);label(caption,[x,y+.16,.08],.56);return m;}
 const nx=compact?0:-.36,ny=compact?.36:.12,sx=compact?0:.36,sy=compact?-.29:.12;
 models.novacor=model(nova,nx,ny,'NOVACOR · SIMULATED BESS');models.gtsoc=model(template,sx,sy,'GTSOC V2 · ARM BLACK BOX');
 // Group-level plaques intentionally float outside the chassis, not insertion anchors.
 port(overlays,'N.group',[nx,ny-.12,.16],0xcb934e);label('GT I/O GROUP',[nx,ny-.18,.16],.32);
 port(overlays,'S.group',[sx,sy-.12,.16],0xcb934e);label('REAR HOST GROUP',[sx,sy-.18,.16],.39);
 label('MEASUREMENTS / COMMANDS',[compact?0:0,compact?.03:-.23,.10],.48);
 scene.updateMatrixWorld(true);
 for(const [key,model] of Object.entries(models)){
  const bounds=new THREE.Box3().setFromObject(model);
  chassis[key]={center:bounds.getCenter(new THREE.Vector3()),corners:chassisCorners(bounds)};
 }
 container.dataset.modelCount='2';container.dataset.asset='novacor-gtsoc-real-exteriors';container.dataset.anchorScope='functional-groups-no-insertion';fit();
 }
 function world(key){return anchors[key]?.getWorldPosition(new THREE.Vector3());}
 function buildWires(){const sig=JSON.stringify(state.links);if(sig===signature)return;clearWires();signature=sig;overlays.updateMatrixWorld(true);
  state.links.forEach((link,i)=>{const a=world(link.a),b=world(link.b);if(!a||!b)return;const color=colors[link.network]||0xc64b40;const lift=.18+(i%7)*.012;const curve=new THREE.CatmullRomCurve3([a,a.clone().add(new THREE.Vector3(0,0,.045)),new THREE.Vector3((a.x+b.x)/2,(a.y+b.y)/2,lift),b.clone().add(new THREE.Vector3(0,0,.045)),b]);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.0018,5,false),new THREE.MeshStandardMaterial({color,roughness:.6}));wireGroup.add(mesh);const dot=new THREE.Mesh(new THREE.SphereGeometry(.005,10,7),new THREE.MeshBasicMaterial({color:0xffc22b}));wireGroup.add(dot);cables.push({mesh,dot,curve,network:link.network,index:i,signal:link.signal,reverse:link.reverse,returnPath:link.returnPath});});container.dataset.wires=String(cables.length);container.dataset.links=JSON.stringify(state.links);
 }
 function render(force=false){frame=0;if(disposed||(!active&&!force)||document.hidden||!state||!container.clientWidth||!container.clientHeight)return;buildWires();for(const c of cables){const on=!!state.enabled[c.network];c.mesh.material.opacity=on?1:.24;c.mesh.material.transparent=!on;c.dot.visible=on&&Number.isFinite(phase);if(c.dot.visible){const f=((phase%1)+1)%1;c.dot.position.copy(c.curve.getPoint((c.reverse||(c.returnPath&&Math.floor(phase)===2))?1-f:f));}}

  renderer.render(scene,camera);
  if(chassis[view]){
   const projected=chassis[view].corners.map(p=>p.clone().project(camera));
   const xs=projected.map(p=>.5+.5*p.x),ys=projected.map(p=>.5-.5*p.y);
   container.dataset.inspectionBounds=JSON.stringify({left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)});
  }else delete container.dataset.inspectionBounds;
  project();container.dataset.renderedView=view;container.dataset.loaded='true';container.dataset.frames=String(++frames);container.dataset.triangles=String(renderer.info.render.triangles);
 }
 function invalidate(){if(!disposed&&active&&!document.hidden&&!frame)frame=requestAnimationFrame(()=>render());}
 function chassisCorners({min,max}){
  const corners=[];
  for(const x of [min.x,max.x])for(const y of [min.y,max.y])for(const z of [min.z,max.z])corners.push(new THREE.Vector3(x,y,z));
  return corners;
 }
 function fitRear({center,corners}){
  // After the GLB rotation, +Z faces the photographed rear. Tilt only enough to read the enclosure.
  const angle=THREE.MathUtils.degToRad(view==='gtsoc'?7:4);
  const towardCamera=new THREE.Vector3(0,Math.sin(angle),Math.cos(angle));
  const up=new THREE.Vector3(0,Math.cos(angle),-Math.sin(angle));
  const heightSlope=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*.83;
  const widthSlope=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*.91*camera.aspect;
  const distance=Math.max(.32,...corners.map(p=>{
   const relative=p.clone().sub(center);
   return relative.dot(towardCamera)+Math.max(Math.abs(relative.x)/widthSlope,Math.abs(relative.dot(up))/heightSlope);
  }));
  controls.target.copy(center);
  camera.position.copy(center).addScaledVector(towardCamera,distance);
 }
 function fit(){
  const selection=chassis[view],overview=!selection;
  for(const [key,chassis] of Object.entries(models))chassis.visible=overview||key===view;
  overlays.visible=wireGroup.visible=overview;
  container.dataset.visibleModelCount=String(overview?Object.keys(models).length:1);
  container.dataset.overlaysVisible=String(overview);
  container.dataset.view=view;
  if(selection)fitRear(selection);
  else{
   const width=compact?.75:1.35,height=compact?1.25:.70,centerY=compact?.02:.06;
   const distance=Math.max(height,width/Math.max(.3,camera.aspect))/(2*Math.tan(THREE.MathUtils.degToRad(18)))*1.2;
   controls.target.set(-.02,centerY,.035);camera.position.set(-.02,centerY+.12,distance);
  }
  controls.update();invalidate();
 }
 function resize(){if(disposed)return;const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;const nextCompact=w<600;if(nextCompact!==compact){compact=nextCompact;if(layout)rebuild();}renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();fit();}
 const ro=new ResizeObserver(resize);ro.observe(container);resize();const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};document.addEventListener('visibilitychange',visibility);
 const lost=e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;container.dataset.loaded='false';container.dispatchEvent(new CustomEvent('blackbox-scene-error'));};renderer.domElement.addEventListener('webglcontextlost',lost);
 // A single static readiness frame is independent of stale intersection delivery.
 // It does not start animation, and is requested only for the selected lesson.
 return {paintStatic(){cancelAnimationFrame(frame);frame=0;render(true);},update(s,p=null){state=s;phase=p;if(!layout)rebuild();invalidate();},setActive(v){active=!!v;controls.enabled=active;if(!active){cancelAnimationFrame(frame);frame=0;}else invalidate();},setView(next){if(next!==view&&(next==='overview'||next==='gtsoc'||next==='novacor')){view=next;fit();}},dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);controls.dispose();clearLayout();const resources=new Set();[template,nova].forEach(model=>model.traverse(n=>{if(n.geometry)resources.add(n.geometry);for(const m of n.material?Array.isArray(n.material)?n.material:[n.material]:[]){resources.add(m);for(const v of Object.values(m))if(v?.isTexture)resources.add(v);}}));for(const r of resources)r.dispose();renderer.dispose();renderer.domElement.remove();container.dataset.loaded='false';}};
}

