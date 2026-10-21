import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('late model completion and mode activation cannot resume a document-hidden RTDS renderer',()=>{
 const source=readFileSync('src/rtds-gallery.js','utf8');assert.doesNotMatch(source,/viewer\??\.setActive\(active\)/);assert.ok((source.match(/viewer\??\.setActive\(active\s*&&\s*!document\.hidden\)/g)||[]).length>=3);
});
