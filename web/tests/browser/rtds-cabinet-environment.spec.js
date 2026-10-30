import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
test('1A environmental conditions are independent assumptions with keyboard recovery and contextual history',async({page})=>{
 await page.goto('./#rtds-chapter-1a');
 const result=page.locator('#cabinet-env-result');
 await expect(result).toHaveAttribute('data-status','unknown');
 await expect(page.locator('#cabinet-left')).toContainText('30 / 100 W');
 await expect(page.locator('#cabinet-left-space')).toContainText('39.4');
 await page.locator('[data-env-preset=normal]').focus();await page.keyboard.press('Enter');
 await expect(result).toHaveAttribute('data-status','within');
 for(const name of ['lower','upper']){await page.locator(`[data-env-preset=${name}]`).click();await expect(result).toHaveAttribute('data-status','within');}
 await page.locator('[data-env-preset=condensation]').click();
 await expect(result).toHaveAttribute('data-status','outside');
 await expect(page.locator('#cabinet-env-temperature-result')).toHaveAttribute('data-status','within');
 await expect(page.locator('#cabinet-env-humidity-result')).toHaveAttribute('data-status','within');
 await expect(page.locator('#cabinet-env-condensation-result')).toHaveAttribute('data-status','outside');
 await page.locator('#cabinet-env-temperature').fill('');await expect(result).toHaveAttribute('data-status','invalid');
 await expect(page.locator('#cabinet-env-temperature')).toHaveAttribute('aria-invalid','true');
 await page.locator('[data-env-preset=normal]').click();await expect(page.locator('#cabinet-env-temperature')).toHaveAttribute('aria-invalid','false');await page.locator('#cabinet-env-humidity').fill('101');await expect(result).toHaveAttribute('data-status','invalid');
 await page.locator('[data-env-preset=normal]').click();await page.locator('#cabinet-env-cleanliness').selectOption('unknown');await expect(result).toHaveAttribute('data-status','unknown');
 await page.locator('#cabinet-env-cleanliness').selectOption('not-clean');await expect(result).toHaveAttribute('data-status','outside');
 await page.locator('[data-env-preset=condensation]').click();
 await expect(page.locator('#cabinet-left')).toContainText('30 / 100 W');
 await expect(page.locator('#cabinet-light-state')).toContainText('内部灯条：OFF');
 await page.locator('#cabinet-environment').scrollIntoViewIfNeeded();await expect(page.locator('.rtds-pip')).toBeHidden();
 await mkdir('screenshots',{recursive:true});await page.locator('#cabinet-environment').screenshot({path:'screenshots/chapter-1a-environment-desktop.png'});
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(result).toBeHidden();await page.goBack();await expect(result).toHaveAttribute('data-status','outside');await expect(result).toBeVisible();
});
test('1A environment checker remains usable on mobile reduced motion without WebGL',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:old.call(this,type,...args);};});
 await page.goto('./#rtds-chapter-1a');await page.locator('[data-env-preset=normal]').click();
 await page.locator('#cabinet-env-temperature').fill('31');await expect(page.locator('#cabinet-env-temperature-result')).toHaveAttribute('data-status','outside');
 await page.locator('[data-env-preset=normal]').click();await expect(page.locator('#cabinet-env-result')).toHaveAttribute('data-status','within');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await mkdir('screenshots',{recursive:true});await page.locator('#cabinet-environment').screenshot({path:'screenshots/chapter-1a-environment-mobile.png'});
});
