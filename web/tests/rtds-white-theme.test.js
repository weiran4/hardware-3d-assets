import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const main=readFileSync('src/styles.css','utf8');
const analog=readFileSync('src/rtds-analog.css','utf8');
const pip=readFileSync('src/rtds-pip.css','utf8');

test('the interface uses the verified RTDS red, black and pure-white palette with local sans-serif fonts',()=>{
 for(const [token,color] of [['paper','#ffffff'],['ink','#000000'],['brand-red','#e41b48'],['brand-navy','#0a2240']])assert.match(main,new RegExp(`--${token}:\\s*${color}(?:;|})`),token);
 assert.match(main,/--sans:[^;]*Arial[^;]*Helvetica[^;]*PingFang SC[^;]*Microsoft YaHei/);
 assert.doesNotMatch(main+analog+pip,/@font-face|url\([^)]*\.(?:woff|ttf|otf)/i,'no licensed official webfonts are distributed');
 assert.match(readFileSync('index.html','utf8'),/name="theme-color" content="#ffffff"/);
});

test('white page, card and viewer surfaces have no old paper or green decorative wash',()=>{
 for(const [name,css] of [['main',main],['analog',analog],['pip',pip]]){
  assert.doesNotMatch(css,/#(?:f4f0e7|e9ebe1|e9ede4|fafaf4|f9f3e9|e3e8db|faf8f1)\b/i,`${name}: legacy tinted surface`);
  assert.doesNotMatch(css,/radial-gradient\(/,`${name}: no decorative tinted viewer background`);
 }
 assert.match(main,/\.scene-wrap:before\{[^}]*background:none/);
 assert.match(main,/\.rtds-viewer-wrap:before\{[^}]*background:none/);
 assert.match(analog,/\.analog-model-wrap\{[^}]*background:var\(--paper\)/);
 assert.match(analog,/\.analog-card\{[^}]*background:var\(--paper\)/);
 assert.match(pip,/\.rtds-pip\{[^}]*background:var\(--paper,#ffffff\)/);
});

test('brand treatment keeps semantic hardware, orange selection and measurement cues distinct',()=>{
 assert.match(main,/\.rtds-highlight-main\{[^}]*stroke:#ff6a00/);
 assert.match(analog,/\.analog-wire\.black\{stroke:#344940\}/);
 assert.match(analog,/\.analog-wire\.red\{stroke:#b74431\}/);
 assert.match(analog,/\.analog-meter\{[^}]*background:#cba44f/);
 assert.match(analog,/--signal:#176f7a;--output:#b64d35/);
 assert.match(analog,/\.analog-lesson #analog-play\{[^}]*background:var\(--brand-red\)/);
 assert.doesNotMatch(main+analog,/\.rtds-pip-(?:capable|active)\b/,'theme must never reserve a PiP gutter');
});
