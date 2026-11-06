import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const mode of ['desktop','mobile','fallback'])test(`2B Light independent I/O and evidence boundaries ${mode}`,async({page})=>{
 test.setTimeout(60000);
 if(mode!=='desktop'){await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});}
 if(mode==='fallback')await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:old.call(this,type,...args);};});
 await page.goto('./#rtds-chapter-2b');
 const lesson=page.locator('#rtds-chapter-2b'),loop=page.locator('#light-loop-result'),pins=page.locator('#light-pin-result'),chain=page.locator('#light-chain-result');
 await expect(lesson).toBeVisible();await expect(page.locator('[data-variant="novacor-light"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);
 await expect(page.locator('#rtds-chapter-2a')).toBeHidden();await expect(page.locator('#rtds-analog-lesson')).toBeHidden();await expect(page.locator('#novacor-light-heading')).toBeFocused();
 expect((await page.locator('#light-kind').boundingBox()).height).toBeGreaterThanOrEqual(44);
 await expect(loop).toHaveAttribute('data-status','unknown');await page.locator('[data-light-loop="digital"]').focus();await page.keyboard.press('Enter');await expect(loop).toHaveAttribute('data-status','match');
 await page.locator('[data-light-loop="crossed"]').click();await expect(loop).toHaveAttribute('data-status','mismatch');await page.locator('[data-light-loop="analogue"]').click();await expect(loop).toHaveAttribute('data-status','match');await expect(page.locator('#light-loop-path')).toContainText('I2');
 await page.locator('#light-medium').selectOption('copper');await expect(loop).toHaveAttribute('data-status','mismatch');await page.locator('[data-light-loop="digital"]').click();
 await mkdir('screenshots',{recursive:true});await page.locator('.light-loop').screenshot({path:`screenshots/chapter-2b-loop-${mode}.png`});
 if(mode==='desktop'){await page.locator('#novacor-light-heading').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));const view=await page.locator('.light-loop').boundingBox();expect(view.y+view.height).toBeLessThan(1050);await page.screenshot({path:'screenshots/chapter-2b-first-screen-desktop.png'});}
 await expect(pins).toHaveAttribute('data-status','match');await expect(page.locator('#light-pin-facts')).toContainText('pin 14');await expect(page.locator('#light-pin-warnings')).toContainText('AO pin 13');
 await page.locator('#light-direction').selectOption('input');await page.locator('#light-channel').fill('12');await expect(page.locator('#light-pin-facts')).toContainText('pin 25');await expect(page.locator('#light-pin-facts')).toContainText('pin 13');
 await page.locator('#light-channel').fill('');await expect(pins).toHaveAttribute('data-status','invalid');await expect(page.locator('#light-pin-facts')).toBeEmpty();await page.locator('#light-channel').fill('1.5');await expect(pins).toHaveAttribute('data-status','invalid');
 await page.locator('#light-pin-kind').selectOption('digital');await page.locator('#light-channel').fill('9');await expect(pins).toHaveAttribute('data-status','unknown');await expect(page.locator('#light-pin-facts')).toContainText('待核对');await expect(page.locator('#light-pin-warnings')).toContainText('14');
 await page.locator('#light-channel').fill('1');await expect(page.locator('#light-pin-facts')).toContainText('pin 13');await page.locator('#light-channel').fill('17');await expect(pins).toHaveAttribute('data-status','unknown');await expect(page.locator('#light-pin-facts')).toContainText('BANK 待核对');await expect(page.locator('#light-pin-facts')).not.toContainText('pin 13');await expect(page.locator('#light-pin-warnings')).toContainText('第二只 DI');
 await page.locator('#light-direction').selectOption('output');await page.locator('#light-channel').fill('32');await expect(pins).toHaveAttribute('data-status','match');await expect(page.locator('#light-pin-facts')).toContainText('BANK 4');await expect(page.locator('#light-pin-facts')).toContainText('pin 21');
 await page.locator('#light-pin-kind').selectOption('analogue');await expect(pins).toHaveAttribute('data-status','invalid');await page.locator('#light-channel').fill('1');await expect(pins).toHaveAttribute('data-status','match');
 await page.locator('[data-light-chain="normal"]').click();await expect(chain).toHaveAttribute('data-status','match');
 for(const name of ['v1','mixed','exclusive']){await page.locator(`[data-light-chain="${name}"]`).click();await expect(chain).toHaveAttribute('data-status','invalid');}
 await page.locator('[data-light-chain="latency"]').click();await expect(chain).toHaveAttribute('data-status','warning');await page.locator('[data-light-chain="normal"]').click();
 await page.locator('#light-chain').fill('GTFPGA');await expect(chain).toHaveAttribute('data-status','unknown');await page.locator('#light-chain').fill(Array(9).fill('GTDO').join(','));await expect(chain).toHaveAttribute('data-status','invalid');
 await page.locator('[data-light-chain="normal"]').click();await page.locator('#light-chain-port').selectOption('i1');await expect(chain).toHaveAttribute('data-status','invalid');await page.locator('#light-chain-port').selectOption('gt6');await expect(chain).toHaveAttribute('data-status','match');await page.locator('#light-chain-version').selectOption('unknown');await expect(chain).toHaveAttribute('data-status','unknown');
 await page.locator('[data-light-chain="reset"]').click();await expect(page.locator('#light-chain')).toHaveValue('');await expect(chain).toHaveAttribute('data-status','unknown');await page.locator('[data-light-chain="normal"]').click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await lesson.screenshot({path:`screenshots/chapter-2b-full-${mode}.png`});
 await lesson.locator('a[href="#rtds-chapter-2a"]').click();await expect(lesson).toBeHidden();await expect(page.locator('#rtds-chapter-2a')).toBeVisible();if(mode!=='fallback')await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await page.goBack();await expect(lesson).toBeVisible();await page.goForward();await expect(lesson).toBeHidden();await page.goBack();await expect(lesson).toBeVisible();
 for(const id of ['gtao-v2','novacor-light','novacor-1.0','novacor-light']){await page.locator(`[data-variant="${id}"]`).click();await expect(lesson)[id==='novacor-light'?'toBeVisible':'toBeHidden']();}
 await expect(page.locator('#rtds-analog-lesson')).toHaveAttribute('data-playing','false');await expect(page.locator('#rtds-power-lesson')).toHaveAttribute('data-playing','false');expect(await page.locator('[id]').evaluateAll(nodes=>new Set(nodes.map(n=>n.id)).size===nodes.length)).toBe(true);
});

for(const action of ['input','new-route'])test(`initial Light navigation does not override later ${action}`,async({page})=>{
 let release,seen;const held=new Promise(resolve=>{release=resolve;}),requested=new Promise(resolve=>{seen=resolve;});
 await page.route('**/route-load-barrier.svg',async route=>{seen();await held;await route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'});});
 await page.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const image=document.createElement('img');image.src='route-load-barrier.svg';image.alt='';image.hidden=true;document.body.append(image);},{once:true}));
 await page.goto('./#rtds-chapter-2b',{waitUntil:'domcontentloaded'});await requested;
 await expect(page.locator('#rtds-chapter-2b')).toBeVisible();
 if(action==='input'){await page.locator('[data-light-loop="digital"]').click();await expect(page.locator('#light-loop-result')).toHaveAttribute('data-status','match');}
 else{await page.locator('#mode-generic').click();await expect(page.locator('#generic-panel')).toBeVisible();}
 release();await page.waitForLoadState('load');await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 if(action==='input'){await expect(page.locator('[data-light-loop="digital"]')).toBeFocused();await expect(page.locator('#light-loop-result')).toHaveAttribute('data-status','match');}
 else{await expect(page.locator('#rtds-panel')).toBeHidden();await expect(page.locator('#mode-generic')).toBeFocused();expect(new URL(page.url()).hash).toBe('#generic');}
});
