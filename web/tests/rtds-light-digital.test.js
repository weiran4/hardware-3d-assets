import test from 'node:test';import assert from 'node:assert/strict';
import {defaultLightDigital,evaluateLightDigital} from '../src/rtds-light-digital-state.js';
const ready={...defaultLightDigital,connected:true};
test('digital initially disconnected',()=>assert.equal(evaluateLightDigital().status,'disconnected'));
test('DI high and low teaching values',()=>{assert.equal(evaluateLightDigital(ready).reading,'1 · 24 V示例');assert.equal(evaluateLightDigital({...ready,high:false}).reading,'0 · 0 V示例');});
for(const [key,value]of [['loop','i2'],['loop','none'],['port','do'],['paired',false]])test('digital fault '+key+value,()=>assert.equal(evaluateLightDigital({...ready,[key]:value}).status,'blocked'));
test('DO bank supply and load',()=>{const s={...ready,mode:'do',port:'do'};assert.equal(evaluateLightDigital(s).reading,'输出驱动 · 24 V');assert.equal(evaluateLightDigital({...s,high:false}).reading,'输出关闭 · 不保证0 V');for(const bankVoltage of [4,31,NaN])assert.equal(evaluateLightDigital({...s,bankVoltage}).status,'blocked');assert.equal(evaluateLightDigital({...s,supplied:false}).status,'blocked');});
test('DI does not borrow DO bank supply',()=>assert.equal(evaluateLightDigital({...ready,supplied:false,bankVoltage:0}).status,'ready'));
test('invalid mode rejected',()=>assert.equal(evaluateLightDigital({...ready,mode:'ao',port:'ao'}).status,'blocked'));
