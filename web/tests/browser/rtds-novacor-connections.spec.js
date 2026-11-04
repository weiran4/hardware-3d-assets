import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const mobile of [false,true])test(`2A connection and ordered chain checks ${mobile?'mobile fallback':'desktop real model'}`,async({page})=>{
 if(mobile){await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return /webgl/.test(t)?null:old.call(this,t,...args);};});}
 await page.goto('./#rtds-chapter-2a');
 const section=page.locator('#rtds-chapter-2a'),connection=page.locator('#novacor-connection-result'),chain=page.locator('#novacor-chain-result');
 await expect(section).toBeVisible();await expect(page.locator('[data-variant="novacor-2.0"]')).toHaveAttribute('aria-pressed','true');
 if(!mobile)await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await page.locator('#novacor-purpose').selectOption('gtio');await page.locator('#novacor-port').selectOption('gt1-20');await page.locator('#novacor-cable').selectOption('optical');await expect(connection).toHaveAttribute('data-status','match');
 await page.locator('#novacor-port').selectOption('gt21-24');await expect(connection).toHaveAttribute('data-status','mismatch');
 await page.locator('#novacor-purpose').selectOption('aurora');await page.locator('#novacor-aurora-license').selectOption('absent');await expect(connection).toHaveAttribute('data-status','blocked');
 await page.locator('#novacor-inspect-port').click();await expect(page.locator('[data-group="aurora"]')).toHaveAttribute('aria-pressed','true');await page.goBack();await expect(section).toBeVisible();
 await page.locator('[data-novacor-example="normal"]').focus();await page.keyboard.press('Enter');await expect(chain).toHaveAttribute('data-status','match');
 for(const example of ['mixed-input','exclusive','over']){await page.locator(`[data-novacor-example="${example}"]`).click();await expect(chain).toHaveAttribute('data-status','invalid');}
 await page.locator('[data-novacor-example="latency"]').click();await expect(chain).toHaveAttribute('data-status','warning');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await mkdir('screenshots',{recursive:true});await section.screenshot({path:`screenshots/chapter-2a-connections-${mobile?'mobile':'desktop'}.png`});
 await page.locator('#novacor-chain').fill('GTAI, <img src=x>');await expect(chain).toHaveAttribute('data-status','unknown');await expect(section.locator('img')).toHaveCount(0);
 await page.locator('#novacor-chain').fill('A'.repeat(160));await expect(chain).toHaveAttribute('data-status','unknown');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-novacor-example="reset"]').click();await expect(chain).toHaveAttribute('data-status','unknown');
 await page.locator('[data-variant="novacor-light"]').click();await expect(section).toBeHidden();await expect(page.locator('#rtds-analog-lesson')).toBeHidden();await expect(page.locator('#rtds-analog-lesson')).toHaveAttribute('data-playing','false');
 await page.goBack();await expect(section).toBeVisible();await page.goForward();await expect(section).toBeHidden();await page.goBack();await expect(section).toBeVisible();
 await section.locator('a[href="#rtds-analog"]').click();await expect(page.locator('#rtds-analog-lesson')).toBeVisible();await expect(page.locator('[data-variant="novacor-2.0"]')).toHaveAttribute('aria-pressed','true');
 await page.goBack();await expect(section).toBeVisible();await page.locator('[data-variant="cubicle-v1"]').click();await expect(section).toBeHidden();await expect(page.locator('#rtds-chapter-1b')).toBeVisible();
});
