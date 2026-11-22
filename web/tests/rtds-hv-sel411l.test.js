import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {buildSel411lExterior,SEL_411L_PHOTO_URL} from '../src/rtds-hv-sel411l.js';

test('SEL-411L 4U front represents same-model photo landmarks without circuit anchors',()=>{
 const model=buildSel411lExterior();
 const part=name=>{const o=model.getObjectByName(name);assert.ok(o,name);return o;};
 const [w,h]=new Box3().setFromObject(model).getSize(new Vector3()).toArray();
 assert.ok(Math.abs(w-.4826)<.002&&Math.abs(h-.177)<.001,[w,h]);
 for(const side of ['left','right'])assert.equal(part(side+'-rack-ear').geometry.parameters.shapes.holes.length,2);
 assert.equal(part('face-fasteners').children.length,4);
 assert.equal(part('front-db9-exterior').getObjectByName('socket-recesses').children.length,9);
 assert.equal(part('navigation-cluster').children.length,4);
 assert.equal(part('menu-keycaps').children.length,2);
 assert.equal(part('target-lens-columns').children.length,2);
 assert.equal(part('local-control-columns').children.length,2);
 for(const col of part('local-control-columns').children)assert.equal(col.children.length,6);
 assert.ok(new Box3().setFromObject(part('lcd-glass')).max.z<new Box3().setFromObject(part('blue-control-fascia')).max.z);
 assert.match(SEL_411L_PHOTO_URL,/selinc\.com\/.*411L_Front\.jpeg/);
 model.traverse(o=>assert.ok(!o.userData.sid&&!o.userData.anchor));
});
