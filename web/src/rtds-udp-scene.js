import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {publishedModels} from './rtds-models.js';

// Original teaching apparatus is schematic; only NovaCor uses inspected model anchors.
const colors={fiber:0x9a6330,gt:0x9a6330,'gt-fiber':0x9a6330,'st-timing-fiber':0xc18b34,'st-ethernet-fiber':0x2478ac,coax:0x60717f,ethernet:0x2478ac};
export async function createUdpScene(container,project){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xffffff,1);renderer.domElement.setAttribute('aria-hidden','true');
 let template;try{template=(await new GLTFLoader().loadAsync(new URL(publishedModels['novacor-2.0'].glb,document.baseURI).href)).scene;}catch(e){renderer.dispose();throw e;}
 const scene=new THREE.Scene(),group=new THREE.Group(),wireGroup=new THREE.Group(),camera=new THREE.PerspectiveCamera(36,1,.01,30);scene.add(group,wireGroup);scene.add(new THREE.HemisphereLight(0xffffff,0x7a9293,2.7));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-1,2,4);scene.add(light);
 const owned=new Set();let compact=container.clientWidth<600,anchors={},cables=[],state=null,phase=null,layout=0,signature='',active=true,disposed=false,frame=0,frames=0;
 container.append(renderer.domElement);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=.3;controls.maxDistance=12;controls.addEventListener('change',invalidate);
 function own(x){owned.add(x);return x;}
 function box(parent,size,pos,color){const m=new THREE.Mesh(own(new THREE.BoxGeometry(...size)),own(new THREE.MeshStandardMaterial({color,roughness:.62})));m.position.fromArray(pos);parent.add(m);return m;}
 function label(text,pos,width=.24,parent=group){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,768,96);c.fillStyle='#193a4c';c.font='bold 56px sans-serif';c.textAlign='center';c.fillText(text,384,61);const texture=own(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:texture,depthTest:false})));sprite.scale.set(width,width/8,1);sprite.position.fromArray(pos);sprite.renderOrder=20;parent.add(sprite);return sprite;}
 function port(parent,key,pos,color){anchors[key]=box(parent,[.012,.009,.008],pos,color);}
 function clearWires(){for(const c of cables){c.mesh.geometry.dispose();c.mesh.material.dispose();c.dot.geometry.dispose();c.dot.material.dispose();}cables=[];wireGroup.clear();signature='';}
 function clearLayout(){clearWires();group.clear();for(const r of owned)r.dispose();owned.clear();anchors={};}
 function find(root,suffix){let result;root.traverse(n=>{if(n.userData.sid?.endsWith('.'+suffix))result=n;});if(!result)throw Error('Confirmed NovaCor anchor unavailable: '+suffix);return result;}

 function rebuild(){
 clearLayout();layout=1;
 const model=template.clone(true);model.scale.setScalar(.6);model.rotation.y=Math.PI;model.position.set(compact?0:.40,compact?-.28:.12,0);group.add(model);

 group.updateMatrixWorld(true);
 for(const key of ['udp','wif','gt21'])anchors['N.'+key]=find(model,key);
 const ring=new THREE.BoxHelper(anchors['N.udp'],0xff7d00);ring.material.depthTest=false;ring.renderOrder=30;group.add(ring);owned.add(ring.geometry);owned.add(ring.material);
 label('NovaCor 2.0 · ETH UDP',[compact?0:.48,compact?-.12:.27,.06],.38);
 const pc=new THREE.Group();pc.position.set(compact?-.12:-.42,compact?.40:.18,0);group.add(pc);
 box(pc,[.22,.16,.07],[0,.04,0],0x263c4a);box(pc,[.20,.13,.008],[0,.04,.04],0x77b9d5);
 box(pc,[.03,.06,.04],[0,-.07,0],0x9aabb7);box(pc,[.23,.015,.12],[0,-.105,.02],0xaab8c2);
 box(pc,[.075,.14,.10],[.17,-.03,0],0xd4dce1);port(pc,'PC.nic',[.17,-.07,.055],0x2478ac);
 label('PC · NIC / STORAGE',[0,.17,.06],.32,pc);
 const sw=new THREE.Group();sw.position.set(compact?.15:-.32,compact?.12:-.14,.03);group.add(sw);
 box(sw,[.28,.065,.12],[0,0,0],0x6c8391);
 for(let i=0;i<4;i++)box(sw,[.025,.018,.006],[-.105+i*.07,0,.064],0x243c46);
 port(sw,'SW.in',[-.105,0,.07],0x2478ac);port(sw,'SW.out',[.105,0,.07],0x2478ac);
 label('ETHERNET SWITCH',[0,-.065,.08],.30,sw);
 group.updateMatrixWorld(true);container.dataset.modelCount='3';container.dataset.anchorCount=String(Object.keys(anchors).length);fit();
 }
 function world(key){return anchors[key]?.getWorldPosition(new THREE.Vector3());}
 function buildWires(){const sig=JSON.stringify(state.links);if(sig===signature)return;clearWires();signature=sig;group.updateMatrixWorld(true);
  state.links.forEach((link,i)=>{const a=world(link.a),b=world(link.b);if(!a||!b)return;const color=colors[link.network]||0xc64b40;const lift=.18+(i%7)*.012;const curve=new THREE.CatmullRomCurve3([a,a.clone().add(new THREE.Vector3(0,0,.045)),new THREE.Vector3((a.x+b.x)/2,(a.y+b.y)/2,lift),b.clone().add(new THREE.Vector3(0,0,.045)),b]);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.0018,5,false),new THREE.MeshStandardMaterial({color,roughness:.6}));wireGroup.add(mesh);const dot=new THREE.Mesh(new THREE.SphereGeometry(.005,10,7),new THREE.MeshBasicMaterial({color:0xffc22b}));wireGroup.add(dot);cables.push({mesh,dot,curve,network:link.network,index:i,signal:link.signal,reverse:link.reverse,returnPath:link.returnPath});});container.dataset.wires=String(cables.length);container.dataset.links=JSON.stringify(state.links);
 }
 function render(force=false){frame=0;if(disposed||(!active&&!force)||document.hidden||!state||!container.clientWidth||!container.clientHeight)return;buildWires();for(const c of cables){const on=!!state.enabled[c.network];c.mesh.material.opacity=on?1:.24;c.mesh.material.transparent=!on;c.dot.visible=on&&Number.isFinite(phase);if(c.dot.visible){const f=((phase%1)+1)%1;c.dot.position.copy(c.curve.getPoint((c.reverse||(c.returnPath&&Math.floor(phase)===2))?1-f:f));}}

  renderer.render(scene,camera);const points={};for(const key of Object.keys(anchors)){const v=world(key).project(camera);points[key]={x:(v.x*.5+.5)*container.clientWidth,y:(.5-v.y*.5)*container.clientHeight,visible:Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z>-1&&v.z<1};}project(points);container.dataset.loaded='true';container.dataset.frames=String(++frames);container.dataset.triangles=String(renderer.info.render.triangles);
 }
 function invalidate(){if(!disposed&&active&&!document.hidden&&!frame)frame=requestAnimationFrame(()=>render());}
 function fit(){const width=compact?.75:1.35,height=compact?1.05:.65;const centerY=compact?.15:.06;const distance=Math.max(height,width/Math.max(.3,camera.aspect))/(2*Math.tan(THREE.MathUtils.degToRad(18)))*1.2;controls.target.set(-.02,centerY,.035);camera.position.set(-.02,centerY+.12,distance);controls.update();invalidate();}
 function resize(){if(disposed)return;const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;const nextCompact=w<600;if(nextCompact!==compact){compact=nextCompact;if(layout)rebuild();}renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();fit();}
 const ro=new ResizeObserver(resize);ro.observe(container);resize();const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};document.addEventListener('visibilitychange',visibility);
 const lost=e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;container.dataset.loaded='false';container.dispatchEvent(new CustomEvent('udp-scene-error'));};renderer.domElement.addEventListener('webglcontextlost',lost);
 // A single static readiness frame is independent of stale intersection delivery.
 // It does not start animation, and is requested only for the selected lesson.
 return {paintStatic(){cancelAnimationFrame(frame);frame=0;render(true);},update(s,p=null){state=s;phase=p;if(!layout)rebuild();invalidate();},setActive(v){active=!!v;controls.enabled=active;if(!active){cancelAnimationFrame(frame);frame=0;}else invalidate();},fit,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);controls.dispose();clearLayout();const resources=new Set();template.traverse(n=>{if(n.geometry)resources.add(n.geometry);for(const m of n.material?Array.isArray(n.material)?n.material:[n.material]:[]){resources.add(m);for(const v of Object.values(m))if(v?.isTexture)resources.add(v);}});for(const r of resources)r.dispose();renderer.dispose();renderer.domElement.remove();container.dataset.loaded='false';}};
}

