import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const projection=await import('../src/rtds-anchor-projection.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND'&&error.message.includes('rtds-anchor-projection.js'))return {};throw error;});
const bytes=readFileSync('public/assets/rtds/novacor-2.0-2023.glb'),metadata=JSON.parse(readFileSync('public/assets/rtds/novacor-2.0-2023.json'));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
const nodes=new Map(),ports=new Map(metadata.ports.map(p=>[p.id,p]));gltf.scene.traverse(n=>{if(n.userData.sid)nodes.set(n.userData.sid,n);});
const ids=['novacor-2.0-2023.ao1','novacor-2.0-2023.gnd1'];
function front(){const center=nodes.get(ids[0]).getWorldPosition(new THREE.Vector3()).lerp(nodes.get(ids[1]).getWorldPosition(new THREE.Vector3()),.5),camera=new THREE.OrthographicCamera(-.14,.14,.10,-.10,.001,5);camera.position.copy(center).add(new THREE.Vector3(0,0,1));camera.lookAt(center);camera.updateMatrixWorld();return camera;}
function project(camera,width=700,height=400){assert.equal(typeof projection.projectModelAnchors,'function','real model anchor projection missing');return projection.projectModelAnchors(ids,nodes,ports,camera,width,height);}
test('lesson probe contacts project exact loaded GLB world anchors, never an invented two-jack panel',()=>{
 const camera=front(),points=project(camera);assert.equal(Object.keys(points).length,2);
 for(const id of ids){const expected=nodes.get(id).getWorldPosition(new THREE.Vector3()),ndc=expected.clone().project(camera);assert.deepEqual(points[id].world,expected.toArray());assert.equal(points[id].x,(ndc.x*.5+.5)*700);assert.equal(points[id].y,(-ndc.y*.5+.5)*400);assert.equal(points[id].visible,true);}
 for(const [id,expected]of [[ids[0],[.059,.037,.261]],[ids[1],[.134,.016,.261]]])points[id].world.forEach((v,i)=>assert.ok(Math.abs(v-expected[i])<1e-6,'loaded Y-up GLB anchor coordinates'));
 assert.ok(points[ids[0]].x<points[ids[1]].x);assert.ok(points[ids[0]].y<points[ids[1]].y);
});
test('actual anchor projection follows front oblique orbit, zoom and mobile resize',()=>{
 const camera=front(),initial=project(camera);camera.position.x+=.15;camera.lookAt(nodes.get(ids[0]).getWorldPosition(new THREE.Vector3()));camera.updateMatrixWorld();const oblique=project(camera);assert.notEqual(oblique[ids[1]].x,initial[ids[1]].x);
 camera.zoom=1.4;camera.updateProjectionMatrix();const zoomed=project(camera),mobile=project(camera,280,340);assert.notEqual(zoomed[ids[1]].x,oblique[ids[1]].x);assert.ok(Math.abs(mobile[ids[1]].x/zoomed[ids[1]].x-.4)<1e-9);assert.equal(mobile[ids[1]].visible,true);
});
test('offscreen, rear-facing and missing real anchors cannot pretend to be contacted',()=>{
 const camera=front();camera.position.z=-1;camera.lookAt(new THREE.Vector3(.1,.02,.26));camera.updateMatrixWorld();for(const p of Object.values(project(camera)))assert.equal(p.visible,false);
 const c=front();c.position.x+=5;c.updateMatrixWorld();for(const p of Object.values(project(c)))assert.equal(p.visible,false);
 assert.deepEqual(projection.projectModelAnchors(['missing'],nodes,ports,front(),280,340),{});for(const p of Object.values(project(front(),0,0)))assert.equal(p.visible,false);
});
test('teaching camera stays on the actual front surface with a context-preserving closeup',()=>{
 project(front());assert.deepEqual(projection.lessonCameraLimits,{minAzimuthAngle:-.35,maxAzimuthAngle:.35,minPolarAngle:Math.PI/2-.16,maxPolarAngle:Math.PI/2+.16,minZoom:.7,maxZoom:1.8,enablePan:false});
 assert.deepEqual(projection.lessonDetailMinimum,[.18,.1,.035]);
});
test('hardware stage embeds the real model and exact-anchor overlays rather than a substitute panel',()=>{
 const html=readFileSync('index.html','utf8');for(const id of ['analog-model-scene','analog-model-loading','analog-model-front','analog-model-detail','analog-model-retry'])assert.ok(html.includes(`id="${id}"`),id);
 assert.ok(!html.includes('class="analog-frontpanel"'));assert.ok(!html.includes('class="analog-sockets"'));assert.ok(html.indexOf('id="analog-bench"')<html.indexOf('class="analog-virtual-grid"'),'actual hardware is the primary visual');
 const source=readFileSync('src/rtds-analog-lesson.js','utf8');assert.match(source,/createRtdsScene/);assert.match(source,/subscribeAnchors/);assert.match(source,/publishedModels\['novacor-2.0'\]/);
});
test('lesson viewer preserves the default gallery namespace and exposes render-synchronized projection without another model copy',()=>{
 const source=readFileSync('src/rtds-scene.js','utf8');assert.match(source,/options\.overlayPrefix\|\|'rtds'/);assert.match(source,/subscribeAnchors/);assert.match(source,/projectModelAnchors/);assert.match(source,/projectionListeners\.clear/);
});
test('front teaching view fits visible chassis width rather than wasting the frame on hidden chassis depth',()=>{
 assert.equal(typeof projection.frontInspectionFrame,'function','front model framing is not implemented');
 for(const [w,h]of [[666,400],[264,310]]){const f=projection.frontInspectionFrame([.483,.178,.522],w,h);assert.ok(f.right-f.left>=.483);assert.ok(f.right-f.left<=.483*1.3);assert.ok(f.top-f.bottom>=.178);}
});
