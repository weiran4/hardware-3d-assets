import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import * as scene from '../src/rtds-gtao-scope-scene.js';

test('GTAO scope uses recognizable DS1054Z geometry and a single coaxial measurement jack',()=>{
 assert.equal(typeof scene.createDS1054Z,'function','a physical DS1054Z model is required');
 const {group,signal,shield,screen}=scene.createDS1054Z();
 const size=new Box3().setFromObject(group).getSize(new Vector3());
 assert.ok(Math.abs(size.x/size.y-313.1/160.8)<.12);
 assert.ok(Math.abs(size.z/size.x-122.4/313.1)<.05);
 assert.ok(screen.right-screen.left>.105);
 assert.ok(group.getObjectByName('USB-A'));
 assert.ok(group.getObjectByName('power'));
 assert.ok(group.getObjectByName('foot-L')&&group.getObjectByName('foot-R'));
 const ports=group.children.filter(o=>/^CH[1-4]$/.test(o.name));
 assert.deepEqual(ports.map(o=>o.name),['CH1','CH2','CH3','CH4']);
 assert.equal(group.getObjectByName('TRIG'),undefined);
 assert.ok(ports.every(o=>o.getObjectByName('bayonet-shell')?.geometry.type==='LatheGeometry'));
 assert.ok(signal.distanceTo(shield)<.007);
 assert.equal(group.children.filter(o=>o.name.startsWith('knob-')).length,6);
});
