import {test,expect} from '@playwright/test';import {mkdir} from 'node:fs/promises';
const root='#rtds-digital-output',id=k=>'#output-'+k;
async function open(page,hash='#rtds-digital-output'){await page.goto('./'+hash);await expect(page.locator(root)).toBeVisible();await expect(page.locator(id('heading'))).toBeFocused();}
for(const mode of ['desktop','mobile','fallback'])test(`GTDO original external load interactive 3D ${mode}`,async({page})=>{
 if(mode!=='desktop')await page.setViewportSize({width:390,height:844});
 if(mode==='fallback')await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:get.call(this,t,...a);};});
 await open(page);await expect(page.locator(id('scene'))).toHaveAttribute('data-loaded',mode==='fallback'?'error':'true');
 await page.locator(id('example-correct')).click();await page.locator(id('power')).click();await expect(page.locator(id('driver'))).toHaveText('HIGH-Z');await expect(page.locator(id('current'))).toHaveText('0 mA');
 await page.locator(id('logic')).click();await expect(page.locator(id('driver'))).toHaveText('V+');await expect(page.locator(id('current'))).toHaveText('24 mA');await expect(page.locator(root)).toHaveAttribute('data-flow','true');
 if(mode!=='fallback'){await expect(page.locator(id('scene'))).toHaveAttribute('data-triangles',/^[1-9]\d+$/);await page.locator(id('animate')).click();await expect(page.locator(root)).toHaveAttribute('data-playing','true');await page.locator(id('animate')).click();}
 await page.locator(id('terminal-plus')).click();await expect(page.locator(id('notice'))).toContainText('断电');await expect(page.locator(id('wire-list')+' button')).toHaveCount(4);
 await page.locator(id('power')).click();await page.locator(id('example-return')).click();await page.locator(id('power')).click();await expect(page.locator(id('result'))).toHaveAttribute('data-status','incomplete');await expect(page.locator(id('current'))).toHaveText('?');
 await page.locator(id('power')).click();await page.locator(id('example-conflict')).click();await page.locator(id('power')).click();await expect(page.locator(root)).toHaveAttribute('data-power','false');await expect(page.locator(id('result'))).toHaveAttribute('data-status','unsafe');
 await page.locator(id('example-correct')).click();await page.locator(id('power')).click();await page.locator(id('scene')).scrollIntoViewIfNeeded();if(mode!=='fallback')await expect(page.locator(id('scene'))).toHaveAttribute('data-wire-count','4');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await mkdir('screenshots',{recursive:true});await page.locator(root).screenshot({path:`screenshots/digital-output-${mode}.png`});
});
test('GTDO keyboard wiring and selected bank voltage/ideal current',async({page})=>{await open(page);for(const [a,b]of [['plus','vplus'],['minus','vminus'],['output','loadIn'],['loadReturn','vminus']]){await page.locator(id('terminal-'+a)).focus();await page.keyboard.press('Enter');await page.locator(id('terminal-'+b)).focus();await page.keyboard.press('Enter');}await expect(page.locator(id('wire-list')+' button')).toHaveCount(4);await page.locator(id('voltage')).selectOption('12');await page.locator(id('resistance')).selectOption('2000');await page.locator(id('power')).click();await page.locator(id('logic')).click();await expect(page.locator(id('current'))).toHaveText('6 mA');});
test('GTDO slide routes, back/forward and hardware switching do not bypass interlocks',async({page})=>{await open(page,'#rtds-presentation-15');await expect(page.locator(root)).toHaveAttribute('data-page','15');await page.locator(id('page16')).click();await expect(page.locator(root)).toHaveAttribute('data-page','16');await page.goBack();await expect(page.locator(root)).toHaveAttribute('data-page','15');await page.goForward();await expect(page.locator(root)).toHaveAttribute('data-page','16');await page.locator(id('example-correct')).click();await page.locator(id('power')).click();await page.evaluate(()=>{location.hash='#rtds-presentation-17';});await expect(page.locator(root)).toHaveAttribute('data-page','16');await expect(page.locator(id('notice'))).toContainText('断电');await page.locator('#mode-generic').click();await expect(page.locator(root)).toBeHidden();});
test('GTDO reduced motion and background stop circuit animation',async({page})=>{await open(page);await expect(page.locator(id('scene'))).toHaveAttribute('data-loaded','true');await page.locator(id('example-correct')).click();await page.locator(id('power')).click();await page.locator(id('logic')).click();await page.locator(id('animate')).click();await expect(page.locator(root)).toHaveAttribute('data-playing','true');await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator(root)).toHaveAttribute('data-playing','false');await expect(page.locator(id('animate'))).toBeDisabled();await page.locator(id('step')).click();await expect(page.locator(root)).toHaveAttribute('data-step','1');await page.emulateMedia({reducedMotion:'no-preference'});await page.locator(id('animate')).click();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator(root)).toHaveAttribute('data-playing','false');});
test('GTDO context loss safely stops and retry preserves circuit',async({page})=>{await open(page);await expect(page.locator(id('scene'))).toHaveAttribute('data-loaded','true');await page.locator(id('example-correct')).click();await page.locator(id('power')).click();await page.locator(id('logic')).click();await page.locator(id('animate')).click();await page.locator(id('scene')+' canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await expect(page.locator(id('scene'))).toHaveAttribute('data-loaded','error');await expect(page.locator(root)).toHaveAttribute('data-playing','false');await page.locator(id('retry')).click();await expect(page.locator(id('scene'))).toHaveAttribute('data-loaded','true');await expect(page.locator(id('current'))).toHaveText('24 mA');await expect(page.locator(id('scene')+' canvas')).toHaveCount(1);});
test('GTDO scoped styling and narrow layout keep controls legible',async({page})=>{await open(page);const b=page.locator(id('power'));await expect(b).toHaveCSS('border-radius','5px');await expect(b).toHaveCSS('min-height','36px');await page.setViewportSize({width:320,height:720});await expect(page.locator(id('scene'))).toHaveAttribute('data-loaded','true');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator(id('scene')).scrollIntoViewIfNeeded();await mkdir('screenshots',{recursive:true});await page.locator(root).screenshot({path:'screenshots/digital-output-narrow.png'});});
test('mobile playback brings the offscreen 3D circuit back before starting',async({page})=>{await page.setViewportSize({width:390,height:844});await open(page);await expect(page.locator(id('scene'))).toHaveAttribute('data-loaded','true');await page.locator(id('example-correct')).click();await page.locator(id('power')).click();await page.locator(id('logic')).click();await page.locator(id('animate')).evaluate(b=>b.scrollIntoView({block:'start'}));await expect(page.locator(id('scene'))).toHaveAttribute('data-active','false');await page.locator(id('animate')).click();await expect(page.locator(root)).toHaveAttribute('data-playing','true');await expect(page.locator(id('scene'))).toHaveAttribute('data-active','true');const box=await page.locator(id('scene')).boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(844);});

for(const width of [1280,390])test(`GTDO exact unconnected DP832 exterior ${width}`,async({page})=>{
 await page.setViewportSize({width,height:880});await open(page,'#rtds-presentation-16');
 const stage=page.locator(id('scene'));const eye=page.locator(id('view-dp832'));
 await expect(stage).toHaveAttribute('data-loaded','true');
 await expect(stage).toHaveAttribute('data-dp832','overview');
 await expect(page.locator(id('dp832-photo'))).toHaveAttribute('href',/Rigol_DP832/);
 await expect(page.locator(id('dp832-caption'))).toContainText('未接线');
 await stage.scrollIntoViewIfNeeded();
 await expect(page.locator(id('dp832-caption'))).toBeVisible();
 await page.locator(id('both-correct')).click();
 await expect(stage).toHaveAttribute('data-bank-count','2');
 await page.locator(id('power')).click();await page.locator(id('logic')).click();
 await expect(page.locator(id('current'))).toHaveText('12 mA');
 await stage.scrollIntoViewIfNeeded();
 await expect(stage).toHaveAttribute('data-rendered-wire-count','8');
 await expect(stage).toHaveAttribute('data-wire-count','4');await expect(stage).toHaveAttribute('data-bank2-wire-count','4');
 const state=await page.locator(id('bank-results')).textContent();
 const qa=process.env.GTDO_PHOTO_QA_DIR;
 if(qa){await mkdir(qa,{recursive:true});await stage.screenshot({path:`${qa}/dp832-overview-${width}.png`});}
 if(width===390){await page.locator(id('animate')).evaluate(b=>b.scrollIntoView({block:'start'}));await expect(stage).toHaveAttribute('data-active','false');}
 await page.locator(id('animate')).click();await expect(page.locator(root)).toHaveAttribute('data-playing','true');
 await eye.focus();await page.keyboard.press('Enter');
 await expect(stage).toHaveAttribute('data-dp832','closeup');
 await expect(stage).toHaveAccessibleName(/DP832.*未接线/);
 await stage.scrollIntoViewIfNeeded();await expect(stage).toHaveAttribute('data-rendered-wire-count','0');
 await expect(page.locator(root)).toHaveAttribute('data-playing','false');
 await expect(eye).toHaveAttribute('aria-pressed','true');await expect(page.locator(id('labels'))).toBeHidden();
 await expect(page.locator(id('animate'))).toBeDisabled();await expect(page.locator(id('replay'))).toBeDisabled();await expect(page.locator(id('step'))).toBeDisabled();
 await expect(stage).toHaveAttribute('data-wire-count','4');await expect(stage).toHaveAttribute('data-bank2-wire-count','4');await expect(page.locator(id('bank-results'))).toHaveText(state);
 if(qa)await stage.screenshot({path:`${qa}/dp832-front-${width}.png`});
 await page.locator(id('view-reset')).click();await expect(stage).toHaveAttribute('data-dp832','overview');await expect(eye).toHaveAttribute('aria-pressed','false');await expect(page.locator(id('labels'))).toBeVisible();
 await stage.scrollIntoViewIfNeeded();await expect(stage).toHaveAttribute('data-rendered-wire-count','8');
 await expect(page.locator(id('bank-results'))).toHaveText(state);await expect(page.locator(id('current'))).toHaveText('12 mA');
 if(width===1280){
  await eye.click();await expect(stage).toHaveAttribute('data-dp832','closeup');
  await stage.locator('canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await expect(stage).toHaveAttribute('data-loaded','error');await expect(eye).toBeDisabled();
  await page.locator(id('retry')).click();await expect(stage).toHaveAttribute('data-dp832','overview');
  await expect(stage.locator('canvas')).toHaveCount(1);await expect(page.locator(id('current'))).toHaveText('12 mA');
 }
 await page.locator(id('power')).click();await eye.click();await expect(stage).toHaveAttribute('data-dp832','closeup');
 await page.locator(id('page17')).click();await expect(stage).toHaveAttribute('data-page','17');await expect(stage).toHaveAttribute('data-dp832','overview');await expect(eye).toHaveAttribute('aria-pressed','false');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
