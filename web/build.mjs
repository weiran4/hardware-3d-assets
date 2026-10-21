import {build} from 'esbuild';
import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true}); await copyFile('index.html','dist/index.html');await copyFile('src/styles.css','dist/styles.css');
await build({entryPoints:['src/app.js'],bundle:true,minify:true,outfile:'dist/app.js',format:'esm',target:'es2022',sourcemap:false,legalComments:'eof'});
console.log('Built static display-only dist');
