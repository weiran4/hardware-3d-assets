import {projectModelAnchors,frontInspectionFrame} from './rtds-anchor-projection.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createInspectionControls,applyInspectionPose} from './rtds-camera.js';
import {createCardIdentityOverlay} from './rtds-card-identity.js';
import {gltfDirection,inspectionFrame} from './rtds-state.js';
import {createPortInteraction,createTapGesture} from './rtds-interaction.js';

// Independent RTDS viewer. Authored materials, semantic IDs and Y-up export are retained.
// Gentle authored-mesh emission is inspection UI, not physical LEDs or live device behaviour.
export async function createRtdsScene(container,label,modelInfo,metadata,onPort,isCurrent=()=>true,options={}){
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.001,20);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.domElement.setAttribute('aria-hidden','true');
 scene.add(new THREE.HemisphereLight(0xfffae9,0xa9b8b5,2.2));
 for(const [color,intensity,position]of [[0xfff5df,3,[-1,2,2]],[0xe6f0ff,2,[1,1,-1]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.fromArray(position);scene.add(light);}
 let gltf;
 try{gltf=await new GLTFLoader().loadAsync(new URL(modelInfo.glb,document.baseURI).href);}catch(e){renderer.dispose();renderer.domElement.remove();throw e;}
 if(!isCurrent()){gltf.scene.traverse(n=>{if(n.isMesh){n.geometry.dispose();for(const m of Array.isArray(n.material)?n.material:[n.material])m.dispose();}});renderer.dispose();return null;}
 const model=gltf.scene;scene.add(model);model.updateMatrixWorld(true);
 const nodes=new Map(),meshes=[];model.traverse(n=>{if(n.userData.sid)nodes.set(n.userData.sid,n);if(n.isMesh)meshes.push(n);});
 for(const p of metadata.ports){if(!nodes.has(p.id)){renderer.dispose();renderer.domElement.remove();throw Error('模型缺少接口 ID: '+p.id);}}
 container.append(renderer.domElement);const instance=crypto.randomUUID();container.dataset.instance=instance;
 const portById=new Map(metadata.ports.map(p=>[p.id,p])),interaction=createPortInteraction(model,portById);
 const originalVisibility=new Map(meshes.map(mesh=>[mesh,mesh.visible]));label.hidden=true;
 const wholeBox=new THREE.Box3().setFromObject(model),wholeSize=wholeBox.getSize(new THREE.Vector3()),wholeCenter=wholeBox.getCenter(new THREE.Vector3());
 const extent=Math.max(...wholeSize.toArray());let frameSize=wholeSize.toArray(),selected=[],selectedPort=null,active=true,disposed=false,frame=0;
 const identity=createCardIdentityOverlay(container,metadata,nodes);let inspectionContext=false;
 const projectionListeners=new Map();
 let controls=createInspectionControls(camera,renderer.domElement,invalidate);
 if(options.controlsLimits)Object.assign(controls,options.controlsLimits);
 function invalidate(){if(active&&!disposed&&!frame)frame=requestAnimationFrame(render);}
 function render(){frame=0;if(!active||disposed)return;controls.update();
  camera.updateMatrixWorld(true);
  const w=container.clientWidth,h=container.clientHeight;
  if(hoverPoint&&!gesture.active())setHover(pick(hoverPoint));
  identity.update(camera,w,h,inspectionContext);
  renderer.render(scene,camera);container.dataset.frames=String(+(container.dataset.frames||0)+1);container.dataset.triangles=String(renderer.info.render.triangles);
  for(const [callback,ids]of projectionListeners)callback(projectModelAnchors(ids,nodes,portById,camera,w,h));
 }
 function resize(){clearHover();const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);Object.assign(camera,(options.frontOnly?frontInspectionFrame:inspectionFrame)(frameSize,w,h));camera.updateProjectionMatrix();invalidate();}
 function pointAt(center,direction,size){clearHover();frameSize=size;controls=applyInspectionPose(camera,controls,center,direction,Math.max(extent*2,1),renderer.domElement,invalidate);if(options.controlsLimits)Object.assign(controls,options.controlsLimits);controls.enabled=active;resize();}
 function reset(){pointAt(wholeCenter,new THREE.Vector3(...(options.frontOnly?[0,.04,1]:[1,.8,1.25])),wholeSize.toArray());}
 const observer=new ResizeObserver(resize);observer.observe(container);
 const raycaster=new THREE.Raycaster(),gesture=createTapGesture(),listeners=[];let hoverPoint=null;
 function listen(type,callback){renderer.domElement.addEventListener(type,callback,true);listeners.push([type,callback]);}
 function pick(point){const r=renderer.domElement.getBoundingClientRect();if(!r.width||!r.height||point.x<r.left||point.x>r.right||point.y<r.top||point.y>r.bottom)return null;camera.updateMatrixWorld(true);raycaster.setFromCamera(new THREE.Vector2((point.x-r.left)/r.width*2-1,-(point.y-r.top)/r.height*2+1),camera);return interaction.pick(raycaster.intersectObjects(meshes,false));}
 function setHover(id){const changed=interaction.hover(id);container.dataset.hover=id||'';return changed;}
 function clearHover(){hoverPoint=null;if(setHover(null))invalidate();}
 if(options.directInspection!==false){
  listen('pointerdown',event=>{if(!active)return;clearHover();gesture.down(event);});
  listen('pointermove',event=>{if(!active)return;gesture.move(event);if(gesture.active()||event.pointerType==='touch')return;hoverPoint={x:event.clientX,y:event.clientY};invalidate();});
  listen('pointerup',event=>{if(!active)return;const tap=gesture.up(event);if(!tap)return;clearHover();const id=pick({x:event.clientX,y:event.clientY});if(id)onPort(id);});
  listen('pointerleave',clearHover);
  listen('wheel',clearHover);
  for(const type of ['pointercancel','lostpointercapture'])listen(type,()=>{gesture.cancel();clearHover();});
 }

 reset();container.dataset.loaded='true';container.dataset.asset=metadata.asset_id;container.dataset.anchors=String(metadata.ports.length);container.dataset.pixelRatio=String(renderer.getPixelRatio());
 return{
  inspect(ids,portId=null,isolate=false,title=''){selected=ids.filter(id=>nodes.has(id));selectedPort=portId&&nodes.has(portId)?portId:null;inspectionContext=Boolean(title||selected.length||isolate);clearHover();
   const selectedSet=new Set(selected);for(const mesh of meshes)mesh.visible=originalVisibility.get(mesh)&&(!isolate||selectedSet.has(interaction.anchor(mesh)));
   interaction.select(portId?[portId]:selected);
   container.dataset.highlightIds=interaction.selectedIds().join(',');container.dataset.highlightKind=interaction.selectedIds().length?(portId?'port':'group'):'';
   container.dataset.selection=selectedPort||selected.join(',');container.dataset.isolated=String(isolate);invalidate();
  },
  subscribeAnchors(ids,callback){projectionListeners.set(callback,[...ids]);invalidate();return()=>projectionListeners.delete(callback);},
  focus(ids){const box=new THREE.Box3(),normal=new THREE.Vector3();for(const id of ids){const n=nodes.get(id);if(!n)continue;box.expandByObject(n);normal.add(new THREE.Vector3().fromArray(gltfDirection(portById.get(id).normal||[0,-1,0])));}
   if(box.isEmpty())return;if(normal.length()<.01)normal.set(0,1,1);const size=box.getSize(new THREE.Vector3()).toArray().map((v,i)=>Math.max(v,options.detailMinimum?.[i]||.035));pointAt(box.getCenter(new THREE.Vector3()),normal,size);container.dataset.view='detail';container.dataset.direction=normal.clone().normalize().toArray().map(v=>v.toFixed(2)).join(',');
  },
  view(action){clearHover();if(action==='reset')reset();else if(action==='in'||action==='out'){camera.zoom=THREE.MathUtils.clamp(camera.zoom*(action==='in'?1.25:.8),controls.minZoom,controls.maxZoom);camera.updateProjectionMatrix();invalidate();}else{const dir={front:[0,.08,1],rear:[0,.08,-1],top:[0,1,0]}[action];if(dir)pointAt(wholeCenter,new THREE.Vector3().fromArray(dir),wholeSize.toArray());}container.dataset.view=action;},
  setActive(value){active=value;controls.enabled=value;if(!value){gesture.cancel();clearHover();}if(!value){cancelAnimationFrame(frame);frame=0;}else{resize();invalidate();}},
  dispose(){disposed=true;projectionListeners.clear();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();gesture.cancel();hoverPoint=null;for(const [type,callback]of listeners)renderer.domElement.removeEventListener(type,callback,true);interaction.dispose();identity.dispose();for(const key of ['hover','highlightIds','highlightKind','selection'])delete container.dataset[key];model.traverse(n=>{if(n.isMesh){n.geometry.dispose();for(const m of Array.isArray(n.material)?n.material:[n.material])m.dispose();}});renderer.dispose();renderer.domElement.remove();label.hidden=true;if(container.dataset.instance===instance)delete container.dataset.loaded;}
 };
}
