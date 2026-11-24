import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {buildMoxaExterior,moxaReference} from '../src/rtds-light-moxa.js';
test('current photo EDS-205A has a recessed four-port bank and isolated fifth, with no simulated anchors',()=>{
 const {group,dispose}=buildMoxaExterior();assert.equal(group.name,'moxa-eds-205a');
 const sockets=[5,4,3,2,1].map(n=>group.getObjectByName('rj45-recess-'+n));
 assert.ok(sockets.every(o=>o?.isMesh));assert.ok(sockets.every(o=>o.geometry.parameters.shapes.holes.length===1));
 const gaps=sockets.slice(1).map((o,i)=>sockets[i].position.y-o.position.y);
 assert.ok(gaps.slice(0,3).every(g=>Math.abs(g-.0145)<1e-7));assert.ok(gaps[3]>gaps[0]*1.38);
 assert.ok(group.getObjectByName('four-port-continuous-shield'));assert.ok(group.getObjectByName('top-green-four-position-block'));assert.ok(group.getObjectByName('status-lens-P1'));
 const size=new Box3().setFromObject(group.getObjectByName('housing')).getSize(new Vector3());
 [size.x,size.y,size.z].forEach((n,i)=>assert.ok(Math.abs(n-[.030,.115,.070][i])<1e-6));
 group.traverse(o=>{assert.ok(!o.name.startsWith('SW.'));assert.ok(!o.userData.anchor);});
 assert.match(moxaReference.photo,/moxa\.com.*eds-205a-image\.jpg/);
 let freed=0;sockets[0].geometry.addEventListener('dispose',()=>freed++);dispose();dispose();assert.equal(freed,1);
});
