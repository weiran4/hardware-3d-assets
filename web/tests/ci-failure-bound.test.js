import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
for (const ci of ['', 'true']) test(`CI browser failure bound ${ci || 'local'}`,()=>{const r=spawnSync(process.execPath,['--input-type=module','-e',"import c from './playwright.config.js'; console.log(JSON.stringify({maxFailures:c.maxFailures,retries:c.retries,workers:c.workers}));"],{cwd:new URL('..',import.meta.url),env:{...process.env,CI:ci},encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.deepEqual(JSON.parse(r.stdout),{maxFailures:ci?3:0,retries:0,workers:1});});
