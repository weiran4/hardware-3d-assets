// Isolated module harness; not part of production routes.
import {build} from 'esbuild';import {mkdir,cp,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});await cp('public/assets','dist/assets',{recursive:true});
await build({stdin:{contents:"import {mountGtaoScope} from './src/rtds-gtao-scope.js';window.lab=mountGtaoScope(document.querySelector('main'));",resolveDir:process.cwd()},bundle:true,format:'esm',outfile:'dist/scope-harness.js'});
await writeFile('dist/scope-harness.html','<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="scope-harness.css"><body style="margin:12px;font:16px Arial"><main style="max-width:1000px;margin:auto"></main><script type="module" src="scope-harness.js"></script></body></html>');
