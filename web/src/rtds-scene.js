import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createInspectionControls,applyInspectionPose} from './rtds-camera.js';
import {gltfDirection,inspectionFrame,isPortFacingCamera,highlightSelection,projectHighlightBounds,highlightCornerPath} from './rtds-state.js';

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
 const svg=tag=>document.createElementNS('http://www.w3.org/2000/svg',tag);
 const overlay=svg('svg'),underlay=svg('rect'),outline=svg('rect'),cornerUnderlay=svg('path'),corners=svg('path');
 overlay.classList.add('rtds-highlight');overlay.setAttribute('aria-hidden','true');overlay.setAttribute('hidden','');
 for(const [node,className]of [[underlay,'rtds-highlight-underlay'],[outline,'rtds-highlight-main'],[cornerUnderlay,'rtds-highlight-corners-underlay'],[corners,'rtds-highlight-corners']]){node.classList.add(className);node.setAttribute('vector-effect','non-scaling-stroke');if(node.tagName==='rect')node.setAttribute('rx','4');overlay.append(node);}container.append(overlay);
 const portById=new Map(metadata.ports.map(p=>[p.id,p]));
 const wholeBox=new THREE.Box3().setFromObject(model),wholeSize=wholeBox.getSize(new THREE.Vector3()),wholeCenter=wholeBox.getCenter(new THREE.Vector3());
 const extent=Math.max(...wholeSize.toArray());let frameSize=wholeSize.toArray(),selected=[],selectedPort=null,active=true,disposed=false,frame=0,highlight={ids:[],box:null},highlightTitle='';
 let controls=createInspectionControls(camera,renderer.domElement,invalidate);
 function invalidate(){if(active&&!disposed&&!frame)frame=requestAnimationFrame(render);}
 function render(){frame=0;if(!active||disposed)return;controls.update();
  camera.updateMatrixWorld(true);
  const w=container.clientWidth,h=container.clientHeight;
  const facing=highlight.ids.some(id=>{const world=nodes.get(id).getWorldPosition(new THREE.Vector3());return isPortFacingCamera(portById.get(id).normal||[0,-1,0],camera.position.toArray(),world.toArray());});
  const bounds=facing?projectHighlightBounds(highlight.box,camera,w,h):null;
  overlay.toggleAttribute('hidden',!bounds);label.hidden=!bounds;
  if(bounds){overlay.setAttribute('viewBox',`0 0 ${w} ${h}`);for(const [key,value]of Object.entries(bounds))for(const node of [underlay,outline])node.setAttribute(key,String(value));const path=highlightCornerPath(bounds);corners.setAttribute('d',path);cornerUnderlay.setAttribute('d',path);label.textContent=highlightTitle;const halfLabel=label.offsetWidth/2+4;label.style.left=Math.max(halfLabel,Math.min(w-halfLabel,bounds.x+bounds.width/2))+'px';label.style.top=Math.max(34,bounds.y-7)+'px';}
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
 function clearHighlights(){highlight={ids:[],box:null};highlightTitle='';overlay.setAttribute('hidden','');overlay.removeAttribute('data-ids');overlay.removeAttribute('data-kind');label.hidden=true;}

 reset();container.dataset.loaded='true';container.dataset.asset=metadata.asset_id;container.dataset.anchors=String(metadata.ports.length);container.dataset.pixelRatio=String(renderer.getPixelRatio());
 return{
  inspect(ids,portId=null,isolate=false,title=''){selected=ids.filter(id=>nodes.has(id));selectedPort=portId&&nodes.has(portId)?portId:null;clearHighlights();
   const selectedSet=new Set(selected);for(const mesh of meshes)mesh.visible=!isolate||selectedSet.has(getAnchor(mesh));
   highlight=highlightSelection(selected,portId,nodes);highlightTitle=title||(selectedPort?portById.get(selectedPort).label:`${highlight.ids.length} 个接口`);
   if(highlight.ids.length){overlay.dataset.ids=highlight.ids.join(',');overlay.dataset.kind=portId?'port':'group';}
   container.dataset.selection=selectedPort||selected.join(',');container.dataset.isolated=String(isolate);invalidate();
  },
  focus(ids){const box=new THREE.Box3(),normal=new THREE.Vector3();for(const id of ids){const n=nodes.get(id);if(!n)continue;box.expandByObject(n);normal.add(new THREE.Vector3().fromArray(gltfDirection(portById.get(id).normal||[0,-1,0])));}
   if(box.isEmpty())return;if(normal.length()<.01)normal.set(0,1,1);const size=box.getSize(new THREE.Vector3()).toArray().map(v=>Math.max(v,.035));pointAt(box.getCenter(new THREE.Vector3()),normal,size);container.dataset.view='detail';container.dataset.direction=normal.clone().normalize().toArray().map(v=>v.toFixed(2)).join(',');
  },
  view(action){if(action==='reset')reset();else if(action==='in'||action==='out'){camera.zoom=THREE.MathUtils.clamp(camera.zoom*(action==='in'?1.25:.8),.5,8);camera.updateProjectionMatrix();invalidate();}else{const dir={front:[0,.08,1],rear:[0,.08,-1],top:[0,1,0]}[action];if(dir)pointAt(wholeCenter,new THREE.Vector3().fromArray(dir),wholeSize.toArray());}container.dataset.view=action;},
  setActive(value){active=value;controls.enabled=value;if(!value){cancelAnimationFrame(frame);frame=0;}else{resize();invalidate();}},
  dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();clearHighlights();overlay.remove();model.traverse(n=>{if(n.isMesh){n.geometry.dispose();for(const m of Array.isArray(n.material)?n.material:[n.material])m.dispose();}});renderer.dispose();renderer.domElement.remove();label.hidden=true;if(container.dataset.instance===instance)delete container.dataset.loaded;}
 };
}
