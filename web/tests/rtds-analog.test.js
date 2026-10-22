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
test('one action starts every signal together while physical contact alone gates the meter',()=>{
 let s=initial();assert.deepEqual(s,{elapsedMs:0,playing:false,started:false});assert.equal(lesson.analogPresentation(s).scaled,true);assert.equal(lesson.analogPresentation(s).meterReady,false);
 s=lesson.analogLessonTransition(s,{type:'replay'});assert.equal(s.playing,true);assert.equal(s.started,true);assert.equal(lesson.analogPresentation(s).scaled,true);
 s=lesson.analogLessonTransition(s,{type:'tick',deltaMs:400});assert.equal(lesson.analogProbeProgress(s),.5);assert.equal(lesson.analogPresentation(s).meterReady,false);assert.notEqual(lesson.analogDisplaySample(s.elapsedMs).output,0);
 s=lesson.analogLessonTransition(s,{type:'tick',deltaMs:400});assert.equal(lesson.analogProbeProgress(s),1);assert.equal(lesson.analogPresentation(s).meterReady,true);
});
test('replay resets and immediately runs all signals, pause resumes, and playback ends after two cycles',()=>{
 let s=initial();assert.deepEqual(lesson.analogLessonTransition(s,{type:'tick',deltaMs:1000}),s);s=lesson.analogLessonTransition(s,{type:'replay'});s=lesson.analogLessonTransition(s,{type:'tick',deltaMs:1200});s=lesson.analogLessonTransition(s,{type:'pause'});assert.equal(s.playing,false);assert.equal(s.elapsedMs,1200);assert.deepEqual(lesson.analogLessonTransition(s,{type:'tick',deltaMs:1000}),s);
 s=lesson.analogLessonTransition(s,{type:'play'});assert.equal(s.elapsedMs,1200);s=lesson.analogLessonTransition(s,{type:'tick',deltaMs:20000});assert.equal(s.elapsedMs,8000);assert.equal(s.playing,false);assert.equal(lesson.analogPresentation(s).meterReady,true);
 s=lesson.analogLessonTransition(s,{type:'replay'});assert.deepEqual(s,{elapsedMs:0,playing:true,started:true});assert.equal(lesson.analogPresentation(s).meterReady,false);
});
test('removed stages and malformed times cannot reintroduce sequential gates',()=>{
 let s=initial();for(const action of [{type:'stage',stage:1},{type:'step'},{type:'tick',deltaMs:NaN},{type:'tick',deltaMs:-1},{type:'wire',port:'mains'}])assert.deepEqual(lesson.analogLessonTransition(s,action),s);
 s=lesson.analogLessonTransition(s,{type:'replay'});for(const deltaMs of [NaN,Infinity,-1])assert.deepEqual(lesson.analogLessonTransition(s,{type:'tick',deltaMs}),s);assert.equal('stage' in s,false);
});
test('physical lesson endpoint preserves exact low-voltage output identity and unknown connector certification',()=>{
 initial();const d=JSON.parse(readFileSync('public/assets/rtds/novacor-2.0-2023.json'));const p=d.ports.find(p=>p.id===lesson.analogLesson.endpoint.portId);assert.equal(p.id,'novacor-2.0-2023.ao1');assert.equal(p.group,'analogue');assert.equal(p.validated_mating,false);assert.equal(p.physical_compatibility,'unknown');
});
test('compact lesson contains every simultaneous teaching surface and only play/replay plus optional pause',()=>{
 const html=readFileSync('index.html','utf8');for(const id of ['rtds-analog-lesson','analog-play','analog-pause','analog-meter-value','analog-source-wave','analog-output-wave','analog-inspect-output','analog-dashboard'])assert.ok(html.includes(`id="${id}"`),id);
 for(const id of ['analog-step','analog-restart','analog-stage-number'])assert.ok(!html.includes(`id="${id}"`),id);assert.ok(!html.includes('data-analog-stage'));
 for(const copy of ['220 V RMS','±5 V 峰值','±10 V 峰值','50 Hz','不是市电输入','不是二进制数字 I/O','3.54','200 倍慢放'])assert.ok(html.includes(copy),copy);
});
test('reduced motion connects immediately only after play and keeps source/output phases synchronized',()=>{
 let s=initial();assert.equal(lesson.analogProbeProgress(s,true),0);s=lesson.analogLessonTransition(s,{type:'replay'});assert.equal(lesson.analogProbeProgress(s),0);assert.equal(lesson.analogProbeProgress(s,true),1);assert.equal(lesson.analogPresentation(s,true).meterReady,true);
 for(const [elapsedMs,progress] of [[0,0],[400,.5],[800,1],[1000,1]])assert.equal(lesson.analogProbeProgress({...s,elapsedMs}),progress);
});
