import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const mobile of [false,true])test(`connection-first entry ${mobile?'mobile reduced-motion no-WebGL':'desktop'} keeps references optional`,async({page})=>{
 if(mobile){await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return /webgl/.test(t)?null:old.call(this,t,...args);};});}
 await page.goto('./#rtds-chapter-1a');
 const focus=page.locator('#cabinet-wiring-focus'),aux=page.locator('#cabinet-auxiliary');
 await expect(focus).toBeVisible();await expect(aux).not.toHaveAttribute('open','');await expect(page.locator('#cabinet-environment')).toBeHidden();await expect(page.locator('#cabinet-dimensions')).toBeHidden();await expect(page.locator('#cabinet-components')).toBeHidden();
 await expect(focus).toContainText('GT 1–20');await expect(focus).toContainText('GT 21–24');await expect(focus).toContainText('采样/更新间隔不等于端到端延时');await expect(focus).toContainText('Cload = 30 pF');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await mkdir('screenshots',{recursive:true});await focus.screenshot({path:`screenshots/connection-first-${mobile?'mobile':'desktop'}.png`});
 await aux.locator(':scope > summary').focus();await page.keyboard.press('Enter');await expect(page.locator('#cabinet-components')).toBeVisible();
 await aux.locator(':scope > summary').focus();await page.keyboard.press('Enter');await expect(page.locator('#cabinet-components')).toBeHidden();
 for(const [name,hardware,group] of [['选 NovaCor 2.0，点击对应真实接口 ↗','novacor-2.0','gtio'],['查看 GTAI V2 输入端子与规格 ↗','gtai-v2','analogue_input'],['查看 GTAO V2 输出端子与规格 ↗','gtao-v2','analog_output'],['查看 GTDO V2 输出接口 ↗','gtdo-v2','digital_output']]){await focus.getByRole('link',{name}).click();await expect(page.locator(`[data-variant="${hardware}"]`)).toHaveAttribute('aria-pressed','true');const target=page.locator(`[data-group="${group}"]`);await expect(target).toBeFocused();await expect(target).toHaveAttribute('aria-pressed','true');await expect(target).toBeInViewport();await page.goBack();await expect(focus).toBeVisible();}
 await focus.getByRole('link',{name:'查看 GTAO V2 双卡供电接法 ↗'}).click();await expect(page.locator('[data-variant="gtao-v2"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#rtds-power-lesson')).toBeVisible();await expect(focus).toBeHidden();
 await page.goBack();await expect(focus).toBeVisible();await expect(page.locator('#rtds-power-lesson')).toBeHidden();await expect(aux).not.toHaveAttribute('open','');
 await focus.getByRole('link',{name:'查看 NovaCor 2.0 输出与测量 ↗'}).click();await expect(page.locator('[data-variant="novacor-2.0"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#rtds-analog-lesson')).toBeVisible();await page.goBack();await expect(focus).toBeVisible();await page.goForward();await expect(focus).toBeHidden();
});
