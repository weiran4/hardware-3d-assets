import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {defaultCamera,viewFrustum,pulseVisualState,layoutPortLabels,scopePulsePoints} from './scene-config.js';

const SID = {out:'trigger-controller.out',ch1:'oscilloscope.ch1',trig:'oscilloscope.trig'};
export async function createLabScene(container, labelLayer, onSelect) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-.4,.4,.3,-.3,.01,8);
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NoToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  container.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;
  controls.minPolarAngle=.25;controls.maxPolarAngle=Math.PI/2.12;controls.minZoom=.7;controls.maxZoom=2.5;
  controls.target.fromArray(defaultCamera.target);
  const initialPosition=new THREE.Vector3().fromArray(defaultCamera.position);
  camera.position.copy(initialPosition);controls.update();controls.saveState();
  scene.add(new THREE.HemisphereLight(0xfff9e9,0x8a9a9d,2.2));
  const key=new THREE.DirectionalLight(0xfff2da,2.1);key.position.set(-.5,1.3,.6);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-.7,right:.7,top:.7,bottom:-.7,near:.1,far:3});key.shadow.bias=-.0003;key.shadow.normalBias=.002;scene.add(key);
  const fill=new THREE.DirectionalLight(0xb7ced8,.6);fill.position.set(.6,.6,-.6);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.ShadowMaterial({color:0x647689,opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=-.0005;floor.receiveShadow=true;scene.add(floor);
  const gltf=await new GLTFLoader().loadAsync(new URL('./assets/hardware.glb',document.baseURI).href);
  const model=gltf.scene;scene.add(model);const nodes=new Map();const meshes=[];
  model.traverse(n=>{if(n.userData.sid)nodes.set(n.userData.sid,n);if(n.isMesh)meshes.push(n);});
  for(const key of Object.values(SID))if(!nodes.has(key))throw Error('缺少语义接口 '+key);
  const outlineMaterial=new THREE.LineBasicMaterial({color:0x344248,transparent:true,opacity:.72});
  for(const mesh of meshes){mesh.castShadow=true;mesh.receiveShadow=true;const old=mesh.material;mesh.material=new THREE.MeshStandardMaterial({color:old.color,roughness:.85,metalness:0});
    const sid=mesh.userData.sid||'';
    if(!/grid|trace|label|caption|brand|screw|vent|pin|well|rib|pointer/.test(sid)){
      const line=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,40),outlineMaterial);line.userData.isOutline=true;mesh.add(line);
    }
  }
  // The source asset contains a decorative sine; the lesson displays its own square pulse.
  nodes.get('oscilloscope.trace').visible=false;
  const scopePath=new THREE.CurvePath();
  for(let i=1;i<scopePulsePoints.length;i++)scopePath.add(new THREE.LineCurve3(new THREE.Vector3().fromArray(scopePulsePoints[i-1]),new THREE.Vector3().fromArray(scopePulsePoints[i])));
  const scopePulseTrace=new THREE.Mesh(new THREE.TubeGeometry(scopePath,60,.00055,6,false),new THREE.MeshBasicMaterial({color:0xb9d9c2}));scopePulseTrace.name='conceptual-square-pulse';scopePulseTrace.visible=false;nodes.get('oscilloscope.root').add(scopePulseTrace);
  model.updateMatrixWorld(true);
  const anchors=Object.fromEntries(Object.entries(SID).map(([key,sid])=>[key,nodes.get(sid)]));
  const looseCable=nodes.get('signal-cable.root');
  const labels={};
  for(const [key,anchor] of Object.entries(anchors)){
    const btn=document.createElement('button');btn.className='anchor-label';btn.dataset.port=key;btn.textContent=key.toUpperCase();btn.setAttribute('aria-label',`三维接口 ${key.toUpperCase()}`);btn.addEventListener('click',()=>onSelect({type:'port',port:key}));const leader=document.createElement('span');leader.className='anchor-leader';labelLayer.append(leader,btn);labels[key]={btn,anchor,leader};
  }
  let connected=false,cableGroup=null,cableCurve=null,pulseStart=-Infinity,selected='overview';
  const pulse=new THREE.Mesh(new THREE.SphereGeometry(.0048,12,8),new THREE.MeshBasicMaterial({color:0xf0b78b}));pulse.visible=false;scene.add(pulse);
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v=new THREE.Vector3(),normal=new THREE.Vector3(),quat=new THREE.Quaternion();
  function getPort(key){const n=anchors[key];return {point:n.getWorldPosition(new THREE.Vector3()),normal:new THREE.Vector3(0,1,0).applyQuaternion(n.getWorldQuaternion(new THREE.Quaternion())).normalize()};}
  function addConnection(){
    cableGroup=new THREE.Group();cableGroup.name='conceptual-connection';
    const a=getPort('out'),b=getPort('ch1');
    for(const [suffix,port] of [['a',a],['b',b]]){
      const plug=nodes.get('signal-cable.connector_'+suffix).clone(true);plug.position.copy(port.point).addScaledVector(port.normal,.0095);plug.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),port.normal.clone().negate());cableGroup.add(plug);
    }
    const p0=a.point.clone().addScaledVector(a.normal,.027),p1=b.point.clone().addScaledVector(b.normal,.027);
    cableCurve=new THREE.CatmullRomCurve3([p0,p0.clone().addScaledVector(a.normal,.035),new THREE.Vector3(p0.x-.018,.013,.235),new THREE.Vector3((p0.x+p1.x)/2,.012,.29),new THREE.Vector3(p1.x+.04,.014,.21),p1.clone().addScaledVector(b.normal,.035),p1],false,'centripetal');
    const tube=new THREE.Mesh(new THREE.TubeGeometry(cableCurve,100,.0032,8,false),new THREE.MeshStandardMaterial({color:0x34434b,roughness:.95}));tube.castShadow=true;cableGroup.add(tube);scene.add(cableGroup);looseCable.visible=false;
  }
  function removeConnection(){if(cableGroup){scene.remove(cableGroup);cableGroup.traverse(n=>{if(n.isMesh&&n.geometry.type==='TubeGeometry'){n.geometry.dispose();n.material.dispose();}});cableGroup=null;}looseCable.visible=true;connected=false;pulse.visible=false;pulseStart=-Infinity;scopePulseTrace.visible=false;}
  const raycaster=new THREE.Raycaster();let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;const r=container.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);const hits=raycaster.intersectObjects(meshes,false).filter(h=>{let n=h.object;while(n){if(!n.visible)return false;n=n.parent;}return true;});if(!hits.length)return;const n=hits[0].object,sid=n.userData.sid||'',asset=n.userData.asset_id;const port=Object.entries(SID).find(([k])=>sid.includes(`port_${k}`));if(port)onSelect({type:'port',port:port[0]});else onSelect({type:'inspect',target:asset==='oscilloscope'?'scope':asset==='trigger-controller'?'controller':'cable'});});
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);Object.assign(camera,viewFrustum(w,h));camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function updateLabels(){const w=container.clientWidth,h=container.clientHeight;const visible=[];
    for(const [key,{btn,anchor,leader}] of Object.entries(labels)){
      anchor.getWorldPosition(v);const portNormal=normal.set(0,1,0).applyQuaternion(anchor.getWorldQuaternion(quat));const facing=camera.position.clone().sub(v).normalize().dot(portNormal)>.08;v.addScaledVector(portNormal,.012).project(camera);const x=(v.x*.5+.5)*w,y=(-v.y*.5+.5)*h;
      btn.hidden=leader.hidden=!facing||v.z>1||x<10||x>w-10||y<0||y>h-20;btn.classList.toggle('selected',selected===key||(connected&&key!=='trig'));if(!btn.hidden)visible.push({key,x,y,anchorX:x,anchorY:y});
    }
    for(const p of layoutPortLabels(visible,w,h)){const{btn,leader}=labels[p.key];btn.style.left=p.x+'px';btn.style.top=p.y+'px';leader.style.left=p.anchorX+'px';leader.style.top=p.anchorY+'px';leader.style.width=Math.hypot(p.x-p.anchorX,p.y-p.anchorY)+'px';leader.style.transform=`rotate(${Math.atan2(p.y-p.anchorY,p.x-p.anchorX)}rad)`;}
  }
  let disposed=false,active=true,frameId=0;
  function frame(now){if(disposed||!active)return;controls.update();updateLabels();const visual=pulseVisualState(now,pulseStart,reducedMotion);pulse.visible=connected&&visual.particleVisible;if(pulse.visible)pulse.position.copy(cableCurve.getPoint(visual.elapsed));scopePulseTrace.visible=connected&&visual.traceVisible;renderer.render(scene,camera);frameId=requestAnimationFrame(frame);}
  frameId=requestAnimationFrame(frame);
  container.dataset.loaded='true';container.dataset.meshes=meshes.length;container.dataset.anchors=Object.keys(anchors).join(',');
  return {
    setActive(value){if(active===value)return;active=value;if(!value){cancelAnimationFrame(frameId);}else{resize();frameId=requestAnimationFrame(frame);}},
    update(state){selected=state.selected;if(state.stage==='connected'&&!connected){connected=true;addConnection();}else if(state.stage!=='connected'&&connected)removeConnection();container.dataset.connection=connected?'out-ch1':'none';},
    pulse(){pulseStart=performance.now();if(reducedMotion)scopePulseTrace.visible=true;},
    view(action){if(action==='reset'){controls.reset();camera.position.copy(initialPosition);controls.target.fromArray(defaultCamera.target);camera.zoom=1;}else if(action==='in')camera.zoom=Math.min(2.5,camera.zoom*1.16);else if(action==='out')camera.zoom=Math.max(.7,camera.zoom/1.16);else{const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),action==='left'?.22:-.22);camera.position.copy(controls.target).add(offset);}camera.updateProjectionMatrix();controls.update();container.dataset.view=`${camera.position.x.toFixed(3)},${camera.position.z.toFixed(3)},${camera.zoom.toFixed(3)}`;},
    dispose(){disposed=true;observer.disconnect();controls.dispose();renderer.dispose();}
  };
}
