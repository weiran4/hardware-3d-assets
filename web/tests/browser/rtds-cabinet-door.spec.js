import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
test('1A door sequence rejects skipped latches and supports repeat and contextual history',async({page})=>{
 await page.goto('./#rtds-chapter-1a');await page.locator('#cabinet-auxiliary > summary').click();const section=page.locator('#cabinet-door'),state=page.locator('#cabinet-door-state'),feedback=page.locator('#cabinet-door-feedback');
 await expect(state).toHaveAttribute('data-phase','closed');
 await page.locator('[data-door-action=remove]').click();await expect(feedback).toHaveAttribute('data-status','blocked');await expect(state).toHaveAttribute('data-phase','closed');
 for(const [action,phase] of [['open','open'],['release','released'],['remove','detached'],['seat','seated'],['align','aligned'],['secure','secured']]){await page.locator(`[data-door-action=${action}]`).focus();await page.keyboard.press('Enter');await expect(state).toHaveAttribute('data-phase',phase);}
 await expect(state).toContainText('教学复位序列完成');await expect(section).toContainText('不证明真实门已装牢');
 await page.locator('[data-door-action=reset]').click();await page.locator('[data-door-action=open]').click();await page.locator('[data-door-action=release]').click();
 await section.scrollIntoViewIfNeeded();await expect(page.locator('.rtds-pip')).toBeHidden();await mkdir('screenshots',{recursive:true});await section.screenshot({path:'screenshots/chapter-1a-door-desktop.png'});
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(section).toBeHidden();await page.goBack();await expect(state).toHaveAttribute('data-phase','released');
 await page.locator('[data-door-action=reset]').click();await expect(state).toHaveAttribute('data-phase','closed');
});
test('1A door mobile no-WebGL reduced motion and wrong reinstall order',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return /webgl/.test(t)?null:old.call(this,t,...args);};});
 await page.goto('./#rtds-chapter-1a');await page.locator('#cabinet-auxiliary > summary').click();for(const action of ['open','release','remove'])await page.locator(`[data-door-action=${action}]`).click();
 await page.locator('[data-door-action=secure]').click();await expect(page.locator('#cabinet-door-feedback')).toHaveAttribute('data-status','blocked');await expect(page.locator('#cabinet-door-state')).toHaveAttribute('data-phase','detached');
 expect(await page.locator('.door-sheet').evaluate(e=>getComputedStyle(e).transitionDuration)).toBe('0s');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await mkdir('screenshots',{recursive:true});await page.locator('#cabinet-door').screenshot({path:'screenshots/chapter-1a-door-mobile.png'});
 await page.locator('[data-door-action=reset]').click();await expect(page.locator('#cabinet-door-state')).toHaveAttribute('data-phase','closed');
});
