import test from 'node:test';
import assert from 'node:assert/strict';
const power=await import('../src/rtds-power-state.js').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
function initial(){assert.equal(typeof power.createPowerLessonState,'function','GTIO power playback is not implemented');return power.createPowerLessonState();}
test('supply starts off and one action starts both harnesses from the same clock',()=>{
 let s=initial();assert.deepEqual(s,{elapsedMs:0,playing:false,started:false});assert.equal(power.powerPresentation(s).energized,false);
 s=power.powerLessonTransition(s,{type:'replay'});s=power.powerLessonTransition(s,{type:'tick',deltaMs:800});
 const p=power.powerPresentation(s);assert.equal(p.feedProgress,.5);assert.equal(p.jumperProgress,.5);assert.equal(p.energized,false);assert.equal(p.connected,false);
});
test('hookup completes with power off before both parallel cards receive the same source voltage',()=>{
 let s=power.powerLessonTransition(initial(),{type:'replay'});
 s=power.powerLessonTransition(s,{type:'tick',deltaMs:1600});let p=power.powerPresentation(s);assert.equal(p.connected,true);assert.equal(p.energized,false);assert.deepEqual(p.cardVoltage,[0,0]);
 s=power.powerLessonTransition(s,{type:'tick',deltaMs:300});p=power.powerPresentation(s);assert.equal(p.energized,true);assert.deepEqual(p.cardVoltage,[24,24]);assert.equal(p.sourceVoltage,24);
});
test('replay resets every harness and voltage; pause and resume preserve shared time',()=>{
 let s=power.powerLessonTransition(initial(),{type:'replay'});s=power.powerLessonTransition(s,{type:'tick',deltaMs:2100});s=power.powerLessonTransition(s,{type:'pause'});
 assert.equal(s.playing,false);assert.deepEqual(power.powerLessonTransition(s,{type:'tick',deltaMs:500}),s);
 s=power.powerLessonTransition(s,{type:'play'});assert.equal(s.elapsedMs,2100);s=power.powerLessonTransition(s,{type:'replay'});assert.equal(s.elapsedMs,0);assert.equal(power.powerPresentation(s).energized,false);
});
test('playback reaches a stable final supply state rather than looping or accepting invalid time',()=>{
 let s=power.powerLessonTransition(initial(),{type:'replay'});for(const deltaMs of [-1,NaN,Infinity])assert.deepEqual(power.powerLessonTransition(s,{type:'tick',deltaMs}),s);
 s=power.powerLessonTransition(s,{type:'tick',deltaMs:90000});assert.equal(s.elapsedMs,6000);assert.equal(s.playing,false);assert.equal(power.powerPresentation(s).energized,true);
 s=power.powerLessonTransition(s,{type:'play'});assert.equal(s.elapsedMs,0);assert.equal(s.playing,true);
});
test('reduced motion seats without animation but keeps the connect-before-power order',()=>{
 let s=initial();assert.equal(power.powerPresentation(s,true).energized,false);assert.equal(power.powerPresentation(s,true).connected,false);
 s=power.powerLessonTransition(s,{type:'replay'});const p=power.powerPresentation(s,true);assert.equal(p.connected,true);assert.equal(p.energized,false);assert.equal(p.feedProgress,1);assert.equal(p.jumperProgress,1);assert.equal(p.pulsePhase,null);
 s=power.powerLessonTransition(s,{type:'tick',deltaMs:1900});assert.equal(power.powerPresentation(s,true).energized,true);assert.equal(power.powerPresentation(s,true).pulsePhase,null);
});
test('unrecognized sequential stage actions cannot advance the simultaneous demonstration',()=>{
 const s=initial();for(const action of [{type:'step'},{type:'wire',pin:1},{type:'stage',stage:2}])assert.deepEqual(power.powerLessonTransition(s,action),s);
});
