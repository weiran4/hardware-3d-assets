import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog, sources} from '../src/rtds-catalog.js';
import {createGalleryState, galleryTransition, portGroups, gltfDirection, inspectionFrame} from '../src/rtds-state.js';

test('RTDS catalog preserves 18 distinct reference identities and source-only media links',()=>{
 assert.equal(catalog.length,18);assert.equal(new Set(catalog.map(a=>a.id)).size,18);
 assert.ok(catalog.find(a=>a.id==='novacor-2.0'));assert.ok(catalog.find(a=>a.id==='gtdi-v2'));
 for(const a of catalog){assert.ok(a.name&&a.summary&&a.revision);assert.ok(a.evidence.length);}
 for(const s of Object.values(sources))if(s.url)assert.match(s.url,/^https:\/\/(knowledge\.|www\.)?rtds\.com\//);
 assert.ok(!JSON.stringify(catalog).match(/\/workspace\/|[A-Z]:\\|private-original/));
});
test('gallery state isolates reference selection from the generic wiring lesson',()=>{
 let s=createGalleryState();assert.equal(s.variantId,'novacor-2.0');assert.equal(s.group,null);
 s=galleryTransition(s,{type:'group',group:'gtio'});assert.equal(s.group,'gtio');
 s=galleryTransition(s,{type:'port',portId:'novacor-2.0-2023.gt1'});assert.equal(s.portId,'novacor-2.0-2023.gt1');
 s=galleryTransition(s,{type:'tour',playing:true});s=galleryTransition(s,{type:'variant',variantId:'gtdi-v2'});
 assert.equal(s.variantId,'gtdi-v2');assert.equal(s.group,null);assert.equal(s.portId,null);assert.equal(s.playing,false);
 assert.deepEqual(galleryTransition(s,{type:'connect',port:'out'}),s);
});
test('port groups are derived from actual IDs with no invented ports or mating approval',()=>{
 const m={ports:[{id:'asset.gt1',group:'gtio'},{id:'asset.gt2',group:'gtio'},{id:'asset.udp',group:'udp'}]};
 const groups=portGroups(m);assert.equal(groups.length,2);assert.equal(groups[0].ports.length,2);
 assert.deepEqual(groups.flatMap(g=>g.ports.map(p=>p.id)),m.ports.map(p=>p.id));
 assert.deepEqual(portGroups(null),[]);
});
test('RTDS camera uses exporter Y-up once and fits portrait and extreme detail views',()=>{
 assert.deepEqual(gltfDirection([0,-1,0]),[0,0,1]);
 for(const [width,height]of [[320,500],[1440,700]]){
  const f=inspectionFrame([.483,.178,.522],width,height);
  assert.ok(f.right-f.left>=.483*1.15);assert.ok(f.top-f.bottom>=.522*1.15);
 }
});

test('RTDS and generic modes have separate, accessible inspection controls',async()=>{
 const {readFileSync}=await import('node:fs');const html=readFileSync('index.html','utf8');
 for(const id of ['mode-generic','mode-rtds','generic-panel','rtds-panel','rtds-scene','rtds-catalog','rtds-group-list','rtds-port-list','rtds-tour','rtds-front','rtds-rear','rtds-top','rtds-reset'])assert.ok(html.includes(`id="${id}"`),id);
 assert.match(html,/不能据此外接真实设备/);
});

test('unresolved service anchors stay identifiable but are excluded from inspection tours',()=>{
 const groups=portGroups({ports:[{id:'a.known',group:'optical',interactive:true},{id:'a.unknown',group:'service_unresolved',interactive:false}]});
 assert.equal(groups[0].interactive,true);assert.equal(groups[1].interactive,false);assert.equal(groups[1].ports[0].id,'a.unknown');
});
test('camera envelope includes diagonal projection instead of only largest axis',()=>{
 const f=inspectionFrame([.483,.178,.522],1000,1000);assert.ok(f.top-f.bottom>Math.hypot(.483,.178,.522));
});

test('public RTDS GLBs retain all source identities, no images/private paths and unknown mating',async()=>{
 const {readFileSync}=await import('node:fs');const {publishedModels}=await import('../src/rtds-models.js');assert.equal(Object.keys(publishedModels).length,2);
 for(const info of Object.values(publishedModels)){
  const file=readFileSync('public/'+info.glb.replace('./',''));const data=JSON.parse(readFileSync('public/'+info.metadata.replace('./',''),'utf8'));const doc=JSON.parse(file.toString('utf8',20,20+file.readUInt32LE(12)));
  assert.equal(file.toString('ascii',0,4),'glTF');assert.equal(doc.images?.length??0,0);assert.ok(doc.meshes.length>100);
  const serialized=JSON.stringify({doc,data});assert.ok(!serialized.match(/\/workspace\/|\/home\/agent\/|[A-Z]:\\|rtds-private-manual/));
  const nodes=new Map(doc.nodes.filter(n=>n.extras?.sid).map(n=>[n.extras.sid,n]));
  for(const port of data.ports){assert.ok(nodes.has(port.id),port.id);assert.equal(nodes.get(port.id).extras.kind,'anchor');assert.equal(port.validated_mating,false);assert.equal(port.physical_compatibility,'unknown');}
  if(data.asset_id.startsWith('gtdi')){assert.equal(data.ports.filter(p=>p.group==='digital_input').reduce((n,p)=>n+p.visible_contact_count,0),80);assert.equal(data.ports.filter(p=>p.interactive===false).length,4);}
 }
});

test('internal RTDS skip anchors preserve the RTDS mode',async()=>{
 const {galleryModeFromHash}=await import('../src/rtds-state.js');assert.equal(galleryModeFromHash('#rtds-heading'),'rtds');assert.equal(galleryModeFromHash('#rtds'),'rtds');assert.equal(galleryModeFromHash('#lesson'),'generic');
});
test('top and power views refresh OrbitControls up-frame and remain horizontally orbitable',async()=>{
 const THREE=await import('three');const {createInspectionControls,applyInspectionPose}=await import('../src/rtds-camera.js');const camera=new THREE.OrthographicCamera(-1,1,1,-1,.001,10);camera.position.set(0,0,1);let controls=createInspectionControls(camera,null);
 for(const direction of [new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,1,0)]){
  controls=applyInspectionPose(camera,controls,new THREE.Vector3(),direction,1,null);const before=camera.position.clone();controls.autoRotate=true;controls.update(1);controls.autoRotate=false;assert.ok(before.distanceTo(camera.position)>.05,'horizontal orbit must not get stuck at the old pole');
 }
});

test('GTDI lower power assignments remain unknown instead of copying the upper connector',async()=>{
 const {readFileSync}=await import('node:fs');const data=JSON.parse(readFileSync('public/assets/rtds/gtdi-v2-2.01.json','utf8'));
 assert.deepEqual(data.ports.find(p=>p.id.endsWith('.power1')).contact_labels,['+24V','GND','GND','NC']);assert.deepEqual(data.ports.find(p=>p.id.endsWith('.power2')).contact_labels,[null,null,null,null]);
});

test('GLB embedded port records agree with the shipped metadata, preventing stale model mixtures',async()=>{
 const {readFileSync}=await import('node:fs');for(const asset of ['novacor-2.0-2023','gtdi-v2-2.01']){const b=readFileSync(`public/assets/rtds/${asset}.glb`),doc=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12))),data=JSON.parse(readFileSync(`public/assets/rtds/${asset}.json`));const nodes=new Map(doc.nodes.filter(n=>n.extras?.sid).map(n=>[n.extras.sid,n]));for(const p of data.ports){const embedded=JSON.parse(nodes.get(p.id).extras.port_record);assert.deepEqual(embedded,p,p.id);}}
});

test('selected port labels do not float over the wrong hardware surface',async()=>{
 const {isPortFacingCamera}=await import('../src/rtds-state.js');assert.equal(isPortFacingCamera([0,1,0],[0,0,-1],[0,0,0]),true);assert.equal(isPortFacingCamera([0,1,0],[0,0,1],[0,0,0]),false);
});
