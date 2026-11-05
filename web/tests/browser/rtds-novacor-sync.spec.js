import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const mobile of [false,true])test(`2A separate GBH and IRC paths ${mobile?'mobile fallback':'desktop real model'}`,async({page})=>{
 if(mobile){await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return /webgl/.test(t)?null:old.call(this,t,...args);};});}
 await page.goto('./#rtds-chapter-2a');
 const lesson=page.locator('#novacor-sync-lesson'),out=page.locator('#novacor-sync-result');
 await expect(lesson).toBeVisible();if(!mobile)await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await expect(out).toHaveAttribute('data-status','unknown');
 await page.locator('[data-sync-example="pair"]').focus();await page.keyboard.press('Enter');await expect(out).toHaveAttribute('data-status','match');await expect(out).toContainText('配置 #1');
 await page.locator('#novacor-sync-count').fill('3');await expect(out).toHaveAttribute('data-status','invalid');await expect(page.locator('#novacor-sync-issues')).toContainText('三台及以上');
 for(const example of ['hub','switch']){await page.locator(`[data-sync-example="${example}"]`).click();await expect(out).toHaveAttribute('data-status','match');}
 await page.locator('#novacor-sync-data').selectOption('direct');await expect(out).toHaveAttribute('data-status','invalid');await expect(page.locator('#novacor-sync-issues')).toContainText('IRC Switch');
 for(const example of ['missing','wrong-p2p']){await page.locator(`[data-sync-example="${example}"]`).click();await expect(out).toHaveAttribute('data-status','invalid');}
 await page.locator('[data-sync-example="pair"]').click();await page.locator('#novacor-sync-files').uncheck();await expect(out).toHaveAttribute('data-status','unknown');await page.locator('#novacor-sync-files').check();await expect(out).toHaveAttribute('data-status','match');
 await lesson.locator('a[href$=":gbh"]').click();await expect(page.locator('[data-group="gbh"]')).toHaveAttribute('aria-pressed','true');await page.goBack();await expect(lesson).toBeVisible();
 await lesson.locator('a[href$=":irc"]').click();await expect(page.locator('[data-group="irc"]')).toHaveAttribute('aria-pressed','true');await page.goBack();await expect(lesson).toBeVisible();
 await page.locator('[data-sync-example="switch"]').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await mkdir('screenshots',{recursive:true});await lesson.screenshot({path:`screenshots/chapter-2a-sync-${mobile?'mobile':'desktop'}.png`});
 await page.locator('[data-sync-example="reset"]').click();await expect(out).toHaveAttribute('data-status','unknown');await expect(page.locator('#novacor-sync-files')).not.toBeChecked();
 await page.locator('[data-variant="novacor-light"]').click();await expect(lesson).toBeHidden();await page.goBack();await expect(lesson).toBeVisible();await page.goForward();await expect(lesson).toBeHidden();
});
