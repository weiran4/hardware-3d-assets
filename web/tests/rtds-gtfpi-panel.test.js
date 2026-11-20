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

test('photographed SEL-751A sender is a detached enclosure, not the animated NO/COM terminals',()=>{
 const board=new THREE.Group();const lv=new THREE.Object3D();lv.userData.sid='gtfpi-v2-2.01-capped.lv';board.add(lv);
 const model=createGtfpiAssembly(board);
 try{
  const shell=model.group.getObjectByName('sel-751a-photo-exterior');
  assert.ok(shell,'missing exact SEL-751A exterior');
  for(const [name,count] of [['navigation-keys',7],['left-indicators',8],['right-control-strips',4],['port-f-serial-socket-holes',9]]){
   assert.equal(shell.getObjectByName(name)?.children.length,count,name);
  }
  assert.ok(shell.getObjectByName('recessed-lcd-glass'));
  for(const id of ['no','com','sense','zero']){
   for(let part=model.anchors[id];part;part=part.parent)assert.notEqual(part,shell);
  }
  const shellBox=new THREE.Box3().setFromObject(shell);
  const contactBox=new THREE.Box3().setFromObject(model.relay);
  assert.equal(shellBox.intersectsBox(contactBox),false);
 }finally{model.dispose();}
});
