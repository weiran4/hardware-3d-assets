import test from 'node:test';
import assert from 'node:assert/strict';
import {checkNovacorConnection, checkGtioChain, initNovacorConnections} from '../src/rtds-novacor-connections.js';

const gtio={purpose:'gtio',port:'gt1-20',cable:'optical',auroraLicense:'unknown'};
const chain=(cards,timeCritical=false)=>checkGtioChain({cards,timeCritical});
const codes=items=>items.map(item=>item.code);

test('connection categories match only their own known source ports and cable families',()=>{
 for(const [purpose,port,cable] of [['gtio','gt1-20','optical'],['interrack','irc1-6','optical'],['host','wif','ethernet'],['udp','eth','ethernet']]){
  const result=checkNovacorConnection({...gtio,purpose,port,cable});
  assert.equal(result.status,'match');assert.equal(result.categoryMatch,true);assert.ok(result.endpoint);assert.ok(result.sourcePages.length);
 }
});
test('reserved Aurora, IRC, synchronization, WIF and UDP ports cannot substitute for each other',()=>{
 for(const [purpose,port,cable] of [['gtio','gt21-24','optical'],['gtio','irc1-6','optical'],['interrack','gtsync','optical'],['sync','irc1-6','optical'],['host','eth','ethernet'],['udp','wif','ethernet'],['gtio','gbh','optical'],['gtio','analog','optical']]){
  const result=checkNovacorConnection({...gtio,purpose,port,cable});assert.equal(result.status,'mismatch');assert.equal(result.categoryMatch,false);
 }
});
test('wrong cable family fails even when the port category is correct',()=>{
 for(const cable of ['ethernet','signal','power'])assert.equal(checkNovacorConnection({...gtio,cable}).status,'mismatch');
 assert.equal(checkNovacorConnection({...gtio,purpose:'host',port:'wif',cable:'optical'}).status,'mismatch');
});
test('unselected port or cable never implies a matching connection',()=>{
 for(const patch of [{port:'unknown'},{cable:'unknown'},{port:'unknown',cable:'unknown'}])assert.equal(checkNovacorConnection({...gtio,...patch}).status,'unknown');
 assert.equal(checkNovacorConnection({...gtio,port:'gt21-24',cable:'unknown'}).status,'mismatch');
});
test('Aurora needs a separately purchased option and never pretends the external endpoint is verified',()=>{
 const input={...gtio,purpose:'aurora',port:'gt21-24'};
 assert.equal(checkNovacorConnection({...input,auroraLicense:'absent'}).status,'blocked');
 for(const auroraLicense of ['unknown','present']){
  const result=checkNovacorConnection({...input,auroraLicense});assert.equal(result.status,'unknown');assert.equal(result.categoryMatch,true);
 }
 assert.equal(checkNovacorConnection({...input,port:'gt1-20',auroraLicense:'present'}).status,'mismatch');
});
test('GTSYNC recognizes the optical category while leaving its exact peer unverified',()=>{
 const result=checkNovacorConnection({...gtio,purpose:'sync',port:'gtsync'});
 assert.equal(result.status,'unknown');assert.equal(result.categoryMatch,true);
});
test('connection check rejects missing, inherited and unexpected enum values without throwing',()=>{
 for(const input of [undefined,null,{},'gtio',[],{...gtio,purpose:'toString'},{...gtio,port:'__proto__'},{...gtio,cable:'coax'},{...gtio,auroraLicense:true}])assert.equal(checkNovacorConnection(input).status,'invalid');
});
test('manual GTAI output-card example passes and retains the user ordered sequence',()=>{
 const result=chain('GTAI, GTAO, GTAO, GTDO');
 assert.equal(result.status,'match');assert.deepEqual(result.cards,['GTAI','GTAO','GTAO','GTDO']);assert.equal(result.cardCount,4);assert.deepEqual(result.errors,[]);assert.deepEqual(result.warnings,[]);
});
test('card parsing normalizes case and surrounding spaces without mutating input arrays',()=>{
 const cards=[' gtai ','gtao','GTDO'];const original=[...cards];
 assert.equal(chain(cards).status,'match');assert.deepEqual(chain(cards).cards,['GTAI','GTAO','GTDO']);assert.deepEqual(cards,original);
});
test('one and eight ordinary cards meet the count rule but nine do not',()=>{
 assert.equal(chain('GTDO').status,'match');assert.equal(chain(Array(8).fill('GTDO')).status,'match');
 const result=chain(Array(9).fill('GTDO'));assert.equal(result.status,'invalid');assert.equal(result.cardCount,9);assert.ok(codes(result.errors).includes('too-many-cards'));
});
test('empty chains and blank positions cannot be silently accepted or filtered out',()=>{
 for(const cards of ['', '  ', []])assert.equal(chain(cards).status,'unknown');
 for(const cards of ['GTDO,,GTAO',',GTDO','GTDO,',['GTDO','']])assert.equal(chain(cards).status,'invalid');
});
test('GTNET, GTFPGA and GTSOC need exclusive use of a GT I/O port',()=>{
 for(const card of ['GTNET','GTFPGA','GTSOC']){
  assert.equal(chain(card).status,'match');
  for(const cards of [[card,'GTDO'],['GTDO',card],[card,card]]){
   const result=chain(cards);assert.equal(result.status,'invalid');assert.ok(codes(result.errors).includes('exclusive-port'));
  }
 }
});
test('GTAI cannot share with GTDI or another GTAI in either order',()=>{
 for(const cards of ['GTDI,GTAI,GTAO,GTAO','GTAI,GTDI','GTAI,GTAI']){
  const result=chain(cards);assert.equal(result.status,'invalid');assert.ok(codes(result.errors).includes('gtai-other-input'));
 }
});
test('GTFPI is listed but its combination with GTAI is not silently approved from this chapter',()=>{
 assert.equal(chain('GTFPI').status,'match');
 const result=chain('GTAI,GTFPI');assert.equal(result.status,'unknown');assert.ok(codes(result.unknowns).includes('gtai-gtfpi-unverified'));
});
test('time-critical GTDI after another card is a latency warning, not an invented hard prohibition',()=>{
 const result=chain('GTAO,GTDO,GTDI',true);
 assert.equal(result.status,'warning');assert.deepEqual(result.errors,[]);assert.ok(codes(result.warnings).includes('time-critical-input-order'));
 assert.equal(chain('GTAO,GTDO,GTDI',false).status,'match');assert.equal(chain('GTDI,GTAO,GTDO',true).status,'match');
});
test('latency warning never hides a violated input combination or count limit',()=>{
 const result=chain('GTAI,GTAO,GTDI',true);assert.equal(result.status,'invalid');assert.ok(codes(result.warnings).includes('time-critical-input-order'));assert.ok(codes(result.errors).includes('gtai-other-input'));
});
test('unknown types block passing even alongside normal types, and known violations remain visible',()=>{
 for(const cards of ['GTSYNC','GTAO,FUTURECARD','GTAO,<img src=x>','toString']){
  const result=chain(cards);assert.equal(result.status,'unknown');assert.ok(codes(result.unknowns).includes('unknown-card'));
 }
 const result=chain(['GTNET','FUTURECARD']);assert.equal(result.status,'invalid');assert.ok(codes(result.errors).includes('exclusive-port'));assert.ok(codes(result.unknowns).includes('unknown-card'));
});
test('malformed chain input and nonboolean timing assumptions cannot pass',()=>{
 for(const input of [undefined,null,{},[],{cards:null},{cards:42},{cards:['GTDO',null]},{cards:new Array(2)},{cards:'GTDO',timeCritical:'false'}])assert.equal(checkGtioChain(input).status,'invalid');
});
test('initializer is a safe no-op without the optional chapter container',()=>{
 assert.equal(initNovacorConnections(null),null);
});
