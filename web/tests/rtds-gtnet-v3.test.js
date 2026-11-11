import test from 'node:test';
import assert from 'node:assert/strict';
import {checkGtnetV3,defaultGtnetV3} from '../src/rtds-gtnet-v3-state.js';
import {parseTeachingRoute,lessonForHardware} from '../src/rtds-lesson-context.js';
test('GTNET v3 route chooses existing hardware',()=>{assert.deepEqual(parseTeachingRoute('#rtds-chapter-5a'),{hardware:'gtnet-v3',lesson:'gtnetV3'});assert.equal(lessonForHardware('gtnet-v3'),'gtnetV3');});
test('normal two-module loop retains explicit directions',()=>{const r=checkGtnetV3(defaultGtnetV3);assert.equal(r.status,'match');assert.equal(r.links.length,4);assert.match(r.links.join(' '),/AA/);assert.match(r.links.join(' '),/BA/);});
for(const [key,value] of [['gtA',false],['gtB',false],['firmwareA','GOOSE'],['firmwareB','SV'],['speed',10],['duplex','half'],['medium','unknown'],['mode','unknown'],['gtA','yes'],['speed',NaN]])test(`fails closed ${key}:${value}`,()=>{const r=checkGtnetV3({...defaultGtnetV3,[key]:value});assert.equal(r.status,'invalid');assert.deepEqual(r.links,[]);});
const prp={...defaultGtnetV3,mode:'prp',secondary:true,independent:true,firmwarePrp:true};
test('PRP retains two modules and four ethernet connections',()=>{const r=checkGtnetV3(prp);assert.equal(r.status,'match');assert.equal(r.links.length,4);assert.match(r.links.join(' '),/AB/);assert.match(r.links.join(' '),/BB/);});
for(const key of ['secondary','independent','firmwarePrp'])test(`PRP requires ${key}`,()=>assert.equal(checkGtnetV3({...prp,[key]:false}).status,'invalid'));
for(const [medium,speed,expected]of [['copper',100,'match'],['copper',1000,'match'],['fx',100,'match'],['fx',1000,'invalid'],['sx',1000,'match'],['sx',100,'invalid']])test(`${medium} ${speed}`,()=>assert.equal(checkGtnetV3({...defaultGtnetV3,medium,speed}).status,expected));
test('unknown direct copper crossover suitability stays unverified',()=>assert.equal(checkGtnetV3({...defaultGtnetV3,direct:true,crossover:false}).status,'unverified'));

test("verified direct copper omits switches",()=>{const r=checkGtnetV3({...defaultGtnetV3,direct:true,crossover:true});assert.equal(r.status,"match");assert.doesNotMatch(r.links.join(" "),/交换机/);});
test("PRP direct is outside supported example",()=>assert.equal(checkGtnetV3({...prp,direct:true,crossover:true}).status,"invalid"));
test("SV reaches relay before GOOSE return",()=>{const r=checkGtnetV3(defaultGtnetV3);assert.match(r.links[0],/GT A/);assert.match(r.links[1],/AA.*继电器/);assert.match(r.links[2],/继电器.*BA/);assert.match(r.links[3],/GT B.*NovaCor/);});

for(const direct of [undefined,null,"true"])test(`unknown connection mode ${direct} fails closed`,()=>{const r=checkGtnetV3({...defaultGtnetV3,direct});assert.equal(r.status,"invalid");assert.deepEqual(r.links,[]);});
