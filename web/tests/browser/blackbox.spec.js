import {test,expect} from '@playwright/test';import {mkdir} from 'node:fs/promises';
for(const width of [1200,390])test('course37 blackbox '+width,async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width,height:1000});await page.goto('./#rtds-presentation-37');const b=page.locator('.blackbox-bench'),s=b.locator('.blackbox-stage'),pick=k=>b.locator('[data-blackbox="'+k+'"]');
 await expect(b).toBeVisible();await expect(s).toHaveAttribute('data-loaded','true');await expect.poll(async()=>Number(await s.getAttribute('data-triangles'))).toBeGreaterThan(1000);await expect(s).toHaveAttribute('data-model-count','2');await expect(s).toHaveAttribute('data-anchor-scope','functional-groups-no-insertion');
 await b.locator('[data-blackbox-connect]').focus();await page.keyboard.press('Enter');await expect(b).toHaveAttribute('data-status','ready');await b.locator('[data-blackbox-step]').click();await expect(b.locator('.blackbox-direction')).toContainText('ARM控制命令');
 for(const [k,v,good]of [['socPort','front','rear'],['hostPort','aurora','gtio'],['medium','ethernet','fiber'],['artifact','library','firmware'],['firmware','sv','blackbox']]){await pick(k).selectOption(v);await expect(b).toHaveAttribute('data-status','blocked');await pick(k).selectOption(good);}
 for(const k of ['mapping','feedback']){await pick(k).uncheck();await expect(b).toHaveAttribute('data-status','blocked');await pick(k).check();}
 await pick('exposed').uncheck();await expect(pick('gain')).toBeDisabled();await expect(b.locator('.blackbox-access')).toContainText('源码仍不可查看');await pick('exposed').check();await pick('gain').selectOption('2');await expect(b.locator('.blackbox-access')).toContainText('快速');
 await b.locator('.blackbox-budget-panel summary').click();await pick('work').fill('9');await pick('work').blur();await expect(b).toHaveAttribute('data-status','overbudget');await expect(b.locator('[data-blackbox-play]')).toBeDisabled();await pick('work').fill('2');await pick('work').blur();await expect(b).toHaveAttribute('data-status','ready');
 await b.locator('.blackbox-budget-panel summary').click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await mkdir('screenshots',{recursive:true});await s.screenshot({path:'screenshots/blackbox-p37-'+width+'.png'});await b.screenshot({path:'screenshots/blackbox-p37-full-'+width+'.png'});
 await b.locator('[data-blackbox-play]').click();await expect(b).toHaveAttribute('data-playing','true');await page.evaluate(()=>location.hash='#rtds-presentation-36');await expect(b).toBeHidden();await expect(page.locator('.gtsoc-bench')).toBeVisible();await expect(b).toHaveAttribute('data-playing','false');await page.waitForTimeout(100);const stopped=await s.getAttribute('data-frames');await page.waitForTimeout(100);await expect(s).toHaveAttribute('data-frames',stopped);await page.goBack();await expect(b).toBeVisible();await page.goForward();await expect(b).toBeHidden();await page.goBack();await expect(b).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await expect(b.locator('[data-blackbox-play]')).toBeDisabled();await b.locator('[data-blackbox-step]').click();await s.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(s).toHaveAttribute('data-loaded','false');await b.locator('[data-blackbox-retry]').click();await expect(s).toHaveAttribute('data-loaded','true');await expect(s.locator('canvas')).toHaveCount(1);
});

test('course37 rear inspection fits a single chassis without changing the connection or phase',async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:1200,height:1000});await page.goto('./#rtds-presentation-37');
 const b=page.locator('.blackbox-bench'),s=b.locator('.blackbox-stage');
 const view=name=>b.locator('[data-blackbox-view="'+name+'"]');
 await expect(s).toHaveAttribute('data-loaded','true');
 await b.locator('[data-blackbox-connect]').click();
 await b.locator('[data-blackbox-step]').click();
 await expect(b.locator('.blackbox-direction')).toContainText('ARM控制命令');
 await expect(s).toHaveAttribute('data-links',/"reverse":true/);
 const links=await s.getAttribute('data-links');
 expect(JSON.parse(links)).toHaveLength(1);
 async function fitted(name){
  await expect(view(name)).toHaveAttribute('aria-pressed','true');
  await expect(s).toHaveAttribute('data-rendered-view',name);
  await expect(s).toHaveAttribute('data-visible-model-count','1');
  await expect(s).toHaveAttribute('data-overlays-visible','false');
  await expect.poll(async()=>{
   const raw=await s.getAttribute('data-inspection-bounds');
   if(!raw)return false;
   const {left,right,top,bottom}=JSON.parse(raw);
   return left>.02&&right<.98&&top>.02&&bottom<.98&&right-left>.48;
  }).toBe(true);
  await expect(s).toHaveAttribute('data-links',links);
 }
 await expect(view('gtsoc')).toBeEnabled();await view('gtsoc').focus();await page.keyboard.press('Enter');await fitted('gtsoc');
 await expect(b.locator('.blackbox-view-note')).toContainText('不指定插孔');
 await expect(b.locator('.blackbox-view-note a')).toHaveAttribute('href','https://knowledge.rtds.com/hc/en-us/article_attachments/19752419198231');
 await s.screenshot({path:'screenshots/p37-gtsoc-rear-1200.png'});
 async function resize(width){
  const frame=await s.getAttribute('data-frames');
  await page.setViewportSize({width,height:1000});
  await expect(s).not.toHaveAttribute('data-frames',frame);
  await expect.poll(()=>s.evaluate(el=>el.querySelector('canvas').style.width===el.clientWidth+'px'&&el.querySelector('canvas').style.height===el.clientHeight+'px')).toBe(true);
 }
 await resize(390);await fitted('gtsoc');
 await s.screenshot({path:'screenshots/p37-gtsoc-rear-390.png'});
 await view('novacor').click();await fitted('novacor');
 await expect(b.locator('.blackbox-view-note a')).toHaveAttribute('href','https://knowledge.rtds.com/hc/en-us/article_attachments/16079537928727#page=2');
 await s.screenshot({path:'screenshots/p37-novacor-rear-390.png'});
 await resize(1200);await fitted('novacor');
 await s.screenshot({path:'screenshots/p37-novacor-rear-1200.png'});
 await s.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
 await expect(view('novacor')).toBeDisabled();
 await b.locator('[data-blackbox-retry]').click();
 await expect(s).toHaveAttribute('data-loaded','true');await fitted('novacor');
 await view('overview').click();
 await expect(s).toHaveAttribute('data-overlays-visible','true');
 await expect(s).toHaveAttribute('data-visible-model-count','2');
 await expect(s).toHaveAttribute('data-links',links);
 await expect(b.locator('.blackbox-direction')).toContainText('ARM控制命令');
 await expect(b).toHaveAttribute('data-playing','false');
});
