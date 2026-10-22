import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
test('removed 05 GTDI conceptual section has no visible UI, imported runtime, dead source or old suite',()=>{
 const html=readFileSync('index.html','utf8'),gallery=readFileSync('src/rtds-gallery.js','utf8'),css=readFileSync('src/styles.css','utf8');assert.ok(!html.includes('rtds-signal-flow'));assert.ok(!html.includes('05 / CONCEPTUAL SIGNAL FLOW'));assert.ok(!gallery.includes('signalFlow'));assert.ok(!gallery.includes('initSignalFlow'));assert.ok(!css.includes('.flow-'));
 for(const p of ['src/rtds-signal-flow.js','src/rtds-signal-state.js','tests/rtds-signal.test.js','tests/browser/rtds-signal.spec.js'])assert.equal(existsSync(p),false,p);
});
test('removing 05 does not remove the original generic wiring laboratory',()=>{
 const html=readFileSync('index.html','utf8');for(const id of ['generic-panel','port-out','port-ch1','send-pulse','reset-lesson'])assert.ok(html.includes(`id="${id}"`));
});
