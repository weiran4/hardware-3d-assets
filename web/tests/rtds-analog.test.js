import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const lesson=await import('../src/rtds-analog-state.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND'&&error.message.includes('rtds-analog-state.js'))return {};throw error;});
function initial(){assert.equal(typeof lesson.createAnalogLessonState,'function','NovaCor analog lesson not implemented');return lesson.createAnalogLessonState();}
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
test('220 V RMS is a simulated sine, not a physical input or binary I/O',()=>{
 initial();const c=lesson.analogLesson;assert.equal(c.sourceRms,220);assert.equal(c.frequencyHz,50);near(c.sourcePeak,220*Math.SQRT2);assert.equal(c.outputPeak,5);assert.equal(c.hardwarePeak,10);near(c.gain,5/(220*Math.SQRT2));near(c.outputRms,5/Math.SQRT2);assert.equal(c.displayCycleMs,4000);assert.equal(c.slowdown,200);
});
test('instantaneous source and output stay proportional over a complete 50 Hz cycle',()=>{
 initial();for(const [time,source,output] of [[0,0,0],[.005,220*Math.SQRT2,5],[.01,0,0],[.015,-220*Math.SQRT2,-5],[.02,0,0]]){const p=lesson.analogSample(time);near(p.source,source);near(p.output,output);near(p.output,p.source*lesson.analogLesson.gain);}
});
test('display time is slowed and output AC RMS is constant, not the instantaneous probe reading',()=>{
 initial();for(const elapsed of [0,1000,2000,3000,4000]){const p=lesson.analogDisplaySample(elapsed);near(p.simulatedSeconds,elapsed/1000/200);near(p.output,5*Math.sin(2*Math.PI*elapsed/4000));near(p.meterRms,3.5355339059327373);}
});
test('manual stages pause playback and never show a meter value before both probes are placed',()=>{
 let s=initial();assert.equal(s.playing,false);assert.equal(s.stage,0);assert.equal(lesson.analogPresentation(s).meterReady,false);
 for(let stage=1;stage<=3;stage++){s=lesson.analogLessonTransition(s,{type:'step'});assert.equal(s.stage,stage);assert.equal(s.playing,false);assert.equal(lesson.analogPresentation(s).probesConnected,stage>=2);assert.equal(lesson.analogPresentation(s).meterReady,stage===3);}
 assert.equal(lesson.analogLessonTransition(s,{type:'step'}).stage,3);
});
test('play advances only when playing, finishes once, and restart clears all stages',()=>{
 let s=initial();assert.deepEqual(lesson.analogLessonTransition(s,{type:'tick',deltaMs:1000}),s);s=lesson.analogLessonTransition(s,{type:'play'});
 s=lesson.analogLessonTransition(s,{type:'tick',deltaMs:4500});assert.equal(s.stage,1);assert.equal(s.elapsedMs,4500);s=lesson.analogLessonTransition(s,{type:'pause'});assert.equal(s.playing,false);assert.deepEqual(lesson.analogLessonTransition(s,{type:'tick',deltaMs:1000}),s);
 s=lesson.analogLessonTransition(s,{type:'play'});s=lesson.analogLessonTransition(s,{type:'tick',deltaMs:20000});assert.equal(s.stage,3);assert.equal(s.elapsedMs,16000);assert.equal(s.playing,false);assert.equal(lesson.analogPresentation(s).meterReady,true);
 s=lesson.analogLessonTransition(s,{type:'play'});assert.equal(s.elapsedMs,0);assert.equal(s.stage,0);assert.equal(s.playing,true);assert.deepEqual(lesson.analogLessonTransition(s,{type:'restart'}),initial());
});
test('stage selection, malformed time and unknown actions cannot create invalid presentation state',()=>{
 let s=initial();for(const action of [{type:'stage',stage:4},{type:'stage',stage:-1},{type:'stage',stage:.5},{type:'tick',deltaMs:NaN},{type:'tick',deltaMs:-1},{type:'wire',port:'mains'}])assert.deepEqual(lesson.analogLessonTransition(s,action),s);
 s=lesson.analogLessonTransition(s,{type:'stage',stage:2});assert.equal(s.stage,2);assert.equal(s.playing,false);assert.equal(s.elapsedMs,9000);
 s=lesson.analogLessonTransition(s,{type:'play'});for(const deltaMs of [NaN,Infinity,-1])assert.deepEqual(lesson.analogLessonTransition(s,{type:'tick',deltaMs}),s);
});
test('physical lesson endpoint preserves exact low-voltage output identity and unknown connector certification',()=>{
 initial();const d=JSON.parse(readFileSync('public/assets/rtds/novacor-2.0-2023.json'));const p=d.ports.find(p=>p.id===lesson.analogLesson.endpoint.portId);assert.equal(p.id,'novacor-2.0-2023.ao1');assert.equal(p.group,'analogue');assert.equal(p.validated_mating,false);assert.equal(p.physical_compatibility,'unknown');
});
test('analog lesson is a separate accessible, explicitly scoped teaching animation',()=>{
 const html=readFileSync('index.html','utf8');for(const id of ['rtds-analog-lesson','analog-play','analog-step','analog-restart','analog-meter-value','analog-source-wave','analog-output-wave','analog-inspect-output'])assert.ok(html.includes(`id="${id}"`),id);
 for(const copy of ['220 V RMS','±5 V 峰值','±10 V 峰值','50 Hz','不是市电输入','不是二进制数字 I/O','3.54','200 倍慢放'])assert.ok(html.includes(copy),copy);
});
test('probe contact progress distinguishes approach from settled contact, with immediate reduced motion',()=>{
 initial();assert.equal(typeof lesson.analogProbeProgress,'function','contact progress is not yet exposed');
 assert.equal(lesson.analogProbeProgress({stage:1,elapsedMs:5000}),0);
 for(const [elapsedMs,progress] of [[8000,0],[8400,.5],[8800,1],[9000,1]])assert.equal(lesson.analogProbeProgress({stage:2,elapsedMs}),progress);
 assert.equal(lesson.analogProbeProgress({stage:2,elapsedMs:8000},true),1);
 assert.equal(lesson.analogProbeProgress({stage:3,elapsedMs:16000}),1);
});
