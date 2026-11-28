import assert from 'node:assert/strict';
import test from 'node:test';
import {useX2Gs316,x2PhotoJacks} from '../src/rtds-gtnet-x2-switch-photo.js';
import {defaultGtnetX2 as normal} from '../src/rtds-gtnet-x2-state.js';
import {buildGs316v3} from '../src/rtds-network-gs316.js';

test('only ordinary 100/1000 full-duplex switched copper has GS316v3 jack positions',()=>{
 assert.ok(useX2Gs316(normal));
 assert.ok(useX2Gs316({...normal,speed:100}));
 for(const excluded of [{mode:'prp'},{medium:'fx',speed:100},{medium:'sx'},{direct:true},{duplex:'half'},{speed:10}]){
  assert.equal(useX2Gs316({...normal,...excluded}),false);
 }
 assert.deepEqual(x2PhotoJacks,{S_A:[1,2,3],S_B:[1,2]});
 const resources=new Set(),specimen=buildGs316v3(x=>{resources.add(x);return x;});
 try{
  for(const ports of Object.values(x2PhotoJacks)) for(const p of ports) assert.ok(specimen.getObjectByName('jack-anchor-'+p));
 } finally{for(const resource of resources)resource.dispose();}
});
