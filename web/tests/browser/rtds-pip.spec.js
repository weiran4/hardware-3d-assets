import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

let pageErrors=[];
test.beforeEach(async({page})=>{pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));});
test.afterEach(()=>{expect(pageErrors).toEqual([]);});

async function loaded(page){
 await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await page.evaluate(()=>{window.__pipOriginalCanvas=document.querySelector('#rtds-scene canvas');window.__pipOriginalWrap=document.querySelector('.rtds-viewer-wrap');});
}
async function dock(page){
 const targetY=await page.evaluate(()=>{const slot=document.querySelector('.rtds-pip-slot');scrollTo(0,scrollY+slot.getBoundingClientRect().bottom+24);return scrollY;});
 await expect(page.locator('.rtds-pip')).toBeVisible();await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','expanded');
 expect(Math.abs(await page.evaluate(()=>scrollY)-targetY)).toBeLessThan(1);
}
async function sourceVisible(page){
 await page.locator('.rtds-pip-slot').evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
 await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);
}
async function sameCanvas(page){
 await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);
 expect(await page.evaluate(()=>document.querySelector('#rtds-scene canvas')===window.__pipOriginalCanvas&&document.querySelector('.rtds-viewer-wrap')===window.__pipOriginalWrap)).toBe(true);
 expect(await page.locator('[id]').evaluateAll(nodes=>{const ids=nodes.map(node=>node.id);return ids.length===new Set(ids).size;})).toBe(true);
}
async function rect(page){
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 return page.locator('.rtds-highlight-main').evaluate(node=>Object.fromEntries(['x','y','width','height'].map(key=>[key,Number(node.getAttribute(key))])));
}
async function insideFrame(page){
 const bounds=await rect(page);await expect(page.locator('#rtds-label')).toBeVisible();
 const scene=await page.locator('#rtds-scene').boundingBox(),label=await page.locator('#rtds-label').boundingBox();
 expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.y).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(scene.width+.1);expect(bounds.y+bounds.height).toBeLessThanOrEqual(scene.height+.1);
 expect(label.x).toBeGreaterThanOrEqual(scene.x-.1);expect(label.y).toBeGreaterThanOrEqual(scene.y-.1);expect(label.x+label.width).toBeLessThanOrEqual(scene.x+scene.width+.1);expect(label.y+label.height).toBeLessThanOrEqual(scene.y+scene.height+.1);
}
async function shot(page,name){await mkdir('screenshots',{recursive:true});await page.screenshot({path:`screenshots/rtds-pip-${name}.png`,fullPage:false});}
async function selectAurora(page){await page.locator('[data-group=aurora]').click();await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');}
const action=(page,name)=>page.locator(`[data-pip-action="${name}"]`);

test('desktop scroll docks one real canvas, preserves orbit/zoom and restores its original footprint',async({page})=>{
 await loaded(page);await selectAurora(page);await sourceVisible(page);await page.locator('#rtds-in').click();
 const canvas=page.locator('#rtds-scene canvas'),box=await canvas.boundingBox();
 await page.mouse.move(box.x+box.width*.45,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.48,box.y+box.height*.52,{steps:8});await page.mouse.up();
 await expect(page.locator('.rtds-highlight')).toBeVisible();const before=await rect(page),height=await page.locator('.rtds-pip-slot').evaluate(node=>node.getBoundingClientRect().height),instance=await page.locator('#rtds-scene').getAttribute('data-instance');
 await dock(page);await sameCanvas(page);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-instance',instance);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-view','in');
 await expect(page.locator('.rtds-pip .rtds-viewer-wrap')).toHaveCount(1);await expect(page.locator('body')).toHaveClass(/rtds-pip-active/);
 expect(await page.locator('.rtds-pip-slot').evaluate(node=>node.getBoundingClientRect().height)).toBe(height);
 const panel=await page.locator('.rtds-pip').boundingBox();expect(panel.width).toBe(320);expect(panel.x+panel.width).toBe(page.viewportSize().width-18);expect(panel.y+panel.height).toBe(page.viewportSize().height-18);
 await expect(page.locator('.rtds-highlight')).toBeVisible();await insideFrame(page);await shot(page,'desktop-orbit-preserved');
 await action(page,'return').click();await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot')).toBeFocused();await sameCanvas(page);
 const restored=await rect(page);for(const key of Object.keys(before))expect(Math.abs(restored[key]-before[key])).toBeLessThan(.5);
 await expect(page.locator('body')).not.toHaveClass(/rtds-pip-active/);
 await shot(page,'restored-inline-after-return');
});

test('03 paragraph and DI/DO bank rows keep their reading position through dock, minimize, expand and close',async({page})=>{
 await loaded(page);
 for(const {variant,group,selector}of [
  {variant:'novacor-2.0',group:'aurora',selector:'#rtds-detail-copy'},
  {variant:'gtdi-v2',group:'digital_input',selector:'.rtds-bank-map tbody tr:nth-child(3)'},
  {variant:'gtdo-v2',group:'digital_output',selector:'.rtds-bank-map tbody tr:nth-child(3)'}
 ]){
  await page.locator(`[data-variant="${variant}"]`).click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await page.locator(`[data-group="${group}"]`).click();await sourceVisible(page);
  const before=await page.locator(selector).evaluate(node=>{const target=scrollY+node.getBoundingClientRect().top-innerHeight*.35,sourceEnd=scrollY+document.querySelector('.rtds-pip-slot').getBoundingClientRect().bottom+24;scrollTo(0,Math.max(target,sourceEnd));const r=node.getBoundingClientRect();return {scrollY,top:r.top,width:r.width,height:r.height};});
  expect(before.top).toBeGreaterThanOrEqual(0);expect(before.top).toBeLessThan(page.viewportSize().height);
  async function unchanged(){
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const after=await page.locator(selector).evaluate(node=>{const r=node.getBoundingClientRect();return {scrollY,top:r.top,width:r.width,height:r.height};});
   for(const key of Object.keys(before))expect(Math.abs(after[key]-before[key]),`${variant} reading ${key}`).toBeLessThan(1);
   await expect(page.locator('body')).toHaveClass(/rtds-pip-capable/);
  }
  await expect(page.locator('.rtds-pip')).toBeVisible();await unchanged();
  await action(page,'minimize').click();await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','minimized');await unchanged();
  await action(page,'minimize').click();await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','expanded');await unchanged();
  await action(page,'close').click();await expect(page.locator('.rtds-pip')).toBeHidden();await unchanged();await shot(page,`${variant}-reading-anchor-after-close`);
 }
});

test('dock tracks shared-group and physical-port selection, orbit and keyboard camera controls without covering reading',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);
 const overlay=page.locator('.rtds-highlight');await expect(overlay).toHaveAttribute('data-ids',[21,22,23,24].map(n=>`novacor-2.0-2023.gt${n}`).join(','));await expect(page.locator('#rtds-label')).toHaveText('GT 21–24 · Aurora');
 const old=await rect(page);await action(page,'in').focus();await page.keyboard.press('Enter');await expect.poll(async()=>(await rect(page)).width).toBeGreaterThan(old.width);
 const canvas=page.locator('#rtds-scene canvas'),box=await canvas.boundingBox(),zoomed=await rect(page);
 await page.mouse.move(box.x+box.width*.42,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.48,box.y+box.height*.5,{steps:8});await page.mouse.up();await expect.poll(()=>rect(page)).not.toEqual(zoomed);
 await page.locator('.rtds-model-notes summary').click();await page.locator('#rtds-physical-port').selectOption('novacor-2.0-2023.gt23');await dock(page);
 await expect(overlay).toHaveAttribute('data-kind','port');await expect(overlay).toHaveAttribute('data-ids','novacor-2.0-2023.gt23');await expect(page.locator('#rtds-label')).toHaveText('GT23');await insideFrame(page);
 const panel=await page.locator('.rtds-pip').boundingBox();
 for(const selector of ['#rtds-detail-copy','.rtds-functional-facts','#rtds-physical-port']){const text=await page.locator(selector).boundingBox();expect(text.x+text.width).toBeLessThan(panel.x);}
 expect(await overlay.locator('.rtds-highlight-main').evaluate(node=>getComputedStyle(node).stroke)).toBe('rgb(255, 106, 0)');expect(await overlay.evaluate(node=>getComputedStyle(node).pointerEvents)).toBe('none');
 for(const view of ['front','rear','top','out']){await action(page,view).focus();await page.keyboard.press('Enter');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-view',view);}
 await action(page,'rear').click();await insideFrame(page);await sameCanvas(page);await shot(page,'physical-port-and-reading');
});

test('keyboard minimize, expand, Escape, close and return have predictable dismissal and focus lifecycles',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);
 await action(page,'minimize').focus();await page.keyboard.press('Enter');await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','minimized');await expect(page.locator('.rtds-pip-stage')).toBeHidden();await expect(action(page,'minimize')).toHaveAttribute('aria-expanded','false');await expect(action(page,'minimize')).toBeFocused();await sameCanvas(page);await shot(page,'minimized');
 await page.keyboard.press('Enter');await expect(page.locator('.rtds-pip-stage')).toBeVisible();await expect(action(page,'minimize')).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Escape');await expect(page.locator('.rtds-pip')).toBeHidden();await page.evaluate(()=>scrollBy(0,40));await expect(page.locator('.rtds-pip')).toBeHidden();await sameCanvas(page);
 await sourceVisible(page);await dock(page);await action(page,'close').focus();await page.keyboard.press('Enter');await expect(page.locator('.rtds-pip')).toBeHidden();await page.evaluate(()=>scrollBy(0,30));await expect(page.locator('.rtds-pip')).toBeHidden();
 await sourceVisible(page);await dock(page);await action(page,'return').focus();await page.keyboard.press('Enter');await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot')).toBeFocused();await expect(page.locator('#rtds-label')).toHaveText('GT 21–24 · Aurora');await sameCanvas(page);
});

test('mode, reference-only, failed model and recovery transitions never leave an old model floating',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);
 await page.evaluate(()=>{location.hash='#generic';});await expect(page.locator('#generic-panel')).toBeVisible();await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);await expect(page.locator('body')).not.toHaveClass(/rtds-pip-active/);
 await page.evaluate(()=>{location.hash='#rtds';});await expect(page.locator('#rtds-panel')).toBeVisible();await dock(page);
 // DOM activation deliberately keeps the reading scroll position unchanged so
 // these checks exercise lifecycle restoration, not auto-restoration on scroll-up.
 await page.locator('[data-variant="novacor-light"]').evaluate(node=>node.click());await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);
 await page.route('**/assets/rtds/gtdi-v2-2.01.glb',route=>route.abort());await page.locator('[data-variant="gtdi-v2"]').evaluate(node=>node.click());await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','error');await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);await expect(page.locator('body')).not.toHaveClass(/rtds-pip-active/);
 await page.locator('[data-variant="novacor-2.0"]').evaluate(node=>node.click());await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await dock(page);await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);await expect(page.locator('.rtds-highlight')).toBeHidden();await shot(page,'recovered-model');
});

test('pending or superseded model loads hide the dock until the current renderer is ready',async({page})=>{
 await loaded(page);await dock(page);let release,requested;const held=new Promise(resolve=>{release=resolve;}),seen=new Promise(resolve=>{requested=resolve;});
 await page.route('**/assets/rtds/gtdi-v2-2.01.glb',async route=>{requested();await held;await route.continue();});
 await page.locator('[data-variant="gtdi-v2"]').evaluate(node=>node.click());await seen;await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);
 await page.locator('[data-variant="novacor-light"]').evaluate(node=>node.click());release();await page.waitForLoadState('networkidle');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);
});

test('mobile widths never dock; desktop/mobile resize restores minimized viewers without overflow or duplicate canvases',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);await action(page,'minimize').click();
 for(const width of [1023,768,390,320]){
  await page.setViewportSize({width,height:900});await page.evaluate(()=>{const slot=document.querySelector('.rtds-pip-slot');scrollTo(0,scrollY+slot.getBoundingClientRect().bottom+24);});
  await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);await expect(page.locator('body')).not.toHaveClass(/rtds-pip-active/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await sameCanvas(page);await shot(page,`mobile-inline-${width}`);
 }
 for(const width of [1024,1440]){
  await page.setViewportSize({width,height:900});await dock(page);await expect(page.locator('.rtds-pip-stage')).toBeVisible();await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');await insideFrame(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await sameCanvas(page);await shot(page,`desktop-${width}`);
 }
});
