import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scrollDestinationError} from './helpers/scroll-destination.js';
function element({absoluteTop=2000,scrollTop=1984,scrollHeight=6000,clientHeight=1050,margin=16}={}){
 return {getBoundingClientRect:()=>({top:absoluteTop-scrollTop}),ownerDocument:{scrollingElement:{scrollTop,scrollHeight,clientHeight},defaultView:{getComputedStyle:()=>({scrollMarginTop:String(margin)+'px'})}}};
}
test('scroll destination accounts for margin and rejects smooth-scroll intermediate positions',()=>{
 assert.equal(scrollDestinationError(element()),0);
 assert.equal(scrollDestinationError(element({scrollTop:1500})),484);
});
test('scroll destination is clamped to the document bottom, not an unreachable margin alignment',()=>{
 const args={absoluteTop:5000,scrollHeight:5866.453125,scrollTop:4816.453125};
 assert.equal(scrollDestinationError(element(args)),0);
 assert.equal(scrollDestinationError(element({...args,scrollTop:4000})),816.453125);
});
test('scroll destination clamps top and short documents without treating any stable position as correct',()=>{
 assert.equal(scrollDestinationError(element({absoluteTop:8,scrollTop:0})),0);
 assert.equal(scrollDestinationError(element({absoluteTop:8,scrollTop:100})),100);
 assert.equal(scrollDestinationError(element({absoluteTop:80,scrollTop:0,scrollHeight:900})),0);
});
