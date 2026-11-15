import test from 'node:test';import assert from 'node:assert/strict';import * as lab from '../src/rtds-blackbox-state.js';import {parseTeachingRoute} from '../src/rtds-lesson-context.js';
test('p37 separate GTSOC route, p36 preserved',()=>{assert.deepEqual(parseTeachingRoute('#rtds-presentation-37'),{hardware:'gtsoc-v2',lesson:'blackbox'});assert.deepEqual(parseTeachingRoute('#rtds-presentation-36'),{hardware:'gtsoc-v2',lesson:'gtsoc'});});
test('not connected until user action',()=>assert.equal(lab.evaluateBlackbox().status,'disconnected'));
test('valid offline loop',()=>assert.equal(lab.evaluateBlackbox({...lab.defaultBlackbox,connected:true}).status,'ready'));
for(const [key,value]of [['socPort','front'],['hostPort','aurora'],['medium','ethernet'],['firmware','sv'],['artifact','library'],['mapping',false],['feedback',false]])test('reject '+key,()=>assert.equal(lab.evaluateBlackbox({...lab.defaultBlackbox,connected:true,[key]:value}).status,'blocked'));
test('budget exceeds illustrative sample window',()=>{const r=lab.evaluateBlackbox({...lab.defaultBlackbox,connected:true,work:9,sample:4});assert.equal(r.status,'overbudget');assert.equal(r.budget.remaining,-5);});
test('budget has no measured units and boundary is inclusive',()=>{const r=lab.evaluateBlackbox({...lab.defaultBlackbox,connected:true,work:4,sample:4});assert.equal(r.status,'ready');assert.equal(r.budget.remaining,0);});
for(const v of [-1,0,NaN,Infinity])test('invalid synthetic sample '+v,()=>assert.equal(lab.evaluateBlackbox({...lab.defaultBlackbox,connected:true,sample:v}).status,'blocked'));
