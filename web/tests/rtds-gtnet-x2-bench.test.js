import test from 'node:test';
import assert from 'node:assert/strict';
import {wireX2,x2Pairs} from '../src/rtds-gtnet-x2-bench-state.js';
import {defaultGtnetX2,checkGtnetX2} from '../src/rtds-gtnet-x2-state.js';
import {parseTeachingRoute} from '../src/rtds-lesson-context.js';
test('course32 routes to x2 not v3',()=>assert.deepEqual(parseTeachingRoute('#rtds-presentation-32'),{hardware:'gtnet-x2',lesson:'gtnetX2'}));
test('known pairs toggle, cross role and wrong medium leave state unchanged',()=>{
 for(const [key,{a,b,medium}] of Object.entries(x2Pairs)){
 const s=wireX2(defaultGtnetX2,a,b,medium);assert.equal(s[key],false);
 assert.equal(wireX2(s,b,a,medium)[key],true);
 assert.deepEqual(wireX2(defaultGtnetX2,a,b,medium==='gt'?'ethernet':'gt'),defaultGtnetX2);
 }
 assert.deepEqual(wireX2(defaultGtnetX2,'N.GT1','X.LAN_A','gt'),defaultGtnetX2);
});
test('PRP runtime remains valid without B GT but setup does not',()=>{
 const s=wireX2({...defaultGtnetX2,mode:'prp'},'N.GT2','X.GT_B','gt');
 assert.equal(checkGtnetX2(s).status,'match');assert.equal(checkGtnetX2({...s,stage:'setup'}).status,'invalid');
});
