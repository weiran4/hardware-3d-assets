import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {portContent} from '../src/rtds-port-content.js';
const metadata=id=>JSON.parse(readFileSync(`public/assets/rtds/${id}.json`));
test('every interactive existing port has source-backed purpose and connection content',()=>{
 for(const id of ['novacor-2.0-2023','gtdi-v2-2.01','gtdo-v2-2.00','gtai-v2-2.31','gtao-v2-2.20']){const m=metadata(id);for(const p of m.ports){const c=portContent(m,p);if(p.interactive===false){assert.equal(c,null);continue;}assert.ok(c?.purpose,p.id);assert.ok(c.rows.some(([k])=>k==='连接对象'),p.id);assert.ok(c.source.pages.length);assert.doesNotMatch(JSON.stringify(c),/照片估计|局部尺寸|配接兼容性.*未知/);}}
});
test('NovaCor optical families retain documented roles, LC and the separate GBH cable family',()=>{
 const m=metadata('novacor-2.0-2023'),get=s=>portContent(m,m.ports.find(p=>p.id.endsWith('.'+s)));
 assert.match(JSON.stringify(get('gt1')),/GTI\/O/);assert.match(JSON.stringify(get('gt21')),/授权/);assert.match(JSON.stringify(get('gt21')),/不能.*GTI\/O/);
 for(const id of ['gt1','gt21','irc1','gtsync'])assert.match(JSON.stringify(get(id)),/LC/);
 assert.match(JSON.stringify(get('gbh')),/1 mm.*POF/);assert.match(JSON.stringify(get('gbh')),/200 μm.*HCS/);assert.match(JSON.stringify(get('gbh')),/非 LC/);
});
test('GTDI details distinguish known upper supply from unresolved lower pins and channels from positions',()=>{
 const m=metadata('gtdi-v2-2.01'),get=s=>portContent(m,m.ports.find(p=>p.id.endsWith('.'+s)));
 assert.match(JSON.stringify(get('bank1_odd')),/64.*输入通道/);assert.match(JSON.stringify(get('bank1_odd')),/80.*端子位置/);assert.match(JSON.stringify(get('power1')),/24V/);assert.doesNotMatch(JSON.stringify(get('power2')),/24V/);assert.match(JSON.stringify(get('power2')),/引脚.*未核/);
 assert.match(JSON.stringify(get('gt1')),/上游/);assert.match(JSON.stringify(get('gt2')),/后续/);
});
