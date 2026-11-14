import test from 'node:test';import assert from 'node:assert/strict';
import {defaultAurora,evaluateAurora} from '../src/rtds-aurora-bench-state.js';
import {parseTeachingRoute} from '../src/rtds-lesson-context.js';
test('Aurora defaults disconnected; all four dedicated ports may connect with gates',()=>{
 assert.equal(evaluateAurora(defaultAurora).status,'disconnected');
 for(const port of ['gt21','gt22','gt23','gt24'])assert.equal(evaluateAurora({...defaultAurora,port,connected:true}).status,'ready');
});
test('Aurora gate cases never enable transfer',()=>{
 for(const patch of [{port:'gt1'},{medium:'ethernet'},{licensed:false},{compatible:false},{port:'aur1'},{medium:'unknown'}])
 assert.equal(evaluateAurora({...defaultAurora,connected:true,...patch}).ready,false);
});
test('Aurora p34 route selects matching hardware and lesson',()=>assert.deepEqual(parseTeachingRoute('#rtds-presentation-34'),{hardware:'novacor-2.0',lesson:'aurora'}));
