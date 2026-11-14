import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultGtsyncBench as base,evaluateGtsyncBench as evaluate,calculateGtsyncSkew as skew} from '../src/rtds-gtsync-bench-state.js';
import {parseTeachingRoute} from '../src/rtds-lesson-context.js';

test('page 33 and the GTSYNC lesson resolve to NovaCor 2.0 without overriding the hardware default',()=>{
 for(const hash of ['#rtds-presentation-33','#rtds-external-sync','#rtds-chapter-11a'])assert.deepEqual(parseTeachingRoute(hash),{hardware:'novacor-2.0',lesson:'externalSync'});
 assert.deepEqual(parseTeachingRoute('#rtds-hardware-novacor-2.0'),{hardware:'novacor-2.0',lesson:'analog'});
});
test('valid reference port and medium combinations lead to acquisition only after the event',()=>{
 for(const [source,input,medium] of [
  ['pps','bnc','coax'],['pps','st-time','st-timing-fiber'],['irig','bnc','coax'],['irig','st-time','st-timing-fiber'],['ptp','rj45','ethernet'],['ptp','st-ethernet','st-ethernet-fiber']
 ]){
  const s={...base,source,input,medium};
  const ready=evaluate(s);assert.equal(ready.status,'ready');assert.equal(ready.referenceLink,true);assert.equal(ready.hostLink,true);
  assert.equal(evaluate(s,'acquire').status,'locked');
 }
});
test('wrong reference port or cable and wrong NovaCor GT path cannot acquire',()=>{
 for(const [patch,code] of [
  [{input:'sync-out'},'reference-port'],[{medium:'ethernet'},'reference-medium'],[{source:'ptp',input:'bnc'},'reference-port'],
  [{source:'ptp',input:'st-time',medium:'st-timing-fiber'},'reference-port'],
  [{input:'st-time',medium:'st-ethernet-fiber'},'reference-medium'],[{host:'gtio'},'host-port'],[{hostMedium:'ethernet'},'host-medium']
 ]){
  const result=evaluate({...base,...patch,history:true},'acquire');
  assert.equal(result.status,'miswired');assert.equal(result.nextState.history,false);assert.ok(result.issues.some(i=>i.code===code));
 }
});
test('1 PPS without valid SNTP does not claim correct time-of-day; unsupported PTP switch does not lock',()=>{
 let r=evaluate({...base,sntp:false},'acquire');assert.equal(r.status,'unconfigured');assert.equal(r.referenceLink,true);assert.equal(r.issues[0].code,'sntp');
 r=evaluate({...base,source:'ptp',input:'rj45',medium:'ethernet',ptpNetwork:'ordinary-switch'},'acquire');assert.equal(r.status,'unconfigured');assert.equal(r.issues[0].code,'ptp-switch');
 r=evaluate({...base,source:'ptp',input:'rj45',medium:'ethernet',ptpNetwork:'compatible-switch',sntp:false},'acquire');assert.equal(r.status,'locked');
});
test('holdover requires a prior lock, restoration requires reacquisition, and disabled holdover loses lock',()=>{
 let r=evaluate(base,'loss');assert.equal(r.status,'lost');assert.equal(r.reason,'no-reference');assert.equal(r.nextState.history,false);
 const locked=evaluate(base,'acquire').nextState;
 r=evaluate(locked,'loss');assert.equal(r.status,'holdover');assert.equal(r.nextState.available,false);
 r=evaluate(r.nextState,'restore');assert.equal(r.status,'ready');assert.equal(r.nextState.history,false);
 r=evaluate({...locked,holdover:false},'loss');assert.equal(r.status,'lost');assert.equal(r.reason,'overflow');assert.equal(evaluate(r.nextState).reason,'overflow');assert.equal(r.nextState.history,false);
 assert.equal(evaluate({...base,configured:false},'acquire').status,'unconfigured');
});
test('explicit internal oscillator is neither an external link nor an external UTC lock',()=>{
 const r=evaluate({...base,source:'internal',input:'none',medium:'none',available:false},'acquire');
 assert.equal(r.status,'internal');assert.equal(r.referenceLink,false);assert.equal(r.nextState.history,false);
});
test('host compensation arithmetic is independent of lock and is not clamped',()=>{
 assert.deepEqual(skew(2),{ns:760,inRange:true});assert.deepEqual(skew(49.8),{ns:999,inRange:true});assert.deepEqual(skew('50'),{ns:1000,inRange:false});
 for(const invalid of [-1,'',null,NaN,Infinity,{},true])assert.equal(skew(invalid),null);
});
test('signed source correction delays/advances, stays separate from skew and does not clamp',async()=>{
 const {describeSyncCorrection: correction}=await import('../src/rtds-gtsync-bench-state.js');
 assert.deepEqual(correction(5000),{ns:5000,inRange:true,direction:'later'});
 assert.deepEqual(correction('-5000'),{ns:-5000,inRange:true,direction:'earlier'});
 assert.deepEqual(correction(0),{ns:0,inRange:true,direction:'unchanged'});
 assert.deepEqual(correction(-5001),{ns:-5001,inRange:false,direction:'earlier'});
 for(const invalid of ['',null,NaN,Infinity,{},true])assert.equal(correction(invalid),null);
});
test('illustrated simulation phase does not advance when start is unconfirmed or overflow stops the case',()=>{
 const locked=evaluate(base,'acquire');
 assert.equal(evaluate(base).simulatorRunning,false);
 assert.equal(locked.simulatorRunning,true);
 assert.equal(evaluate(locked.nextState,'loss').simulatorRunning,true);
 assert.equal(evaluate({...locked.nextState,holdover:false},'loss').simulatorRunning,false);
 assert.equal(evaluate({...base,source:'internal',input:'none',medium:'none'}).simulatorRunning,true);
});
