import test from 'node:test';
import assert from 'node:assert/strict';
import {chassisPowerReference} from '../src/rtds-cabinet-chassis.js';

test('chassis reference distinguishes baseline, NovaCor2 and populated GTNET scopes',()=>{
 assert.deepEqual(chassisPowerReference({novacor:2,gtnet:1,population:'three',countCardsAgain:false}),{status:'reference',baselineWatts:120,novacorWatts:580,gtnetWatts:90,referenceWatts:790,duplicateWatts:0});
 assert.equal(chassisPowerReference({novacor:1,gtnet:0,population:'unknown',countCardsAgain:true}).referenceWatts,410);
 assert.equal(chassisPowerReference({novacor:0,gtnet:0,population:'three',countCardsAgain:false}).referenceWatts,120);
});
test('included GTNET cards cannot be counted a second time',()=>{
 const r=chassisPowerReference({novacor:2,gtnet:1,population:'three',countCardsAgain:true});
 assert.equal(r.status,'double-count');assert.equal(r.referenceWatts,790);assert.equal(r.duplicateWatts,54);assert.notEqual(r.referenceWatts,844);
});
test('unsupported partial and unknown GTNET populations do not create a numeric sum',()=>{
 for(const population of ['one','two','unknown']){
  const r=chassisPowerReference({novacor:2,gtnet:1,population,countCardsAgain:false});
  assert.equal(r.status,'unknown');assert.equal(r.referenceWatts,null);assert.equal(r.gtnetWatts,null);
 }
});
test('invalid values cannot be coerced into a valid power reference',()=>{
 const base={novacor:2,gtnet:1,population:'three',countCardsAgain:false};
 for(const novacor of [-1,3,1.5,NaN,Infinity,'2',null,undefined])assert.equal(chassisPowerReference({...base,novacor}).status,'invalid');
 for(const gtnet of [-1,2,0.5,NaN,'1',null])assert.equal(chassisPowerReference({...base,gtnet}).status,'invalid');
 for(const population of ['toString','constructor','__proto__','',null])assert.equal(chassisPowerReference({...base,population}).status,'invalid');
 assert.equal(chassisPowerReference({...base,countCardsAgain:'false'}).status,'invalid');
});
