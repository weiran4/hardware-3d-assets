import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {cardIdentity,identityLayout,identityAnchor} from '../src/rtds-card-identity.js';
import {inspectionFrame,projectHighlightBounds} from '../src/rtds-state.js';
const cards=[['gtdi-v2-2.01','DI','数字输入'],['gtdo-v2-2.00','DO','数字输出'],['gtai-v2-2.31','AI','模拟输入'],['gtao-v2-2.20','AO','模拟输出']];
test('identity is an exact-version visual description, not an inferred live signal or physical label',()=>{
 for(const [id,code,label] of cards)assert.deepEqual(cardIdentity(id),{code,label});
 for(const id of ['novacor-2.0-2023','gtdo-v1','gtdi-v2-future',null])assert.equal(cardIdentity(id),null);
});
test('identity label follows its projected anchor while retaining pixel dimensions and viewport bounds',()=>{
 const a=identityLayout({x:300,y:260,z:0},800,500),b=identityLayout({x:350,y:280,z:0},800,500);
 assert.equal(b.x-a.x,50);assert.equal(b.y-a.y,20);assert.equal(a.width,144);assert.equal(a.height,48);
 const edge=identityLayout({x:5,y:5,z:0},320,210);assert.ok(edge.x>=8&&edge.y>=8&&edge.x+edge.width<=312&&edge.y+edge.height<=202);
});
test('identity label never covers interface boxes and hides if no safe space remains',()=>{
 const obstacle={x:200,y:120,width:200,height:100},r=identityLayout({x:300,y:260,z:0},800,500,[obstacle]);
 assert.ok(r);assert.ok(r.x+r.width<=obstacle.x-6||r.x>=obstacle.x+obstacle.width+6||r.y+r.height<=obstacle.y-6||r.y>=obstacle.y+obstacle.height+6);
 assert.equal(identityLayout({x:150,y:100,z:0},320,210,[{x:0,y:0,width:320,height:210}]),null);
});
test('identity hides on clipped/offscreen/invalid anchors or insufficient viewport space',()=>{
 for(const p of [{x:-1,y:10,z:0},{x:10,y:10,z:2},{x:10,y:10,z:-2},{x:NaN,y:10,z:0}])assert.equal(identityLayout(p,320,210),null);
 assert.equal(identityLayout({x:10,y:10,z:0},120,100),null);
});
for(const [id] of cards)test(`${id} identity uses an existing decorative node and fits actual overview geometry including PiP`,async()=>{
 const b=readFileSync(`public/assets/rtds/${id}.glb`),g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');g.scene.updateMatrixWorld(true);
 const nodes=new Map();g.scene.traverse(n=>{if(n.userData.sid)nodes.set(n.userData.sid,n);});const anchor=identityAnchor(id,nodes);assert.ok(anchor);assert.equal(nodes.get(`${id}.heatsink_top`).userData.kind,'part');
 assert.equal(identityAnchor(id,new Map()),null);
 const metadata=JSON.parse(readFileSync(`public/assets/rtds/${id}.json`));assert.ok(metadata.ports.every(p=>p.id!==`${id}.heatsink_top`));
 const box=new THREE.Box3().setFromObject(g.scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 for(const [width,height] of [[1000,520],[296,420],[366,420],[320,210]]){
  const c=new THREE.OrthographicCamera(-1,1,1,-1,.001,20);Object.assign(c,inspectionFrame(size.toArray(),width,height));c.position.copy(center).addScaledVector(new THREE.Vector3(1,.8,1.25).normalize(),Math.max(...size.toArray())*2+1);c.lookAt(center);c.updateProjectionMatrix();c.updateMatrixWorld(true);
  const projected=anchor.clone().project(c),p={x:(projected.x*.5+.5)*width,y:(-.5*projected.y+.5)*height,z:projected.z};
  const obstacles=metadata.ports.map(port=>projectHighlightBounds(new THREE.Box3().setFromObject(nodes.get(port.id)),c,width,height,2)).filter(Boolean);
  const layout=identityLayout(p,width,height,obstacles);assert.ok(layout,`${width}x${height}: no safe identity position`);
 }
});

test('identity styles keep readable fixed pixels and the leader yields to contact regions',()=>{
 const css=readFileSync('src/styles.css','utf8'),scene=readFileSync('src/rtds-scene.js','utf8'),source=readFileSync('src/rtds-card-identity.js','utf8');
 assert.match(css,/\.rtds-card-identity strong\{[^}]*30px/);assert.match(css,/\.rtds-card-identity span\{[^}]*14px/);assert.match(css,/\.rtds-card-identity small\{[^}]*12px/);
 assert.match(css,/\.rtds-card-identity\{[^}]*pointer-events:none/);assert.match(source,/connector\.setAttribute\('mask'/);assert.match(source,/mask\.setAttribute\('x','0'\)/);assert.match(source,/mask\.setAttribute\('y','0'\)/);assert.match(source,/rect\.setAttribute\('fill','black'\)/);
 assert.match(scene,/inspectionContext=Boolean\(title\|\|selected\.length\|\|isolate\)/);assert.match(scene,/identity\.dispose\(\)/);
});
