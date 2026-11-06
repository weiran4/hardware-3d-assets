import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const mobile of [false,true])test(`2B Light GBH and three IRC channels ${mobile?'mobile':'desktop'}`,async({page})=>{
 if(mobile){await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});}
 await page.goto('./#rtds-chapter-2b');
 const lesson=page.locator('#light-sync-unit'),out=page.locator('#light-sync-result');
 await expect(lesson).toBeVisible();await expect(out).toHaveAttribute('data-status','unknown');
 await page.locator('[data-light-sync-example="pair"]').focus();await page.keyboard.press('Enter');await expect(out).toHaveAttribute('data-status','match');await expect(out).toContainText('配置 #1');
 await page.locator('#light-sync-count').fill('3');await expect(out).toHaveAttribute('data-status','invalid');
 await page.locator('[data-light-sync-example="hub"]').click();await page.locator('#light-sync-count').fill('4');await expect(out).toHaveAttribute('data-status','match');
 await page.locator('#light-sync-count').fill('5');await expect(out).toHaveAttribute('data-status','invalid');await expect(page.locator('#light-sync-issues')).toContainText('IRC Switch');
 await page.locator('[data-light-sync-example="switch"]').click();await expect(out).toHaveAttribute('data-status','match');
 await page.locator('#light-sync-family').selectOption('legacy');await expect(out).toHaveAttribute('data-status','invalid');await expect(page.locator('#light-sync-issues')).toContainText('PB5');
 await page.locator('#light-sync-family').selectOption('novacor');await expect(out).toHaveAttribute('data-status','match');
 await page.locator('#light-sync-files').uncheck();await expect(out).toHaveAttribute('data-status','unknown');await page.locator('#light-sync-files').check();
 for(const example of ['missing','wrong-p2p']){await page.locator(`[data-light-sync-example="${example}"]`).click();await expect(out).toHaveAttribute('data-status','invalid');}
 await page.locator('[data-light-sync-example="switch"]').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await mkdir('screenshots',{recursive:true});await lesson.screenshot({path:`screenshots/chapter-2b-sync-${mobile?'mobile':'desktop'}.png`});
 await page.locator('[data-light-sync-example="reset"]').click();await expect(out).toHaveAttribute('data-status','unknown');await expect(page.locator('#light-sync-files')).not.toBeChecked();
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(lesson).toBeHidden();await page.goBack();await expect(lesson).toBeVisible();await page.goForward();await expect(lesson).toBeHidden();
});
