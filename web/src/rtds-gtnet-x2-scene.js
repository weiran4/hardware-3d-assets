import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {publishedModels} from './rtds-models.js';

// Original teaching apparatus is schematic; only NovaCor uses inspected model anchors.
const colors={gt:0x9a6330,ethernet:0x2478ac};
export async function createX2Scene(container,project){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xffffff,1);renderer.domElement.setAttribute('aria-hidden','true');
 let template;try{template=(await new GLTFLoader().loadAsync(new URL(publishedModels['novacor-2.0'].glb,document.baseURI).href)).scene;}catch(e){renderer.dispose();throw e;}
 const scene=new THREE.Scene(),group=new THREE.Group(),wireGroup=new THREE.Group(),camera=new THREE.PerspectiveCamera(36,1,.01,30);scene.add(group,wireGroup);scene.add(new THREE.HemisphereLight(0xffffff,0x7a9293,2.7));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-1,2,4);scene.add(light);
 const owned=new Set();let anchors={},cables=[],state=null,phase=null,layout=0,signature='',active=true,disposed=false,frame=0,frames=0;
 container.append(renderer.domElement);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=.3;controls.maxDistance=12;controls.addEventListener('change',invalidate);
 function own(x){owned.add(x);return x;}
 function box(parent,size,pos,color){const m=new THREE.Mesh(own(new THREE.BoxGeometry(...size)),own(new THREE.MeshStandardMaterial({color,roughness:.62})));m.position.fromArray(pos);parent.add(m);return m;}
 function label(text,pos,width=.24,parent=group){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,768,96);c.fillStyle='#193a4c';c.font='bold 40px sans-serif';c.textAlign='center';c.fillText(text,384,61);const texture=own(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:texture,depthTest:false})));sprite.scale.set(width,width/8,1);sprite.position.fromArray(pos);sprite.renderOrder=20;parent.add(sprite);return sprite;}
 function port(parent,key,pos,color){anchors[key]=box(parent,[.012,.009,.008],pos,color);}
 function clearWires(){for(const c of cables){c.mesh.geometry.dispose();c.mesh.material.dispose();c.dot.geometry.dispose();c.dot.material.dispose();}cables=[];wireGroup.clear();signature='';}
 function clearLayout(){clearWires();group.clear();for(const r of owned)r.dispose();owned.clear();anchors={};}
 function find(root,suffix){let result;root.traverse(n=>{if(n.userData.sid?.endsWith('.'+suffix))result=n;});if(!result)throw Error('Confirmed NovaCor anchor unavailable: '+suffix);return result;}
 function apparatus(name,position,count,color){const device=new THREE.Group();device.position.fromArray(position);group.add(device);box(device,[.23,.07,.07],[0,0,0],0xd2dade);box(device,[.222,.055,.004],[0,0,.038],0x243a47);const first=name==='LAN'?0:1;for(let i=0;i<count;i++)port(device,`${name}.p${i+first}`,[-.094+i*.188/Math.max(1,count-1),-.006,.043],color);label(name+' · SCHEMATIC',[0,.056,.04],.24,device);}

 function rebuild(){
 clearLayout();layout=1;
 const model=template.clone(true);model.scale.setScalar(.6);model.rotation.y=Math.PI;model.position.set(-.44,.2,0);group.add(model);
 anchors['N.GT1']=find(model,'gt1');anchors['N.GT2']=find(model,'gt2');label('NovaCor 2.0',[-.44,.34,.06],.3);
 const x=new THREE.Group();x.position.set(0,.2,0);group.add(x);box(x,[.26,.12,.09],[0,0,0],0xc4d0d6);box(x,[.25,.108,.006],[0,0,.05],0x284b5a);
 for(const [key,pos,col] of [['GT_A',[-.09,.028,.058],colors.gt],['LAN_A',[-.03,.028,.058],colors.ethernet],['GT_B',[.03,-.028,.058],colors.gt],['LAN_B',[.09,-.028,.058],colors.ethernet]])port(x,'X.'+key,pos,col);
 label('GTNETx2 · A / B',[0,.30,.06],.32);
 apparatus('S_A',[-.2,-.10,0],3,colors.ethernet);apparatus('S_B',[.2,-.10,0],2,colors.ethernet);
 const ied=new THREE.Group();ied.position.set(.56,.12,0);group.add(ied);box(ied,[.20,.22,.12],[0,0,0],0xd5dfe2);box(ied,[.15,.095,.005],[0,.04,.065],0x213d4c);label('SV / GOOSE',[0,.04,.07],.14,ied);for(let i=0;i<4;i++)box(ied,[.02,.018,.008],[-.05+i*.034,-.04,.07],0x687b87);
 port(ied,'IED.A',[-.05,-.085,.07],colors.ethernet);port(ied,'IED.B',[.05,-.085,.07],colors.ethernet);label('IED · SCHEMATIC',[.56,.28,.07],.29);
 group.updateMatrixWorld(true);container.dataset.modelCount='5';container.dataset.anchorCount=String(Object.keys(anchors).length);fit();
 }
 function world(key){return anchors[key]?.getWorldPosition(new THREE.Vector3());}
 function buildWires(){const sig=JSON.stringify(state.links);if(sig===signature)return;clearWires();signature=sig;group.updateMatrixWorld(true);
  state.links.forEach((link,i)=>{const a=world(link.a),b=world(link.b);if(!a||!b)return;const color=colors[link.network]||0xc64b40;const lift=.18+(i%7)*.012;const curve=new THREE.CatmullRomCurve3([a,a.clone().add(new THREE.Vector3(0,0,.045)),new THREE.Vector3((a.x+b.x)/2,(a.y+b.y)/2,lift),b.clone().add(new THREE.Vector3(0,0,.045)),b]);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.0018,5,false),new THREE.MeshStandardMaterial({color,roughness:.6}));wireGroup.add(mesh);const dot=new THREE.Mesh(new THREE.SphereGeometry(.005,10,7),new THREE.MeshBasicMaterial({color:0xffc22b}));wireGroup.add(dot);cables.push({mesh,dot,curve,network:link.network,index:i,signal:link.signal,reverse:link.reverse,returnPath:link.returnPath});});container.dataset.wires=String(cables.length);
 }
 function render(force=false){frame=0;if(disposed||(!active&&!force)||document.hidden||!state||!container.clientWidth||!container.clientHeight)return;buildWires();for(const c of cables){const on=!!state.enabled[c.network];c.mesh.material.opacity=on?1:.24;c.mesh.material.transparent=!on;c.dot.visible=on&&Number.isFinite(phase)&&(state.prp?c.signal!==3:(c.signal===Math.floor(phase)||(c.returnPath&&Math.floor(phase)===2)));if(c.dot.visible){const f=((phase%1)+1)%1;c.dot.position.copy(c.curve.getPoint((c.reverse||(c.returnPath&&Math.floor(phase)===2))?1-f:f));}}
  renderer.render(scene,camera);const points={};for(const key of Object.keys(anchors)){const v=world(key).project(camera);points[key]={x:(v.x*.5+.5)*container.clientWidth,y:(.5-v.y*.5)*container.clientHeight,visible:Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z>-1&&v.z<1};}project(points);container.dataset.loaded='true';container.dataset.frames=String(++frames);container.dataset.triangles=String(renderer.info.render.triangles);
 }
 function invalidate(){if(!disposed&&active&&!document.hidden&&!frame)frame=requestAnimationFrame(()=>render());}
 function fit(){const width=1.5,height=.65;const centerY=.10;const distance=Math.max(height,width/Math.max(.3,camera.aspect))/(2*Math.tan(THREE.MathUtils.degToRad(18)))*1.2;controls.target.set(-.02,centerY,.035);camera.position.set(-.02,centerY+.12,distance);controls.update();invalidate();}
 function resize(){if(disposed)return;const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();fit();}
 const ro=new ResizeObserver(resize);ro.observe(container);resize();const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};document.addEventListener('visibilitychange',visibility);
 const lost=e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;container.dataset.loaded='false';container.dispatchEvent(new CustomEvent('x2-scene-error'));};renderer.domElement.addEventListener('webglcontextlost',lost);
 // A single static readiness frame is independent of stale intersection delivery.
 // It does not start animation, and is requested only for the selected lesson.
 return {paintStatic(){cancelAnimationFrame(frame);frame=0;render(true);},update(s,p=null){state=s;phase=p;if(!layout)rebuild();invalidate();},setActive(v){active=!!v;controls.enabled=active;if(!active){cancelAnimationFrame(frame);frame=0;}else invalidate();},fit,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);controls.dispose();clearLayout();const resources=new Set();template.traverse(n=>{if(n.geometry)resources.add(n.geometry);for(const m of n.material?Array.isArray(n.material)?n.material:[n.material]:[]){resources.add(m);for(const v of Object.values(m))if(v?.isTexture)resources.add(v);}});for(const r of resources)r.dispose();renderer.dispose();renderer.domElement.remove();container.dataset.loaded='false';}};
}
