import test from 'node:test';
import assert from 'node:assert/strict';
import {buildGs316v3,gs316v3Spec,gs316v3LanPort} from '../src/rtds-network-gs316.js';

test('the photographed GS316v3 has sixteen recessed ports, paired LEDs and rear features',()=>{
 const resources=new Set(),model=buildGs316v3(x=>(resources.add(x),x));
 const names=[];model.traverse(x=>names.push(x.name));
 assert.deepEqual(gs316v3Spec.dimensionsMm,[286,27,102]);
 assert.equal(names.filter(x=>/^rj45-\d+$/.test(x)).length,16);
 assert.equal(names.filter(x=>/^contact-\d+-\d+$/.test(x)).length,128);
 assert.equal(names.filter(x=>/^link-led-/.test(x)).length,32);
 for(const part of ['front-apertures','rear-perforated-panel','right-perforated-panel','security-slot','dc-barrel','power-led'])assert.ok(model.getObjectByName(part),part);
 for(let i=1;i<=16;i++){
  const jack=model.getObjectByName('rj45-'+i),port=model.getObjectByName('jack-anchor-'+i);
  assert.equal(jack.position.x,port.position.x);
  assert.ok(jack.position.z<port.position.z,'anchor is on the physical jack opening');
 }
 for(const x of resources)x.dispose();
});

test('existing LAN.p0–p8 have an explicit, finite 1–9 example mapping only',()=>{
 assert.deepEqual(Array.from({length:9},(_,i)=>gs316v3LanPort('LAN.p'+i)),[1,2,3,4,5,6,7,8,9]);
 for(const key of ['LAN.p9','LAN.p16','LAN.p-1','LAN.p02','GBH.p0','N1.wif'])assert.equal(gs316v3LanPort(key),null);
});
