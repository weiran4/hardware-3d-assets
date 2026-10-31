import test from 'node:test';
import assert from 'node:assert/strict';
import * as access from '../src/rtds-cabinet-access.js';
const check=x=>access.cableAccessCheck?.(x);
test('top and bottom are identified entries, not installation approvals',()=>{
 for(const route of ['top','bottom'])assert.equal(check({route,panel:'unknown',led:'unknown'})?.status,'identified');
 assert.equal(access.bottomOpeningMm?.width,304.8);assert.equal(access.bottomOpeningMm?.height,76.2);
});
test('side access distinguishes closed, unknown, detached and inconsistent states',()=>{
 assert.equal(check({route:'side',panel:'installed',led:'connected'})?.status,'blocked');
 assert.equal(check({route:'side',panel:'removed',led:'connected'})?.status,'conflict');
 assert.equal(check({route:'side',panel:'removed',led:'unknown'})?.status,'unknown');
 assert.equal(check({route:'side',panel:'unknown',led:'disconnected'})?.status,'unknown');
 assert.equal(check({route:'side',panel:'removed',led:'disconnected'})?.status,'illustrated');
});
test('known entry is independent of stale side state',()=>{
 for(const route of ['top','bottom'])assert.equal(check({route,panel:'removed',led:'connected'})?.status,'identified');
});
test('invalid, absent and inherited enum names never establish access',()=>{
 for(const input of [undefined,null,{}, {route:'toString',panel:'removed',led:'disconnected'}, {route:'side',panel:'__proto__',led:'disconnected'},{route:'side',panel:'removed',led:'constructor'}])assert.equal(check(input)?.status,'invalid');
});
