import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {createSel2407Exterior,SEL_2407_PHOTO_URL} from '../src/rtds-gtsync-sel2407.js';

test('SEL-2407 depicts same-model recognizable front/top features, without electrical anchors',()=>{
 const m=createSel2407Exterior();
 const n=name=>{const o=m.getObjectByName(name);assert.ok(o,name);return o;};
 const ratio=o=>{const s=new Box3().setFromObject(o).getSize(new Vector3());return s.x/s.y;};
 assert.ok(Math.abs(ratio(n('navy-front-face'))-5.1)<.10);
 assert.ok(Math.abs(ratio(m)-5.95)<.16);
 for(const side of ['left','right'])assert.equal(n(side+'-slotted-ear').geometry.parameters.shapes.holes.length,2);
 assert.equal(n('front-fasteners').children.length,4);
 assert.equal(n('front-status-lenses').children.length,3);
 assert.equal(n('static-seven-segment-display').children.filter(o=>o.name==='static-digit').length,9);
 assert.ok(new Box3().setFromObject(n('static-seven-segment-display')).max.z<new Box3().setFromObject(n('navy-front-face')).max.z);
 assert.match(SEL_2407_PHOTO_URL,/2407-Front\.png/);
 m.traverse(o=>assert.ok(!o.userData.sid&&!o.userData.anchor));
});
