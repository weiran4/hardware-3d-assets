import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import {functionalSubtypes,bankContactMap,sharedContent} from '../src/rtds-functional-groups.js';import{portGroups}from'../src/rtds-state.js';
const meta=id=>JSON.parse(readFileSync(`public/assets/rtds/${id}.json`));
test('same-purpose NovaCor ports and GTAI channels collapse without losing physical anchors',()=>{
 for(const [id,group,count]of [['novacor-2.0-2023','aurora',4],['novacor-2.0-2023','gtio',20],['novacor-2.0-2023','irc',6],['gtai-v2-2.31','analogue_input',12]]){const m=meta(id),g=portGroups(m).find(g=>g.id===group),types=functionalSubtypes(m,g);assert.equal(types.length,1);assert.equal(types[0].ports.length,count);assert.deepEqual(types[0].ports.map(p=>p.id),g.ports.map(p=>p.id));}
});
test('upstream/downstream, known/unknown power and GTAO NovaCor-only channels never merge',()=>{
 for(const id of ['gtdi-v2-2.01','gtdo-v2-2.00','gtai-v2-2.31','gtao-v2-2.20']){const m=meta(id);for(const group of ['optical','power']){const types=functionalSubtypes(m,portGroups(m).find(g=>g.id===group));assert.equal(types.length,2);assert.equal(types[0].ports.length,1);assert.equal(types[1].ports.length,1);}}
 const m=meta('gtao-v2-2.20'),types=functionalSubtypes(m,portGroups(m).find(g=>g.id==='analog_output'));assert.deepEqual(types.map(t=>t.ports.length),[12,4]);assert.match(sharedContent(m,types[1]).rows.find(r=>r[0]==='版本条件')[1],/仅 NovaCor/);
});
test('DI/DO show one common pattern and exact eight-bank odd/even numbering, including first positions',()=>{
 for(const id of ['gtdi-v2-2.01','gtdo-v2-2.00']){const m=meta(id),g=portGroups(m).find(g=>g.id.startsWith('digital_')),types=functionalSubtypes(m,g);assert.equal(types.length,1);const map=bankContactMap(types[0].ports);assert.equal(map.length,8);assert.deepEqual(map[0].odd,['1','3','5','7']);assert.deepEqual(map[0].even,['2','4','6','8']);assert.deepEqual(map[7].odd,['57','59','61','63']);assert.deepEqual(map[7].even,['58','60','62','64']);assert.equal(map[0].oddCommon,id.startsWith('gtdi')?'V+(WET)':'V+');assert.equal(map[0].evenCommon,id.startsWith('gtdi')?'GND':'V-');assert.ok(!sharedContent(m,types[0]).rows.some(r=>r[0]==='本插头标识'));}
});
test('unresolved service groups have no invented subtype',()=>{const m=meta('gtdi-v2-2.01');assert.deepEqual(functionalSubtypes(m,portGroups(m).find(g=>g.id==='service_unresolved')),[]);});
