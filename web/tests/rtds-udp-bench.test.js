import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultUdp,evaluateUdp,udpLinks} from '../src/rtds-udp-bench-state.js';
import {parseTeachingRoute} from '../src/rtds-lesson-context.js';
test('UDP direct and switched storage require confirmed endpoint and config',()=>{
 assert.equal(evaluateUdp().status,'disconnected');
 const s={...defaultUdp,connected:true};assert.equal(evaluateUdp(s).ready,true);
 assert.deepEqual(udpLinks(s).map(l=>[l.a,l.b]),[['N.udp','PC.nic']]);
 assert.deepEqual(udpLinks({...s,topology:'switch',secondConnected:true}).map(l=>[l.a,l.b]),[['N.udp','SW.in'],['SW.out','PC.nic']]);
 assert.equal(evaluateUdp({...s,topology:'switch'}).ready,false);
 for(const patch of [{port:'wif'},{port:'gt21'},{medium:'fiber'},{configured:false},{unique:false},{mode:'duplex',receiver:false}])assert.equal(evaluateUdp({...s,...patch}).ready,false);
 assert.equal(evaluateUdp({...s,mode:'duplex',receiver:true}).ready,true);
 assert.equal(udpLinks(s,1.5)[0].reverse,false);
 assert.equal(udpLinks({...s,mode:'duplex'},1.5)[0].reverse,true);
});
test('UDP course route selects only NovaCor 2.0 UDP',()=>assert.deepEqual(parseTeachingRoute('#rtds-presentation-35'),{hardware:'novacor-2.0',lesson:'udp'}));
