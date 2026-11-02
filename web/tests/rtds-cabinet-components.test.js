import test from 'node:test';
import assert from 'node:assert/strict';
const module=await import('../src/rtds-cabinet-components.js').catch(()=>({}));
test('component check distinguishes front screws, side quarter-turn and door latches',()=>{
 assert.equal(typeof module.checkComponent,'function');
 for(const [part,answer] of [['front2','screws'],['front4','screws'],['side','quarter'],['door','latches']])assert.equal(module.checkComponent(part,answer).status,'match');
});
test('component check refuses mechanism transfer and unknown choice',()=>{
 assert.equal(typeof module.checkComponent,'function');
 assert.equal(module.checkComponent('front2','quarter').status,'mismatch');
 assert.equal(module.checkComponent('door','screws').status,'mismatch');
 assert.equal(module.checkComponent('side','unknown').status,'unknown');
});
test('component check rejects invalid and prototype keys without a guessed result',()=>{
 assert.equal(typeof module.checkComponent,'function');
 for(const [part,answer] of [['constructor','screws'],['side','toString'],[null,'screws'],['front2',null],['ground','screws']])assert.equal(module.checkComponent(part,answer).status,'invalid');
});
test('component records preserve both front sizes and all seven source model references',()=>{
 assert.equal(typeof module.componentRecords,'object');
 assert.equal(module.componentRecords.front2.source,'PDF 33–34 §1.8');
 assert.equal(module.componentRecords.front4.mechanism,'screws');
 assert.deepEqual(module.powerComponents.map(x=>x.model),['9926252015','DRS-24V100W1NR','TL-SG1024','P231-QC20BR100K','FA60M28-10M-24V-B','HLG-100H-24B','RSEN-2020D']);
});
