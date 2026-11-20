import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createGtfpiAssembly} from '../src/rtds-gtfpi-geometry.js';

test('the photographed LV panel has two banks of three-row recessed jacks with real channel-one anchors',()=>{
 const board=new THREE.Group();const lv=new THREE.Object3D();lv.userData.sid='gtfpi-v2-2.01-capped.lv';board.add(lv);
 const model=createGtfpiAssembly(board);
 try{
  const {panel,anchors}=model;
  const sockets=panel.getObjectByName('48-recessed-front-jacks');
  assert.ok(sockets);
  assert.equal(sockets.children.length,48);
  const terminal=(ch,row)=>sockets.getObjectByName(`ch${ch}-${row}`);
  assert.deepEqual(anchors.input.parent,terminal(1,'in'));
  assert.deepEqual(anchors.ground.parent,terminal(1,'ground'));
  assert.deepEqual(anchors.output.parent,terminal(1,'out'));
  assert.ok(terminal(8,'in').position.x<0&&terminal(9,'in').position.x>0);
  assert.ok(terminal(9,'in').position.x-terminal(8,'in').position.x>.038);
  assert.ok(terminal(1,'in').position.y>terminal(1,'ground').position.y&&terminal(1,'ground').position.y>terminal(1,'out').position.y);
  assert.equal(terminal(1,'in').children[0].material,terminal(1,'out').children[0].material);
  assert.notEqual(terminal(1,'in').children[0].material,terminal(1,'ground').children[0].material);
 }finally{model.dispose();}
});
