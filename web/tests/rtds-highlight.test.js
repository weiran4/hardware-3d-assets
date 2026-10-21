import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as highlight from '../src/rtds-state.js';
const bytes=readFileSync('public/assets/rtds/novacor-2.0-2023.glb');
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
gltf.scene.updateMatrixWorld(true);
const nodes=new Map();gltf.scene.traverse(n=>{if(n.userData.sid)nodes.set(n.userData.sid,n);});
const ids=[21,22,23,24].map(n=>`novacor-2.0-2023.gt${n}`);
function cameraFor(box){const c=new THREE.OrthographicCamera(-.07,.07,.07,-.07,.001,10),center=box.getCenter(new THREE.Vector3());c.position.copy(center).add(new THREE.Vector3(0,0,-1));c.lookAt(center);c.updateMatrixWorld();return c;}

test('Aurora group uses one union of all four real port anchors; single selection uses only its own geometry',()=>{
 assert.equal(typeof highlight.highlightSelection,'function','projection-selection feature is missing');
 const group=highlight.highlightSelection(ids,null,nodes),single=highlight.highlightSelection(ids,ids[0],nodes);
 assert.deepEqual(group.ids,ids);assert.deepEqual(single.ids,[ids[0]]);
 for(const id of ids)assert.ok(group.box.containsBox(new THREE.Box3().setFromObject(nodes.get(id))),id);
 assert.ok(single.box.equals(new THREE.Box3().setFromObject(nodes.get(ids[0]))));
 assert.ok(group.box.getSize(new THREE.Vector3()).x>single.box.getSize(new THREE.Vector3()).x*1.5);
 assert.ok(!single.box.containsBox(new THREE.Box3().setFromObject(nodes.get(ids[2]))));
});

test('empty or stale selection produces no highlight instead of falling back to a previous group',()=>{
 assert.equal(typeof highlight.highlightSelection,'function','selection-clearing feature is missing');
 for(const [group,port]of [[[],null],[ids,'old-model.gt21'],[['missing'],null]]){
  const result=highlight.highlightSelection(group,port,nodes);assert.deepEqual(result.ids,[]);assert.equal(result.box,null);
 }
});

test('projected group and single bounds follow camera orbit, zoom and viewport resizing',()=>{
 assert.equal(typeof highlight.projectHighlightBounds,'function','screen projection feature is missing');
 const group=highlight.highlightSelection(ids,null,nodes).box,single=highlight.highlightSelection(ids,ids[0],nodes).box,camera=cameraFor(group);
 const a=highlight.projectHighlightBounds(group,camera,800,600),s=highlight.projectHighlightBounds(single,camera,800,600);
 assert.ok(a.width>s.width*1.5);assert.ok(a.x<=s.x&&a.y<=s.y&&a.x+a.width>=s.x+s.width&&a.y+a.height>=s.y+s.height);
 camera.zoom=1.5;camera.updateProjectionMatrix();const zoomed=highlight.projectHighlightBounds(group,camera,800,600);assert.ok(zoomed.width>a.width);
 const narrow=highlight.projectHighlightBounds(group,camera,320,600);assert.ok(narrow.width<zoomed.width);assert.ok(narrow.x>=2&&narrow.x+narrow.width<=318);
 const center=group.getCenter(new THREE.Vector3());camera.position.copy(center).add(new THREE.Vector3(.6,.3,-1));camera.lookAt(center);camera.updateMatrixWorld();
 assert.notDeepEqual(highlight.projectHighlightBounds(group,camera,800,600),zoomed);
});

test('projection hides offscreen, behind-camera or unavailable targets and clips only visible bounds',()=>{
 assert.equal(typeof highlight.projectHighlightBounds,'function','projection visibility feature is missing');
 const box=new THREE.Box3(new THREE.Vector3(-.1,-.1,-.1),new THREE.Vector3(.1,.1,.1));const camera=cameraFor(box);
 assert.equal(highlight.projectHighlightBounds(null,camera,320,600),null);assert.equal(highlight.projectHighlightBounds(box,camera,0,600),null);
 const off=box.clone().translate(new THREE.Vector3(10,0,0));assert.equal(highlight.projectHighlightBounds(off,camera,320,600),null);
 const behind=box.clone().translate(new THREE.Vector3(0,0,-2));assert.equal(highlight.projectHighlightBounds(behind,camera,320,600),null);
 const visible=highlight.projectHighlightBounds(box,camera,320,600);assert.ok(visible.x>=2&&visible.y>=2);assert.ok(visible.x+visible.width<=318&&visible.y+visible.height<=598);
});
