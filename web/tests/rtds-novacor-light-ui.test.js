import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
test('Light teaching is mounted in its own hidden version context',()=>{
 const html=read('../index.html'),gallery=read('../src/rtds-gallery.js');
 assert.match(html,/<section id="rtds-chapter-2b"[^>]*hidden/);
 assert.match(gallery,/light:'rtds-chapter-2b'/);
 assert.match(gallery,/lesson==='light'/);
});
test('Light UI is optional and has no hidden animation or borrowed physical model',async()=>{
 const {initNovacorLight}=await import('../src/rtds-novacor-light.js');assert.equal(initNovacorLight(null),null);
 const text=read('../src/rtds-novacor-light.js');assert.doesNotMatch(text,/requestAnimationFrame|setInterval|asset\.glb/);
 assert.match(text,/PDF 109–111/);assert.match(text,/PDF 112–118/);assert.match(text,/PDF 119/);
 assert.match(text,/pin 13/);assert.match(text,/pin 14\/15/);assert.match(text,/端到端延时/);
});
