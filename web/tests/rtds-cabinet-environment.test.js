import test from 'node:test';
import assert from 'node:assert/strict';
import {environmentCheck} from '../src/rtds-cabinet-environment.js';
const normal={temperature:22,humidity:45,condensation:'none',cleanliness:'clean'};
test('environment ranges include both manual boundaries only with explicit qualitative assumptions',()=>{
 for(const [temperature,humidity] of [[15,30],[30,60],[22,45]]){
  const result=environmentCheck({...normal,temperature,humidity});
  assert.equal(result.status,'within');
  assert.deepEqual(result.checks,{temperature:'within',humidity:'within',condensation:'within',cleanliness:'within'});
 }
});
test('numeric ranges independently reject nearby values and preserve other checks',()=>{
 for(const temperature of [14.9,30.1])assert.equal(environmentCheck({...normal,temperature}).checks.temperature,'outside');
 for(const humidity of [29.9,60.1])assert.equal(environmentCheck({...normal,humidity}).checks.humidity,'outside');
 const result=environmentCheck({...normal,temperature:31});assert.equal(result.status,'outside');assert.equal(result.checks.humidity,'within');
});
test('normal numbers cannot override condensation, cleanliness or unknown conditions',()=>{
 for(const patch of [{condensation:'present'},{cleanliness:'not-clean'}])assert.equal(environmentCheck({...normal,...patch}).status,'outside');
 for(const patch of [{condensation:'unknown'},{cleanliness:'unknown'},{condensation:'unknown',cleanliness:'unknown'}])assert.equal(environmentCheck({...normal,...patch}).status,'unknown');
 assert.equal(environmentCheck({...normal,temperature:31,condensation:'unknown'}).status,'outside');
});
test('missing, nonfinite, mistyped and physically invalid RH never pass',()=>{
 for(const temperature of [NaN,Infinity,-Infinity,undefined,null,'',22+''])assert.equal(environmentCheck({...normal,temperature}).checks.temperature,'invalid');
 for(const humidity of [NaN,Infinity,undefined,null,'',-1,101])assert.equal(environmentCheck({...normal,humidity}).checks.humidity,'invalid');
 for(const humidity of [0,100])assert.equal(environmentCheck({...normal,humidity}).checks.humidity,'outside');
 for(const patch of [{condensation:'yes'},{cleanliness:'toString'}])assert.equal(environmentCheck({...normal,...patch}).status,'invalid');
 assert.equal(environmentCheck({...normal,temperature:NaN,humidity:70}).status,'invalid');
});
