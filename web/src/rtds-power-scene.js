import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createInspectionControls,applyInspectionPose} from './rtds-camera.js';
import {createPowerAssembly} from './rtds-power-geometry.js';

export async function createPowerScene(container,modelInfo,metadata,onProjection,isCurrent=()=>true){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.domElement.setAttribute('aria-hidden','true');
 let template,assembly,controls,observer,disposed=false,active=true,frame=0,detail=false;
 const releaseTemplate=()=>{const geometries=new Set(),materials=new Set();template?.traverse(n=>{if(n.isMesh){geometries.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material])materials.add(m);}});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();};
 try{
  template=(await new GLTFLoader().loadAsync(new URL(modelInfo.glb,document.baseURI).href)).scene;
  if(!isCurrent()){releaseTemplate();renderer.dispose();return null;}
  assembly=createPowerAssembly(template,metadata);
 }catch(error){assembly?.dispose();releaseTemplate();renderer.dispose();throw error;}
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.001,10);scene.add(assembly.group);
 scene.add(new THREE.HemisphereLight(0xfffae9,0xa9b8b5,2.2));for(const [intensity,pos]of [[3,[-1,2,2]],[1.4,[1,1,1]]]){const l=new THREE.DirectionalLight(0xfff5e8,intensity);l.position.fromArray(pos);scene.add(l);}
 container.append(renderer.domElement);controls=createInspectionControls(camera,renderer.domElement,invalidate);
 const limits={enablePan:false,minZoom:.8,maxZoom:1.6,minAzimuthAngle:-.25,maxAzimuthAngle:.25,minPolarAngle:Math.PI/2-.15,maxPolarAngle:Math.PI/2+.15};Object.assign(controls,limits);
 const nodes={...assembly.anchors,upperBoard:assembly.boardCenters[0],lowerBoard:assembly.boardCenters[1],supplyLabel:assembly.supply,feedPlug:assembly.cables.feed.plugs[1],jumperPlug:assembly.cables.jumper.plugs[1],jumperStartPlug:assembly.cables.jumper.plugs[0]};
 function invalidate(){if(active&&!disposed&&!frame)frame=requestAnimationFrame(render);}
 function render(){
  frame=0;if(!active||disposed)return;controls.update();assembly.group.updateMatrixWorld(true);camera.updateMatrixWorld(true);renderer.render(scene,camera);
  const width=container.clientWidth,height=container.clientHeight,points={};
  for(const [name,node]of Object.entries(nodes)){const world=node.getWorldPosition(new THREE.Vector3()),p=world.clone().project(camera);points[name]={world:world.toArray(),x:(p.x*.5+.5)*width,y:(.5-p.y*.5)*height,visible:width>0&&height>0&&Math.abs(p.x)<=1&&Math.abs(p.y)<=1&&p.z>=-1&&p.z<=1};}
  onProjection(points);container.dataset.frames=String(+(container.dataset.frames||0)+1);container.dataset.triangles=String(renderer.info.render.triangles);
 }
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h,span=detail?.3:Math.max(.565,.35/aspect);camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();invalidate();}
 function view(action){
  if(action==='in'||action==='out'){camera.zoom=THREE.MathUtils.clamp(camera.zoom*(action==='in'?1.2:1/1.2),limits.minZoom,limits.maxZoom);camera.updateProjectionMatrix();invalidate();return;}
  detail=action==='detail';const center=new THREE.Vector3(detail?-.015:.045,detail?.027:-.024,0);
  controls=applyInspectionPose(camera,controls,center,new THREE.Vector3(0,.025,1),1,renderer.domElement,invalidate);Object.assign(controls,limits);controls.enabled=active;container.dataset.view=detail?'detail':'front';resize();
 }
 observer=new ResizeObserver(resize);observer.observe(container);view('front');container.dataset.loaded='true';container.dataset.asset=metadata.asset_id;container.dataset.boardCount='2';
 return{update(p){assembly.update(p);invalidate();},view,setActive(value){active=!!value;controls.enabled=active;if(active)resize();else{cancelAnimationFrame(frame);frame=0;}},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();assembly.dispose();releaseTemplate();renderer.dispose();renderer.domElement.remove();delete container.dataset.loaded;}};
}
