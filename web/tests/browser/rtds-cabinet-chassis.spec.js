import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

test('1A chassis scopes reject double counting and unknown populations',async({page})=>{
 await page.goto('./#rtds-chapter-1a');
 const result=page.locator('#cabinet-chassis-result'),section=page.locator('#cabinet-chassis');
 await expect(result).toHaveAttribute('data-status','reference');await expect(result).toContainText('790 W');
 await expect(section).toContainText('不等于整柜最大输入功率');
 await page.getByRole('button',{name:'错误例：把 GTNET 卡再加一次'}).focus();await page.keyboard.press('Enter');
 await expect(result).toHaveAttribute('data-status','double-count');await expect(result).toContainText('54 W');await expect(result).toContainText('790 W');
 await page.getByRole('button',{name:'缺证据例：GTNET 只有 2 张卡'}).click();await expect(result).toHaveAttribute('data-status','unknown');await expect(result).not.toContainText('790 W');
 await page.getByLabel('NovaCor 2.0 机箱数量').fill('');await expect(result).toHaveAttribute('data-status','invalid');
 await page.getByRole('button',{name:'参考例：2 台 NovaCor + 1 台满配 GTNET'}).click();await expect(result).toContainText('790 W');
 await page.getByLabel('GTNET 机箱数量').fill('0');await expect(result).toContainText('700 W');
 await expect(page.getByLabel('每台 GTNET 的 GTNETx2 数量')).toBeDisabled();
 await page.getByRole('button',{name:'参考例：2 台 NovaCor + 1 台满配 GTNET'}).click();
 await section.scrollIntoViewIfNeeded();await expect(page.locator('.rtds-pip')).toBeHidden();
 await mkdir('screenshots',{recursive:true});await section.screenshot({path:'screenshots/chapter-1a-chassis-desktop.png'});
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(section).toBeHidden();
 await page.goBack();await expect(result).toContainText('790 W');
});
test('1A chassis reference mobile keyboard and no-WebGL fallback',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return /webgl/.test(t)?null:old.call(this,t,...args);};});
 await page.goto('./#rtds-chapter-1a');
 await page.getByLabel('NovaCor 2.0 机箱数量').fill('-1');await expect(page.locator('#cabinet-chassis-result')).toHaveAttribute('data-status','invalid');
 await page.getByRole('button',{name:'错误例：把 GTNET 卡再加一次'}).click();
 await expect(page.locator('#cabinet-chassis-result')).toContainText('54 W');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await mkdir('screenshots',{recursive:true});await page.locator('#cabinet-chassis').screenshot({path:'screenshots/chapter-1a-chassis-mobile.png'});
});
