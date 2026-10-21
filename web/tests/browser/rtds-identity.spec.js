import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {selectPhysical} from './rtds-test-helpers.js';

// Real WebGL / responsive screenshots run only in the official browser CI job.
test.setTimeout(120000);
const cards=[
 {type:'DI',variant:'gtdi-v2',asset:'gtdi-v2-2.01',group:'digital_input',port:'bank1_odd'},
 {type:'DO',variant:'gtdo-v2',asset:'gtdo-v2-2.00',group:'digital_output',port:'bank1_odd'},
 {type:'AI',variant:'gtai-v2',asset:'gtai-v2-2.31',group:'analogue_input',port:'input1'},
 {type:'AO',variant:'gtao-v2',asset:'gtao-v2-2.20',group:'analog_output',port:'channel1'}
];
const badge=page=>page.locator('#rtds-scene .rtds-card-identity');
const leader=page=>page.locator('#rtds-scene .rtds-card-identity-leader');
let errors=[];
test.beforeEach(async({page})=>{errors=[];page.on('pageerror',error=>errors.push(error.message));});
test.afterEach(()=>expect(errors).toEqual([]));
async function loaded(page){await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');}
async function selectCard(page,card){await page.locator(`[data-variant="${card.variant}"]`).click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset',card.asset);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await expect(badge(page)).toHaveCount(1);await expect(badge(page)).toHaveAttribute('data-card-type',card.type);}
async function settle(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function inline(page){await page.locator('.rtds-pip-slot').evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));await expect(page.locator('.rtds-pip')).toBeHidden();await settle(page);}
async function dock(page){await page.evaluate(()=>{const slot=document.querySelector('.rtds-pip-slot');scrollTo(0,scrollY+slot.getBoundingClientRect().bottom+24);});await expect(page.locator('.rtds-pip')).toBeVisible();await settle(page);}
async function inside(page){
 await settle(page);await expect(badge(page)).toBeVisible();const scene=await page.locator('#rtds-scene').boundingBox(),label=await badge(page).boundingBox();
 expect(label.x).toBeGreaterThanOrEqual(scene.x-.5);expect(label.y).toBeGreaterThanOrEqual(scene.y-.5);expect(label.x+label.width).toBeLessThanOrEqual(scene.x+scene.width+.5);expect(label.y+label.height).toBeLessThanOrEqual(scene.y+scene.height+.5);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
}
async function textMetrics(page){return badge(page).locator('strong').evaluate(node=>{const range=document.createRange();range.selectNodeContents(node);const text=range.getBoundingClientRect();return {font:getComputedStyle(node).fontSize,width:text.width,height:text.height};});}
async function anchor(page){await settle(page);return leader(page).locator('line').evaluate(node=>[Number(node.getAttribute('x1')),Number(node.getAttribute('y1'))]);}
async function shot(page,name,floating=false){await mkdir('screenshots',{recursive:true});await page.locator(floating?'.rtds-pip':'.rtds-viewer-wrap').screenshot({path:`screenshots/rtds-identity-${name}.png`});}

for(const card of cards)test(`${card.type} identity is readable and inside its overview at desktop and mobile widths`,async({page})=>{
 await loaded(page);await selectCard(page,card);let font;
 for(const width of [1440,320,390,768]){
  await page.setViewportSize({width,height:900});await inline(page);await inside(page);
  await expect(badge(page).locator('strong')).toHaveText(card.type);await expect(badge(page)).toContainText(/[\u4e00-\u9fff]/);
  const metrics=await textMetrics(page);expect(metrics.font).toMatch(/^\d+(?:\.\d+)?px$/);font??=metrics.font;expect(metrics.font).toBe(font);
  expect(await badge(page).evaluate(node=>getComputedStyle(node).pointerEvents)).toBe('none');
  await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);await shot(page,`${card.type}-overview-${width}`);
 }
});

test('identity tracks the projected heatsink anchor, keeps pixel-sized text and reuses the same overlay in PiP',async({page})=>{
 const card=cards[2];await loaded(page);await selectCard(page,card);await inline(page);await inside(page);
 await page.evaluate(()=>{window.__identityOriginal=document.querySelector('.rtds-card-identity');window.__identityCanvas=document.querySelector('#rtds-scene canvas');});
 const metrics=await textMetrics(page),before=await anchor(page),canvas=page.locator('#rtds-scene canvas'),box=await canvas.boundingBox();
 await page.mouse.move(box.x+box.width*.42,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.49,box.y+box.height*.52,{steps:10});await page.mouse.up();
 await expect.poll(async()=>{const next=await anchor(page);return Math.hypot(next[0]-before[0],next[1]-before[1]);}).toBeGreaterThan(1);
 await page.locator('#rtds-out').click();await inside(page);const zoomed=await textMetrics(page);expect(zoomed.font).toBe(metrics.font);expect(Math.abs(zoomed.width-metrics.width)).toBeLessThan(.5);expect(Math.abs(zoomed.height-metrics.height)).toBeLessThan(.5);
 expect(await badge(page).evaluate(node=>{const r=node.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===document.querySelector('#rtds-scene canvas');})).toBe(true);
 await dock(page);await inside(page);expect((await textMetrics(page)).font).toBe(metrics.font);await expect(page.locator('.rtds-pip .rtds-card-identity')).toHaveCount(1);
 expect(await page.evaluate(()=>document.querySelector('.rtds-card-identity')===window.__identityOriginal&&document.querySelector('#rtds-scene canvas')===window.__identityCanvas)).toBe(true);await shot(page,'AI-floating-overview',true);
 await page.locator(`[data-group="${card.group}"]`).evaluate(node=>node.click());await expect(badge(page)).toBeHidden();await expect(badge(page)).toHaveAttribute('hidden','');await expect(leader(page)).toBeHidden();await expect(page.locator('.rtds-highlight')).toBeVisible();await shot(page,'AI-floating-inspection-priority',true);
 await page.locator('#rtds-reset').evaluate(node=>node.click());await inside(page);await expect(page.locator('.rtds-highlight')).toBeHidden();expect(await page.evaluate(()=>document.querySelector('.rtds-card-identity')===window.__identityOriginal)).toBe(true);
 await page.locator('[data-pip-action="return"]').click();await inline(page);await inside(page);await shot(page,'AI-restored-inline');
});

test('every card yields to group, physical-port and unresolved inspection, then returns on reset',async({page})=>{
 await loaded(page);
 for(const card of cards){
  await selectCard(page,card);await inline(page);await inside(page);
  await page.locator(`[data-group="${card.group}"]`).click();await expect(badge(page)).toHaveCount(1);await expect(badge(page)).toHaveAttribute('hidden','');await expect(badge(page)).toBeHidden();await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');
  await selectPhysical(page,`${card.asset}.${card.port}`);await expect(badge(page)).toBeHidden();await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids',`${card.asset}.${card.port}`);await expect(page.locator('#rtds-label')).toBeVisible();
  await page.locator('[data-group="service_unresolved"]').click();await expect(badge(page)).toBeHidden();await expect(page.locator('.rtds-highlight')).toBeHidden();
  await page.locator('#rtds-reset').click();await inline(page);await inside(page);await expect(badge(page).locator('strong')).toHaveText(card.type);await expect(page.locator('.rtds-highlight')).toBeHidden();
 }
});

test('model disposal, NovaCor, reference-only and errors cannot retain a stale card identity',async({page})=>{
 await loaded(page);await expect(badge(page)).toHaveCount(0);await expect(leader(page)).toHaveCount(0);
 for(const card of cards){await selectCard(page,card);await inline(page);await inside(page);await expect(badge(page).locator('strong')).toHaveText(card.type);await expect(leader(page)).toHaveCount(1);}
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','novacor-2.0-2023');await expect(badge(page)).toHaveCount(0);await expect(leader(page)).toHaveCount(0);
 await selectCard(page,cards[0]);await page.locator('[data-variant="gtdi-v1"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(badge(page)).toHaveCount(0);await expect(leader(page)).toHaveCount(0);
 await page.route('**/assets/rtds/gtdo-v2-2.00.glb',route=>route.abort());await page.locator('[data-variant="gtdo-v2"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','error');await expect(badge(page)).toHaveCount(0);await expect(leader(page)).toHaveCount(0);
 await selectCard(page,cards[2]);await inline(page);await inside(page);await expect(badge(page).locator('strong')).toHaveText('AI');
});
