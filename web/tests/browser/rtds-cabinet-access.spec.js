import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const mobile of [false,true])test(`1A cable entry and side-panel assumptions ${mobile?'mobile':'desktop'}`,async({page})=>{
 if(mobile){await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:old.call(this,type,...args);};});}
 await page.goto('./#rtds-chapter-1a');
 const root=page.locator('#cabinet-access'),out=page.locator('#cabinet-access-result'),route=page.locator('#cabinet-access-route'),panel=page.locator('#cabinet-access-panel'),led=page.locator('#cabinet-access-led');
 await expect(out).toHaveAttribute('data-status','identified');await expect(panel).toBeDisabled();await expect(led).toHaveValue('unknown');
 await route.selectOption('bottom');await expect(page.locator('#cabinet-access-detail')).toContainText('304.8 × 76.2 mm');
 await route.selectOption('side');await expect(panel).toBeEnabled();await expect(out).toHaveAttribute('data-status','unknown');
 await page.locator('[data-access-preset=normal]').focus();await page.keyboard.press('Enter');await expect(out).toHaveAttribute('data-status','illustrated');await expect(out).toContainText('不是安装许可');
 await page.locator('[data-access-preset=blocked]').click();await expect(out).toHaveAttribute('data-status','blocked');
 await page.locator('[data-access-preset=conflict]').click();await expect(out).toHaveAttribute('data-status','conflict');
 await route.selectOption('top');await expect(out).toHaveAttribute('data-status','identified');await expect(panel).toBeDisabled();
 await route.selectOption('side');await expect(out).toHaveAttribute('data-status','conflict');await led.selectOption('unknown');await expect(out).toHaveAttribute('data-status','unknown');
 await page.locator('[data-access-preset=conflict]').click();await root.scrollIntoViewIfNeeded();await expect(page.locator('.rtds-pip')).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(root.locator('[data-access-zone=side]')).toHaveAttribute('data-selected','true');
 const marker=await root.locator('.access-side i').boundingBox();expect(marker.width).toBeGreaterThanOrEqual(40);expect(marker.height).toBeGreaterThanOrEqual(28);
 await mkdir('screenshots',{recursive:true});await root.screenshot({path:`screenshots/chapter-1a-access-${mobile?'mobile':'desktop'}.png`});
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(root).toBeHidden();await page.goBack();await expect(root).toBeVisible();await expect(out).toHaveAttribute('data-status','conflict');
 await page.goForward();await expect(root).toBeHidden();await page.goBack();await expect(root).toBeVisible();
});
