import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const mobile of [false,true])test(`2A dedicated GTSYNC counterpart ${mobile?'mobile fallback':'desktop real model'}`,async({page})=>{
 if(mobile){await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return /webgl/.test(t)?null:old.call(this,t,...args);};});}
 await page.goto('./#rtds-chapter-2a');
 const lesson=page.locator('#novacor-gtsync-lesson'),out=page.locator('#novacor-gtsync-result');
 await expect(lesson).toBeVisible();if(!mobile)await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await expect(out).toHaveAttribute('data-status','unknown');
 await page.locator('[data-gtsync-example="v2"]').focus();await page.keyboard.press('Enter');await expect(out).toHaveAttribute('data-status','match');await expect(out).toContainText('不代表时源已锁定');
 await expect(page.locator('#novacor-gtsync-lock-result')).toHaveAttribute('data-state','unknown');
 await page.locator('[data-gtsync-example="v1"]').click();await expect(out).toHaveAttribute('data-status','match');await expect(page.locator('#novacor-gtsync-path')).toContainText('GT #1');
 for(const example of ['wrong-port','wrong-end']){await page.locator(`[data-gtsync-example="${example}"]`).click();await expect(out).toHaveAttribute('data-status','invalid');}
 await page.locator('[data-gtsync-example="unlocked"]').click();await expect(out).toHaveAttribute('data-status','match');await expect(page.locator('#novacor-gtsync-lock-result')).toHaveAttribute('data-state','unlocked');await expect(page.locator('#novacor-gtsync-lock-result')).toContainText('不能宣称同步成功');
 await page.locator('#novacor-gtsync-hardware').uncheck();await expect(out).toHaveAttribute('data-status','unknown');await page.locator('#novacor-gtsync-hardware').check();await page.locator('#novacor-gtsync-component').uncheck();await expect(out).toHaveAttribute('data-status','unknown');await page.locator('#novacor-gtsync-component').check();await expect(out).toHaveAttribute('data-status','match');
 await page.locator('#novacor-gtsync-medium').selectOption('ethernet');await expect(out).toHaveAttribute('data-status','invalid');await page.locator('[data-gtsync-example="v2"]').click();
 await lesson.locator('a[href$=":gtsync"]').click();await expect(page.locator('[data-group="gtsync"]')).toHaveAttribute('aria-pressed','true');await page.goBack();await expect(lesson).toBeVisible();
 await lesson.getByText('补偿设定：不是实测端到端延时',{exact:true}).click();
 const length=page.locator('#novacor-gtsync-length'),skew=page.locator('#novacor-gtsync-skew');
 await length.fill('2');await expect(skew).toHaveAttribute('data-status','within');await expect(skew).toContainText('760 ns');
 await length.fill('49.8');await expect(skew).toHaveAttribute('data-status','within');await expect(skew).toContainText('999 ns');
 await length.fill('50');await expect(skew).toHaveAttribute('data-status','outside');await expect(skew).toContainText('1000 ns');
 await length.fill('');await expect(skew).toHaveAttribute('data-status','invalid');await expect(skew).not.toContainText('1000 ns');
 await length.fill('-1');await expect(length).toHaveAttribute('aria-invalid','true');await length.fill('2');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await mkdir('screenshots',{recursive:true});await lesson.screenshot({path:`screenshots/chapter-2a-gtsync-${mobile?'mobile':'desktop'}.png`});
 await page.locator('[data-gtsync-example="reset"]').click();await expect(out).toHaveAttribute('data-status','unknown');await expect(length).toHaveValue('');await expect(page.locator('#novacor-gtsync-hardware')).not.toBeChecked();
 await page.locator('[data-variant="novacor-light"]').click();await expect(lesson).toBeHidden();await page.goBack();await expect(lesson).toBeVisible();await page.goForward();await expect(lesson).toBeHidden();await page.goBack();await expect(lesson).toBeVisible();
});
