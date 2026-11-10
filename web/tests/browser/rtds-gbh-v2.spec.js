import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const mode of ['desktop','mobile','fallback'])test(`GBH V2 connections and boundaries ${mode}`,async({page})=>{
 if(mode!=='desktop'){await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});}
 if(mode==='fallback')await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:old.call(this,type,...args);};});
 await page.goto('./#rtds-chapter-4b');const lesson=page.locator('#rtds-chapter-4b'),result=page.locator('#gbh-v2-result');
 await expect(lesson).toBeVisible();await expect(page.locator('#gbh-v2-heading')).toBeFocused();await expect(page.locator('[data-variant="gbh-v2"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(result).toHaveAttribute('data-status','match');await expect(page.locator('#gbh-v2-groups')).toContainText('R5（master）');await expect(page.locator('#gbh-v2-boundaries')).toContainText('P4–P5：隔离');
 for(const key of ['gap','overlap','capacity']){await page.locator(`[data-gbh-v2-example="${key}"]`).click();await expect(result).toHaveAttribute('data-status','invalid');await expect(page.locator('#gbh-v2-groups')).toBeEmpty();}
 await page.locator('[data-gbh-v2-example="normal"]').focus();await page.keyboard.press('Enter');await expect(result).toHaveAttribute('data-status','match');
 const link=page.locator('#gbh-v2-link-result');await expect(link).toHaveAttribute('data-status','match');for(const key of ['medium','length','mapping']){await page.locator(`[data-gbh-v2-link="${key}"]`).click();await expect(link).toHaveAttribute('data-status','invalid');}
 for(const key of ['normal','lan','usb']){await page.locator(`[data-gbh-v2-link="${key}"]`).click();await expect(link).toHaveAttribute('data-status','match');}
 await page.locator('[data-gbh-v2-link="normal"]').click();await page.locator('#gbh-v2-link-length').fill('');await expect(link).toHaveAttribute('data-status','invalid');await page.locator('[data-gbh-v2-link="normal"]').click();
 expect((await page.locator('#gbh-v2-boards').boundingBox()).height).toBeGreaterThanOrEqual(44);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await mkdir('screenshots',{recursive:true});await lesson.screenshot({path:`screenshots/chapter-4b-${mode}.png`});
 await lesson.locator('a[href="#rtds-chapter-4a"]').click();await expect(lesson).toBeHidden();await expect(page.locator('#rtds-chapter-4a')).toBeVisible();await page.goBack();await expect(lesson).toBeVisible();await page.goForward();await expect(lesson).toBeHidden();await page.goBack();
 for(const id of ['novacor-2.0','gbh-v2','gtao-v2','gbh-v2']){await page.locator(`[data-variant="${id}"]`).click();await expect(lesson)[id==='gbh-v2'?'toBeVisible':'toBeHidden']();}await expect(page.locator('#rtds-analog-lesson')).toHaveAttribute('data-playing','false');await expect(page.locator('#rtds-power-lesson')).toHaveAttribute('data-playing','false');
});
