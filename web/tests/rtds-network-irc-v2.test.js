import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {Raycaster,Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {preparePhotoAsset} from '../src/rtds-photo-bench-assets.js';
import {buildNetworkIrc,ircV2CapPoint} from '../src/rtds-network-irc-v2.js';

test('IRC V2 p1–p8 reach eight distinct lower-row dust caps on pictured card 1',async()=>{
 const bytes=await readFile(new URL('../public/models/photo-bench/irc.glb',import.meta.url));
 const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const asset=preparePhotoAsset('irc',scene,{});
 const {group,anchors}=buildNetworkIrc(asset,8,asset.size.x);
 group.updateMatrixWorld(true);
 assert.deepEqual(Object.keys(anchors),Array.from({length:8},(_,i)=>'IRC.p'+(i+1)));
 assert.equal(Object.keys(buildNetworkIrc(asset,0,.487).anchors).length,0);
 const seen=[];
 for(let n=1;n<=8;n++){
  const p=ircV2CapPoint(n);
  assert.ok(Math.abs(p.y-.0363)<1e-8);
  const hits=new Raycaster(p.clone().add(new Vector3(0,0,.015)),new Vector3(0,0,-1),0,.020).intersectObject(scene);
  assert.equal(hits[0]?.object.name,'Dark_optical_dust_caps_geometry');
  assert.ok(hits[0].point.distanceTo(p)<.0001);
  assert.ok(anchors['IRC.p'+n].getWorldPosition(new Vector3()).distanceTo(p.clone().sub(asset.center))<.0001);
  seen.push(p.x);
 }
 assert.ok(seen.every((value,i)=>i===0||value>seen[i-1]));
 assert.ok(seen[6]-seen[5]>.025,'visible gap between the two 6-port banks');
 for(const n of [0,9,-1,NaN,3.2,'1'])assert.equal(ircV2CapPoint(n),null);
});
