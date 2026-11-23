import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {buildSel421Exterior,SEL_421_PHOTO_URL} from '../src/rtds-gtnet-x2-sel421.js';

test('detached SEL-421 family 5U exterior reproduces the 5U face without wire endpoints',()=>{
 const owned=new Set(),model=buildSel421Exterior(r=>{owned.add(r);return r;});
 try{
  const part=name=>{const o=model.getObjectByName(name);assert.ok(o,name);return o;};
  const [w,h]=new Box3().setFromObject(model).getSize(new Vector3()).toArray();
  assert.ok(Math.abs(w-.4826)<.002&&Math.abs(h-.2215)<.001,[w,h]);
  for(const side of ['left','right'])assert.equal(part(side+'-rack-ear').geometry.parameters.shapes.holes.length,2);
  assert.equal(part('face-fasteners').children.length,4);
  for(const col of part('local-control-columns').children)assert.equal(col.children.length,6);
  assert.equal(part('navigation-cluster').children.length,4);
  assert.ok(new Box3().setFromObject(part('lcd-glass')).max.z<new Box3().setFromObject(part('blue-control-fascia')).max.z);
  assert.match(SEL_421_PHOTO_URL,/selinc\.com\/.*421_Front\.png/);
  model.traverse(o=>assert.ok(!o.userData.sid&&!o.userData.anchor&&!o.userData.endpoint));
 }finally{for(const r of owned)r.dispose();}
});
