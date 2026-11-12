import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const digital=await import('../src/rtds-digital-input-geometry.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
const bytes=readFileSync('public/assets/rtds/gtdi-v2-2.01.glb');
const template=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
const state={mode:'dry',wires:['signal','return','wetPlus','wetReturn'],power:true,closed:true,voltage:24,wetVoltage:24,selected:null,notice:''};
const ready={status:'ready',raw:0,flow:true};
function assembly(){assert.equal(typeof digital.createDigitalAssembly,'function','digital input geometry is not implemented');return digital.createDigitalAssembly(template);}
const world=node=>node.getWorldPosition(new THREE.Vector3());
const meshes=node=>{const found=[];node.traverse(child=>{if(child.isMesh)found.push(child);});return found;};

test('published GTDI board is stood upright without altering its meshes or materials',()=>{
 const a=assembly(),original=meshes(template),copy=meshes(a.board);
 assert.equal(copy.length,original.length);assert.equal(a.board.rotation.x,Math.PI/2);
 for(let i=0;i<copy.length;i++){assert.equal(copy[i].geometry,original[i].geometry);assert.equal(copy[i].material,original[i].material);}
 const bounds=new THREE.Box3().setFromObject(a.board);assert.ok(bounds.max.y-bounds.min.y>.18);
 a.dispose();
});
test('CH1, WET and GND use bank1 metadata and existing contact geometry',()=>{
 const a=assembly();
 for(const [name,port,label]of [['input','bank1_odd','1'],['wet','bank1_odd','V+(WET)'],['ground','bank1_even','GND']]){
  const anchor=a.anchors[name];assert.equal(anchor.userData.portId,`gtdi-v2-2.01.${port}`);assert.equal(anchor.userData.contactLabel,label);
  assert.equal(anchor.userData.mapping,'functional-illustration');
  let source;a.board.traverse(n=>{if(n.userData.sid===anchor.userData.sourceSid)source=n;});assert.ok(source);assert.ok(world(anchor).distanceTo(world(source))<1e-8);
 }
 assert.ok(world(a.anchors.input).distanceTo(world(a.anchors.wet))>.01);
 a.dispose();
});
test('original relay, controller and field supply are distinct and mode swaps functional terminals',()=>{
 const a=assembly();assert.deepEqual(Object.keys(a.devices).sort(),['relay','source','supply']);
 for(const device of Object.values(a.devices)){assert.equal(device.userData.origin,'original-illustrative');assert.ok(meshes(device).length>8);}
 a.update(state,ready,.2);const out=world(a.anchors.out),common=world(a.anchors.common);
 assert.equal(a.devices.relay.visible,true);assert.equal(a.devices.source.visible,false);
 assert.equal(a.anchors.out.parent,a.devices.relay);assert.equal(a.anchors.common.parent,a.devices.relay);
 a.update({...state,mode:'wet',wires:['signal','return']},{...ready,raw:1},.2);
 assert.equal(a.devices.relay.visible,false);assert.equal(a.devices.source.visible,true);assert.equal(a.devices.supply.visible,true);
 assert.equal(a.anchors.out.parent,a.devices.source);assert.equal(a.anchors.common.parent,a.devices.source);
 assert.ok(world(a.anchors.out).distanceTo(out)>.001);assert.ok(world(a.anchors.common).distanceTo(common)>.001);
 a.dispose();
});
test('contact closure moves the real relay arm into the fixed contact',()=>{
 const a=assembly();a.update({...state,closed:false},{...ready,raw:1,flow:false},null);a.group.updateMatrixWorld(true);
 const open=world(a.contactTip),fixed=world(a.fixedContact);assert.ok(open.distanceTo(fixed)>.012);
 a.update(state,ready,null);a.group.updateMatrixWorld(true);assert.ok(world(a.contactTip).distanceTo(world(a.fixedContact))<.001);
 assert.ok(world(a.contactTip).distanceTo(open)>.012);a.dispose();
});
test('connected cables meet their selected terminal anchors and removed cables disappear',()=>{
 const a=assembly();
 for(const mode of ['dry','wet']){
  a.update({...state,mode},ready,.3);a.group.updateMatrixWorld(true);
  for(const [name,start,end]of [['signal','out','input'],['return','common','ground'],['wetPlus','plus','wet'],['wetReturn','minus','ground']]){
   const c=a.cables[name];assert.equal(c.mesh.visible,true);assert.ok(c.curve.getPoint(0).distanceTo(world(a.anchors[start]))<1e-8);assert.ok(c.curve.getPoint(1).distanceTo(world(a.anchors[end]))<1e-8);
  }
 }
 a.update({...state,wires:['signal']},{status:'incomplete',flow:false},null);
 assert.equal(a.cables.signal.mesh.visible,true);for(const name of ['return','wetPlus','wetReturn'])assert.equal(a.cables[name].mesh.visible,false);
 a.dispose();
});
test('current animation only appears on a complete valid powered circuit and null phase stops it',()=>{
 const a=assembly();a.update(state,ready,.1);assert.ok(Object.values(a.cables).every(c=>c.pulse.visible));const before=a.cables.signal.pulse.position.clone();
 a.update(state,ready,.7);assert.ok(before.distanceTo(a.cables.signal.pulse.position)>.01);
 for(const [s,r,phase]of [[state,ready,null],[state,{...ready,flow:false},.2],[state,{...ready,status:'unsafe'},.2],[{...state,power:false},ready,.2],[{...state,closed:false},ready,.2],[{...state,wires:['signal']},ready,.2],[{...state,mode:'wet'},ready,.2],[state,ready,NaN]]){
  a.update(s,r,phase);assert.ok(Object.values(a.cables).every(c=>!c.pulse.visible));
 }
 a.update({...state,mode:'wet',wires:['signal','return']},{...ready,raw:1},.4);assert.equal(a.cables.signal.pulse.visible,true);assert.equal(a.cables.return.pulse.visible,true);assert.equal(a.cables.wetPlus.pulse.visible,false);
 a.dispose();
});
test('assembly disposal releases only owned resources and does not mutate the published template',()=>{
 const before=template.toJSON();let originalDisposals=0;for(const mesh of meshes(template)){mesh.geometry.addEventListener('dispose',()=>originalDisposals++);mesh.material.addEventListener('dispose',()=>originalDisposals++);}
 const a=assembly();let ownedDisposals=0;const seen=new Set();a.devices.relay.traverse(n=>{if(n.isMesh&&!seen.has(n.geometry)){seen.add(n.geometry);n.geometry.addEventListener('dispose',()=>ownedDisposals++);}});
 a.dispose();assert.ok(ownedDisposals>8);assert.equal(originalDisposals,0);assert.deepEqual(template.toJSON(),before);
});
test('missing board anchors or unverified contact labels fail instead of inventing ports',()=>{
 assembly().dispose();assert.throws(()=>digital.createDigitalAssembly(new THREE.Group()),/bank1|anchor|接口/);
 const broken=template.clone(true);broken.traverse(n=>{if(n.userData.sid==='gtdi-v2-2.01.bank1_odd'){const record=JSON.parse(n.userData.port_record);record.contact_labels[0]='unknown';n.userData.port_record=JSON.stringify(record);}});
 assert.throws(()=>digital.createDigitalAssembly(broken),/CH1|contact|触点|端子/);
});

test('renderer integration exposes the scene lifecycle before loading any model',async()=>{
 const renderer=await import('../src/rtds-digital-input-scene.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
 assert.equal(typeof renderer.createDigitalScene,'function','digital input scene lifecycle is missing');
 // Invalid hosting elements fail before allocating a renderer or fetching assets.
 await assert.rejects(()=>renderer.createDigitalScene(null,()=>{}),/container|容器/);
});

test('an unused supply negative reference does not block the wet circuit or carry animated current',()=>{
 const a=assembly();a.update({...state,mode:'wet',wires:['signal','return','wetReturn']},{...ready,raw:1},.4);
 assert.equal(a.cables.signal.pulse.visible,true);assert.equal(a.cables.return.pulse.visible,true);
 assert.equal(a.cables.wetReturn.mesh.visible,true);assert.equal(a.cables.wetReturn.pulse.visible,false);
 a.dispose();
});

test('dry-contact conventional current travels from WET supply through CH1 and the contact to ground',()=>{
 const a=assembly();
 const directions=[['wetPlus','plus','wet'],['signal','input','out'],['return','common','ground'],['wetReturn','ground','minus']];
 for(const [phase,index]of [[0,1],[1,2]]){
  a.update(state,ready,phase);
  for(const direction of directions){const c=a.cables[direction[0]],terminal=direction[index];assert.equal(c.pulse.visible,true);assert.ok(c.pulse.position.distanceTo(world(a.anchors[terminal]))<1e-8,`${direction[0]} phase ${phase} must be at ${terminal}`);}
 }
 a.dispose();
});
test('wet-input conventional current travels OUT to CH1 and ground to the source common',()=>{
 const a=assembly(),wetState={...state,mode:'wet',wires:['signal','return']};
 const directions=[['signal','out','input'],['return','ground','common']];
 for(const [phase,index]of [[0,1],[1,2]]){
  a.update(wetState,{...ready,raw:1},phase);
  for(const direction of directions){const c=a.cables[direction[0]],terminal=direction[index];assert.equal(c.pulse.visible,true);assert.ok(c.pulse.position.distanceTo(world(a.anchors[terminal]))<1e-8,`${direction[0]} phase ${phase} must be at ${terminal}`);}
 }
 a.dispose();
});
