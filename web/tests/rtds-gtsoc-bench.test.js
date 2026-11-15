import test from 'node:test';import assert from 'node:assert/strict';
import * as lab from '../src/rtds-gtsoc-bench-state.js';
import {parseTeachingRoute} from '../src/rtds-lesson-context.js';
test('p36 selects GTSOC, not p37',()=>{assert.deepEqual(parseTeachingRoute('#rtds-presentation-36'),{hardware:'gtsoc-v2',lesson:'gtsoc'});assert.notEqual(parseTeachingRoute('#rtds-presentation-37')?.lesson,'gtsoc');});
test('MMC needs an explicit cable connection',()=>assert.equal(lab.evaluateGtsoc(lab.defaultGtsoc).status,'disconnected'));
test('verified application group permits illustrative duplex only',()=>{assert.equal(lab.evaluateGtsoc({...lab.defaultGtsoc,connected:true}).status,'ready');});
for(const [k,v]of [['firmware','sv'],['group','rear'],['medium','copper'],['compatible',false],['returnPath',false]])test('blocks MMC mismatch '+k,()=>assert.equal(lab.evaluateGtsoc({...lab.defaultGtsoc,connected:true,[k]:v}).status,'blocked'));
for(const app of ['sv','tline','gpes','blackbox'])test(app+' is not a claimed verified loop',()=>assert.equal(lab.evaluateGtsoc({...lab.defaultGtsoc,connected:true,app}).status,'reference'));
