import test from 'node:test';
import assert from 'node:assert/strict';
import * as light from '../src/rtds-novacor-light-state.js';
const loop = (extra={})=>light.checkLightLoop({kind:'digital',source:'i1',target:'i1',medium:'fibre',...extra});
const pins = (extra={})=>light.lightChannelPins({kind:'analogue',direction:'input',channel:1,...extra});
const chain = (extra={})=>light.checkLightChain({cards:'GTAI,GTAO,GTDO',version:'v2',port:'gt3',...extra});

test('internal loop matches only corresponding upper and lower fibre roles',()=>{
 assert.equal(loop().status,'match');
 assert.equal(loop({kind:'analogue',source:'i2',target:'i2'}).status,'match');
 for(const extra of [{target:'i2'},{source:'gt3'},{target:'aur1'},{medium:'copper'},{medium:'signal'}])assert.equal(loop(extra).status,'mismatch');
 assert.equal(loop({target:'unknown'}).status,'unknown');
 assert.equal(loop({source:'unknown',target:'gt3'}).status,'mismatch');
 assert.match(loop().message,/上方.*下方/);
});
test('loop rejects malformed inputs and unknown enum names',()=>{
 for(const input of [null,[],true,{}, {kind:'digital',source:'i1',target:'i1',medium:'optical'}])assert.equal(light.checkLightLoop(input).status,'invalid');
 for(const field of ['kind','source','target','medium'])for(const value of [true,[],{},'toString'])assert.equal(loop({[field]:value}).status,'invalid');
});
test('all 12 analogue channels use signal n and return n+13',()=>{
 for(const direction of ['input','output'])for(let channel=1;channel<=12;channel++){
  const result=pins({direction,channel});assert.equal(result.status,'match');assert.equal(result.signalPin,channel);assert.equal(result.returnPin,channel+13);assert.equal(result.connector,1);assert.equal(result.bank,null);
 }
 assert.deepEqual(pins().groundPins,[13]);
 const output=pins({direction:'output'});assert.deepEqual(output.groundPins,[]);assert.ok(output.warnings.some(x=>/13/.test(x.message)));assert.ok(!output.powerPins.includes(13));
 assert.equal(pins({channel:'12'}).signalPin,12);
});
test('digital output maps both DB25 connectors and all four banks',()=>{
 for(let channel=1;channel<=32;channel++){
  const r=pins({kind:'digital',direction:'output',channel});const local=(channel-1)%16;
  assert.equal(r.status,'match');assert.equal(r.connector,Math.floor((channel-1)/16)+1);assert.equal(r.bank,Math.floor((channel-1)/8)+1);assert.equal(r.signalPin,local<8?local+1:local+6);
  assert.deepEqual(r.powerPins,local<8?[12,13]:[24,25]);assert.deepEqual(r.groundPins,local<8?[11]:[23]);
 }
});
test('digital input preserves table ambiguity and does not infer the second connector pinout',()=>{
 for(let channel=1;channel<=32;channel++){
  const r=pins({kind:'digital',channel});const local=(channel-1)%16;const second=channel>16;const ambiguous=[9,10].includes(channel);
  assert.equal(r.status,ambiguous||second?'unknown':'match');assert.equal(r.signalPin,ambiguous||second?null:local<8?local+1:local+6);
  assert.deepEqual(r.pullupPins,second?[]:local<8?[13]:[25]);assert.deepEqual(r.groundPins,second?[]:local<8?[10,11]:[23,24]);assert.deepEqual(r.powerPins,[]);
  if(ambiguous)assert.ok(r.warnings.some(x=>/14.*15/.test(x.message)));
  if(second){assert.equal(r.bank,null);assert.equal(r.connector,2);assert.ok(r.warnings.some(x=>x.code==='di-second-connector-unverified'));}
 }
});
test('pin lookup strictly validates numbers and enum values',()=>{
 for(const channel of [true,false,[],[1],{},null,undefined,'',' ','1.0','1e0','0x1',1.2,NaN,Infinity,-1,0,13])assert.equal(pins({channel}).status,'invalid',String(channel));
 for(const channel of [33,'33'])assert.equal(pins({kind:'digital',channel}).status,'invalid');
 for(const extra of [{kind:'unknown'},{kind:[]},{direction:'unknown'},{direction:true}])assert.equal(pins(extra).status,'invalid');
 for(const input of [null,[],true,{}])assert.equal(light.lightChannelPins(input).status,'invalid');
});
test('Light external chain uses only four ports and V2 cards',()=>{
 for(const port of ['gt3','gt4','gt5','gt6'])assert.equal(chain({port}).status,'match');
 for(const port of ['i1','i2','aur1'])assert.equal(chain({port}).status,'invalid');
 assert.equal(chain({port:'unknown'}).status,'unknown');assert.equal(chain({version:'unknown'}).status,'unknown');assert.equal(chain({version:'v1'}).status,'invalid');
 assert.deepEqual(chain().sourcePages,[119]);
 assert.equal(chain({cards:Array(8).fill('GTDO')}).status,'match');
 const over=chain({cards:Array(9).fill('GTDO')});assert.equal(over.status,'invalid');assert.ok(over.errors.some(x=>/GT 3–6/.test(x.message)));assert.doesNotMatch(JSON.stringify(over),/1–20/);
});
test('Light retains chain restrictions and unknown support caveats',()=>{
 for(const cards of ['GTNET,GTAO','GTFPGA,GTAO','GTSOC,GTAO','GTAI,GTDI','GTAI,GTAI','GTDO,'])assert.equal(chain({cards}).status,'invalid',cards);
 for(const cards of ['GTFPGA','GTAI,GTFPI','FUTURE',''])assert.equal(chain({cards}).status,'unknown',cards);
 assert.equal(chain({cards:'GTAO,GTDI',timeCritical:true}).status,'warning');
 assert.equal(chain({cards:'GTDI,GTAO',timeCritical:true}).status,'match');
 assert.equal(chain({cards:'GTDO'}).status,'match');
});
test('Light chain rejects malformed values without coercion',()=>{
 for(const input of [null,[],true,{}])assert.equal(light.checkLightChain(input).status,'invalid');
 for(const extra of [{version:[]},{version:'V2'},{port:true},{port:'gt1'},{cards:true},{cards:[1]},{timeCritical:'true'}])assert.equal(chain(extra).status,'invalid');
});
test('pin source pages include complete tables and associated specifications',()=>{
 assert.deepEqual(pins({direction:'output'}).sourcePages,[114,115]);
 assert.deepEqual(pins().sourcePages,[115,116]);
 assert.deepEqual(pins({kind:'digital',direction:'output'}).sourcePages,[112,113]);
 assert.deepEqual(pins({kind:'digital'}).sourcePages,[112,113,114]);
});
