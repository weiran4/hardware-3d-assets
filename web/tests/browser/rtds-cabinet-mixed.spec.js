import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const mobile of [false,true])test(`1A mixed card revisions and heterogeneous lengths ${mobile?'mobile':'desktop'}`,async({page})=>{
 if(mobile){await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:old.call(this,type,...args);};});}
 await page.goto('./#rtds-chapter-1a');
 await page.locator('[data-preset=mixed]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#cabinet-left')).toContainText('31 / 100 W');
 await expect(page.locator('#cabinet-right-space')).toContainText('94.5 / 134 cm');
 await expect(page.getByLabel('左侧 GTDI V1.11 数量')).toHaveValue('1');
 await expect(page.getByLabel('右侧 GTDO V1.21 数量')).toHaveValue('1');
 await page.locator('[data-preset=legacy-space]').click();
 await expect(page.locator('#cabinet-left')).toContainText('60 / 100 W');
 await expect(page.locator('#cabinet-right')).toHaveAttribute('data-status','within');
 await expect(page.locator('#cabinet-left-space')).toContainText('余量 1.5 cm');
 await expect(page.locator('#cabinet-right-space')).toContainText('超出 8.5 cm');
 await page.getByLabel('左侧 GTDI V1.11 数量').fill('1.5');await expect(page.locator('#cabinet-left')).toHaveAttribute('data-status','invalid');
 await page.locator('[data-preset=mixed]').click();await expect(page.locator('#cabinet-left')).toHaveAttribute('data-status','within');
 const widths=await page.locator('[data-space-map=left] > span').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
 expect(widths).toHaveLength(4);expect(widths[2]).toBeGreaterThan(widths[0]);expect(widths[3]).toBeGreaterThan(widths[2]);expect(widths[2]/widths[0]).toBeCloseTo(266/197,2);expect(widths[3]/widths[0]).toBeCloseTo(285/197,2);
 await page.locator('[data-preset=normal]').click();await expect(page.getByLabel('左侧 GTDI V1.11 数量')).toHaveValue('0');await expect(page.getByLabel('右侧 GTDO V1.21 数量')).toHaveValue('0');
 await page.locator('[data-preset=legacy-space]').click();
 await page.locator('.cabinet-rails').scrollIntoViewIfNeeded();await expect(page.locator('.rtds-pip')).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await mkdir('screenshots',{recursive:true});await page.locator('.cabinet-rails').screenshot({path:`screenshots/chapter-1a-mixed-${mobile?'mobile':'desktop'}.png`});
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(page.locator('#cabinet-left')).toBeHidden();await page.goBack();await expect(page.locator('#cabinet-right-space')).toContainText('超出 8.5 cm');
});
