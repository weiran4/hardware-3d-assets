import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const failures=[];
test.beforeEach(async({page})=>{failures.length=0;page.on('pageerror',e=>failures.push(e.message));});
async function rtdsLoaded(page){await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','novacor-2.0-2023');await expect(page.locator('#rtds-loading')).toBeHidden();}
async function screenshot(page,name){await mkdir('screenshots',{recursive:true});await page.screenshot({path:`screenshots/rtds-${name}.png`,fullPage:true});}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}

test('RTDS real NovaCor: sparse labels, rear-port camera, isolation, bookmarks and demand rendering',async({page})=>{
 await rtdsLoaded(page);await expect(page.locator('#rtds-catalog button')).toHaveCount(18);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-anchors','51');await expect(page.locator('#rtds-label')).toBeHidden();await noOverflow(page);await screenshot(page,'novacor-overview');
 for(const view of ['front','rear','top']){await page.locator('#rtds-'+view).click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-view',view);await screenshot(page,'novacor-'+view);}
 await page.locator('[data-group="gtio"]').click();await expect(page.locator('#rtds-port-list button')).toHaveCount(20);await page.locator('[data-rtds-port="novacor-2.0-2023.gt3"]').click();await expect(page.locator('#rtds-port-facts')).toContainText('novacor-2.0-2023.gt3');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-direction','0.00,0.00,-1.00');await expect(page.locator('#rtds-label')).toHaveText('GT3');await screenshot(page,'novacor-gt3');await page.locator('#rtds-front').click();await expect(page.locator('#rtds-label')).toBeHidden();await page.locator('[data-rtds-port="novacor-2.0-2023.gt3"]').click();
 await page.locator('#rtds-isolate').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-isolated','true');await page.locator('#rtds-reset').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-isolated','false');await expect(page.locator('#rtds-label')).toBeHidden();
 await page.waitForTimeout(150);const frames=await page.locator('#rtds-scene').getAttribute('data-frames');await page.waitForTimeout(350);expect(await page.locator('#rtds-scene').getAttribute('data-frames')).toBe(frames);expect(Number(await page.locator('#rtds-scene').getAttribute('data-pixel-ratio'))).toBeLessThanOrEqual(1.5);expect(failures).toEqual([]);
});

test('tour pauses scheduling and switching modes preserves the original generic lesson',async({page})=>{
 await page.goto('./');await expect(page.locator('#scene')).toHaveAttribute('data-loaded','true');await page.locator('#port-out').click();await page.locator('#port-ch1').click();await page.locator('#mode-rtds').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await page.clock.install();await page.locator('#rtds-tour').click();await expect(page.locator('#rtds-tour')).toHaveAttribute('aria-pressed','true');await page.clock.fastForward(6600);await expect(page.locator('[data-group="ground"]')).toHaveAttribute('aria-pressed','true');await page.locator('#rtds-tour').click();const group=await page.locator('#rtds-group-list [aria-pressed=true]').getAttribute('data-group');await page.clock.fastForward(20000);expect(await page.locator('#rtds-group-list [aria-pressed=true]').getAttribute('data-group')).toBe(group);
 await page.locator('#mode-generic').click();await expect(page.locator('#scene')).toHaveAttribute('data-connection','out-ch1');await page.locator('#send-pulse').click();await expect(page.locator('#trace-status')).toHaveText('脉冲 × 1');await page.locator('#mode-rtds').click();await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);await expect(page.locator('#rtds-tour')).toHaveAttribute('aria-pressed','false');expect(failures).toEqual([]);
});

test('GTDI distinguishes 80 terminal positions and excludes four unresolved service anchors',async({page})=>{
 await rtdsLoaded(page);await page.locator('[data-variant="gtdi-v2"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','gtdi-v2-2.01');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-anchors','24');await expect(page.locator('#rtds-summary')).toContainText('80');await screenshot(page,'gtdi-overview');await page.locator('#rtds-top').click();await screenshot(page,'gtdi-top-upright');
 await page.locator('[data-group="digital_input"]').click();await expect(page.locator('#rtds-port-list button')).toHaveCount(16);await page.locator('[data-rtds-port="gtdi-v2-2.01.bank1_odd"]').click();await expect(page.locator('#rtds-port-facts')).toContainText('1 · 3 · 5 · 7 · V+(WET)');await screenshot(page,'gtdi-terminal-detail');
 await page.locator('[data-group="service_unresolved"]').click();await expect(page.locator('#rtds-port-list button')).toHaveCount(0);await expect(page.locator('#rtds-port-list [data-unresolved]')).toHaveCount(4);await expect(page.locator('#rtds-isolate')).toBeDisabled();await expect(page.locator('#rtds-detail-copy')).toContainText('暂不提供接口选择');expect(failures).toEqual([]);
});

test('reference-only variants show useful facts, no stale model and no dead enabled 3D controls',async({page})=>{
 await rtdsLoaded(page);await page.locator('[data-variant="novacor-light"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);await expect(page.locator('#rtds-reference-placeholder')).toBeVisible();await expect(page.locator('#rtds-summary')).toContainText('D-sub');await expect(page.locator('#rtds-front')).toBeDisabled();await expect(page.locator('#rtds-tour')).toBeDisabled();await expect(page.locator('#rtds-source-list')).toContainText('私有参考');await screenshot(page,'reference-only');
 await page.locator('#rtds-filter').selectOption('modeled');await expect(page.locator('#rtds-catalog button')).toHaveCount(2);await page.locator('[data-variant="novacor-2.0"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);expect(failures).toEqual([]);
});

test('320px and touch mobile keep inspection controls and one selected label within viewport',async({page})=>{
 for(const width of [320,390,768]){await page.setViewportSize({width,height:900});await rtdsLoaded(page);await noOverflow(page);await page.locator('[data-group="gtio"]').click();await page.locator('[data-rtds-port="novacor-2.0-2023.gt1"]').click();await expect(page.locator('#rtds-label')).toBeVisible();await noOverflow(page);const box=await page.locator('#rtds-label').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);await screenshot(page,`mobile-${width}`);}expect(failures).toEqual([]);
});

test('model failure leaves metadata inspectable and a version switch safely recovers',async({page})=>{
 await page.route('**/assets/rtds/novacor-2.0-2023.glb',route=>route.abort());await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','error');await expect(page.locator('#rtds-loading')).toContainText('可继续查看');await expect(page.locator('#rtds-front')).toBeDisabled();await page.locator('[data-group="gtio"]').click();await page.locator('[data-rtds-port="novacor-2.0-2023.gt1"]').click();await expect(page.locator('#rtds-port-facts')).toContainText('novacor-2.0-2023.gt1');await page.locator('[data-variant="gtdi-v2"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);expect(failures).toEqual([]);
});

test('late model completion cannot overwrite a newer selected version or leave duplicate canvases',async({page})=>{
 let held;const hold=new Promise(resolve=>{held=resolve;});let requested;const seen=new Promise(resolve=>{requested=resolve;});await page.route('**/assets/rtds/novacor-2.0-2023.glb',async route=>{requested();await hold;await route.continue();});await page.goto('./#rtds');await seen;await page.locator('[data-variant="gtdi-v2"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','gtdi-v2-2.01');held();await page.waitForLoadState('networkidle');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','gtdi-v2-2.01');await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);await expect(page.locator('.rtds-highlight')).toHaveCount(1);await expect(page.locator('.rtds-highlight')).toBeHidden();expect(failures).toEqual([]);
});

test('RTDS skip and keyboard selection preserve mode and focus; top view remains orbitable',async({page})=>{
 await rtdsLoaded(page);await page.locator('.skip').focus();await page.locator('.skip').press('Enter');await expect(page.locator('#rtds-panel')).toBeVisible();await expect(page.locator('#generic-panel')).toBeHidden();
 const variant=page.locator('[data-variant="gtdi-v2"]');await variant.focus();await variant.press('Enter');await expect(page.locator('[data-variant="gtdi-v2"]')).toBeFocused();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await page.locator('[data-group="digital_input"]').press('Enter');const port=page.locator('[data-rtds-port="gtdi-v2-2.01.bank1_odd"]');await port.focus();await port.press('Enter');await expect(page.locator('[data-rtds-port="gtdi-v2-2.01.bank1_odd"]')).toBeFocused();await page.keyboard.press('Tab');await expect(page.locator('[data-rtds-port="gtdi-v2-2.01.bank1_even"]')).toBeFocused();
 await page.locator('#rtds-top').click();const canvas=page.locator('#rtds-scene canvas'),before=await canvas.screenshot(),box=await canvas.boundingBox();await page.mouse.move(box.x+box.width*.4,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.65,box.y+box.height*.5,{steps:10});await page.mouse.up();expect(Buffer.compare(before,await canvas.screenshot())).not.toBe(0);expect(failures).toEqual([]);
});

async function highlightRect(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));return page.locator('.rtds-highlight rect').evaluate(n=>Object.fromEntries(['x','y','width','height'].map(k=>[k,Number(n.getAttribute(k))])));}

test('Aurora uses one conspicuous grouped rectangle; an individual port narrows the outline and tracks orbit/zoom',async({page})=>{
 await rtdsLoaded(page);const overlay=page.locator('.rtds-highlight');await expect(overlay).toBeHidden();
 await page.locator('[data-group="aurora"]').click();await expect(overlay).toBeVisible();await expect(overlay.locator('rect')).toHaveCount(1);await expect(overlay).toHaveAttribute('data-kind','group');
 await expect(overlay).toHaveAttribute('data-ids',[21,22,23,24].map(n=>`novacor-2.0-2023.gt${n}`).join(','));await expect(page.locator('#rtds-label')).toHaveText('GT 21–24 · Aurora');
 expect(await overlay.locator('rect').evaluate(n=>parseFloat(getComputedStyle(n).strokeWidth))).toBeGreaterThanOrEqual(2);await screenshot(page,'aurora-group-highlight');
 const before=await highlightRect(page);await page.locator('#rtds-in').click();await expect.poll(async()=> (await highlightRect(page)).width).toBeGreaterThan(before.width);
 const canvas=page.locator('#rtds-scene canvas'),box=await canvas.boundingBox(),zoomed=await highlightRect(page);await page.mouse.move(box.x+box.width*.45,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.52,box.y+box.height*.5,{steps:8});await page.mouse.up();await expect(overlay).toBeVisible();await expect.poll(()=>highlightRect(page)).not.toEqual(zoomed);await screenshot(page,'aurora-orbit-highlight');
 // Compare group and single geometry at the same rear bookmark, not at different auto-focus zoom levels.
 await page.locator('#rtds-rear').click();const group=await highlightRect(page);
 await page.locator('[data-rtds-port="novacor-2.0-2023.gt21"]').click();await expect(overlay).toHaveAttribute('data-kind','port');await expect(overlay).toHaveAttribute('data-ids','novacor-2.0-2023.gt21');await expect(page.locator('#rtds-label')).toHaveText('GT21');await screenshot(page,'aurora-single-gt21-highlight');
 await page.locator('#rtds-rear').click();const single=await highlightRect(page);expect(single.width).toBeLessThan(group.width);expect(single.height).toBeLessThan(group.height);
 await page.locator('#rtds-front').click();await expect(overlay).toBeHidden();await expect(page.locator('#rtds-label')).toBeHidden();expect(failures).toEqual([]);
});

test('highlight is cleared on reset, new model, unresolved group and reference-only transitions',async({page})=>{
 await rtdsLoaded(page);await page.locator('[data-group="aurora"]').click();await expect(page.locator('.rtds-highlight')).toBeVisible();await page.locator('#rtds-reset').click();await expect(page.locator('.rtds-highlight')).toBeHidden();await expect(page.locator('.rtds-highlight')).not.toHaveAttribute('data-ids',/.+/);await expect(page.locator('#rtds-label')).toBeHidden();
 await page.locator('[data-group="aurora"]').click();await page.locator('[data-variant="gtdi-v2"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','gtdi-v2-2.01');await expect(page.locator('.rtds-highlight')).toHaveCount(1);await expect(page.locator('.rtds-highlight')).toBeHidden();await expect(page.locator('#rtds-label')).toBeHidden();
 await page.locator('[data-group="optical"]').click();await expect(page.locator('.rtds-highlight')).toBeVisible();await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids','gtdi-v2-2.01.gt1,gtdi-v2-2.01.gt2');
 await page.locator('[data-group="service_unresolved"]').click();await expect(page.locator('.rtds-highlight')).toBeHidden();await expect(page.locator('#rtds-label')).toBeHidden();
 await page.locator('[data-variant="novacor-light"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(page.locator('.rtds-highlight')).toHaveCount(0);await expect(page.locator('#rtds-label')).toBeHidden();
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await expect(page.locator('.rtds-highlight')).toHaveCount(1);await expect(page.locator('.rtds-highlight')).toBeHidden();expect(failures).toEqual([]);
});

test('Aurora group and single highlights remain legible and inside the viewer across mobile breakpoints',async({page})=>{
 await rtdsLoaded(page);await page.locator('[data-group="aurora"]').focus();await page.keyboard.press('Enter');
 for(const width of [320,390,560,768,800]){
  await page.setViewportSize({width,height:900});const overlay=page.locator('.rtds-highlight');await expect(overlay).toBeVisible();await expect(page.locator('#rtds-label')).toHaveText('GT 21–24 · Aurora');await noOverflow(page);
  const rect=await highlightRect(page),viewer=await page.locator('#rtds-scene').boundingBox(),label=await page.locator('#rtds-label').boundingBox();expect(rect.x).toBeGreaterThanOrEqual(0);expect(rect.x+rect.width).toBeLessThanOrEqual(viewer.width);expect(rect.y+rect.height).toBeLessThanOrEqual(viewer.height);expect(label.x).toBeGreaterThanOrEqual(viewer.x);expect(label.x+label.width).toBeLessThanOrEqual(viewer.x+viewer.width);await screenshot(page,`aurora-group-mobile-${width}`);
  await page.locator('[data-rtds-port="novacor-2.0-2023.gt24"]').focus();await page.keyboard.press('Enter');await expect(overlay).toHaveAttribute('data-ids','novacor-2.0-2023.gt24');await expect(page.locator('#rtds-label')).toHaveText('GT24');await noOverflow(page);await screenshot(page,`aurora-single-mobile-${width}`);
  await page.locator('[data-group="aurora"]').click();
 }
 expect(failures).toEqual([]);
});
