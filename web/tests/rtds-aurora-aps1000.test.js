import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {createAps1000Exterior,APS_1000_PHOTO_URL} from '../src/rtds-aurora-aps1000.js';

test('APS 1000 front has the manufacturer photo landmarks and no connection endpoints',()=>{
 const {group,dispose}=createAps1000Exterior();
 try{
  const part=name=>{const o=group.getObjectByName(name);assert.ok(o,name);return o;};
  assert.equal(group.name,'aps1000-front-exterior');
  const bbox=new Box3().setFromObject(group),[w,h,d]=bbox.getSize(new Vector3()).toArray();
  assert.ok(Math.abs(w-.483)<.005&&Math.abs(h-.178)<.008&&Math.abs(d-.650)<.008,[w,h,d]);
  assert.ok(bbox.max.z<.029 && bbox.min.z<-.60);
  assert.equal(part('left-air-vent-louvers').children.length,5);
  assert.equal(part('front-pull-handles').children.length,2);
  assert.equal(part('photographed-left-recessed-grips').children.length,2);
  assert.equal(part('paired-lower-round-details').children.length,2);
  for(const name of ['circular-usb-bezel','green-square-button','black-rotary-selector','amber-rocker-switch'])assert.ok(part(name));
  assert.ok(part('touchscreen-bezel').position.x>0);
  assert.ok(part('left-air-vent-louvers').position.x<0);
  assert.match(APS_1000_PHOTO_URL,/SPS-TD-APS-Overview-ver03-a25cf\.pdf#page=1$/);
  group.traverse(o=>assert.ok(!o.userData.sid&&!o.userData.anchor&&!o.userData.endpoint));
 }finally{dispose();dispose();}
});
