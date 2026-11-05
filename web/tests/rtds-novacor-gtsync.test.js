import test from 'node:test';
import assert from 'node:assert/strict';
import * as lesson from '../src/rtds-novacor-gtsync.js';
const valid={version:'v2',hostPort:'gtsync',cardPort:'v2-gt',medium:'gt-fiber',hardwareConfigured:true,caseComponent:true,lockState:'locked'};
test('dedicated GTSYNC connection checker exists',()=>assert.equal(typeof lesson.checkGtsyncConnection,'function'));
for(const [version,cardPort] of [['v2','v2-gt'],['v1','v1-gt1']])test(`dedicated link matches ${version} endpoint`,()=>{const r=lesson.checkGtsyncConnection({...valid,version,cardPort});assert.equal(r.status,'match');assert.match(r.boundary,/端到端/);});
for(const change of [{hostPort:'gtio'},{hostPort:'gbh'},{hostPort:'irc'},{cardPort:'v1-gt1'},{cardPort:'v1-gt2'},{cardPort:'time-input'},{cardPort:'ethernet'},{medium:'ethernet'},{medium:'electrical'}])test(`rejects endpoint or medium ${JSON.stringify(change)}`,()=>assert.equal(lesson.checkGtsyncConnection({...valid,...change}).status,'invalid'));
for(const key of ['version','hostPort','cardPort','medium'])test(`unselected ${key} stays unknown`,()=>assert.equal(lesson.checkGtsyncConnection({...valid,[key]:'unknown'}).status,'unknown'));
test('unconfirmed configuration stays unknown',()=>assert.equal(lesson.checkGtsyncConnection({...valid,hardwareConfigured:false}).status,'unknown'));
for(const input of [null,[],{}, {...valid,version:'__proto__'},{...valid,hardwareConfigured:'yes'}])test('malformed connection input cannot match',()=>assert.equal(lesson.checkGtsyncConnection(input).status,'invalid'));
test('version-specific sources remain distinct',()=>{assert.ok(lesson.checkGtsyncConnection(valid).sourcePages.includes(471));assert.ok(lesson.checkGtsyncConnection({...valid,version:'v1',cardPort:'v1-gt1'}).sourcePages.includes(491));});
for(const [length,value] of [[0,750],[10,800],[49.8,999]])test(`skew arithmetic ${length} m`,()=>{const r=lesson.calculateGtsyncSkew(length);assert.equal(r.status,'within');assert.equal(r.settingNs,value);assert.match(r.boundary,/实测|端到端/);assert.equal('latencyNs' in r,false);});
test('skew exceeding setting range is not clamped or approved',()=>{const r=lesson.calculateGtsyncSkew(50);assert.equal(r.status,'outside');assert.equal(r.settingNs,1000);});
for(const value of [-1,NaN,Infinity,'10',null,undefined])test(`skew rejects ${String(value)}`,()=>{const r=lesson.calculateGtsyncSkew(value);assert.equal(r.status,'invalid');assert.equal(r.settingNs,null);});
test('skew rejects arithmetic overflow',()=>assert.equal(lesson.calculateGtsyncSkew(Number.MAX_VALUE).status,'invalid'));

test('missing case component stays unknown',()=>assert.equal(lesson.checkGtsyncConnection({...valid,caseComponent:false}).status,'unknown'));
for(const lockState of ['locked','unlocked','unknown'])test(`link match does not claim lock ${lockState}`,()=>{const r=lesson.checkGtsyncConnection({...valid,lockState});assert.equal(r.status,'match');assert.equal(r.lockState,lockState);assert.equal('synchronized' in r,false);});

import {readFileSync} from 'node:fs';
test('GTSYNC checker is mounted inside the version-scoped 2A lesson',()=>{const source=readFileSync(new URL('../src/rtds-novacor-connections.js',import.meta.url),'utf8');assert.match(source,/id="novacor-gtsync-lesson"/);assert.match(source,/initNovacorGtsync\(root\.querySelector\('#novacor-gtsync-lesson'\)\)/);});
test('adjacent ETH/UDP is a recognized but wrong host role',()=>{const r=lesson.checkGtsyncConnection({...valid,hostPort:'eth'});assert.equal(r.status,'invalid');assert.ok(r.issues.some(x=>x.code==='host-port'));});
