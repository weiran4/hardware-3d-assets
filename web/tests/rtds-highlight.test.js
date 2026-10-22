import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createPortInteraction} from '../src/rtds-interaction.js';
import {publishedModels} from '../src/rtds-models.js';
const baseline=JSON.parse(readFileSync('tests/fixtures/rtds-interaction-assets.json'));
for(const [variant,info]of Object.entries(publishedModels))test(`${variant}: every unchanged real GLB port maps to independently emissive descendant geometry`,async()=>{
 const bytes=readFileSync('public/'+info.glb.replace('./','')),json=readFileSync('public/'+info.metadata.replace('./','')),metadata=JSON.parse(json),audit=baseline.find(row=>row.variant===variant);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),audit.glbSha256);assert.equal(createHash('sha256').update(json).digest('hex'),audit.metadataSha256);
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),''),model=gltf.scene;model.updateMatrixWorld(true);
 const interaction=createPortInteraction(model,new Map(metadata.ports.map(p=>[p.id,p]))),originals=new Map(interaction.meshes.map(mesh=>[mesh,mesh.material]));
 for(const port of metadata.ports){interaction.select([port.id]);const expected=port.interactive!==false;assert.deepEqual(interaction.selectedIds(),expected?[port.id]:[]);
  const matches=interaction.meshes.filter(mesh=>interaction.anchor(mesh)===port.id);if(expected)assert.ok(matches.length>0,port.id);
  for(const mesh of interaction.meshes){const changed=mesh.material!==originals.get(mesh);assert.equal(changed,expected&&matches.includes(mesh),mesh.name);if(changed){const original=originals.get(mesh);assert.equal(mesh.material.color.getHex(),original.color.getHex());assert.equal(mesh.material.map,original.map);assert.ok(mesh.material.emissive.r>original.emissive.r);}}
 }
 const ids=metadata.ports.filter(p=>p.interactive!==false).map(p=>p.id);interaction.select(ids);assert.deepEqual(interaction.selectedIds(),ids);interaction.dispose();for(const mesh of interaction.meshes)assert.equal(mesh.material,originals.get(mesh));
});
test('nearest actual raycast chassis hit blocks ports on the hidden rear of NovaCor',async()=>{
 const bytes=readFileSync('public/assets/rtds/novacor-2.0-2023.glb'),metadata=JSON.parse(readFileSync('public/assets/rtds/novacor-2.0-2023.json'));const {scene:model}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');model.updateMatrixWorld(true);const ports=new Map(metadata.ports.map(p=>[p.id,p])),interaction=createPortInteraction(model,ports),node=interaction.meshes.find(m=>interaction.anchor(m)==='novacor-2.0-2023.gt21');const target=new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3()),ray=new THREE.Raycaster(new THREE.Vector3(target.x,target.y,2),new THREE.Vector3(0,0,-1));const hits=ray.intersectObjects(interaction.meshes,false);assert.ok(hits.length>1);assert.notEqual(interaction.pick(hits),'novacor-2.0-2023.gt21');assert.ok(hits.some(hit=>interaction.anchor(hit.object)==='novacor-2.0-2023.gt21'),'test ray must actually reach rear target behind chassis');
});
test('selection is restrained mesh emission, not an SVG rectangle or flashing overlay',()=>{const source=readFileSync('src/rtds-scene.js','utf8'),css=readFileSync('src/styles.css','utf8'),interaction=readFileSync('src/rtds-interaction.js','utf8');assert.doesNotMatch(source,/projectHighlightBounds|createElementNS|highlightCornerPath/);assert.doesNotMatch(css,/\.rtds-highlight-main/);assert.match(interaction,/emissive\.copy/);assert.doesNotMatch(interaction,/\.color\.(?:set|copy)|toneMapped\s*=/);});
