import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

// Original Light-specific teaching arrangement. No borrowed NovaCor2.0 geometry or physical pin coordinates.
const colors={power:0x7650a2,signal:0xb45749,return:0x425b78,optical:0x9a6330,copper:0xc64b40,fiber:0x9a6330,gt:0x9a6330,'gt-fiber':0x9a6330,'st-timing-fiber':0xc18b34,'st-ethernet-fiber':0x2478ac,coax:0x60717f,ethernet:0x2478ac};
export async function createLightBenchScene(container,project){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xffffff,1);renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),group=new THREE.Group(),wireGroup=new THREE.Group(),camera=new THREE.PerspectiveCamera(36,1,.01,30);scene.add(group,wireGroup);scene.add(new THREE.HemisphereLight(0xffffff,0x7a9293,2.7));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-1,2,4);scene.add(light);
 const owned=new Set();let compact=container.clientWidth<600,anchors={},cables=[],state=null,phase=null,layout=0,signature='',active=true,disposed=false,frame=0,frames=0;
 container.append(renderer.domElement);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=.3;controls.maxDistance=12;controls.addEventListener('change',invalidate);
 function own(x){owned.add(x);return x;}
 function box(parent,size,pos,color){const m=new THREE.Mesh(own(new THREE.BoxGeometry(...size)),own(new THREE.MeshStandardMaterial({color,roughness:.62})));m.position.fromArray(pos);parent.add(m);return m;}
 function label(text,pos,width=.24,parent=group){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,768,96);c.fillStyle='#193a4c';c.font='bold 56px sans-serif';c.textAlign='center';c.fillText(text,384,61,740);const texture=own(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:texture,depthTest:false})));sprite.scale.set(width,width/8,1);sprite.position.fromArray(pos);sprite.renderOrder=20;parent.add(sprite);return sprite;}
 function port(parent,key,pos,color){anchors[key]=box(parent,[.012,.009,.008],pos,color);}
 function clearWires(){for(const c of cables){c.mesh.geometry.dispose();c.mesh.material.dispose();c.dot.geometry.dispose();c.dot.material.dispose();}cables=[];wireGroup.clear();signature='';}
 function clearLayout(){clearWires();group.clear();for(const r of owned)r.dispose();owned.clear();anchors={};}


 function rebuild(){
 clearLayout();layout=1;
 const digital=['di','do'].includes(state?.mode);
 const lx=compact?0:-.36,ly=compact?.32:.10,ex=compact?0:.36,ey=compact?-.30:.10;
 const chassis=new THREE.Group();chassis.position.set(lx,ly,0);group.add(chassis);box(chassis,[.44,.25,.14],[0,0,0],0xd0dade);box(chassis,[.43,.24,.008],[0,0,.075],0x2b414b);
 label('NOVACOR LIGHT · SCHEMATIC',[0,.18,.08],.56,chassis);
 // Layout is a functional teaching arrangement, not a pin-coordinate or mating model.
 const upper=digital?'do':'ao',lower=digital?'di':'ai',loop=digital?'I1':'I2';
 box(chassis,[.13,.025,.009],[.13,.075,.085],0xaab8c2);box(chassis,[.13,.025,.009],[.13,.015,.085],0xaab8c2);
 port(chassis,'L.'+upper,[.13,.075,.10],0xd2a15c);port(chassis,'L.'+lower,[.13,.015,.10],0x6aa2c3);label(upper.toUpperCase(),[.13,.11,.10],.08,chassis);label(lower.toUpperCase(),[.13,-.02,.10],.08,chassis);
 port(chassis,'L.top'+loop,[-.035,.07,.10],0x54a9bd);port(chassis,'L.bottom'+loop,[-.035,-.08,.10],0x54a9bd);label(loop,[-.08,.07,.10],.07,chassis);label(loop,[-.08,-.08,.10],.07,chassis);
 if(digital){
 port(chassis,'L.topI2',[-.17,.075,.10],0x929da5);port(chassis,'L.bottomI2',[-.17,-.08,.10],0x929da5);label('I2',[-.21,.075,.10],.05,chassis);label('I2',[-.21,-.08,.10],.05,chassis);
 port(chassis,'L.ai',[-.14,-.005,.10],0x929da5);label('AI',[-.18,-.005,.10],.05,chassis);
 }else label('DI / DO · REFERENCE',[-.13,-.01,.10],.16,chassis);
 const terminal=new THREE.Group();terminal.position.set(lx,ly-.20,.12);group.add(terminal);box(terminal,[.23,.045,.04],[0,0,0],0x557e71);port(terminal,'T.signal',[-.07,0,.03],0xcb6c51);port(terminal,'T.return',[.07,0,.03],0x4c6177);label(digital?'CH1          COMMON':'SIGNAL       RETURN',[0,-.048,.03],.30,terminal);
 const device=new THREE.Group();device.position.set(ex,ey,0);group.add(device);box(device,[.30,.18,.14],[0,0,0],0xdce3e5);box(device,[.28,.16,.008],[0,0,.075],0x2c4b58);box(device,[.15,.08,.009],[-.045,.015,.09],0x76bec6);for(let i=0;i<3;i++)box(device,[.025,.018,.012],[.105,-.035+i*.035,.09],0xaabac0);port(device,'E.signal',[-.055,-.06,.10],0xcb6c51);port(device,'E.return',[.055,-.06,.10],0x4c6177);
 if(state?.mode==='do'){
 box(device,[.16,.055,.02],[-.045,.015,.11],0xb88a52);
 for(let i=0;i<4;i++)box(device,[.009,.055,.004],[-.10+i*.035,.015,.122],[0x6c4137,0x191919,0xab4037,0xc7a257][i]);
 label(state?.reading||'NO SIGNAL',[0,-.115,.105],.29,device);
 }else label(state?.reading||'NO SIGNAL',[-.045,.015,.105],.15,device);
 label(state?.mode==='di'?'ACTIVE PLC OUTPUT · SCHEMATIC':state?.mode==='do'?'RESISTIVE LOAD · SCHEMATIC':state?.mode==='ai'?'SIGNAL GENERATOR · SCHEMATIC':'OSCILLOSCOPE · SCHEMATIC',[0,.14,.08],.53,device);
 if(state?.mode==='do'){
 const supply=new THREE.Group();supply.position.set(ex,ey-.25,.0);group.add(supply);box(supply,[.25,.11,.10],[0,0,0],0xd5e0e3);label('EXTERNAL BANK DC',[0,.09,.07],.34,supply);port(supply,'P.plus',[-.065,0,.06],0xcb6c51);port(supply,'P.common',[.065,0,.06],0x4c6177);
 port(terminal,'T.supply',[0,0,.03],0x7650a2);label('BANK +',[0,.05,.03],.10,terminal);
 }
 group.updateMatrixWorld(true);container.dataset.modelCount=state?.mode==='do'?'4':'3';container.dataset.asset='original-light-only-schematic';container.dataset.mode=state?.mode||'ao';container.dataset.anchorScope='logical-groups-no-pin-coordinates';fit();
 }
 function world(key){return anchors[key]?.getWorldPosition(new THREE.Vector3());}
 function buildWires(){const sig=JSON.stringify(state.links);if(sig===signature)return;clearWires();signature=sig;group.updateMatrixWorld(true);
  state.links.forEach((link,i)=>{const a=world(link.a),b=world(link.b);if(!a||!b)return;const color=colors[link.network]||0xc64b40;const lift=.18+(i%7)*.012;const curve=new THREE.CatmullRomCurve3([a,a.clone().add(new THREE.Vector3(0,0,.045)),new THREE.Vector3((a.x+b.x)/2,(a.y+b.y)/2,lift),b.clone().add(new THREE.Vector3(0,0,.045)),b]);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.0018,5,false),new THREE.MeshStandardMaterial({color,roughness:.6}));wireGroup.add(mesh);const dot=new THREE.Mesh(new THREE.SphereGeometry(.005,10,7),new THREE.MeshBasicMaterial({color:0xffc22b}));wireGroup.add(dot);cables.push({mesh,dot,curve,network:link.network,index:i,signal:link.signal,reverse:link.reverse,returnPath:link.returnPath});});container.dataset.wires=String(cables.length);container.dataset.links=JSON.stringify(state.links);
 }
 function render(force=false){frame=0;if(disposed||(!active&&!force)||document.hidden||!state||!container.clientWidth||!container.clientHeight)return;buildWires();for(const c of cables){const on=!!state.enabled[c.network];c.mesh.material.opacity=on?1:.24;c.mesh.material.transparent=!on;c.dot.visible=on&&Number.isFinite(phase);if(c.dot.visible){const f=((phase%1)+1)%1;c.dot.position.copy(c.curve.getPoint((c.reverse||(c.returnPath&&Math.floor(phase)===2))?1-f:f));}}

  renderer.render(scene,camera);const points={};for(const key of Object.keys(anchors)){const v=world(key).project(camera);points[key]={x:(v.x*.5+.5)*container.clientWidth,y:(.5-v.y*.5)*container.clientHeight,visible:Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z>-1&&v.z<1};}project(points);container.dataset.phase=String(phase);container.dataset.loaded='true';container.dataset.frames=String(++frames);container.dataset.triangles=String(renderer.info.render.triangles);
 }
 function invalidate(){if(!disposed&&active&&!document.hidden&&!frame)frame=requestAnimationFrame(()=>render());}
 function fit(){const width=compact?.75:1.35,height=compact?1.25:.70;const centerY=compact?.02:.06;const distance=Math.max(height,width/Math.max(.3,camera.aspect))/(2*Math.tan(THREE.MathUtils.degToRad(18)))*1.2;controls.target.set(-.02,centerY,.035);camera.position.set(-.02,centerY+.12,distance);controls.update();invalidate();}
 function resize(){if(disposed)return;const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;const nextCompact=w<600;if(nextCompact!==compact){compact=nextCompact;if(layout)rebuild();}renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();fit();}
 const ro=new ResizeObserver(resize);ro.observe(container);resize();const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};document.addEventListener('visibilitychange',visibility);
 const lost=e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;container.dataset.loaded='false';container.dispatchEvent(new CustomEvent('lightbench-scene-error'));};renderer.domElement.addEventListener('webglcontextlost',lost);
 // A single static readiness frame is independent of stale intersection delivery.
 // It does not start animation, and is requested only for the selected lesson.
 return {paintStatic(){cancelAnimationFrame(frame);frame=0;render(true);},update(s,p=null){const changed=state?.mode!==s.mode||state?.reading!==s.reading;state=s;phase=p;if(!layout||changed)rebuild();invalidate();},setActive(v){active=!!v;controls.enabled=active;if(!active){cancelAnimationFrame(frame);frame=0;}else invalidate();},fit,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);controls.dispose();clearLayout();renderer.dispose();renderer.domElement.remove();container.dataset.loaded='false';}};
}

