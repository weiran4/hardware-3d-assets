import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publishedModels} from '../src/rtds-models.js';
import {catalog} from '../src/rtds-catalog.js';
import {portGroups} from '../src/rtds-state.js';
const variants=[
 {variant:'gtdo-v2',asset:'gtdo-v2-2.00',pcb:'2.00',group:'digital_output',plugs:16,contacts:80,anchors:24,unresolved:4},
 {variant:'gtai-v2',asset:'gtai-v2-2.31',pcb:'2.31',group:'analogue_input',plugs:12,contacts:36,anchors:18,unresolved:2},
 {variant:'gtao-v2',asset:'gtao-v2-2.20',pcb:'2.20',group:'analog_output',plugs:16,contacts:32,anchors:22,unresolved:2}
];
for(const v of variants)test(`${v.asset} ships its own reviewed version, port inventory and unresolved-service boundary`,()=>{
 const info=publishedModels[v.variant];assert.ok(info,`${v.asset} is not integrated yet`);const data=JSON.parse(readFileSync('public/'+info.metadata.replace('./','')));
 assert.equal(data.asset_id,v.asset);assert.equal(data.pcb_revision,v.pcb);assert.equal(data.ports.length,v.anchors);assert.ok(catalog.find(c=>c.id===v.variant).revision.includes(v.pcb));
 const field=data.ports.filter(p=>p.group===v.group);assert.equal(field.length,v.plugs);assert.equal(field.reduce((s,p)=>s+p.visible_contact_count,0),v.contacts);
 assert.equal(data.ports.filter(p=>p.interactive===false).length,v.unresolved);assert.equal(portGroups(data).find(g=>g.id==='service_unresolved').interactive,false);
 assert.deepEqual(data.ports.find(p=>p.id.endsWith('.power2')).contact_labels,[null,null,null,null]);
 for(const p of data.ports){assert.equal(p.validated_mating,false);assert.equal(p.physical_compatibility,'unknown');}
 const b=readFileSync('public/'+info.glb.replace('./','')),doc=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12))),nodes=new Map(doc.nodes.filter(n=>n.extras?.sid).map(n=>[n.extras.sid,n]));assert.equal(doc.images?.length??0,0);
 for(const p of data.ports){assert.ok(nodes.has(p.id));assert.deepEqual(JSON.parse(nodes.get(p.id).extras.port_record),p);}
 if(v.variant==='gtdo-v2')assert.equal(new Set(field.flatMap(p=>p.contact_labels).filter(x=>/^\d+$/.test(x))).size,64);
 if(v.variant==='gtai-v2')for(const p of field)assert.deepEqual(p.contact_labels,['+','-','GND']);
 if(v.variant==='gtao-v2')for(const p of field.filter(p=>p.channel>=13))assert.equal(p.availability,'NovaCor only');
});
test('legacy GTIO variants remain reference-only; a new V2 model is not a renamed V1',()=>{
 for(const id of ['gtdo-v1','gtai-v1','gtao-v1'])assert.equal(publishedModels[id],undefined);
});
