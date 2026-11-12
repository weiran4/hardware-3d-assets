import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {publishedModels} from './rtds-models.js';
import {createInspectionControls,applyInspectionPose} from './rtds-camera.js';
import {createOutputAssembly} from './rtds-digital-output-geometry.js';

export async function createOutputScene(container,onProjection=()=>{}){
 if(!container?.append||!container?.getBoundingClientRect)throw Error('Output scene requires a DOM container / 场景容器');
 const info=publishedModels['gtdo-v2'];
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.style.touchAction='pan-y';
 let template,assembly,second,controls,observer,disposed=false,active=true,frame=0,detail=false,frames=0;
 let latestState={page:17,wires:[],power:false,logic:false},latestResult={status:'off',flow:false},latestPhase=null;
 const releaseTemplate=()=>{
  const geometries=new Set(),materials=new Set(),textures=new Set();
  template?.traverse(n=>{if(n.isMesh){geometries.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material]){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}}});
  for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();
 };
 try{template=(await new GLTFLoader().loadAsync(new URL(info.glb,document.baseURI).href)).scene;assembly=createOutputAssembly(template);second=createOutputAssembly(template,2);}
 catch(error){assembly?.dispose();releaseTemplate();renderer.dispose();throw error;}
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.001,10);
 scene.add(assembly.group);scene.add(second.group);scene.add(new THREE.HemisphereLight(0xfff8e9,0x8caba5,2.4));
 for(const [intensity,color,position]of [[3.1,0xfff3dc,[-.4,1,1]],[1.6,0xe0edff,[.6,.3,.8]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.fromArray(position);scene.add(light);}
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
 const limits={enablePan:false,minZoom:.85,maxZoom:1.8,minAzimuthAngle:-.35,maxAzimuthAngle:.5,minPolarAngle:Math.PI/2-.35,maxPolarAngle:Math.PI/2+.10};
 container.append(renderer.domElement);controls=createInspectionControls(camera,renderer.domElement,invalidate);Object.assign(controls,limits);
 function setData(name,value){container.dataset[name]=String(value);renderer.domElement.dataset[name]=String(value);}
 function running(){return active&&!disposed&&!document.hidden;}
 function applyState(){
  const dual=latestState.page===16&&latestState.secondBank;
  second.group.visible=!!dual;second.update(latestState.secondBank||{},latestResult.secondBank||{},running()?latestPhase:null);
  assembly.update(latestState,latestResult,running()?latestPhase:null);
  setData('bankCount',dual?2:1);setData('externalDeviceCount',dual?4:2);
  setData('bank2WireCount',Object.values(second.cables).filter(c=>c.mesh.visible).length);setData('bank2LoadActive',second.group.userData.loadActive);
  setData('page',latestState.page);setData('loadActive',assembly.group.userData.loadActive);setData('flow',assembly.group.userData.flow);
  setData('wireCount',Object.values(assembly.cables).filter(c=>c.mesh.visible).length);
 }
 function invalidate(){if(running()&&!frame)frame=requestAnimationFrame(render);}
 function visible(node){for(let n=node;n;n=n.parent)if(!n.visible)return false;return true;}
 function render(){
  frame=0;if(!running())return;
  controls.update();assembly.group.updateMatrixWorld(true);camera.updateMatrixWorld(true);renderer.render(scene,camera);
  const width=container.clientWidth,height=container.clientHeight,points={};
  for(const [name,node]of Object.entries(latestState.page===16&&latestState.activeBank===1?second.anchors:assembly.anchors)){
   const world=node.getWorldPosition(new THREE.Vector3()),p=world.clone().project(camera);
   points[name]={world:world.toArray(),x:(p.x*.5+.5)*width,y:(.5-p.y*.5)*height,visible:visible(node)&&width>0&&height>0&&Math.abs(p.x)<=1&&Math.abs(p.y)<=1&&p.z>=-1&&p.z<=1};
  }
  setData('frames',++frames);setData('triangles',renderer.info.render.triangles);setData('zoom',camera.zoom.toFixed(3));
  onProjection(points);
 }
 function resize(){
  if(disposed)return;const width=container.clientWidth,height=container.clientHeight;if(!width||!height)return;
  renderer.setSize(width,height);const aspect=width/height,span=latestState.page===16?Math.max(.36,.72/aspect):detail?Math.max(.25,.35/aspect):Math.max(.32,.465/aspect);
  camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();invalidate();
 }
 function view(action){
  if(disposed)return;
  if(['in','out','zoomIn','zoomOut'].includes(action)){
   camera.zoom=THREE.MathUtils.clamp(camera.zoom*(['in','zoomIn'].includes(action)?1.2:1/1.2),limits.minZoom,limits.maxZoom);camera.updateProjectionMatrix();invalidate();return;
  }
  detail=action==='detail';const center=new THREE.Vector3(latestState.page===16?-.11:detail?.025:0,.003,.024);
  controls=applyInspectionPose(camera,controls,center,new THREE.Vector3(.17,.19,1),1,renderer.domElement,invalidate);Object.assign(controls,limits);controls.enabled=running();
  setData('view',detail?'detail':'front');resize();
 }
 function availability(){
  if(disposed)return;controls.enabled=running();cancelAnimationFrame(frame);frame=0;applyState();setData('active',running());if(running())resize();
 }
 function motionChanged(){latestPhase=null;availability();}
 function contextLost(event){event.preventDefault();setData('loaded',false);setData('contextLost',true);setActive(false);container.dispatchEvent(new CustomEvent('output-scene-error',{detail:{reason:'context-lost'}}));}
 function setActive(value){active=!!value;availability();}
 observer=new ResizeObserver(resize);observer.observe(container);
 document.addEventListener('visibilitychange',availability);reduced?.addEventListener('change',motionChanged);renderer.domElement.addEventListener('webglcontextlost',contextLost);
 setData('loaded',true);setData('asset','gtdo-v2-2.00');setData('externalDeviceCount',2);setData('frames',0);setData('triangles',0);setData('active',running());
 applyState();view('front');
 return{
  update(state,result,phase=null){if(disposed)return;const changed=latestState.page!==state.page;latestState=state;latestResult=result;latestPhase=phase;applyState();if(changed)view('front');invalidate();},
  setActive,view,
  dispose(){
   if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();
   document.removeEventListener('visibilitychange',availability);reduced?.removeEventListener('change',motionChanged);renderer.domElement.removeEventListener('webglcontextlost',contextLost);
   assembly.dispose();second?.dispose();releaseTemplate();renderer.dispose();renderer.domElement.remove();
   delete container.dataset.loaded;container.dataset.active='false';container.dataset.flow='false';
  }
 };
}
