import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const power=await import('../src/rtds-power-geometry.js').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const data=JSON.parse(readFileSync('public/assets/rtds/gtao-v2-2.20.json'));
const bytes=readFileSync('public/assets/rtds/gtao-v2-2.20.glb');
const template=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
function assembly(){assert.equal(typeof power.createPowerAssembly,'function','real GTAO power assembly is not implemented');return power.createPowerAssembly(template,data);}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('two existing GTAO boards retain authored geometry and their own semantic anchors',()=>{
 const a=assembly();assert.equal(a.boards.length,2);const originals=[];template.traverse(n=>{if(n.isMesh)originals.push(n);});
 for(const board of a.boards){const meshes=[];board.traverse(n=>{if(n.isMesh)meshes.push(n);});assert.equal(meshes.length,originals.length);for(let i=0;i<meshes.length;i++){assert.equal(meshes[i].geometry,originals[i].geometry);assert.equal(meshes[i].material,originals[i].material);}}
 const p=a.anchors;assert.equal(p.upperInput.userData.sid,'gtao-v2-2.20.power2');assert.equal(p.lowerInput.userData.sid,'gtao-v2-2.20.power2');assert.equal(p.lowerLink.userData.sid,'gtao-v2-2.20.power1');
 a.group.updateMatrixWorld(true);const upper=p.upperInput.getWorldPosition(new THREE.Vector3()),lower=p.lowerInput.getWorldPosition(new THREE.Vector3()),link=p.lowerLink.getWorldPosition(new THREE.Vector3());
 assert.ok(upper.y>link.y&&link.y>lower.y);near(upper.x,lower.x);near(link.y-lower.y,.153);near(upper.z,.021);
});
test('source feeds lower POWER2 and jumper joins lower POWER1 to upper POWER2 at loaded anchors',()=>{
 const a=assembly();a.update({feedProgress:1,jumperProgress:1,energized:false,pulsePhase:null});a.group.updateMatrixWorld(true);
 const position=node=>node.getWorldPosition(new THREE.Vector3());
 for(const [cable,start,end]of [[a.cables.feed,a.anchors.supplyOutput,a.anchors.lowerInput],[a.cables.jumper,a.anchors.lowerLink,a.anchors.upperInput]]){
  assert.ok(cable.curve.getPoint(0).distanceTo(position(start))<1e-7);assert.ok(cable.curve.getPoint(1).distanceTo(position(end))<1e-7);
  for(const plug of cable.plugs){assert.equal(plug.material.transparent,false);assert.equal(plug.material.opacity,1);assert.equal(plug.userData.pinMapping,'not-asserted');}
 }
});
test('animated plugs move together and never mutate original model materials or indicate live hookup',()=>{
 const a=assembly();const p=a.anchors.lowerInput.getWorldPosition(new THREE.Vector3());a.update({feedProgress:0,jumperProgress:0,energized:false,pulsePhase:null});assert.ok(a.cables.feed.plugs.at(-1).position.distanceTo(p)>.01);
 for(const light of a.indicators)assert.equal(light.visible,false);a.update({feedProgress:1,jumperProgress:1,energized:true,pulsePhase:.5});
 assert.ok(a.cables.feed.plugs.at(-1).position.distanceTo(p)<1e-7);for(const light of a.indicators)assert.equal(light.visible,true);
});
test('missing real power anchors fails honestly instead of substituting an abstract board',()=>{
 assembly();const empty=new THREE.Group();assert.throws(()=>power.createPowerAssembly(empty,data),/power2|anchor|接口/);
});
test('all three conductors remain separated in the component-side view, not hidden in depth',()=>{
 const a=assembly();a.update({feedProgress:1,jumperProgress:1,energized:false,pulsePhase:null});
 for(const c of Object.values(a.cables)){const xs=c.tubes.map(t=>{t.geometry.computeBoundingBox();return t.geometry.boundingBox.min.x;});assert.ok(Math.abs(xs[0]-xs[1])>.002);assert.ok(Math.abs(xs[1]-xs[2])>.002);}
});
