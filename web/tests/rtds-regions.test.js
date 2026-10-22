import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync('index.html','utf8');
const css=readFileSync('src/styles.css','utf8');

test('catalog, 3D viewer, interface choices and parameters are separate named semantic regions',()=>{
 assert.match(html,/<aside class="rtds-library rtds-region" aria-labelledby="rtds-library-heading">/);
 for(const [id,label] of [['rtds-viewer-region','rtds-viewer-heading rtds-model-title'],['rtds-interface-region','rtds-interfaces-heading'],['rtds-detail','rtds-details-heading']]){
  assert.match(html,new RegExp(`<section[^>]*id="${id}"[^>]*aria-labelledby="${label}"`),id);
 }
 for(const [id,number,title] of [['rtds-library-heading','01','选择版本'],['rtds-interfaces-heading','02','接口巡览'],['rtds-details-heading','03','用途与参数']]){
  assert.match(html,new RegExp(`<h3[^>]*id="${id}"[^>]*><span class="rtds-region-number" aria-hidden="true">${number}</span>${title}</h3>`),id);
 }
 assert.match(html,/<section[^>]*id="rtds-detail"[^>]*aria-describedby="rtds-detail-title"/);
 assert.match(html,/class="rtds-context-label">当前查看<\/p><h4 id="rtds-detail-title">/);
});

test('viewer framing keeps model header, original viewer and camera together without changing the PiP target',()=>{
 const region=html.match(/<section[^>]*id="rtds-viewer-region"[^>]*>([\s\S]*?)<\/section>/)?.[1];
 assert.ok(region,'the 3D region must exist');
 for(const marker of ['class="rtds-model-head"','class="rtds-viewer-wrap"','class="rtds-camera"'])assert.ok(region.includes(marker),marker);
 assert.equal((html.match(/class="rtds-viewer-wrap"/g)||[]).length,1);
 const choices=html.match(/<section[^>]*id="rtds-interface-region"[^>]*>([\s\S]*?)<\/section>/)?.[1];
 assert.ok(choices?.includes('id="rtds-group-list"'),'02 owns its actual choices');
 assert.ok(!choices.includes('id="rtds-detail"'),'03 is not nested inside 02');
 const pip=readFileSync('src/rtds-pip.js','utf8');
 assert.match(pip,/wrap\.parentNode\.insertBefore\(slot,wrap\);slot\.append\(wrap\)/);
 assert.match(pip,/stage\.append\(wrap\)/);
});

test('functional hierarchy uses white framed cards, visible spacing and readable numbered headings',()=>{
 assert.match(css,/\.rtds-region\{[^}]*border:1px solid var\(--line\);[^}]*border-top:3px solid var\(--brand-navy\);[^}]*border-radius:var\(--panel-radius\);[^}]*padding:16px;[^}]*background:var\(--paper\)/);
 assert.match(css,/\.rtds-workbench\{[^}]*gap:20px;[^}]*border:0/);
 assert.match(css,/\.rtds-inspection\{[^}]*display:grid;[^}]*gap:20px;[^}]*padding:0/);
 assert.match(css,/\.rtds-region-title\{[^}]*font-size:18px;[^}]*font-weight:700/);
 assert.match(css,/\.rtds-region-number\{[^}]*background:var\(--brand-navy\)/);
 assert.match(css,/\.rtds-detail\.rtds-region\{border-top-color:var\(--brand-red\)/);
 assert.doesNotMatch(css,/\.rtds-pip-(?:capable|active)\b/,'framing must not restore a permanent floating-view gutter');
});
