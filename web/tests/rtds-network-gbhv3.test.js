import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {Vector3,Raycaster} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {gbhCapPoint,buildNetworkGbh} from '../src/rtds-network-gbhv3.js';
import {preparePhotoAsset} from '../src/rtds-photo-bench-assets.js';

test('GBH p1–p8 rays hit eight numbered first-row dust-cap faces in the original model',async()=>{
 const glb=gunzipSync(await readFile(new URL('../public/models/photo-bench/gbh.glb.gz',import.meta.url)));
 const {scene}=await new GLTFLoader().parseAsync(glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength),'');
 const asset=preparePhotoAsset('gbh',scene,{});
 const {group,anchors}=buildNetworkGbh(asset,8,.24);
 assert.deepEqual(Object.keys(anchors),Array.from({length:8},(_,i)=>'GBH.p'+(i+1)));
 let last=-Infinity;
 for(let channel=1;channel<=8;channel++){
  const point=gbhCapPoint(channel);
  assert.ok(point.x>last);
  const hit=new Raycaster(new Vector3(point.x,point.y,.18),new Vector3(0,0,-1),0,.08).intersectObject(scene)[0];
  assert.match(hit?.object.name??'',/removable_optical_dust_inserts/);
  assert.ok(hit.point.distanceTo(point)<.00001);
  assert.ok(anchors['GBH.p'+channel].getWorldPosition(new Vector3()).distanceTo(point.clone().sub(asset.center).multiplyScalar(group.scale.x))<1e-8);
  last=point.x;
 }
 assert.equal(gbhCapPoint(9),null);
 assert.equal(gbhCapPoint(0),null);
});
