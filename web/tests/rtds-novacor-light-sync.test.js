import test from 'node:test';
import assert from 'node:assert/strict';
import {checkLightSync} from '../src/rtds-novacor-light-sync.js';
const pair={count:2,sync:'direct',data:'direct',p2p:'on',addresses:true,files:true,family:'light'};
for(const [name,input] of [['two chassis',pair],['hub direct',{...pair,count:3,sync:'hub',p2p:'off'}],['hub switch',{...pair,count:5,sync:'hub',data:'switch',p2p:'off'}]])test(`sync category matches ${name}`,()=>assert.equal(checkLightSync(input).status,'match'));
for(const [name,change,code] of [
 ['three without hub',{count:3},'hub-required'],['five without switch',{count:5,sync:'hub',p2p:'off'},'switch-required'],
 ['pair p2p off',{p2p:'off'},'p2p-on'],['hub p2p on',{sync:'hub'},'p2p-off'],
 ['sync missing',{sync:'none'},'sync-missing'],['data missing',{data:'none'},'data-missing'],
 ['IRC as sync',{sync:'irc'},'sync-role'],['GBH as data',{data:'gbh'},'data-role']
])test(`sync rejects ${name}`,()=>{const r=checkLightSync({...pair,...change});assert.equal(r.status,'invalid');assert.ok(r.issues.some(x=>x.code===code));});
for(const change of [{sync:'unknown'},{data:'unknown'},{p2p:'unknown'},{addresses:false},{files:false},{data:'switch'}])test(`sync never approves unresolved ${JSON.stringify(change)}`,()=>assert.equal(checkLightSync({...pair,...change}).status,'unknown'));
for(const count of [0,1,-1,2.5,NaN,Infinity,'2',null])test(`sync invalid count ${String(count)}`,()=>assert.equal(checkLightSync({...pair,count}).status,'invalid'));
for(const input of [null,[],{}, {...pair,sync:'__proto__'},{...pair,addresses:'yes'}])test('sync invalid selections do not match',()=>assert.equal(checkLightSync(input).status,'invalid'));
test('hub does not require point-to-point addresses',()=>assert.equal(checkLightSync({...pair,sync:'hub',p2p:'off',addresses:false}).status,'match'));
test('output has source and bounded disclaimer, no delay',()=>{const r=checkLightSync(pair);assert.deepEqual(r.sourcePages,[122,126,133,134,135,136,137,138,139,140]);assert.match(r.boundary,/端到端延时/);assert.equal('latency' in r,false);});

test('four Light direct IRC category accepted, five rejected',()=>{assert.equal(checkLightSync({...pair,count:4,sync:'hub',p2p:'off'}).status,'match');assert.equal(checkLightSync({...pair,count:5,sync:'hub',p2p:'off'}).status,'invalid');});
test('family compatibility is bounded',()=>{assert.equal(checkLightSync({...pair,family:'novacor'}).status,'match');assert.equal(checkLightSync({...pair,family:'legacy'}).status,'invalid');assert.equal(checkLightSync({...pair,family:'unknown'}).status,'unknown');assert.equal(checkLightSync({...pair,family:'typo'}).status,'invalid');});
for(const data of ['direct','switch'])test(`two Light with hub may use ${data}`,()=>assert.equal(checkLightSync({...pair,sync:'hub',data,p2p:'off',addresses:false}).status,'match'));
test('five-unit rejection says four, never seven',()=>{const r=checkLightSync({...pair,count:5,sync:'hub',p2p:'off'});const issue=r.issues.find(x=>x.code==='switch-required');assert.match(issue.message,/四台/);assert.doesNotMatch(issue.message,/七台/);});
