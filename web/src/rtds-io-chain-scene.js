import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {publishedModels} from './rtds-models.js';
import {chainTypes} from './rtds-io-chain-state.js';
export async function createChainScene(container,onProjection){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.setAttribute('aria-hidden','true');
 const templates={},scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.01,20),group=new THREE.Group();scene.background=new THREE.Color('#ffffff');scene.add(group);
 scene.add(new THREE.HemisphereLight(0xffffff,0xa2b8af,2.6));for(const [pos,intensity]of [[[1,2,3],3],[[-2,1,1],2]]){const l=new THREE.DirectionalLight(0xffffff,intensity);l.position.fromArray(pos);scene.add(l);}
 let disposed=false,active=true,frame=0,state=null,signature='',anchors={},cables=[],focus=-1,phase=null,frames=0;
 const resources=()=>{const gs=new Set(),ms=new Set(),ts=new Set();for(const t of Object.values(templates))t.traverse(n=>{if(n.isMesh){gs.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material]){ms.add(m);for(const v of Object.values(m))if(v?.isTexture)ts.add(v);}}});for(const v of [...gs,...ms,...ts])v.dispose();};
 try{for(const key of ['novacor-2.0',...chainTypes])templates[key]=(await new GLTFLoader().loadAsync(new URL(publishedModels[key].glb,document.baseURI).href)).scene;}
 catch(error){resources();renderer.dispose();throw error;}
 container.append(renderer.domElement);const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=false;controls.minDistance=.22;controls.maxDistance=5;controls.minPolarAngle=Math.PI*.30;controls.maxPolarAngle=Math.PI*.61;controls.addEventListener('change',invalidate);
 const owned=[];function clear(){for(const c of cables){c.mesh.geometry.dispose();c.mesh.material.dispose();}cables=[];group.clear();for(const x of owned)x.dispose();owned.length=0;anchors={};}
 function find(root,suffix){let found;root.traverse(n=>{if(n.userData.sid?.endsWith('.'+suffix))found=n;});if(!found)throw Error('模型缺少已核对接口 '+suffix);return found;}
 function world(n){return n.getWorldPosition(new THREE.Vector3());}
 function rebuild(s){
  clear();const chassis=templates['novacor-2.0'].clone(true);chassis.scale.setScalar(.45);chassis.rotation.y=Math.PI;chassis.position.set(-.28,-.055,0);group.add(chassis);anchors.source=find(chassis,'gt'+s.port);
  s.cards.forEach((kind,i)=>{const card=templates[kind].clone(true);card.rotation.x=Math.PI/2;card.position.set(i*.20,0,0);group.add(card);anchors['top'+i]=find(card,'gt1');anchors['bottom'+i]=find(card,'gt2');const label=new THREE.Object3D();label.position.set(i*.2,.132,.02);group.add(label);anchors['label'+i]=label;});
  group.updateMatrixWorld(true);
  s.cards.forEach((_,i)=>{for(const endpoint of ['top','bottom']){const a=world(i===0?anchors.source:anchors['bottom'+(i-1)]),b=world(anchors[endpoint+i]);const curve=new THREE.CatmullRomCurve3([a,a.clone().add(new THREE.Vector3(-.04,0,.045)),new THREE.Vector3((a.x+b.x)/2,-.14-i*.003,.06),b.clone().add(new THREE.Vector3(-.035,0,.045)),b]);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,50,.0018,6,false),new THREE.MeshStandardMaterial({color:endpoint==='top'?0x3b8193:0xc24d3e}));group.add(mesh);cables.push({mesh,index:i,endpoint,curve});}});
  const geo=new THREE.SphereGeometry(.005,12,8),mat=new THREE.MeshStandardMaterial({color:0xffcf54,emissive:0xffa000,emissiveIntensity:.7});owned.push(geo,mat);for(const c of cables){c.dot=new THREE.Mesh(geo,mat);group.add(c.dot);}
  container.dataset.modelCount=String(s.cards.length+1);container.dataset.anchorCount=String(Object.keys(anchors).length);signature=s.cards.join(',')+'/'+s.port;setFocus(focus>=s.cards.length?-1:focus);
 }
 function apply(){for(const c of cables){c.mesh.visible=state.links[c.index]===c.endpoint;c.dot.visible=c.mesh.visible&&phase!==null;if(c.dot.visible)c.dot.position.copy(c.curve.getPoint((phase+c.index*.17)%1));}container.dataset.wires=String(cables.filter(c=>c.mesh.visible).length);}
 function render(){frame=0;if(disposed||!active||document.hidden)return;renderer.render(scene,camera);const w=container.clientWidth,h=container.clientHeight,p={};group.updateMatrixWorld(true);for(const [k,n]of Object.entries(anchors)){const v=world(n).project(camera);p[k]={x:(v.x*.5+.5)*w,y:(.5-v.y*.5)*h,visible:v.z>=-1&&v.z<=1&&Math.abs(v.x)<1&&Math.abs(v.y)<1};}onProjection(p);container.dataset.frames=String(++frames);container.dataset.triangles=String(renderer.info.render.triangles);}
 function invalidate(){if(!disposed&&active&&!document.hidden&&!frame)frame=requestAnimationFrame(render);}
 function resize(){if(disposed)return;const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();setFocus(focus);}
 function setFocus(i){focus=i;const n=state?.cards.length||3,x=i>=0?i*.2:(-.40+(n-1)*.20+.07)/2,width=i>=0?.30:.55+(n-1)*.20,d=Math.max(.5,width/Math.max(.6,camera.aspect)/(.55));controls.target.set(x,0,.02);camera.position.set(x+.02,.06,d);controls.update();invalidate();}
 const obs=new ResizeObserver(resize);obs.observe(container);
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};document.addEventListener('visibilitychange',visibility);
 const lost=e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;container.dispatchEvent(new CustomEvent('chain-scene-error'));};renderer.domElement.addEventListener('webglcontextlost',lost);
 container.dataset.loaded='true';
 return {update(s,p=null){state=s;phase=p;if(signature!==s.cards.join(',')+'/'+s.port)rebuild(s);apply();invalidate();},setActive(v){active=!!v;controls.enabled=active;if(!active){cancelAnimationFrame(frame);frame=0;}else invalidate();},focus:setFocus,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);obs.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);controls.dispose();clear();resources();renderer.dispose();renderer.domElement.remove();container.dataset.loaded='false';}};
}
