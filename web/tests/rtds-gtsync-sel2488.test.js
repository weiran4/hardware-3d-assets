import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';

test('SEL-2488 rack specimen has the photographed connector banks and datasheet envelope',async()=>{
 const {createSel2488Exterior,SEL_2488_FRONT_URL,SEL_2488_REAR_URL}=await import('../src/rtds-gtsync-sel2488.js');
 const root=createSel2488Exterior();
 const size=new Box3().setFromObject(root).getSize(new Vector3());
 for(const [actual,nominal] of [[size.x,482.6],[size.y,43.7],[size.z,248.6]])assert.ok(Math.abs(actual-nominal)<1,`${actual} vs ${nominal} mm`);
 for(const [name,n] of [['rack-ears',2],['rear-bnc-bank',8],['rear-sma-bank',6],['rear-ethernet-bank',4],['rear-power-supplies',2]])assert.equal(root.getObjectByName(name)?.children.length,n,name);
 assert.equal(root.getObjectByName('front-eth-f')?.parent.name,'front');
 assert.equal(root.getObjectByName('rear-com1')?.parent.name,'rear');
 root.traverse(o=>assert.equal(o.userData.sid,undefined));
 assert.match(SEL_2488_FRONT_URL,/^https:\/\/selinc\.com\/.*2488_Front\.png/);
 assert.match(SEL_2488_REAR_URL,/^https:\/\/selinc\.com\/.*2488_Back\.png/);
 const materials=new Set();root.traverse(o=>{o.geometry?.dispose();if(o.material)materials.add(o.material);});materials.forEach(m=>m.dispose());
});
