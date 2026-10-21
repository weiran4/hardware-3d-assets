import {selectPhysical} from './rtds-test-helpers.js';
import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
async function ready(page){await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');}
async function shot(page,name){await mkdir('screenshots',{recursive:true});await page.locator('#rtds-signal-flow').screenshot({path:`screenshots/rtds-flow-${name}.png`});}

test('conceptual flow keeps virtual input, in-flight value and illustrative received state separate',async({page})=>{
 await ready(page);await expect(page.locator('#flow-received')).toHaveText('—');await page.locator('#flow-input-1').click();await page.locator('#flow-step').click();await expect(page.locator('#rtds-signal-flow')).toHaveAttribute('data-phase','field');await expect(page.locator('#flow-sampled')).toHaveText('1');await expect(page.locator('#flow-received')).toHaveText('—');
 await page.locator('#flow-input-0').click();await page.locator('#flow-step').click();await expect(page.locator('#rtds-signal-flow')).toHaveAttribute('data-phase','optical');await expect(page.locator('#flow-source-value')).toHaveText('0');await expect(page.locator('#flow-sampled')).toHaveText('1');await shot(page,'optical-direction-desktop');
 await page.locator('#flow-step').click();await expect(page.locator('#flow-received')).toHaveText('1');await expect(page.locator('#flow-count')).toHaveText('示意传递 1 次');await page.locator('#flow-step').click();await expect(page.locator('#flow-sampled')).toHaveText('0');await page.locator('#flow-reset').click();await expect(page.locator('#flow-received')).toHaveText('—');await expect(page.locator('#flow-count')).toHaveText('示意传递 0 次');
});

test('flow play/pause and switching modes cancel scheduling while the generic lesson remains intact',async({page})=>{
 await page.goto('./');await expect(page.locator('#scene')).toHaveAttribute('data-loaded','true');await page.locator('#port-out').click();await page.locator('#port-ch1').click();await page.locator('#mode-rtds').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await page.clock.install();
 await page.locator('#flow-play').click();await expect(page.locator('#flow-play')).toHaveAttribute('aria-pressed','true');await page.clock.runFor(2500);await expect(page.locator('#flow-received')).toHaveText('0');
 await page.locator('#flow-play').click();const phase=await page.locator('#rtds-signal-flow').getAttribute('data-phase');await page.clock.fastForward(10000);await expect(page.locator('#rtds-signal-flow')).toHaveAttribute('data-phase',phase);
 await page.locator('#flow-play').click();await page.locator('#mode-generic').click();await expect(page.locator('#scene')).toHaveAttribute('data-connection','out-ch1');const count=await page.locator('#flow-count').textContent();await page.clock.fastForward(10000);await page.locator('#mode-rtds').click();await expect(page.locator('#flow-play')).toHaveAttribute('aria-pressed','false');await expect(page.locator('#flow-count')).toHaveText(count);
});

test('conceptual endpoint buttons inspect exact audited real-model ports without claiming a valid physical connection',async({page})=>{
 await ready(page);await page.locator('#flow-inspect-gtdi').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','gtdi-v2-2.01');await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids','gtdi-v2-2.01.gt1');await expect(page.locator('.rtds-functional-facts')).toContainText('双工 LC');await expect(page.locator('#flow-inspect-status')).toContainText('不验证配接');
 await page.locator('#flow-inspect-novacor').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','novacor-2.0-2023');await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids','novacor-2.0-2023.gt1');await expect(page.locator('#rtds-label')).toHaveText('GT1');
});

test('flow handles unavailable endpoint models honestly and does not masquerade as hardware status',async({page})=>{
 await ready(page);await page.route('**/assets/rtds/gtdi-v2-2.01.glb',route=>route.abort());await page.locator('#flow-inspect-gtdi').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','error');await expect(page.locator('#flow-inspect-status')).toContainText('未能定位接口');await expect(page.locator('#flow-received')).toHaveText('—');await page.locator('#flow-step').click();await expect(page.locator('#rtds-signal-flow')).toHaveAttribute('data-phase','field');
});

test('flow is keyboard operable, reduced-motion safe and readable at mobile/tablet breakpoints',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await ready(page);await page.locator('#flow-input-1').focus();await page.keyboard.press('Enter');await page.locator('#flow-step').focus();await page.keyboard.press('Enter');await expect(page.locator('#flow-sampled')).toHaveText('1');expect(await page.locator('.flow-arrow.active i').evaluate(n=>getComputedStyle(n).animationName)).toBe('none');
 for(const width of [320,390,560,768,800]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();for(const id of ['flow-input-0','flow-input-1','flow-step','flow-play','flow-reset','flow-inspect-gtdi','flow-inspect-novacor']){const b=await page.locator('#'+id).boundingBox();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(width);}await shot(page,`mobile-${width}`);}
});

test('a late conceptual endpoint request cannot replace a newer same-model interface choice',async({page})=>{
 await ready(page);let release,seen;const hold=new Promise(r=>release=r),requested=new Promise(r=>seen=r);let calls=0;
 await page.route('**/assets/rtds/gtdi-v2-2.01.glb',async route=>{if(++calls===1){seen();await hold;}await route.continue();});
 await page.locator('#flow-inspect-gtdi').click();await requested;await page.locator('[data-variant="gtdi-v2"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await page.locator('[data-group="digital_input"]').click();await selectPhysical(page,'gtdi-v2-2.01.bank1_odd');release();await page.waitForLoadState('networkidle');
 await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids','gtdi-v2-2.01.bank1_odd');await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);
});
