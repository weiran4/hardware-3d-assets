import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonForHardware,parseTeachingRoute,hardwareHash,lessonHash} from '../src/rtds-lesson-context.js';
test('only exact supported hardware versions receive a contextual lesson',()=>{assert.equal(lessonForHardware('novacor-2.0'),'analog');assert.equal(lessonForHardware('novacor-light'),'light');assert.equal(lessonForHardware('novacor-1.0'),'one');for(const id of ['gtao-v2','gtai-v2','gtdi-v2','gtdo-v2'])assert.equal(lessonForHardware(id),'power');assert.equal(lessonForHardware('gtao-v1'),null);assert.equal(lessonForHardware('cubicle-v2'),'cabinet');assert.equal(lessonForHardware('cubicle-v1'),'cabinetV1');});
test('legacy deep links choose correct hardware and lesson',()=>{for(const hash of ['#rtds-power','#rtds-power-lesson'])assert.deepEqual(parseTeachingRoute(hash),{hardware:'gtao-v2',lesson:'power'});for(const hash of ['#rtds-analog','#rtds-analog-lesson'])assert.deepEqual(parseTeachingRoute(hash),{hardware:'novacor-2.0',lesson:'analog'});assert.deepEqual(parseTeachingRoute('#rtds-chapter-1a'),{hardware:'cubicle-v2',lesson:'cabinet'});});
test('hardware routes preserve selection and default entry does not activate a lesson',()=>{assert.equal(parseTeachingRoute('#rtds'),null);assert.equal(parseTeachingRoute('#generic'),null);assert.equal(parseTeachingRoute('#rtds-hardware-unknown'),null);assert.deepEqual(parseTeachingRoute(hardwareHash('gtdi-v2')),{hardware:'gtdi-v2',lesson:'power'});assert.equal(lessonHash('cabinet'),'#rtds-chapter-1a');});

test('active teaching yields the floating model, but a lower-page preview does not',async()=>{const {teachingOwnsViewport}=await import('../src/rtds-lesson-context.js');assert.equal(teachingOwnsViewport({top:16,bottom:850},900),true);assert.equal(teachingOwnsViewport({top:650,bottom:1400},900),false);assert.equal(teachingOwnsViewport({top:-900,bottom:-20},900),false);});

test('wiring interface routes pin the exact version and group without requesting a lesson jump',()=>{
 assert.deepEqual(parseTeachingRoute('#rtds-interface:novacor-2.0:gtio'),{hardware:'novacor-2.0',group:'gtio'});
 assert.deepEqual(parseTeachingRoute('#rtds-interface:gtai-v2:analogue_input'),{hardware:'gtai-v2',group:'analogue_input'});
 for(const hash of ['#rtds-interface:novacor-light:gtio','#rtds-interface:gtdi-v2:power','#rtds-interface:__proto__:gtio','#rtds-interface:gtao-v2:constructor'])assert.equal(parseTeachingRoute(hash),null);
});

test('1B route stays on Cubicle V1, separate from V2 and GTAO',()=>{assert.deepEqual(parseTeachingRoute('#rtds-chapter-1b'),{hardware:'cubicle-v1',lesson:'cabinetV1'});assert.equal(lessonHash('cabinetV1'),'#rtds-chapter-1b');});

test('2A chapter route preserves NovaCor2 version and legacy analog lesson identity',()=>{
 assert.deepEqual(parseTeachingRoute('#rtds-chapter-2a'),{hardware:'novacor-2.0',lesson:'analog',chapter:'2a'});
});

test('2A model links allow only known NovaCor2 interface groups',()=>{
 for(const group of ['gtio','aurora','irc','gtsync','wif','udp','gbh','analogue'])assert.deepEqual(parseTeachingRoute('#rtds-interface:novacor-2.0:'+group),{hardware:'novacor-2.0',group});
 for(const group of ['constructor','__proto__','fake','power'])assert.equal(parseTeachingRoute('#rtds-interface:novacor-2.0:'+group),null);
});

test('Light has an independent chapter route and never borrows NovaCor2 analog lesson',()=>{assert.deepEqual(parseTeachingRoute('#rtds-chapter-2b'),{hardware:'novacor-light',lesson:'light'});assert.equal(lessonHash('light'),'#rtds-chapter-2b');assert.deepEqual(parseTeachingRoute('#rtds-hardware-novacor-light'),{hardware:'novacor-light',lesson:'light'});});

test('HV page20 deep link selects GTFPI while keeping low voltage default',()=>{
 for(const h of ['#rtds-hv-panel','#rtds-presentation-20'])assert.deepEqual(parseTeachingRoute(h),{hardware:'gtfpi-v2',lesson:'hv'});
 assert.equal(lessonHash('hv'),'#rtds-hv-panel');
 assert.equal(lessonForHardware('gtfpi-v2'),'gtfpi');
});

test('parallel presentation experiments map to their own version',()=>{
 for(const [hash,hardware,lesson] of [['#rtds-presentation-8','gtao-v2','gtaoScope'],['#rtds-presentation-9','gtao-v2','gtaoScope'],['#rtds-presentation-10','gtai-v2','gtaiLab'],['#rtds-presentation-12','gtai-v2','gtaiLab'],['#rtds-presentation-21','novacor-2.0','ioChain'],['#rtds-presentation-23','novacor-2.0','ioChain']])assert.deepEqual(parseTeachingRoute(hash),{hardware,lesson});
});
