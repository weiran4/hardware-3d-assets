// Software-rendered screenshots across all breakpoints may take longer than one default case.
import {selectPhysical} from './rtds-test-helpers.js';
import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
test.setTimeout(120000);
const cards=[
 {variant:'gtdo-v2',asset:'gtdo-v2-2.00',pcb:'2.00',group:'digital_output',port:'bank1_odd',plugs:16,anchors:24,unresolved:4,contacts:'1 · 3 · 5 · 7 · V+'},
 {variant:'gtai-v2',asset:'gtai-v2-2.31',pcb:'2.31',group:'analogue_input',port:'input1',plugs:12,anchors:18,unresolved:2,contacts:'+ · - · GND'},
 {variant:'gtao-v2',asset:'gtao-v2-2.20',pcb:'2.20',group:'analog_output',port:'channel16',plugs:16,anchors:22,unresolved:2,contacts:'+ · RETURN'}
];
async function shot(page,name){await mkdir('screenshots',{recursive:true});await page.locator('.rtds-inspection').screenshot({path:`screenshots/rtds-${name}.png`});}
for(const c of cards)test(`${c.asset}: real interfaces, exact revision, unknowns, highlights and responsive inspection`,async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await page.locator(`[data-variant="${c.variant}"]`).click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset',c.asset);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-anchors',String(c.anchors));await expect(page.locator('#rtds-model-revision')).toContainText(c.pcb);await shot(page,c.asset+'-overview');
 await page.locator('#rtds-top').click();await shot(page,c.asset+'-top');await page.locator(`[data-group="${c.group}"]`).click();await expect(page.locator('#rtds-port-list button')).toHaveCount(c.variant==='gtao-v2'?2:0);await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');
 await selectPhysical(page,`${c.asset}.${c.port}`);await expect(page.locator('#rtds-port-facts')).toContainText(c.contacts);await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids',`${c.asset}.${c.port}`);await expect(page.locator('.rtds-model-notes')).toHaveAttribute('open','');if(c.variant==='gtao-v2')await expect(page.locator('#rtds-port-facts')).toContainText('仅 NovaCor');await shot(page,c.asset+'-terminal-detail');
 await page.locator('[data-group="power"]').click();await selectPhysical(page,`${c.asset}.power2`);await expect(page.locator('#rtds-port-facts')).toContainText('引脚顺序未核对');
 await page.locator('[data-group="optical"]').click();await expect(page.locator('#rtds-port-list button')).toHaveCount(2);await selectPhysical(page,`${c.asset}.gt1`);await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids',`${c.asset}.gt1`);await shot(page,c.asset+'-optical-detail');
 await page.locator('[data-group="service_unresolved"]').click();await expect(page.locator('#rtds-port-list button')).toHaveCount(0);await expect(page.locator('#rtds-port-list [data-unresolved]')).toHaveCount(c.unresolved);await expect(page.locator('.rtds-highlight')).toBeHidden();
 await page.locator(`[data-group="${c.group}"]`).click();await selectPhysical(page,`${c.asset}.${c.port}`);
 for(const width of [320,390,560,768,800]){await page.setViewportSize({width,height:900});await expect(page.locator('.rtds-highlight')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();const label=await page.locator('#rtds-label').boundingBox();expect(label.x).toBeGreaterThanOrEqual(0);expect(label.x+label.width).toBeLessThanOrEqual(width);await shot(page,`${c.asset}-mobile-${width}`);}
 await page.locator(`[data-variant="${c.variant.replace('-v2','-v1')}"]`).click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);await expect(page.locator('.rtds-highlight')).toHaveCount(0);expect(errors).toEqual([]);
});
