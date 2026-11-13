import test from 'node:test';
import assert from 'node:assert/strict';
import {setGtaiMeterHidden} from '../src/rtds-gtai-visibility.js';
// Model the browser contract: every reflected hidden property write queues the
// body subtree MutationObserver, which invokes availability -> render again.
function fixture(initial){let hidden=initial,writes=0;const queue=[];const element={get hidden(){return hidden;},set hidden(v){hidden=v;writes++;queue.push(()=>setGtaiMeterHidden(element,v));}};return {element,queue,get writes(){return writes;}};}
test('unchanged hidden state does not retrigger subtree observer',()=>{const f=fixture(true);for(let i=0;i<100;i++)setGtaiMeterHidden(f.element,true);assert.equal(f.writes,0);assert.equal(f.queue.length,0);});
test('a visibility transition settles after one observer callback',()=>{const f=fixture(false);setGtaiMeterHidden(f.element,true);for(let i=0;i<10&&f.queue.length;i++)f.queue.shift()();assert.equal(f.writes,1);assert.equal(f.queue.length,0);setGtaiMeterHidden(f.element,false);for(let i=0;i<10&&f.queue.length;i++)f.queue.shift()();assert.equal(f.writes,2);assert.equal(f.queue.length,0);});
