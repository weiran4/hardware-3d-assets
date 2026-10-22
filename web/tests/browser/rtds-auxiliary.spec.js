import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {meshProjection} from './rtds-mesh-test-helpers.js';
import {selectPhysical,canvasCapture,imageDifference,renderedBounds,renderedFrame} from './rtds-test-helpers.js';
test.setTimeout(120000);
const cards=[
 {variant:'gtfpi-v2',asset:'gtfpi-v2-2.01-capped',anchors:9,group:'ribbon_header',port:'lv',direction:'0.00,1.00,0.00',revision:'2.01'},
 {variant:'gtsoc-v2',asset:'gtsoc-v2-2a-copper16',anchors:25,group:'front_sfp',port:'front16',direction:'0.00,0.00,1.00',revision:'GTSOC-2A'}
];
let errors=[];
test.beforeEach(async({page})=>{errors=[];page.on('pageerror',e=>errors.push(e.message));});
test.afterEach(()=>expect(errors).toEqual([]));
async function selectVariant(page,c){await page.locator(`[data-variant="${c.variant}"]`).click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset',c.asset);}
async function start(page,c){await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await selectVariant(page,c);}
async function shot(page,name){await mkdir('screenshots',{recursive:true});await page.screenshot({path:`screenshots/rtds-auxiliary-${name}.png`,fullPage:false});}
async function inline(page){await page.locator('.rtds-pip-slot').evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));await expect(page.locator('.rtds-pip')).toBeHidden();}
async function dock(page){await page.evaluate(()=>{const slot=document.querySelector('.rtds-pip-slot');scrollTo(0,scrollY+slot.getBoundingClientRect().bottom+24);});await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','expanded');await expect(page.locator('.rtds-pip')).toBeVisible();}
async function settled(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function group(page,id){await page.locator(`[data-group="${id}"]`).click();await expect(page.locator(`[data-group="${id}"]`)).toHaveAttribute('aria-pressed','true');}

async function visibleMeshPoint(c,width,height){return (await meshProjection(c,width,height)).point;}

test('real canvas hits select GTFPI LV and GTSOC front16 from their union groups and open exact 03 facts',async({page})=>{
 for(const c of cards){
  await start(page,c);await group(page,c.group);await inline(page);await settled(page);
  const overlay=page.locator('#rtds-scene'),target=`${c.asset}.${c.port}`;await expect(overlay).toHaveAttribute('data-highlight-kind','group');await expect(page.locator('#rtds-scene')).not.toHaveAttribute('data-selection',target);await expect(page.locator('#rtds-physical-port')).toHaveValue('');
  if(c.variant==='gtfpi-v2')await expect(page.locator('#rtds-detail-copy')).toContainText('外接 HV');
  const box=await page.locator('#rtds-scene canvas').boundingBox(),point=await visibleMeshPoint(c,box.width,box.height),x=box.x+point.x,y=box.y+point.y;
  expect(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)===document.querySelector('#rtds-scene canvas'),{x,y}),'ordinary pointer must reach the canvas, not an overlay').toBe(true);
  await page.mouse.click(x,y);
  await expect(page.locator('#rtds-scene')).toHaveAttribute('data-selection',target);await expect(overlay).toHaveAttribute('data-highlight-kind','port');await expect(overlay).toHaveAttribute('data-highlight-ids',target);await expect(page.locator('#rtds-inspection-summary')).toBeVisible();await expect(page.locator('#rtds-physical-port')).toHaveValue(target);await expect(page.locator('#rtds-inspection-summary')).toBeVisible();
  await expect(page.locator('#rtds-detail-copy')).toContainText(c.variant==='gtfpi-v2'?'LV 数字输入 / 输出面板':'SV 通信配置');await expect(page.locator('.rtds-functional-facts')).toContainText(c.variant==='gtfpi-v2'?'34 个可见针脚':'16 个铜 SFP 插口');await shot(page,`${c.variant}-real-mesh-pick`);
 }
});

test('GTFPI capped PCB2.01: automatic HV/LV facts, grouped unknown power, distinct GT directions and unresolved service',async({page})=>{
 const c=cards[0];await start(page,c);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-anchors','9');await expect(page.locator('#rtds-model-revision')).toContainText('2.01');await expect(page.locator('#rtds-model-revision')).toContainText('防尘盖');await expect(page.locator('#rtds-scope-note')).toContainText('电源空间针序');
 await page.locator('#rtds-top').click();await inline(page);await shot(page,'gtfpi-top');
 await group(page,'ribbon_header');await expect(page.locator('#rtds-port-list button')).toHaveCount(2);await expect(page.locator('#rtds-detail-copy')).toContainText('外接 HV');await expect(page.locator('#rtds-port-facts')).toContainText('50');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',`${c.asset}.hv,${c.asset}.lv`);
 await page.locator('[data-rtds-subtype="lv"]').click();await expect(page.locator('#rtds-port-facts')).toContainText('16 路数字输入及 16 路数字输出');await expect(page.locator('#rtds-port-facts')).toContainText('1 在外侧、2 在内侧');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',`${c.asset}.lv`);await page.locator('#rtds-detail-copy').scrollIntoViewIfNeeded();await shot(page,'gtfpi-lv-facts');
 await group(page,'power');await expect(page.locator('#rtds-port-list button')).toHaveCount(0);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',`${c.asset}.power1,${c.asset}.power2`);await expect(page.locator('.rtds-functional-note')).toContainText('空间引脚顺序尚未确认');await expect(page.locator('.rtds-functional-facts')).toContainText('最大功耗 5 W');
 await selectPhysical(page,`${c.asset}.power2`);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',`${c.asset}.power2`);await expect(page.locator('.rtds-functional-note')).toContainText('空间引脚顺序尚未确认');
 await group(page,'aux_power');await expect(page.locator('.rtds-functional-facts')).toContainText('开放式 2 针');await expect(page.locator('.rtds-functional-note')).toContainText('极性位置');
 await group(page,'optical');await expect(page.locator('#rtds-port-list button')).toHaveCount(2);await expect(page.locator('.rtds-functional-note')).toContainText('防尘盖');await page.locator('[data-rtds-subtype="downstream"]').click();await expect(page.locator('#rtds-detail-copy')).toContainText('下游');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',`${c.asset}.gt2`);await inline(page);await shot(page,'gtfpi-capped-gt2');
 await group(page,'service_unresolved');await expect(page.locator('#rtds-port-list [data-unresolved]')).toHaveCount(2);await expect(page.locator('#rtds-port-list button')).toHaveCount(0);await expect(page.locator('#rtds-physical-port')).toHaveCount(0);await expect(page.locator('#rtds-isolate')).toBeDisabled();await expect(page.locator('#rtds-scene')).not.toHaveAttribute('data-highlight-ids',/.+/);
});

test('GTSOC-2A copper16: shared SV facts, distinct service roles, rear links, MMC Ethernet and AC',async({page})=>{
 const c=cards[1];await start(page,c);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-anchors','25');await expect(page.locator('#rtds-model-revision')).toContainText('GTSOC-2A');await expect(page.locator('#rtds-model-revision')).toContainText('铜');await page.locator('#rtds-front').click();await inline(page);await shot(page,'gtsoc-front');
 await group(page,'front_sfp');await expect(page.locator('#rtds-port-list button')).toHaveCount(0);await expect(page.locator('#rtds-detail-copy')).toContainText('SV');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',Array.from({length:16},(_,i)=>`${c.asset}.front${i+1}`).join(','));await expect(page.locator('.rtds-functional-note')).toContainText('不表示当前铜模块适合 Aurora');await expect(page.locator('.rtds-functional-facts')).toContainText('子步限制不同');
 await group(page,'service');await expect(page.locator('#rtds-port-list button')).toHaveCount(3);await expect(page.locator('#rtds-detail-copy')).toContainText('UART');await page.locator('[data-rtds-subtype="monitor_pl"]').click();await expect(page.locator('#rtds-detail-copy')).toContainText('RTDS 硬件测试');await page.locator('[data-rtds-subtype="prog_jtag"]').click();await expect(page.locator('#rtds-detail-copy')).toContainText('编程');await expect(page.locator('.rtds-functional-note')).toContainText('不作为运行时信号 I/O');
 await group(page,'rear_optical');await expect(page.locator('#rtds-port-list button')).toHaveCount(2);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',Array.from({length:4},(_,i)=>`${c.asset}.rear${i+1}`).join(','));await expect(page.locator('#rtds-scene')).toHaveAttribute('data-direction','0.00,0.00,-1.00');await expect(page.locator('.rtds-functional-facts')).toContainText('固件更新');await expect(page.locator('.rtds-functional-facts')).toContainText('8 个白色可见面不计为电气接点');await expect(page.locator('.rtds-functional-note')).toContainText('防尘盖还是套筒尚未确认');
 await page.locator('[data-rtds-subtype="rear2-4"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',[2,3,4].map(i=>`${c.asset}.rear${i}`).join(','));await inline(page);await shot(page,'gtsoc-rear-links');
 await group(page,'rear_eth');await expect(page.locator('#rtds-detail-copy')).toContainText('MMC 子模块');await expect(page.locator('#rtds-detail-copy')).toContainText('工作站');await group(page,'ac_power');await expect(page.locator('.rtds-functional-facts')).toContainText('100–240 V AC，50/60 Hz');await expect(page.locator('.rtds-functional-facts')).toContainText('32 W');await expect(page.locator('.rtds-functional-facts')).toContainText('3 A / 250 V');await page.locator('#rtds-detail-copy').scrollIntoViewIfNeeded();await shot(page,'gtsoc-ac-facts');
});

for(const c of cards)test(`${c.asset}: mobile exact-port inspection preserves readable facts without PiP or horizontal overflow`,async({page})=>{
 await page.setViewportSize({width:390,height:900});await start(page,c);await group(page,c.group);await selectPhysical(page,`${c.asset}.${c.port}`);
 for(const width of [320,390,768]){await page.setViewportSize({width,height:900});await inline(page);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',/.+/);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',`${c.asset}.${c.port}`);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-direction',c.direction);await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.rtds-pip')).toBeHidden();await settled(page);const label=await page.locator('#rtds-inspection-summary').boundingBox();expect(label.x).toBeGreaterThanOrEqual(0);expect(label.x+label.width).toBeLessThanOrEqual(width);await shot(page,`${c.variant}-mobile-model-${width}`);await page.locator('#rtds-detail-copy').scrollIntoViewIfNeeded();await expect(page.locator('.rtds-pip')).toBeHidden();expect(await page.locator('#rtds-detail-copy').evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThanOrEqual(16);await shot(page,`${c.variant}-mobile-facts-${width}`);}
});

for(const c of cards)test(`${c.asset}: desktop PiP retains the same canvas and selected port through zoom, minimize and return`,async({page})=>{
 await start(page,c);await group(page,c.group);await selectPhysical(page,`${c.asset}.${c.port}`);await inline(page);await page.evaluate(()=>{window.__auxCanvas=document.querySelector('#rtds-scene canvas');});const instance=await page.locator('#rtds-scene').getAttribute('data-instance');await dock(page);
 await expect(page.locator('#rtds-scene')).toHaveAttribute('data-instance',instance);expect(await page.evaluate(()=>document.querySelector('#rtds-scene canvas')===window.__auxCanvas)).toBe(true);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',/.+/);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',`${c.asset}.${c.port}`);await expect(page.locator('.rtds-highlight')).toHaveCount(0);await renderedBounds(page);
 await renderedFrame(page);const beforeZoom=await canvasCapture(page);await page.locator('[data-pip-action="in"]').focus();await page.keyboard.press('Enter');expect((await imageDifference(page,beforeZoom,await canvasCapture(page))).fraction,'actual zoomed connector pixels').toBeGreaterThan(.005);await shot(page,`${c.variant}-desktop-pip`);
 await page.locator('[data-pip-action="minimize"]').click();await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','minimized');await page.keyboard.press('Enter');await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','expanded');await page.locator('[data-pip-action="return"]').click();await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot')).toBeFocused();expect(await page.evaluate(()=>document.querySelector('#rtds-scene canvas')===window.__auxCanvas)).toBe(true);await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-ids',`${c.asset}.${c.port}`);await shot(page,`${c.variant}-returned-inline`);
});

test('superseded auxiliary GLB load cannot overwrite the newer asset, and reference-only V1 resets inspection',async({page})=>{
 await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');let release,requested;const held=new Promise(r=>{release=r;}),seen=new Promise(r=>{requested=r;});
 await page.route('**/assets/rtds/gtfpi-v2-2.01-capped.glb',async route=>{requested();await held;await route.continue();});
 await page.locator('[data-variant="gtfpi-v2"]').click();await seen;await selectVariant(page,cards[1]);await group(page,'service');release();await page.waitForLoadState('networkidle');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset',cards[1].asset);await expect(page.locator('#rtds-detail-copy')).toContainText('UART');await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);
 for(const variant of ['gtfpi-v1','gtsoc-v1']){await page.locator(`[data-variant="${variant}"]`).click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);await expect(page.locator('.rtds-pip')).toBeHidden();}
});
