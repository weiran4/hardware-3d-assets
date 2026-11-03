import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
test('1A consolidated component identities, mismatch recovery, references and history',async({page})=>{
 await page.goto('./#rtds-chapter-1a');await page.locator('#cabinet-auxiliary > summary').click();
 const section=page.locator('#cabinet-components'),result=page.locator('#cabinet-component-result'),part=page.getByLabel('要辨识的部件'),answer=page.getByLabel('这类部件使用哪一种连接？');
 await expect(result).toHaveAttribute('data-status','unknown');
 await page.getByRole('button',{name:'正常例：4U 前板与前部螺钉'}).click();await expect(result).toHaveAttribute('data-status','match');await expect(page.locator('#cabinet-component-name')).toHaveText('前部 4U 空白面板');
 await page.getByRole('button',{name:'错误例：把门当成侧板'}).focus();await page.keyboard.press('Enter');await expect(result).toHaveAttribute('data-status','mismatch');await expect(result).toContainText('上、下锁销');
 await answer.selectOption('latches');await expect(result).toHaveAttribute('data-status','match');
 await part.selectOption('side');await expect(result).toHaveAttribute('data-status','unknown');await expect(page.locator('#cabinet-component-facts')).toContainText('完全移离侧板前');
 await answer.selectOption('quarter');await expect(result).toHaveAttribute('data-status','match');
 await section.locator('summary').click();await expect(section).toContainText('断路器正上方');await expect(section.locator('.cabinet-component-models>div')).toHaveCount(7);await expect(section).toContainText('HLG-100H-24B');
 await section.locator('summary').click();await page.getByRole('button',{name:'正常例：4U 前板与前部螺钉'}).click();await section.scrollIntoViewIfNeeded();await expect(page.locator('.rtds-pip')).toBeHidden();
 await expect(page.locator('#cabinet-supply-conflict')).toContainText('3.8 A');await expect(page.locator('#cabinet-supply-conflict')).toContainText('不是已核实的电源额定电流');
 await mkdir('screenshots',{recursive:true});await page.locator('#cabinet-supply-conflict').screenshot({path:'screenshots/chapter-1a-supply-conflict-'+(page.viewportSize().width<600?'mobile':'desktop')+'.png'});await section.screenshot({path:'screenshots/chapter-1a-components-desktop.png'});
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(section).toBeHidden();await page.goBack();await expect(section).toBeVisible();await expect(result).toHaveAttribute('data-status','match');await page.goForward();await expect(section).toBeHidden();await page.goBack();await expect(section).toBeVisible();
 await page.getByRole('button',{name:'重置辨识'}).click();await expect(result).toHaveAttribute('data-status','unknown');
 await page.locator('#cabinet-coverage summary').click();await expect(page.locator('#cabinet-coverage')).toContainText('16 feet / 4 m');await expect(page.locator('#cabinet-coverage')).toContainText('整章版本、来源和交互回归验收');
});
test('1A component mobile reduced-motion no-WebGL reference and mismatch recovery',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return /webgl/.test(t)?null:old.call(this,t,...args);};});
 await page.goto('./#rtds-chapter-1a');await page.locator('#cabinet-auxiliary > summary').click();const section=page.locator('#cabinet-components'),result=page.locator('#cabinet-component-result');
 await page.getByRole('button',{name:'错误例：把门当成侧板'}).click();await expect(result).toHaveAttribute('data-status','mismatch');
 await page.getByLabel('要辨识的部件').selectOption('front2');await expect(result).toHaveAttribute('data-status','unknown');await page.getByLabel('这类部件使用哪一种连接？').selectOption('screws');await expect(result).toHaveAttribute('data-status','match');
 await section.locator('summary').click();await expect(section).toContainText('RSEN-2020D');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.locator('#cabinet-supply-conflict')).toContainText('3.8 A');await expect(page.locator('#cabinet-supply-conflict')).toContainText('不是已核实的电源额定电流');
 await mkdir('screenshots',{recursive:true});await page.locator('#cabinet-supply-conflict').screenshot({path:'screenshots/chapter-1a-supply-conflict-'+(page.viewportSize().width<600?'mobile':'desktop')+'.png'});await section.screenshot({path:'screenshots/chapter-1a-components-mobile.png'});
});
