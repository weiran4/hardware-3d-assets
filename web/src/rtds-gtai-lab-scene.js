import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {evaluateGtai} from './rtds-gtai-lab-state.js';
import {publishedModels} from './rtds-models.js';
import {create81150AExterior} from './rtds-gtai-81150a.js';
export async function createGtaiScene(container,project){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 renderer.setClearColor(0xf8faf9,1);renderer.domElement.setAttribute('aria-hidden','true');
 let board;try{board=(await new GLTFLoader().loadAsync(new URL(publishedModels['gtai-v2'].glb,document.baseURI).href)).scene;}catch(e){renderer.dispose();throw e;}
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-.3,.3,.2,-.2,.01,5);
 camera.position.set(.12,.16,1);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0x698187,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-.3,1,1);scene.add(light);
 const anchors={},wireGroup=new THREE.Group();scene.add(wireGroup);
 const geo=new Set(),mats=new Set();
 function box(size,pos,color,parent=scene){const g=new THREE.BoxGeometry(...size),m=new THREE.MeshStandardMaterial({color,roughness:.55});geo.add(g);mats.add(m);const n=new THREE.Mesh(g,m);n.position.fromArray(pos);parent.add(n);return n;}
 board.rotation.x=Math.PI/2;board.position.set(.1,0,0);scene.add(board);
 board.traverse(n=>{for(const [k,i]of [['ip',0],['im',1],['ig',2]])if(n.userData.sid===`gtai-v2-2.31.input1.wire_recess${i}`)anchors[k]=n;});
 if(!anchors.ip||!anchors.im||!anchors.ig){renderer.dispose();throw Error('GTAI CH1 contact anchors missing');}
 const generator=new THREE.Group();generator.position.set(-.12,0,.02);scene.add(generator);generator.name='original-differential-signal-generator';
 const exterior=create81150AExterior();exterior.position.z=.035;generator.add(exterior);
 // Detached ideal teaching nodes, deliberately NOT the nine real BNC shells.
 for(const [i,k]of ['gp','gm','gg'].entries()){
  const g=new THREE.SphereGeometry(.0035,16,8),m=new THREE.MeshStandardMaterial({color:[0xd35a47,0x467da5,0x40966e][i]});geo.add(g);mats.add(m);const a=new THREE.Mesh(g,m);a.position.set(-.038+i*.038,-.028,.045);a.userData.idealTeachingNode=true;generator.add(a);anchors[k]=a;
 }
 // Floating teaching readout, not a physical device or extra hardware interface.
 const readout=document.createElement('canvas');readout.width=768;readout.height=144;const ctx=readout.getContext('2d'),texture=new THREE.CanvasTexture(readout);texture.colorSpace=THREE.SRGBColorSpace;const readoutMaterial=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthTest:false});mats.add(readoutMaterial);const readoutGeo=new THREE.PlaneGeometry(.34,.064);geo.add(readoutGeo);const panel=new THREE.Mesh(readoutGeo,readoutMaterial);panel.position.set(0,-.095,.1);panel.renderOrder=10;scene.add(panel);
 let state={wires:[],power:false,amplitude:5},phase=0,active=true,disposed=false,frame=0,signature='',inspection=false;
 function updateWires(){const sig=JSON.stringify(state.wires);if(sig===signature)return;signature=sig;
  while(wireGroup.children.length){const n=wireGroup.children[0];wireGroup.remove(n);n.geometry.dispose();n.material.dispose();}
  scene.updateMatrixWorld(true);for(const [a,b]of state.wires){if(!anchors[a]||!anchors[b])continue;const p=anchors[a].getWorldPosition(new THREE.Vector3()),q=anchors[b].getWorldPosition(new THREE.Vector3());
   const curve=new THREE.CatmullRomCurve3([p,new THREE.Vector3(-.035,p.y,.12),new THREE.Vector3(.04,q.y,.12),q]);
   wireGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve,32,.0015,8,false),new THREE.MeshStandardMaterial({color:a==='gg'?0x40966e:a==='gp'?0xd35a47:0x467da5})));}
 }
 function draw(){frame=0;if(disposed||!active||document.hidden)return;updateWires();const reading=evaluateGtai(state,phase);ctx.clearRect(0,0,768,144);ctx.fillStyle='#edfafa';ctx.fillRect(0,0,768,144);ctx.fillStyle='#173942';ctx.font='28px sans-serif';ctx.fillText('TEACHING READOUT: input / SC',20,38);ctx.font='36px monospace';ctx.fillText(reading.engineering===null?'OUTPUT OFF':`${reading.voltage.toFixed(2)} V / ${state.scale} = ${reading.engineering.toFixed(3)} u`,20,90);texture.needsUpdate=true;renderer.render(scene,camera);
  const points={};for(const [k,n]of Object.entries(anchors)){const p=n.getWorldPosition(new THREE.Vector3()).project(camera);points[k]={x:(p.x*.5+.5)*container.clientWidth,y:(.5-p.y*.5)*container.clientHeight};}project(points);container.dataset.loaded='true';container.dataset.wires=state.wires.length;container.dataset.triangles=renderer.info.render.triangles;}
 function invalidate(){if(active&&!disposed&&!frame)frame=requestAnimationFrame(draw);}
 function resize(){if(disposed)return;const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h,span=inspection?Math.max(.065,.19/aspect):Math.max(.28,.43/aspect);camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();invalidate();}
 function lost(e){e.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;container.dispatchEvent(new CustomEvent('gtai-scene-error'));}
 renderer.domElement.addEventListener('webglcontextlost',lost);container.append(renderer.domElement);const ro=new ResizeObserver(resize);ro.observe(container);resize();
 return {setInspect(v){inspection=!!v;board.visible=!inspection;wireGroup.visible=!inspection;panel.visible=!inspection;for(const k of ['gp','gm','gg'])anchors[k].visible=!inspection;camera.position.set(inspection?-.12:.12,inspection?0:.16,1);camera.lookAt(inspection?-.12:0,0,0);resize();},update(s,p){state=s;phase=p;invalidate();},setActive(v){active=!!v;if(!active){cancelAnimationFrame(frame);frame=0;}else resize();},dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(n=>{if(n.geometry)n.geometry.dispose();for(const m of n.material?Array.isArray(n.material)?n.material:[n.material]:[]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});for(const g of geo)g.dispose();for(const m of mats)m.dispose();renderer.dispose();renderer.domElement.remove();}};
}
