import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {checkNovaOneConnection as connection,checkNovaOneChain as chain} from '../src/rtds-novacor-one-state.js';
import {initNovacorOne} from '../src/rtds-novacor-one.js';
import {lessonForHardware,lessonHash,parseTeachingRoute} from '../src/rtds-lesson-context.js';
const base={purpose:'gtio',port:'gt1-20',cable:'optical'};
test('1.0 rejects invalid state without prototype lookups',()=>{for(const x of [null,[],{}, {...base,purpose:'constructor'},{...base,port:'toString'},{...base,cable:5}])assert.equal(connection(x).status,'invalid');});
test('1.0 port and media rules distinguish interfaces',()=>{assert.equal(connection(base).status,'match');for(const port of ['gt21-24','wif','gbh'])assert.equal(connection({...base,port}).status,'mismatch');assert.equal(connection({...base,cable:'power'}).status,'mismatch');assert.equal(connection({...base,port:'unknown'}).status,'unknown');});
test('1.0 Aurora never grants readiness from license',()=>{const x={purpose:'aurora',port:'gt21-24',cable:'optical'};assert.equal(connection({...x,auroraLicense:'absent'}).status,'blocked');for(const auroraLicense of ['unknown','present'])assert.equal(connection({...x,auroraLicense}).status,'unknown');});
test('1.0 host and UDP are separate roles',()=>{for(const [purpose,port]of [['host','wif'],['udp','eth']]){assert.equal(connection({purpose,port,cable:'ethernet'}).status,'match');assert.equal(connection({purpose,port,cable:'optical'}).status,'mismatch');}});
test('1.0 supported chains and eight-card boundary',()=>{for(const cards of ['GTAI,GTAO,GTAO,GTDO',Array(8).fill('GTAO').join(','),'GTFPGA','GTSOCV1'])assert.equal(chain({cards}).status,'match');assert.equal(chain({cards:Array(9).fill('GTAO')}).status,'invalid');});
test('1.0 known forbidden card combinations',()=>{for(const cards of ['GTNET,GTAO','GTFPGA,GTAO','GTDI,GTAI','GTAI,GTAI'])assert.equal(chain({cards}).status,'invalid');});
test('1.0 does not transplant GTSOC or GTFPI assumptions',()=>{for(const cards of ['GTSOC','GTSOCV2','GTSOCV1,GTAO','GTFPI,GTAI','OTHER'])assert.equal(chain({cards}).status,'unknown');});
test('1.0 timing recommendation remains a warning not a prohibition',()=>{assert.equal(chain({cards:'GTAO,GTDI',timeCritical:true}).status,'warning');assert.equal(chain({cards:'GTDI,GTAO',timeCritical:true}).status,'match');assert.equal(chain({cards:'GTAO,GTDI',timeCritical:false}).status,'match');});
test('1.0 malformed chains cannot pass',()=>{for(const x of [null,[],{cards:3},{cards:[null]},{cards:'GTAO,,GTDO'},{cards:'GTAO',timeCritical:1}])assert.equal(chain(x).status,'invalid');assert.equal(chain({cards:''}).status,'unknown');});
test('1.0 own route and optional mount',()=>{assert.equal(initNovacorOne(null),null);assert.equal(lessonForHardware('novacor-1.0'),'one');assert.equal(lessonHash('one'),'#rtds-chapter-2c');assert.deepEqual(parseTeachingRoute('#rtds-chapter-2c'),{hardware:'novacor-1.0',lesson:'one'});});
test('1.0 has scoped controls and no invented model',()=>{const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');assert.match(read('../index.html'),/id="rtds-chapter-2c" hidden/);assert.match(read('../src/rtds-novacor-one.css'),/min-height:44px/);assert.doesNotMatch(read('../src/rtds-novacor-one.js'),/requestAnimationFrame|setInterval|asset\.glb/);assert.match(read('../src/rtds-novacor-one.js'),/部分覆盖/);});

test('2C public progress remains partial',async()=>{const {chapters}=await import('../src/rtds-cabinet-state.js');assert.match(chapters.find(x=>x.id==='2C').status,/基础版.*完善中/);});

test('1.0 chain uses styled text control and invalid state',()=>{const s=readFileSync(new URL('../src/rtds-novacor-one.js',import.meta.url),'utf8');assert.match(s,/<input id="one-chain" type="text"/);assert.match(s,/setAttribute\('aria-invalid',String\(result.status==='invalid'\)\)/);});
