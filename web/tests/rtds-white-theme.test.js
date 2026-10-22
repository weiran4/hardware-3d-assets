import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const main=readFileSync('src/styles.css','utf8');
const analog=readFileSync('src/rtds-analog.css','utf8');
const pip=readFileSync('src/rtds-pip.css','utf8');

test('the white-body RTDS theme defines shared chrome, stage and accessible control tokens',()=>{
 for(const [token,color] of [['paper','#ffffff'],['ink','#000000'],['brand-red','#e41b48'],['brand-navy','#0a2240'],['brand-red-ink','#b41339'],['chrome-soft','#f3f6fa'],['selected-soft','#fff1f4'],['stage','#edf3ef'],['stage-grid','#dce6df']])assert.match(main,new RegExp(`--${token}:\\s*${color}(?:;|})`),token);
 assert.match(main,/--sans:[^;]*Arial[^;]*Helvetica[^;]*PingFang SC[^;]*Microsoft YaHei/);
 assert.doesNotMatch(main+analog+pip,/@font-face|url\([^)]*\.(?:woff|ttf|otf)/i,'no licensed official webfonts are distributed');
 assert.match(readFileSync('index.html','utf8'),/name="theme-color" content="#ffffff"/);
});

test('white page and content cards coexist with intentional tinted chrome and decorative green-grid viewers',()=>{
 assert.match(main,/html,body,\.page,#generic-panel,#rtds-panel,[^}]+\{background:var\(--paper\)\}/);
 assert.match(main,/\.masthead\{[^}]*background:var\(--brand-navy\)/);
 assert.match(main,/\.rtds-region-heading,\.rtds-tour-row\{[^}]*background:var\(--chrome-soft\)/);
 assert.match(main,/\.scene-wrap,\.rtds-viewer-wrap\{[^}]*background-color:var\(--stage\);[^}]*background-image:var\(--stage-grid-image\)/);
 assert.match(analog,/\.analog-model-wrap\{[^}]*background-color:var\(--stage\);[^}]*background-image:var\(--stage-grid-image\)/);
 assert.match(pip,/\.rtds-pip \.rtds-viewer-wrap\{[^}]*background-color:var\(--stage\);[^}]*background-image:var\(--stage-grid-image\)/);
 assert.match(main,/--stage-grid-image:linear-gradient\(var\(--stage-grid\) 1px,transparent 1px\),linear-gradient\(90deg,var\(--stage-grid\) 1px,transparent 1px\)/);
 assert.match(main,/#scene,#rtds-scene\{background:transparent\}/);
 assert.match(analog,/#analog-model-scene\{background:transparent\}/);
 for(const file of ['src/scene.js','src/rtds-scene.js'])assert.match(readFileSync(file,'utf8'),/WebGLRenderer\(\{[^}]*alpha:true/);
 assert.match(analog,/\.analog-card\{[^}]*background:var\(--paper\)/);
 assert.doesNotMatch(main+analog+pip,/radial-gradient\(|backdrop-filter|mix-blend-mode/,'quiet grid, no visual haze or blending');
});

test('controls distinguish secondary, selected, hover, focus and disabled states without relying on color alone',()=>{
 assert.match(main,/--control-radius:6px/);
 assert.match(main,/\.rtds-group\[aria-pressed=true\],[^}]+\{[^}]*background:var\(--selected-soft\)/);
 assert.match(main,/\.rtds-catalog-item\[aria-pressed=true\]\{[^}]*box-shadow:inset 3px 0 var\(--brand-red\)/);
 assert.match(main,/button:disabled\{[^}]*background:var\(--disabled-surface\);[^}]*color:var\(--disabled-ink\);[^}]*box-shadow:none/);
 assert.match(main,/button:focus-visible,a:focus-visible,select:focus-visible,summary:focus-visible\{outline:3px solid var\(--brand-red\)/);
 assert.match(main,/\.view-controls button:focus-visible\{[^}]*outline-offset:-3px/,'segmented camera focus must not be clipped');
 assert.match(analog,/\.analog-model-toolbar button\[aria-pressed=true\]:hover:not\(:disabled\)/,'disabled selected controls must not acquire a hover fill');
 assert.match(main,/#rtds-tour:disabled,#rtds-isolate:disabled\{[^}]*background:var\(--disabled-surface\)/,'ID primary styles must not override disabled state');
 assert.match(pip,/\.rtds-pip-header\{[^}]*background:var\(--brand-navy\);[^}]*color:var\(--paper\)/);
});

test('brand treatment keeps physical materials, amber inspection emission and measurement cues distinct',()=>{
 assert.doesNotMatch(main,/\.rtds-highlight-main/);assert.match(readFileSync('src/rtds-interaction.js','utf8'),/new Color\('#ffc477'\)/);
 assert.match(analog,/\.analog-wire\.black\{stroke:#344940\}/);
 assert.match(analog,/\.analog-wire\.red\{stroke:#b74431\}/);
 assert.match(analog,/\.analog-meter\{[^}]*background:#cba44f/);
 assert.match(analog,/--signal:#176f7a;--output:#b64d35/);
 assert.match(analog,/\.analog-lesson #analog-play\{[^}]*background:var\(--brand-red\)/);
 assert.doesNotMatch(main+analog,/\.rtds-pip-(?:capable|active)\b/,'theme must never reserve a PiP gutter');
});
