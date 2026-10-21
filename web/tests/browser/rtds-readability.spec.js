// Software-rendered screenshots across all breakpoints may take longer than one default case.
import {test,expect} from '@playwright/test';import {mkdir} from 'node:fs/promises';import {selectPhysical} from './rtds-test-helpers.js';
test.setTimeout(120000);
async function loaded(page){await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 // Navigating to the same hash is not a reload: explicitly choose this case's model.
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','novacor-2.0-2023');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');}
async function shot(page,name){await mkdir('screenshots',{recursive:true});await page.screenshot({path:`screenshots/rtds-ux-${name}.png`,fullPage:true});}

test('02 automatically opens a shared03 panel with no repetitive Aurora or GTIO buttons',async({page})=>{
 await loaded(page);await page.locator('[data-group=aurora]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#rtds-port-list button')).toHaveCount(0);await expect(page.locator('#rtds-detail-title')).toHaveText('GT 21–24 · Aurora');await expect(page.locator('#rtds-detail-copy')).toContainText('Aurora');await expect(page.locator('.rtds-functional-facts')).toContainText('双工 LC');await expect(page.locator('.rtds-functional-note')).toContainText('单独购买授权');await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids',[21,22,23,24].map(n=>`novacor-2.0-2023.gt${n}`).join(','));await expect(page.locator('#rtds-label')).toHaveText('GT 21–24 · Aurora');await shot(page,'shared-aurora');
 await selectPhysical(page,'novacor-2.0-2023.gt23');await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','port');await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids','novacor-2.0-2023.gt23');await expect(page.locator('#rtds-physical-port')).toHaveValue('novacor-2.0-2023.gt23');await expect(page.locator('.rtds-model-notes')).toHaveAttribute('open','');
 for(const [group,count]of [['gtio',20],['irc',6],['wif',1]]){await page.locator(`[data-group=${group}]`).click();await expect(page.locator('#rtds-port-list button')).toHaveCount(0);await expect(page.locator('.rtds-shared-label')).toContainText(String(count));await expect(page.locator('.rtds-functional-facts')).toBeVisible();}
 await expect(page.locator('.rtds-functional-facts')).toContainText('RSCAD');await page.locator('#rtds-reset').click();await expect(page.locator('.rtds-functional-facts')).toHaveCount(0);await expect(page.locator('.rtds-highlight')).toBeHidden();
});

test('03 shows cable facts and source-conditional GBH limits instead of geometry boilerplate',async({page})=>{
 await loaded(page);await page.locator('[data-group=gbh]').click();const facts=page.locator('.rtds-functional-facts');await expect(facts).toContainText('1 mm POF');await expect(facts).toContainText('200 μm HCS');await expect(facts).toContainText('非 LC');await expect(facts).toContainText('20 m');await expect(facts).toContainText('100 m');await expect(page.locator('.rtds-functional-note')).toContainText('RTFPGA 0356');await expect(page.locator('.rtds-model-notes')).not.toHaveAttribute('open','');expect(await page.locator('#rtds-port-facts').innerText()).not.toMatch(/尺寸口径|照片估计|配接兼容性.*未知/);await shot(page,'gbh-purpose-cables');
});

test('DI/DO share a numbered eight-bank map while optical, power and GTAO special roles remain distinct',async({page})=>{
 await loaded(page);
 for(const [variant,group,last]of [['gtdi-v2','digital_input','GND'],['gtdo-v2','digital_output','V-']]){await page.locator(`[data-variant="${variant}"]`).click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await page.locator(`[data-group=${group}]`).click();await expect(page.locator('#rtds-port-list button')).toHaveCount(0);await expect(page.locator('.rtds-bank-map tbody tr')).toHaveCount(8);await expect(page.locator('.rtds-bank-map')).toContainText('57');await expect(page.locator('.rtds-bank-map')).toContainText('64');await expect(page.locator('.rtds-bank-map')).toContainText(last);await expect(page.locator('.rtds-terminal-first')).toHaveCount(16);await shot(page,variant+'-numbered-banks');}
 await page.locator('[data-group=optical]').click();await expect(page.locator('#rtds-port-list button')).toHaveCount(2);await expect(page.locator('[data-rtds-subtype=upstream]')).toHaveAttribute('aria-pressed','true');await page.locator('[data-rtds-subtype=downstream]').click();await expect(page.locator('.rtds-functional-facts')).toContainText('后续');await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids','gtdo-v2-2.00.gt2');
 await page.locator('[data-group=power]').click();await expect(page.locator('.rtds-functional-facts')).toContainText('+24V · GND · GND · NC');await page.locator('[data-rtds-subtype=lower]').click();await expect(page.locator('.rtds-functional-facts')).toContainText('引脚顺序未核对');await expect(page.locator('.rtds-functional-facts')).not.toContainText('+24V · GND · GND · NC');
 await page.locator('[data-group=service_unresolved]').click();await expect(page.locator('#rtds-port-list button')).toHaveCount(0);await expect(page.locator('.rtds-functional-facts')).toHaveCount(0);
 await page.locator('[data-variant="gtao-v2"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await page.locator('[data-group=analog_output]').click();await expect(page.locator('#rtds-port-list button')).toHaveCount(2);await page.locator('[data-rtds-subtype=outputs-13-16]').click();await expect(page.locator('.rtds-functional-facts')).toContainText('通道 13–16 仅 NovaCor');await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids',[13,14,15,16].map(n=>`gtao-v2-2.20.channel${n}`).join(','));await shot(page,'gtao-special-four');
});

test('larger primary fonts and grouped bank details fit desktop and mobile widths',async({page})=>{
 for(const width of [1440,1100,1024,800,768,560,390,320]){
  await page.setViewportSize({width,height:900});await loaded(page);await page.locator('[data-group=gbh]').click();expect(await page.locator('body').evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThanOrEqual(16);
  for(const [selector,min]of [['#rtds-detail-copy',16],['.rtds-functional-facts',15],['.rtds-shared-label',14],['.rtds-port-evidence',13]])expect(await page.locator(selector).first().evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThanOrEqual(min);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await shot(page,`readability-${width}`);
  await page.locator('[data-variant="gtdi-v2"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await page.locator('[data-group=digital_input]').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await shot(page,`bank-map-${width}`);
 }
});
