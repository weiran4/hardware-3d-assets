import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('connection teaching precedes closed optional cabinet references',async()=>{
 const text=await readFile(new URL('../src/rtds-cabinet.js',import.meta.url),'utf8');
 assert.match(text,/id="cabinet-wiring-focus"/);
 assert.match(text,/<details id="cabinet-auxiliary" class="cabinet-evidence">/);
 assert.ok(text.indexOf('id="cabinet-wiring-focus"')<text.indexOf('id="cabinet-auxiliary"'));
 assert.ok(text.indexOf('id="cabinet-auxiliary"')<text.indexOf('id="cabinet-components"'));
 assert.match(text,/采样.*更新.*不等于.*端到端延时/);
 assert.match(text,/#rtds-power-lesson/);assert.match(text,/#rtds-analog-lesson/);
});
