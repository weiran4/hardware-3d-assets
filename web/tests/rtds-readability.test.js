import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('RTDS primary reading and controls use readable defaults instead of microtype',()=>{
 const css=readFileSync('src/styles.css','utf8');
 assert.match(css,/body\{font-size:16px\}/);assert.match(css,/#rtds-detail-copy\{font-size:16px/);assert.match(css,/#rtds-port-facts dl\{[^}]*font-size:15px/);assert.match(css,/\.rtds-group\{[^}]*font-size:14px/);
});
