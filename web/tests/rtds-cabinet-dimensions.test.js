import test from 'node:test';
import assert from 'node:assert/strict';
import {dimensionComparison,configuredMass} from '../src/rtds-cabinet-dimensions.js';
const base={source:'nominal',rotated:false,width:700,depth:1000,height:2100};
test('source dimensions stay distinct with exact unit conversion',()=>{
 assert.deepEqual(dimensionComparison(base).dimensions,{width:584.2,depth:825.5,height:1905});
 assert.deepEqual(dimensionComparison({...base,source:'frame'}).dimensions,{width:590.042,depth:827.532,height:1909.826});
 assert.equal(dimensionComparison(base).status,'greater');
});
test('width-depth exchange preserves height and is reversible',()=>{
 const r=dimensionComparison({...base,rotated:true});assert.deepEqual(r.dimensions,{width:825.5,depth:584.2,height:1905});assert.equal(r.status,'smaller');
 assert.equal(dimensionComparison({...base,rotated:false}).status,'greater');
});
test('equality is not clearance and any smaller axis wins',()=>{
 assert.equal(dimensionComparison({...base,width:584.2}).status,'equal');
 assert.equal(dimensionComparison({...base,width:584.1999999}).status,'smaller');
 assert.equal(dimensionComparison({...base,width:584.2,depth:800}).status,'smaller');
 assert.deepEqual(dimensionComparison({...base,width:584.2,depth:825.5,height:1905}).differences,{width:0,depth:0,height:0});
 assert.equal(dimensionComparison({...base,source:'frame',width:590.042,depth:827.532,height:1909.826}).status,'equal');
});
test('invalid or unbounded dimensions never produce a result',()=>{
 for(const width of [0,-1,NaN,Infinity,'700',null,undefined,100001])assert.equal(dimensionComparison({...base,width}).status,'invalid');
 for(const source of ['toString','constructor','__proto__','',null])assert.equal(dimensionComparison({...base,source}).status,'invalid');
 assert.equal(dimensionComparison({...base,rotated:'false'}).status,'invalid');
 assert.equal(dimensionComparison({...base,depth:NaN}).dimensions,undefined);
});
test('approximate configured mass preserves both source units, not extrapolation',()=>{
 assert.deepEqual(configuredMass('one'),{kg:185,lb:408});assert.deepEqual(configuredMass('two'),{kg:198,lb:436});
 for(const key of ['zero','three','toString','constructor','__proto__',null,1])assert.equal(configuredMass(key),null);
});
