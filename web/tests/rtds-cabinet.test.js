import test from 'node:test';
import assert from 'node:assert/strict';
import {cards,railBudget,lightState,chapters} from '../src/rtds-cabinet-state.js';
test('V2 cards retain source power and per-rail capacity',()=>{assert.equal(cards.gtaov2.watts,15);assert.equal(railBudget({gtaov2:6}).watts,90);assert.equal(railBudget({gtaov2:6}).amps,3.75);assert.equal(railBudget({gtdov2:20}).status,'within');assert.equal(railBudget({gtaov2:7}).status,'over');assert.equal(railBudget({gtaov2:7}).remaining,-5);});
test('rails cannot pool their unused capacity',()=>{const left=railBudget({gtaov2:7}),right=railBudget({});assert.equal(left.status,'over');assert.equal(right.watts,0);});
test('reject invalid entries without treating them as safe',()=>{for(const value of [-1,1.5,NaN,Infinity,'', '2'])assert.equal(railBudget({gtaov2:value}).status,'invalid');assert.equal(railBudget({madeup:1}).status,'invalid');});
test('internal light depends on rear LED switch and local light switch',()=>{assert.deepEqual(lightState(false,true),{blue:false,internal:false});assert.deepEqual(lightState(true,false),{blue:true,internal:false});assert.deepEqual(lightState(true,true),{blue:true,internal:true});});
test('29 units preserve V2/V1 split and do not claim complete coverage',()=>{assert.equal(chapters.length,29);assert.equal(chapters[0].pages,'16–36');assert.equal(chapters[0].status,'基础版 · 完善中');assert.equal(chapters[1].pages,'37–64');assert.ok(chapters.slice(1).every(c=>c.status==='待推进'));});

test('chapter reading center temporarily yields the floating model',async()=>{const {chapterOwnsViewport}=await import('../src/rtds-cabinet-state.js');assert.equal(chapterOwnsViewport({top:100,bottom:1100},900),true);assert.equal(chapterOwnsViewport({top:850,bottom:1800},900),false);assert.equal(chapterOwnsViewport({top:-1000,bottom:-100},900),false);});
