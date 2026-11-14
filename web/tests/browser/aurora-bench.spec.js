import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const width of [1200,390])test('course34 Aurora 3D '+width,async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width,height:1000});await page.goto('./#rtds-presentation-34');
 const b=page.locator('.aurora-bench'),s=b.locator('.aurora-stage'),pick=k=>b.locator('[data-aurora="'+k+'"]');
 await expect(b).toBeVisible();await expect(s).toHaveAttribute('data-loaded','true');expect(Number(await s.getAttribute('data-triangles'))).toBeGreaterThan(1000);
 await expect(b).toHaveAttribute('data-status','disconnected');
 await b.locator('[data-aurora-port=gt24]').click();await expect(pick('port')).toHaveValue('gt24');
 await b.locator('[data-aurora-connect]').focus();await page.keyboard.press('Enter');await expect(b).toHaveAttribute('data-status','ready');await expect(s).toHaveAttribute('data-links',/N.gt24/);
 for(const k of ['licensed','compatible']){await pick(k).uncheck();await expect(b).toHaveAttribute('data-status','blocked');await pick(k).check();}
 await pick('medium').selectOption('ethernet');await expect(b).toHaveAttribute('data-status','blocked');await pick('medium').selectOption('fiber');
 await pick('port').selectOption('gt1');await expect(b).toHaveAttribute('data-status','blocked');await pick('port').selectOption('gt21');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await mkdir('screenshots',{recursive:true});await s.screenshot({path:'screenshots/aurora-p34-'+width+'.png'});await b.screenshot({path:'screenshots/aurora-p34-full-'+width+'.png'});
 await b.locator('[data-aurora-play]').click();await expect(b).toHaveAttribute('data-playing','true');
 await page.evaluate(()=>location.hash='#rtds-presentation-33');await expect(b).toBeHidden();await expect(b).toHaveAttribute('data-playing','false');await page.goBack();await expect(b).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await expect(b.locator('[data-aurora-play]')).toBeDisabled();await b.locator('[data-aurora-step]').click();
 await s.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(s).toHaveAttribute('data-loaded','false');await b.locator('[data-aurora-retry]').click();await expect(s).toHaveAttribute('data-loaded','true');await expect(s.locator('canvas')).toHaveCount(1);
});
