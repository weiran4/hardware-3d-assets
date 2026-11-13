import test from 'node:test';import assert from 'node:assert/strict';
import {scopeResult,scopeSample,scopeTransition,scopeInitial} from '../src/rtds-gtao-scope-state.js';
test('Scale equals positive 5V, ideal clipping bounded',()=>{assert.equal(scopeSample(100,100),5);assert.equal(scopeSample(-100,100),-5);assert.equal(scopeSample(300,100),10);assert.equal(scopeSample(-300,100),-10);});
test('open circuit and valid paired connection',()=>{assert.equal(scopeResult(scopeInitial()).status,'open');assert.equal(scopeResult({...scopeInitial(),wiring:'normal'}).status,'ready');});
test('50ohm high current cannot operate',()=>assert.equal(scopeResult({...scopeInitial(),wiring:'normal',load:50}).status,'overload'));
test('invalid input rejected',()=>{for(const scale of [0,-1,NaN,Infinity])assert.equal(scopeResult({...scopeInitial(),scale}).status,'invalid');});
test('grounded scope reversed pair is unsafe and cannot start',()=>{assert.equal(scopeResult({...scopeInitial(),wiring:'reversed'}).status,'unsafe');assert.equal(scopeTransition({...scopeInitial(),wiring:'reversed'},{type:'play'}).playing,false);});
test('running locks wiring and settings; pause permits',()=>{const s=scopeTransition({...scopeInitial(),wiring:'normal'}, {type:'play'});assert.equal(s.playing,true);assert.equal(scopeTransition(s,{type:'wiring',value:'open'}),s);assert.equal(scopeTransition(scopeTransition(s,{type:'pause'}),{type:'wiring',value:'open'}).wiring,'open');});
test('invalid/unsafe cannot start, replay resets time',()=>{assert.equal(scopeTransition(scopeInitial(),{type:'play'}).playing,false);assert.equal(scopeTransition({...scopeInitial(),wiring:'normal',time:2},{type:'replay'}).time,0);});
