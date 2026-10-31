import test from 'node:test';
import assert from 'node:assert/strict';
import {cards,railBudget,lightState,chapters} from '../src/rtds-cabinet-state.js';
test('V2 cards retain source power and per-rail capacity',()=>{assert.equal(cards.gtaov2.watts,15);assert.equal(railBudget({gtaov2:6}).watts,90);assert.equal(railBudget({gtaov2:6}).amps,3.75);assert.equal(railBudget({gtdov2:20}).status,'within');assert.equal(railBudget({gtaov2:7}).status,'over');assert.equal(railBudget({gtaov2:7}).remaining,-5);});
test('rails cannot pool their unused capacity',()=>{const left=railBudget({gtaov2:7}),right=railBudget({});assert.equal(left.status,'over');assert.equal(right.watts,0);});
test('reject invalid entries without treating them as safe',()=>{for(const value of [-1,1.5,NaN,Infinity,'', '2'])assert.equal(railBudget({gtaov2:value}).status,'invalid');assert.equal(railBudget({madeup:1}).status,'invalid');});
test('internal light depends on rear LED switch and local light switch',()=>{assert.deepEqual(lightState(false,true),{blue:false,internal:false});assert.deepEqual(lightState(true,false),{blue:true,internal:false});assert.deepEqual(lightState(true,true),{blue:true,internal:true});});
test('29 units preserve V2/V1 split and do not claim complete coverage',()=>{assert.equal(chapters.length,29);assert.equal(chapters[0].pages,'16–36');assert.equal(chapters[0].status,'基础版 · 完善中');assert.equal(chapters[1].pages,'37–64');assert.ok(chapters.slice(1).every(c=>c.status==='待推进'));});

test('chapter reading center temporarily yields the floating model',async()=>{const {chapterOwnsViewport}=await import('../src/rtds-cabinet-state.js');assert.equal(chapterOwnsViewport({top:100,bottom:1100},900),true);assert.equal(chapterOwnsViewport({top:850,bottom:1800},900),false);assert.equal(chapterOwnsViewport({top:-1000,bottom:-100},900),false);});

test('physical rail capacity uses rear-view V2 millimetres, not pooled space',async()=>{
 const {railSpaceBudget,railLengthsMm}=await import('../src/rtds-cabinet-state.js');
 assert.deepEqual(railLengthsMm,{left:1440,right:1340});
 assert.equal(railSpaceBudget({},'left').usedMm,0);
 const left=railSpaceBudget({gtdov2:7},'left'),right=railSpaceBudget({gtdov2:7},'right');
 assert.equal(left.usedMm,1379);assert.equal(left.remainingMm,61);assert.equal(left.status,'within');
 assert.equal(right.usedMm,1379);assert.equal(right.remainingMm,-39);assert.equal(right.status,'over');
 assert.equal(railBudget({gtdov2:7}).watts,35);
});
test('space sums mixed V2 cards exactly and remains separate from power',async()=>{
 const {railSpaceBudget}=await import('../src/rtds-cabinet-state.js');
 assert.equal(railSpaceBudget({gtaov2:1,gtaiv2:2,gtdiv2:1,gtdov2:2},'right').usedMm,1182);
 assert.equal(railBudget({gtdov2:20}).status,'within');
 assert.equal(railSpaceBudget({gtdov2:20},'left').status,'over');
 assert.equal(railSpaceBudget({gtdov2:20},'left').usedMm,3940);
 assert.ok(['gtaov2','gtaiv2','gtdiv2','gtdov2'].every(key=>cards[key].lengthMm===197));
});
test('invalid rail and counts never receive a passing physical budget',async()=>{
 const {railSpaceBudget}=await import('../src/rtds-cabinet-state.js');
 for(const n of [-1,1.5,NaN,Infinity,'','2',1001])assert.equal(railSpaceBudget({gtaov2:n},'left').status,'invalid');
 assert.equal(railSpaceBudget({madeup:1},'left').status,'invalid');
 assert.equal(railSpaceBudget({},'front').status,'invalid');
});

test('prototype property names are not valid card identities',async()=>{
 const {railSpaceBudget}=await import('../src/rtds-cabinet-state.js');
 for(const key of ['toString','constructor','__proto__']){
  const counts=Object.fromEntries([[key,1]]);
  assert.equal(railBudget(counts).status,'invalid');
  assert.equal(railSpaceBudget(counts,'left').status,'invalid');
 }
});

test('legacy digital cards retain exact power revisions and V1 nominal lengths',()=>{
 assert.deepEqual(cards.gtdiv111,{name:'GTDI V1.11',watts:6,lengthMm:266});
 assert.deepEqual(cards.gtdov121,{name:'GTDO V1.21',watts:12,lengthMm:285});
 assert.equal(railBudget({gtdiv1:1}).status,'invalid');
 assert.equal(railBudget({gtdov1:1}).status,'invalid');
});
test('mixed-generation normal example uses heterogeneous lengths and separate power',async()=>{
 const {railSpaceBudget}=await import('../src/rtds-cabinet-state.js');
 const counts={gtdiv111:1,gtdov121:1,gtdiv2:1,gtdov2:1};
 assert.equal(railBudget(counts).watts,31);
 assert.equal(railSpaceBudget(counts,'left').usedMm,945);
 assert.equal(railSpaceBudget(counts,'right').remainingMm,395);
});
test('five GTDO V1.21 cards fit left nominal length but not right while both power budgets fit',async()=>{
 const {railSpaceBudget}=await import('../src/rtds-cabinet-state.js');
 assert.equal(railBudget({gtdov121:5}).watts,60);
 assert.equal(railSpaceBudget({gtdov121:5},'left').remainingMm,15);
 assert.equal(railSpaceBudget({gtdov121:5},'right').remainingMm,-85);
 for(const n of [-1,1.5,NaN,1001])assert.equal(railSpaceBudget({gtdiv111:n},'left').status,'invalid');
});
