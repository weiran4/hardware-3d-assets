import test from 'node:test';
import assert from 'node:assert/strict';
import {checkGbh} from '../src/rtds-gbh-state.js';
const base={capacity:36,count:8,start:1,fleet:'novacor',cases:'2,3,4\n5,6,7,8'};
test('independent consecutive cases have separate masters and unused rack',()=>{const r=checkGbh(base);assert.equal(r.status,'match');assert.deepEqual(r.groups.map(g=>g.master),[2,5]);assert.deepEqual(r.unused,[1]);assert.deepEqual(r.mapping[7],{port:8,rack:8});});
test('reject gap overlap absent rack and empty data',()=>{for(const cases of ['2,3,5','1,2,3,4\n4,5,6','9','', '1,1','2,x','2.5'])assert.equal(checkGbh({...base,cases}).status,'invalid',cases);});
test('capacity and numbering are independent',()=>{assert.equal(checkGbh({...base,count:37}).status,'invalid');assert.equal(checkGbh({...base,start:129,cases:'129,130'}).status,'match');assert.equal(checkGbh({...base,start:129,fleet:'legacy',cases:'129,130'}).status,'invalid');assert.equal(checkGbh({...base,start:200,cases:'200'}).status,'match');});
test('unsupported and noninteger inputs fail closed',()=>{for(const change of [{capacity:12},{count:0},{count:1.5},{start:-1},{start:NaN},{fleet:'other'}])assert.equal(checkGbh({...base,...change}).status,'invalid');});
test('single cases and all rack case valid; input must ascend',()=>{assert.equal(checkGbh({...base,cases:'1\n2\n3\n4\n5\n6\n7\n8'}).groups.length,8);assert.equal(checkGbh({...base,cases:'1,2,3,4,5,6,7,8'}).groups[0].master,1);assert.equal(checkGbh({...base,cases:'3,2,1'}).status,'invalid');});

test('unsafe final rack rejects before constructing mapping',()=>{assert.equal(checkGbh({...base,start:Number.MAX_SAFE_INTEGER,count:2,cases:String(Number.MAX_SAFE_INTEGER)}).status,'invalid');});
