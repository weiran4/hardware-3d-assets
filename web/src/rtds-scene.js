import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createInspectionControls,applyInspectionPose} from './rtds-camera.js';
import {gltfDirection,inspectionFrame,isPortFacingCamera} from './rtds-state.js';

// Independent RTDS viewer. Authored materials, semantic IDs and Y-up export are retained.
// Highlight outlines are inspection UI, not physical LEDs or live device behaviour.
export async function createRtdsScene(container,label,modelInfo,metadata,onPort,isCurrent=()=>true){
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
 const portById=new Map(metadata.ports.map(p=>[p.id,p]));
 const wholeBox=new THREE.Box3().setFromObject(model),wholeSize=wholeBox.getSize(new THREE.Vector3()),wholeCenter=wholeBox.getCenter(new THREE.Vector3());
 const extent=Math.max(...wholeSize.toArray());let frameSize=wholeSize.toArray(),selected=[],selectedPort=null,active=true,disposed=false,frame=0,highlights=[];
 let controls=createInspectionControls(camera,renderer.domElement,invalidate);
 function invalidate(){if(active&&!disposed&&!frame)frame=requestAnimationFrame(render);}
 function render(){frame=0;if(!active||disposed)return;controls.update();
  label.hidden=!selectedPort;if(selectedPort){const world=nodes.get(selectedPort).getWorldPosition(new THREE.Vector3()),p=world.clone().project(camera);const w=container.clientWidth,h=container.clientHeight;label.hidden=p.z>1||p.z< -1||!isPortFacingCamera(portById.get(selectedPort).normal,camera.position.toArray(),world.toArray());label.style.left=Math.max(60,Math.min(w-60,(p.x*.5+.5)*w))+'px';label.style.top=Math.max(40,Math.min(h-35,(-p.y*.5+.5)*h-14))+'px';label.textContent=portById.get(selectedPort).label;}
  renderer.render(scene,camera);container.dataset.frames=String(+(container.dataset.frames||0)+1);container.dataset.triangles=String(renderer.info.render.triangles);
 }
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);Object.assign(camera,inspectionFrame(frameSize,w,h));camera.updateProjectionMatrix();invalidate();}
 function pointAt(center,direction,size){frameSize=size;controls=applyInspectionPose(camera,controls,center,direction,Math.max(extent*2,1),renderer.domElement,invalidate);controls.enabled=active;resize();}
 function reset(){pointAt(wholeCenter,new THREE.Vector3(1,.8,1.25),wholeSize.toArray());}
 const observer=new ResizeObserver(resize);observer.observe(container);
 function getAnchor(node){while(node&&node!==model){if(portById.has(node.userData.sid)&&portById.get(node.userData.sid).interactive!==false)return node.userData.sid;node=node.parent;}return null;}
 const raycaster=new THREE.Raycaster();let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
 renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;down=null;const r=container.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hits=raycaster.intersectObjects(meshes,false).filter(h=>h.object.visible);const id=hits.length?getAnchor(hits[0].object):null;if(id)onPort(id);});
 function clearHighlights(){for(const h of highlights){scene.remove(h);h.geometry.dispose();h.material.dispose();}highlights=[];}
 reset();container.dataset.loaded='true';container.dataset.asset=metadata.asset_id;container.dataset.anchors=String(metadata.ports.length);container.dataset.pixelRatio=String(renderer.getPixelRatio());
 return{
  inspect(ids,portId=null,isolate=false){selected=ids.filter(id=>nodes.has(id));selectedPort=portId&&nodes.has(portId)?portId:null;clearHighlights();
   const selectedSet=new Set(selected);for(const mesh of meshes)mesh.visible=!isolate||selectedSet.has(getAnchor(mesh));
   for(const id of selected){const box=new THREE.Box3().setFromObject(nodes.get(id));if(box.isEmpty())continue;box.expandByScalar(.0007);const h=new THREE.Box3Helper(box,id===selectedPort?0xc4633d:0x9b8764);h.material.depthTest=false;h.material.transparent=true;h.material.opacity=id===selectedPort?.95:.6;h.renderOrder=10;scene.add(h);highlights.push(h);}
   container.dataset.selection=selectedPort||selected.join(',');container.dataset.isolated=String(isolate);invalidate();
  },
  focus(ids){const box=new THREE.Box3(),normal=new THREE.Vector3();for(const id of ids){const n=nodes.get(id);if(!n)continue;box.expandByObject(n);normal.add(new THREE.Vector3().fromArray(gltfDirection(portById.get(id).normal||[0,-1,0])));}
   if(box.isEmpty())return;if(normal.length()<.01)normal.set(0,1,1);const size=box.getSize(new THREE.Vector3()).toArray().map(v=>Math.max(v,.035));pointAt(box.getCenter(new THREE.Vector3()),normal,size);container.dataset.view='detail';container.dataset.direction=normal.clone().normalize().toArray().map(v=>v.toFixed(2)).join(',');
  },
  view(action){if(action==='reset')reset();else if(action==='in'||action==='out'){camera.zoom=THREE.MathUtils.clamp(camera.zoom*(action==='in'?1.25:.8),.5,8);camera.updateProjectionMatrix();invalidate();}else{const dir={front:[0,.08,1],rear:[0,.08,-1],top:[0,1,0]}[action];if(dir)pointAt(wholeCenter,new THREE.Vector3().fromArray(dir),wholeSize.toArray());}container.dataset.view=action;},
  setActive(value){active=value;controls.enabled=value;if(!value){cancelAnimationFrame(frame);frame=0;}else{resize();invalidate();}},
  dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();clearHighlights();model.traverse(n=>{if(n.isMesh){n.geometry.dispose();for(const m of Array.isArray(n.material)?n.material:[n.material])m.dispose();}});renderer.dispose();renderer.domElement.remove();label.hidden=true;if(container.dataset.instance===instance)delete container.dataset.loaded;}
 };
}
