import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import test from 'node:test';
import {Box3,Raycaster,Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const folder=new URL('../public/models/photo-bench/',import.meta.url);
const bytes=async file=>readFile(new URL(file,folder));
const lightPortIds=['gbh','irc1','eth','wif','internal_i1','internal_i2','i1','i2','do1','di1','ao','ai'];

test('photo bench assets keep linked hardware caps and mouths aligned to original GLB geometry',async()=>{
 const map=JSON.parse(await bytes('anchors.json'));
 const loader=new GLTFLoader();
 for(const stem of ['light','gbh','irc']){
   const transport=await bytes(stem+'.glb'+(stem==='gbh'?'.gz':''));
   assert.ok(transport.length<5500000,stem+' HTTP download budget');
   const glb=stem==='gbh'?gunzipSync(transport):transport;
   assert.equal(createHash('sha256').update(glb).digest('hex'),map.sha256[stem],stem+' metadata mismatch');
   assert.ok(glb.length<20000000,stem+' download budget');
   const embedded=JSON.parse(glb.toString('utf8',20,20+glb.readUInt32LE(12)));
   assert.ok(!embedded.images?.length,stem+' uses no raster textures');
   assert.ok(embedded.buffers.every(b=>!b.uri),stem+' uses no external buffer');
   const {scene}=await loader.parseAsync(glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength),'');
   scene.updateMatrixWorld(true);
   const ext=new Box3().setFromObject(scene).getSize(new Vector3());
   assert.ok(ext.x>.44&&ext.x<.51,stem+' rack fascia width');
   assert.ok(ext.y>.10&&ext.y<.4,stem+' upright fascia height');
   let draws=0;
   scene.traverse(node=>{if(node.isMesh)draws++;});
   assert.ok(draws<=14&&draws>2,stem+' batched meshes');
   if(stem==='light'){
     const ports=lightPortIds.map(id=>{
       let o;scene.traverse(n=>{if(n.userData.kind==='anchor'&&n.userData.sid==='novacor-light-photo-refinement.'+id)o=n;});
       assert.ok(o,id+' anchor present');
       const p=o.getWorldPosition(new Vector3());
       assert.ok(p.z<-.255&&p.z>-.277,id+' on rear panel');
       return p.toArray().join(',');
     });
     assert.equal(new Set(ports).size,lightPortIds.length,'each used Light socket is distinct');
   }else{
     if(stem==='irc'){
       assert.equal(map.ircRearMains.length,2);
       for(const point of map.ircRearMains){
         const p=new Vector3(...point);
         // Rear camera faces toward +Z from -Z. A negative model X projects right.
         assert.ok(p.x<0&&p.y>.29&&p.z<-.30,'IRC rear mains on viewer-right upper panel');
         const hits=new Raycaster(p.clone().add(new Vector3(0,0,-.015)),new Vector3(0,0,1),0,.020).intersectObject(scene);
         assert.ok(hits.length>0&&hits[0].point.distanceTo(p)<.0001,'IRC rear inlet cavity surface');
       }
     }
     for(const point of [map[stem].a,map[stem].b]){
       const p=new Vector3(...point);
       const hits=new Raycaster(p.clone().add(new Vector3(0,0,.035)),new Vector3(0,0,-1),0,.040).intersectObject(scene);
       assert.ok(hits.length>0,stem+' cap surface missing');
       assert.ok(hits[0].point.distanceTo(p)<.0003,stem+' front cap center not aligned');
     }
   }
 }
});
