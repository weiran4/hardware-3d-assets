import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {buildRh25Exterior,rh25Reference} from '../src/rtds-light-rh25.js';

test('RH-25 geometry models the photographed resistor, not circuit endpoints',()=>{
 const {group,dispose}=buildRh25Exterior();
 try{
  const part=name=>{const o=group.getObjectByName(name);assert.ok(o,name);return o;};
  assert.equal(group.name,'vishay-dale-rh25');
  const [w,h,d]=new Box3().setFromObject(group).getSize(new Vector3()).toArray();
  assert.ok(Math.abs(w-.04923)<.001&&Math.abs(h-.01387)<.001&&Math.abs(d-.02743)<.001,[w,h,d]);
  const ears=part('diagonal-mounting-ears').children;
  assert.equal(ears.length,2);
  assert.ok(ears[0].position.x*ears[1].position.x<0&&ears[0].position.z*ears[1].position.z<0);
  for(const ear of ears)assert.equal(ear.geometry.parameters.shapes.holes.length,1);
  assert.equal(part('opposing-visual-solder-ends').children.length,2);
  assert.equal(part('ribbed-anodized-profile').geometry.parameters.shapes.holes.length,0);
  assert.match(rh25Reference.photo,/ebayimg\.com/);
  group.traverse(o=>assert.ok(!o.userData.sid&&!o.userData.anchor&&!o.userData.endpoint));
 }finally{dispose();dispose();}
});
