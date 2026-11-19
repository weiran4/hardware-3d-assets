import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {publishedModels} from './rtds-models.js';

// Photo-referenced chassis; the empty SFP cages show location, not installed modules.
const opticalModel='./models/photo-bench/gtsoc-v2-optical.glb';
const bboxModel='./models/photo-bench/imperix-bbox-rcp.glb';
function gltfResources(models){
 const resources=new Set();
 for(const model of models)model.traverse(n=>{if(n.geometry)resources.add(n.geometry);for(const m of n.material?Array.isArray(n.material)?n.material:[n.material]:[]){resources.add(m);for(const v of Object.values(m))if(v?.isTexture)resources.add(v);}});
 return resources;
}
function getGroupAnchor(model,sid){
 let anchor=null;
 model.traverse(n=>{if(n.userData.kind==='anchor'&&n.userData.sid===sid)anchor=n;});
 return anchor;
}
const colors={optical:0x9a6330,copper:0xc64b40,fiber:0x9a6330,gt:0x9a6330,'gt-fiber':0x9a6330,'st-timing-fiber':0xc18b34,'st-ethernet-fiber':0x2478ac,coax:0x60717f,ethernet:0x2478ac};
export async function createGtsocScene(container,project){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xf1f4f7,1);renderer.domElement.setAttribute('aria-hidden','true');
 const loader=new GLTFLoader();
 // Settle siblings even on one failed request so successful temporary GLBs can be disposed.
 const results=await Promise.allSettled([publishedModels['gtsoc-v2'].glb,opticalModel,bboxModel].map(path=>loader.loadAsync(new URL(path,document.baseURI).href)));
 const models=results.flatMap(r=>r.status==='fulfilled'?[r.value.scene]:[]),[template,optical,bbox]=models;
 const resources=gltfResources(models);
 if(models.length!==3||!getGroupAnchor(optical,'gtsoc.front-sfp-group')||!getGroupAnchor(bbox,'bbox.sfp-group')){
  for(const r of resources)r.dispose();renderer.dispose();throw new Error('GTSOC comparison assets unavailable');
 }
 const scene=new THREE.Scene(),group=new THREE.Group(),wireGroup=new THREE.Group(),camera=new THREE.PerspectiveCamera(36,1,.01,30);scene.add(group,wireGroup);scene.add(new THREE.HemisphereLight(0xffffff,0x7a9293,1.85));const light=new THREE.DirectionalLight(0xffffff,2.15);light.position.set(-1,2,4);scene.add(light);
 const owned=new Set();let compact=container.clientWidth<600,anchors={},cables=[],state=null,phase=null,layout=0,signature='',active=true,disposed=false,frame=0,frames=0;
 container.append(renderer.domElement);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=.3;controls.maxDistance=12;controls.addEventListener('change',invalidate);
 function own(x){owned.add(x);return x;}
 function box(parent,size,pos,color){const m=new THREE.Mesh(own(new THREE.BoxGeometry(...size)),own(new THREE.MeshStandardMaterial({color,roughness:.62})));m.position.fromArray(pos);parent.add(m);return m;}
 function label(text,pos,width=.24,parent=group){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#193a4c';c.font='bold 56px sans-serif';c.textAlign='center';c.fillText(text,384,61,740);const texture=own(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:texture,depthTest:false})));sprite.scale.set(width,width/8,1);sprite.position.fromArray(pos);sprite.renderOrder=20;parent.add(sprite);return sprite;}
 function port(parent,key,pos,color){anchors[key]=box(parent,[.012,.009,.008],pos,color);}
 function clearWires(){for(const c of cables){c.mesh.geometry.dispose();c.mesh.material.dispose();c.dot.geometry.dispose();c.dot.material.dispose();}cables=[];wireGroup.clear();signature='';}
 function clearLayout(){clearWires();group.clear();for(const r of owned)r.dispose();owned.clear();anchors={};}


 function rebuild(){
 clearLayout();layout=1;
 const mmc=state?.app==='mmc',sv=state?.app==='sv';
 function place(source,x,y,width,rotation=0){
  const model=source.clone(true);model.rotation.y=rotation;
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const scale=width/size.x;model.scale.setScalar(scale);model.position.set(x-center.x*scale,y-center.y*scale,-center.z*scale);
  group.add(model);
  return model;
 }
 function groupMarker(model,sid,key){
  const a=getGroupAnchor(model,sid).getWorldPosition(new THREE.Vector3());
  // Surface-derived positions, but detached forward and down: this line is logical, not a jack.
  port(group,key,[a.x,a.y-.056,a.z+.030],0xd5973c);
 }
 if(mmc){
  const sx=compact?0:-.36,cx=compact?0:.36,sy=compact?.36:.13,cy=compact?-.28:.13;
  const soc=place(optical,sx,sy,.57),controller=place(bbox,cx,cy,.57,Math.PI);
  label('GTSOC V2 · 前部 SFP 应用组',[sx,sy+.16,.20],.56);
  label('B-BOX RCP · 后部 SFP 互连组',[cx,cy+.16,.20],.56);
  group.updateMatrixWorld(true);
  groupMarker(soc,'gtsoc.front-sfp-group','S.front');groupMarker(controller,'bbox.sfp-group','C.optical');
 }else{
  place(sv?template:optical,0,.12,.60);
  label(sv?'GTSOC V2 · 铜模块外观参考':'GTSOC V2 · 仅外观参考',[0,.31,.20],.62);
 }
 group.updateMatrixWorld(true);container.dataset.modelCount=mmc?'2':'1';
 container.dataset.asset=mmc?'gtsoc-optical-bbox-rcp-glbs':sv?'gtsoc-copper16-glb':'gtsoc-reference-only';
 container.dataset.anchorScope=mmc?'functional-groups-no-insertion':'none';
 container.dataset.anchorCount=String(Object.keys(anchors).length);fit();
 }
 function world(key){return anchors[key]?.getWorldPosition(new THREE.Vector3());}
 function buildWires(){const sig=JSON.stringify(state.links);if(sig===signature)return;clearWires();signature=sig;group.updateMatrixWorld(true);
  state.links.forEach((link,i)=>{const a=world(link.a),b=world(link.b);if(!a||!b)return;const color=colors[link.network]||0xc64b40;const lift=Math.max(a.z,b.z)+.035,y=Math.min(a.y,b.y)-.09;
   // Stacked devices share an x span; route around the enclosure rather than over its controls.
   const points=compact
    ? [a,new THREE.Vector3(a.x+.025,a.y-.050,lift),new THREE.Vector3(.33,a.y-.050,lift),new THREE.Vector3(.33,b.y-.058,lift),new THREE.Vector3(b.x+.045,b.y-.058,lift),b]
    : [a,a.clone().lerp(b,.14).setY(y).setZ(lift),new THREE.Vector3((a.x+b.x)/2,y,lift),b.clone().lerp(a,.14).setY(y).setZ(lift),b];
   const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.0018,5,false),new THREE.MeshStandardMaterial({color,roughness:.6}));wireGroup.add(mesh);const dot=new THREE.Mesh(new THREE.SphereGeometry(.005,10,7),new THREE.MeshBasicMaterial({color:0xffc22b}));wireGroup.add(dot);cables.push({mesh,dot,curve,network:link.network,index:i,signal:link.signal,reverse:link.reverse,returnPath:link.returnPath});});container.dataset.wires=String(cables.length);container.dataset.links=JSON.stringify(state.links);
 }
 function render(force=false){frame=0;if(disposed||(!active&&!force)||document.hidden||!state||!container.clientWidth||!container.clientHeight)return;buildWires();for(const c of cables){const on=!!state.enabled[c.network];c.mesh.material.opacity=on?1:.24;c.mesh.material.transparent=!on;c.dot.visible=on&&Number.isFinite(phase);if(c.dot.visible){const f=((phase%1)+1)%1;c.dot.position.copy(c.curve.getPoint((c.reverse||(c.returnPath&&Math.floor(phase)===2))?1-f:f));}}

  renderer.render(scene,camera);const points={};for(const key of Object.keys(anchors)){const v=world(key).project(camera);points[key]={x:(v.x*.5+.5)*container.clientWidth,y:(.5-v.y*.5)*container.clientHeight,visible:Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z>-1&&v.z<1};}project(points);container.dataset.loaded='true';container.dataset.frames=String(++frames);container.dataset.triangles=String(renderer.info.render.triangles);
 }
 function invalidate(){if(!disposed&&active&&!document.hidden&&!frame)frame=requestAnimationFrame(()=>render());}
 function fit(){
  const mmc=state?.app==='mmc',width=mmc?(compact?.68:1.43):.71,height=mmc?(compact?1.00:.49):.51;
  const centerY=mmc?(compact?.07:.13):.14;
  const distance=Math.max(height,width/Math.max(.3,camera.aspect))/(2*Math.tan(THREE.MathUtils.degToRad(18)))*1.16;
  controls.target.set(0,centerY,.12);camera.position.set(compact?.11:.13,centerY+.11,distance+.12);controls.update();invalidate();
 }
 function resize(){if(disposed)return;const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;const nextCompact=w<600;if(nextCompact!==compact){compact=nextCompact;if(layout)rebuild();}renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();fit();}
 const ro=new ResizeObserver(resize);ro.observe(container);resize();const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};document.addEventListener('visibilitychange',visibility);
 const lost=e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;container.dataset.loaded='false';container.dispatchEvent(new CustomEvent('gtsoc-scene-error'));};renderer.domElement.addEventListener('webglcontextlost',lost);
 // A single static readiness frame is independent of stale intersection delivery.
 // It does not start animation, and is requested only for the selected lesson.
 return {paintStatic(){cancelAnimationFrame(frame);frame=0;render(true);},update(s,p=null){const changed=state?.app!==s.app;state=s;phase=p;if(!layout||changed)rebuild();invalidate();},setActive(v){active=!!v;controls.enabled=active;if(!active){cancelAnimationFrame(frame);frame=0;}else invalidate();},fit,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);controls.dispose();clearLayout();for(const r of resources)r.dispose();renderer.dispose();renderer.domElement.remove();container.dataset.loaded='false';}};
}

