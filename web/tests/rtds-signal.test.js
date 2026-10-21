import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const flow=await import('../src/rtds-signal-state.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND'&&error.message.includes('rtds-signal-state.js'))return{};throw error;});
function initial(){assert.equal(typeof flow.createSignalFlowState,'function','conceptual flow state is not implemented');return flow.createSignalFlowState();}

test('conceptual input starts unsampled and never pretends it is a measured hardware value',()=>{
 const s=initial();assert.deepEqual(s,{input:0,sampled:null,received:null,phase:'idle',playing:false,transfers:0});
});
test('three manual stages illustrate field input, optical transport and received logical value',()=>{
 let s=initial();s=flow.signalFlowTransition(s,{type:'input',value:1});
 s=flow.signalFlowTransition(s,{type:'step'});assert.equal(s.phase,'field');assert.equal(s.sampled,1);assert.equal(s.received,null);
 s=flow.signalFlowTransition(s,{type:'step'});assert.equal(s.phase,'optical');assert.equal(s.received,null);
 s=flow.signalFlowTransition(s,{type:'step'});assert.equal(s.phase,'received');assert.equal(s.received,1);assert.equal(s.transfers,1);
});
test('an input changed during illustration is sampled on the next cycle, not rewritten in flight',()=>{
 let s=initial();s=flow.signalFlowTransition(s,{type:'step'});s=flow.signalFlowTransition(s,{type:'input',value:1});
 for(let i=0;i<2;i++)s=flow.signalFlowTransition(s,{type:'step'});assert.equal(s.received,0);assert.equal(s.input,1);
 s=flow.signalFlowTransition(s,{type:'step'});assert.equal(s.sampled,1);
});
test('presentation play/pause, manual interruption, reset and invalid input are deterministic',()=>{
 let s=initial();assert.deepEqual(flow.signalFlowTransition(s,{type:'tick'}),s);assert.deepEqual(flow.signalFlowTransition(s,{type:'input',value:24}),s);assert.deepEqual(flow.signalFlowTransition(s,{type:'wire',port:'aurora'}),s);
 s=flow.signalFlowTransition(s,{type:'play'});s=flow.signalFlowTransition(s,{type:'tick'});assert.equal(s.phase,'field');assert.equal(s.playing,true);
 s=flow.signalFlowTransition(s,{type:'pause'});assert.equal(s.playing,false);assert.deepEqual(flow.signalFlowTransition(s,{type:'tick'}),s);
 s=flow.signalFlowTransition(s,{type:'play'});s=flow.signalFlowTransition(s,{type:'step'});assert.equal(s.playing,false);assert.equal(s.phase,'optical');assert.deepEqual(flow.signalFlowTransition(s,{type:'reset'}),initial());
});
test('optical role association uses only audited exact endpoint IDs and never enables mating validation',()=>{
 initial();assert.deepEqual(flow.signalFlowEndpoints.map(e=>e.portId),['gtdi-v2-2.01.gt1','novacor-2.0-2023.gt1']);
 for(const endpoint of flow.signalFlowEndpoints){const d=JSON.parse(readFileSync(`public/assets/rtds/${endpoint.assetId}.json`));const p=d.ports.find(p=>p.id===endpoint.portId);assert.ok(p);assert.equal(p.validated_mating,false);assert.equal(p.physical_compatibility,'unknown');assert.ok(endpoint.pdfPages.length);}
});
test('signal-flow controls and limitations are explicit and separate from the original generic lesson',()=>{
 const html=readFileSync('index.html','utf8');for(const id of ['rtds-signal-flow','flow-input-0','flow-input-1','flow-step','flow-play','flow-reset','flow-received','flow-inspect-gtdi','flow-inspect-novacor'])assert.ok(html.includes(`id="${id}"`),id);
 for(const text of ['概念信号流','不是硬件执行','非测量值','不验证配接','无电压 / 时间标定'])assert.ok(html.includes(text),text);
});
