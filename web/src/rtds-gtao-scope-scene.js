import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {publishedModels} from './rtds-models.js';
import {scopeSample,scopeResult} from './rtds-gtao-scope-state.js';
export async function createGtaoScopeScene(host){
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0xffffff);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,20),owned=[];
 const mat=color=>{const m=new THREE.MeshStandardMaterial({color,roughness:.6});owned.push(m);return m;};
 function box(size,pos,color,parent=scene){const g=new THREE.BoxGeometry(...size),m=mat(color),o=new THREE.Mesh(g,m);owned.push(g);o.position.fromArray(pos);parent.add(o);return o;}
 let board;
 try{board=(await new GLTFLoader().loadAsync(new URL(publishedModels['gtao-v2'].glb,document.baseURI).href)).scene;}catch(e){renderer.dispose();throw e;}
 board.rotation.x=Math.PI/2;board.position.x=-.13;scene.add(board);
 const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(0,1,2);scene.add(light,new THREE.HemisphereLight(0xffffff,0x859da3,2));
 // Original functional teaching scope, not a commercial model or certified probe.
 const scope=new THREE.Group();scope.name='original-illustrative-oscilloscope';scope.position.set(.13,0,.025);scene.add(scope);
 box([.19,.135,.07],[0,0,0],0xdbe3e5,scope);box([.127,.098,.004],[-.020,.006,.038],0x122d37,scope);
 for(const x of [.062,.078])for(const y of [-.01,.02,.047]){const g=new THREE.CylinderGeometry(.005,.005,.008,20);g.rotateX(Math.PI/2);owned.push(g);const n=new THREE.Mesh(g,mat(0x657980));n.position.set(x,y,.04);scope.add(n);}
 box([.40,.009,.16],[.005,-.11,-.005],0xe9efed);
 let channel;const contacts={};board.traverse(n=>{if(n.userData.sid==='gtao-v2-2.20.channel1')channel=n;for(const i of [0,1])if(n.userData.sid==='gtao-v2-2.20.channel1.wire_recess'+i)contacts[i]=n;});
 if(!channel||!contacts[0]||!contacts[1]){renderer.dispose();throw Error('GTAO CH1 metadata missing');}
 board.updateMatrixWorld(true);const center=channel.getWorldPosition(new THREE.Vector3());
 const plus=contacts[0].getWorldPosition(new THREE.Vector3()),ret=contacts[1].getWorldPosition(new THREE.Vector3());
 const input=new THREE.Vector3(.17,-.051,.066),ground=new THREE.Vector3(.205,-.051,.066);
 for(const [p,c]of [[plus,0xc84a3a],[ret,0x273c46],[input,0xc84a3a],[ground,0x273c46]]){const g=new THREE.SphereGeometry(.003,12,8);owned.push(g);const n=new THREE.Mesh(g,mat(c));n.position.copy(p);scene.add(n);}
 const cables=[];
 for(const [a,b,color]of [[plus,input,0xc84a3a],[ret,ground,0x273c46],[plus,ground,0xc84a3a],[ret,input,0x273c46]]){
 const curve=new THREE.CatmullRomCurve3([a,new THREE.Vector3(a.x+.035,a.y,.12),new THREE.Vector3(.06,b.y,.13),b]);const g=new THREE.TubeGeometry(curve,40,.0014,8,false);owned.push(g);const line=new THREE.Mesh(g,mat(color));scene.add(line);cables.push(line);
 }
 const traceGeometry=new THREE.BufferGeometry(),traceMaterial=new THREE.LineBasicMaterial({color:0x60ff9e});owned.push(traceGeometry,traceMaterial);const trace=new THREE.Line(traceGeometry,traceMaterial);scope.add(trace);
 const gridMaterial=new THREE.LineBasicMaterial({color:0x365660});owned.push(gridMaterial);
 for(let i=0;i<=4;i++){const y=-.035+i*.020;const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.078,y,.041),new THREE.Vector3(.038,y,.041)]);owned.push(g);scope.add(new THREE.Line(g,gridMaterial));}
 host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 let latest,active=true,disposed=false;
 function draw(){if(disposed||!active||document.hidden||!latest)return;const r=scopeResult(latest);cables.forEach((c,i)=>c.visible=latest.wiring==='normal'?i<2:latest.wiring==='reversed'?i>=2:latest.wiring==='signal'?i===0:false);trace.visible=r.status==='ready';
 const points=[];for(let i=0;i<=160;i++){const phase=i/160*4*Math.PI+latest.time*Math.PI;const v=scopeSample(latest.amplitude*Math.sin(phase),latest.scale)*r.polarity;points.push(new THREE.Vector3(-.078+.116*i/160,.006+v*.0038,.043));}traceGeometry.setFromPoints(points);renderer.render(scene,camera);host.dataset.loaded='true';host.dataset.triangles=String(renderer.info.render.triangles);host.dataset.wires=latest.wiring;host.dataset.frame=String((Number(host.dataset.frame)||0)+1);}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h||disposed)return;renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(.035,.10,Math.max(.65,.85/camera.aspect));camera.lookAt(.01,0,0);camera.updateProjectionMatrix();draw();}
 const ro=new ResizeObserver(resize);ro.observe(host);const loss=e=>{e.preventDefault();active=false;host.dataset.loaded='false';host.dispatchEvent(new CustomEvent('gtao-scope-error'));};renderer.domElement.addEventListener('webglcontextlost',loss);
 return{update(s){latest=s;resize();},setActive(v){active=v;resize();},dispose(){if(disposed)return;disposed=true;ro.disconnect();renderer.domElement.removeEventListener('webglcontextlost',loss);const gs=new Set(),ms=new Set(),ts=new Set();board.traverse(n=>{if(n.isMesh){gs.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material]){ms.add(m);for(const v of Object.values(m))if(v?.isTexture)ts.add(v);}}});[...gs,...ms,...ts,...owned].forEach(o=>o.dispose());renderer.dispose();renderer.domElement.remove();host.dataset.loaded='false';}};
}
