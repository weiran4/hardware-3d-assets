import test from 'node:test';
import assert from 'node:assert/strict';
import * as door from '../src/rtds-cabinet-door.js';
test('door sequence follows release then bottom-first reinstallation',()=>{
 assert.equal(typeof door.doorTransition,'function');
 let state='closed';
 for(const [action,next] of [['open','open'],['release','released'],['remove','detached'],['seat','seated'],['align','aligned'],['secure','secured']]){
  const result=door.doorTransition(state,action);assert.equal(result.status,'advanced');assert.equal(result.state,next);state=result.state;
 }
});
test('out-of-order door actions preserve state rather than illustrating unsafe success',()=>{
 for(const [state,action] of [['closed','remove'],['open','remove'],['detached','secure'],['seated','secure'],['released','seat']])assert.deepEqual(door.doorTransition(state,action),{state,status:'blocked'});
});
test('door reset supports repeat without implicit movement',()=>{
 for(const state of ['closed','open','released','detached','seated','aligned','secured'])assert.deepEqual(door.doorTransition(state,'reset'),{state:'closed',status:'reset'});
 assert.deepEqual(door.doorTransition('secured','open'),{state:'open',status:'advanced'});
});
test('invalid and prototype names cannot enter the door state graph',()=>{
 for(const state of [null,undefined,{},'constructor','__proto__','toString'])assert.equal(door.doorTransition(state,'open').status,'invalid');
 for(const action of [null,undefined,{},'constructor','__proto__','toString'])assert.equal(door.doorTransition('closed',action).status,'invalid');
});
