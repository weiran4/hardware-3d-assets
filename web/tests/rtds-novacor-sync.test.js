import test from 'node:test';
import assert from 'node:assert/strict';
import {checkNovacorSync} from '../src/rtds-novacor-sync.js';
const pair={count:2,sync:'direct',data:'direct',p2p:'on',addresses:true,files:true};
for(const [name,input] of [['two chassis',pair],['hub direct',{...pair,count:3,sync:'hub',p2p:'off'}],['hub switch',{...pair,count:8,sync:'hub',data:'switch',p2p:'off'}]])test(`sync category matches ${name}`,()=>assert.equal(checkNovacorSync(input).status,'match'));
for(const [name,change,code] of [
 ['three without hub',{count:3},'hub-required'],['eight without switch',{count:8,sync:'hub',p2p:'off'},'switch-required'],
 ['pair p2p off',{p2p:'off'},'p2p-on'],['hub p2p on',{sync:'hub'},'p2p-off'],
 ['sync missing',{sync:'none'},'sync-missing'],['data missing',{data:'none'},'data-missing'],
 ['IRC as sync',{sync:'irc'},'sync-role'],['GBH as data',{data:'gbh'},'data-role']
])test(`sync rejects ${name}`,()=>{const r=checkNovacorSync({...pair,...change});assert.equal(r.status,'invalid');assert.ok(r.issues.some(x=>x.code===code));});
for(const change of [{sync:'unknown'},{data:'unknown'},{p2p:'unknown'},{addresses:false},{files:false},{data:'switch'}])test(`sync never approves unresolved ${JSON.stringify(change)}`,()=>assert.equal(checkNovacorSync({...pair,...change}).status,'unknown'));
for(const count of [0,1,-1,2.5,NaN,Infinity,'2',null])test(`sync invalid count ${String(count)}`,()=>assert.equal(checkNovacorSync({...pair,count}).status,'invalid'));
for(const input of [null,[],{}, {...pair,sync:'__proto__'},{...pair,addresses:'yes'}])test('sync invalid selections do not match',()=>assert.equal(checkNovacorSync(input).status,'invalid'));
test('hub does not require point-to-point addresses',()=>assert.equal(checkNovacorSync({...pair,sync:'hub',p2p:'off',addresses:false}).status,'match'));
test('output has source and bounded disclaimer, no delay',()=>{const r=checkNovacorSync(pair);assert.deepEqual(r.sourcePages,[80,97,98,99,100]);assert.match(r.boundary,/端到端延时/);assert.equal('latency' in r,false);});
