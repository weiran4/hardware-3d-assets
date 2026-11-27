import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
import {createDell7080} from '../src/rtds-udp-dell.js';
test('workstation Ethernet anchor tracks the fitted rear RJ45 mouth, not an extra socket',()=>{
 const specimen=createDell7080();
 try {
  const rear=specimen.group.getObjectByName('standard-rear');
  const jack=rear.getObjectByName('rear-rj45-visual-only');
  const anchor=jack.getObjectByName('rear-rj45-mouth');
  assert.equal(anchor.parent,jack);
  const center=jack.getObjectByName('rj45-dark-well').position;
  assert.equal(anchor.position.x,center.x);
  assert.equal(anchor.position.y,center.y);
  assert.ok(anchor.position.z>center.z);
  assert.ok(anchor.getWorldPosition(new Vector3()).z<-.09);
  assert.equal(jack.children.filter(n=>n.name==='rj45-contact').length,8);
 }finally{specimen.dispose();}
});
