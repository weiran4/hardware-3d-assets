import {test,expect} from '@playwright/test';import {mkdir} from 'node:fs/promises';
const root='#rtds-gtfpi-protection',q=k=>'#gtfpi-'+k;
async function open(page,hash='#rtds-gtfpi-protection'){await page.goto('./'+hash);await expect(page.locator(root)).toBeVisible();await expect(page.locator(q('heading'))).toBeFocused();}
async function ready(page){await page.locator(root).locator('[data-example="correct"]').click();await page.locator(q('power')).click();}
for(const mode of ['desktop','mobile','fallback'])test(`GTFPI low voltage loop ${mode}`,async({page})=>{if(mode!=='desktop')await page.setViewportSize({width:390,height:844});if(mode==='fallback')await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:get.call(this,t,...a);};});await open(page);await expect(page.locator(q('scene'))).toHaveAttribute('data-loaded',mode==='fallback'?'error':'true');await ready(page);await expect(page.locator(q('raw'))).toHaveText('1');await expect(page.locator(q('processed'))).toHaveText('0');await expect(page.locator(q('receiver'))).toHaveText('5 V');await page.locator(q('contact')).click();await expect(page.locator(q('raw'))).toHaveText('0');await expect(page.locator(q('breaker'))).toHaveText('合');await page.locator(q('sample')).click();await expect(page.locator(q('breaker'))).toHaveText('分');await expect(page.locator(q('receiver'))).toHaveText('0 V');await page.locator(q('contact')).click();await page.locator(q('reclose')).click();await expect(page.locator(q('breaker'))).toHaveText('合');await page.locator(q('terminal-no')).click();await expect(page.locator(q('notice'))).toContainText('断电');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator(q('scene')).scrollIntoViewIfNeeded();await page.waitForTimeout(100);await mkdir('screenshots',{recursive:true});await page.locator(root).screenshot({path:`screenshots/gtfpi-${mode}.png`});if(mode!=='fallback')await expect(page.locator(q('scene'))).toHaveAttribute('data-triangles',/^[1-9]\d+$/);});
test('GTFPI errors and keyboard wiring',async({page})=>{await open(page);for(const [a,b]of [['no','input'],['com','ground'],['output','sense'],['ground','zero']]){await page.locator(q('terminal-'+a)).focus();await page.keyboard.press('Enter');await page.locator(q('terminal-'+b)).focus();await page.keyboard.press('Enter');}await expect(page.locator(q('wires')+' button')).toHaveCount(4);for(const kind of ['active','hv','overload']){await page.locator(root).locator(`[data-example="${kind}"]`).click();await page.locator(q('power')).click();await expect(page.locator(root)).toHaveAttribute('data-power','false');await expect(page.locator(root)).toHaveAttribute('data-status','unsafe');}await page.locator(root).locator('[data-example="missing"]').click();await page.locator(q('power')).click();await page.locator(q('contact')).click();await expect(page.locator(root)).toHaveAttribute('data-status','incomplete');await expect(page.locator(q('raw'))).toHaveText('1');});
test('GTFPI animation pauses hidden background reduced motion and repeats safely',async({page})=>{await open(page);await expect(page.locator(q('scene'))).toHaveAttribute('data-loaded','true');await ready(page);await page.locator(q('play')).click();await expect(page.locator(root)).toHaveAttribute('data-playing','true');await page.locator(q('play')).click();await expect(page.locator(root)).toHaveAttribute('data-playing','false');await page.locator(q('replay')).click();await expect(page.locator(q('breaker'))).toHaveText('分',{timeout:6000});await expect(page.locator(root)).toHaveAttribute('data-playing','false');await page.locator(q('replay')).click();await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator(root)).toHaveAttribute('data-playing','false');await expect(page.locator(q('play'))).toBeDisabled();await page.emulateMedia({reducedMotion:'no-preference'});await page.locator(q('replay')).click();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator(root)).toHaveAttribute('data-playing','false');await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await page.locator(q('replay')).click();await page.locator('#mode-generic').click();await expect(page.locator(root)).toBeHidden();await expect(page.locator(root)).toHaveAttribute('data-playing','false');});
test('GTFPI slide routes and browser history retain state without rewiring',async({page})=>{await open(page,'#rtds-presentation-18');await ready(page);await page.locator(root).locator('a[href="#rtds-presentation-19"]').click();await expect(page.locator(root)).toBeVisible();await page.goBack();await expect(page.locator(root)).toHaveAttribute('data-power','true');await expect(page.locator(q('wires')+' button')).toHaveCount(4);await page.goForward();await expect(page.locator(root)).toBeVisible();await page.evaluate(()=>location.hash='#rtds-digital-output');await expect(page.locator(root)).toBeHidden();await page.goBack();await expect(page.locator(root)).toBeVisible();});
test('GTFPI runtime context loss and model retry',async({page})=>{await open(page);await expect(page.locator(q('scene'))).toHaveAttribute('data-loaded','true');await ready(page);await page.locator(q('play')).click();await page.locator(q('scene')+' canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await expect(page.locator(q('scene'))).toHaveAttribute('data-loaded','error');await expect(page.locator(root)).toHaveAttribute('data-playing','false');await page.locator(q('retry')).click();await expect(page.locator(q('scene'))).toHaveAttribute('data-loaded','true');await expect(page.locator(q('scene')+' canvas')).toHaveCount(1);});
test('GTFPI mobile play reveals scene and pause resumes without resetting stage',async({page})=>{await page.setViewportSize({width:390,height:844});await open(page);await expect(page.locator(q('scene'))).toHaveAttribute('data-loaded','true');await ready(page);await page.locator(q('play')).click();await expect(page.locator(root)).toHaveAttribute('data-playing','true');await expect(page.locator(root)).toHaveAttribute('data-stage','1');await page.locator(q('play')).click();await expect(page.locator(root)).toHaveAttribute('data-playing','false');const pausedStage=await page.locator(root).getAttribute('data-stage');expect(['1','2']).toContain(pausedStage);await expect(page.locator(q('raw'))).toHaveText('0');await page.locator(q('play')).click();await expect(page.locator(root)).not.toHaveAttribute('data-stage','0');await expect(page.locator(q('raw'))).toHaveText('0');await expect(page.locator(q('breaker'))).toHaveText('分',{timeout:6000});await page.locator(q('replay')).click();await expect(page.locator(root)).toHaveAttribute('data-stage','0');await expect(page.locator(q('breaker'))).toHaveText('合');await expect(page.locator(q('breaker'))).toHaveText('分',{timeout:6000});});

for(const width of [1200,390])test(`GTFPI source-backed low-voltage front view ${width}`,async({page})=>{
 await page.setViewportSize({width,height:880});await open(page,'#rtds-presentation-19');
 const scene=page.locator(q('scene'));
 await expect(scene).toHaveAttribute('data-loaded','true');
 await expect(scene).toHaveAttribute('data-panel-socket-count','48');
 await expect(page.locator(q('panel-photo'))).toHaveAttribute('href','https://knowledge.rtds.com/hc/en-us/articles/360034817373-Low-Voltage-Digital-Input-Output-Interface-Panel');
 await ready(page);
 await page.locator(q('view-panel')).focus();await page.keyboard.press('Enter');
 await expect(scene).toHaveAttribute('data-view','panel');
 await expect(page.locator(q('labels'))).toBeHidden();
 await expect(page.locator(root)).toHaveAttribute('data-power','true');
 await expect(page.locator(q('wires')+' button')).toHaveCount(4);
 await expect.poll(async()=>Number(await scene.getAttribute('data-triangles'))).toBeGreaterThan(5000);
 await mkdir('screenshots',{recursive:true});
 await scene.screenshot({path:`screenshots/gtfpi-photo-panel-${width}.png`});
 await page.locator(q('view-reset')).click();
 await expect(scene).toHaveAttribute('data-view','front');
 await expect(page.locator(q('labels'))).toBeVisible();
 await expect(page.locator(q('wires')+' button')).toHaveCount(4);
});

for(const width of [1200,390])test(`GTFPI SEL-751A exterior isolates symbolic wiring ${width}`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:880});
 await open(page,width===1200?'#rtds-presentation-18':'#rtds-presentation-19');
 const scene=page.locator(q('scene'));
 await expect(scene).toHaveAttribute('data-loaded','true');
 await expect(page.locator(q('sender-photo'))).toHaveAttribute('href','https://selinc.com/products/751a/');
 await ready(page);
 await page.locator(q('view-sender')).click();
 await expect(scene).toHaveAttribute('data-view','sender');
 await expect(page.locator(q('labels'))).toBeHidden();
 await expect(page.locator(root)).toHaveAttribute('data-power','true');
 await expect.poll(async()=>Number(await scene.getAttribute('data-triangles'))).toBeGreaterThan(1200);
 await scene.screenshot({path:testInfo.outputPath(`sel-751a-${width}.png`)});
 await page.locator(q('view-reset')).click();
 await expect(scene).toHaveAttribute('data-view','front');
 await expect(page.locator(q('labels'))).toBeVisible();
 await expect(page.locator(q('wires')+' button')).toHaveCount(4);
 await expect(page.locator(q('receiver'))).toHaveText('5 V');
});
