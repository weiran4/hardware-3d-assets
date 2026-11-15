import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const width of [1200,390])test('course35 UDP 3D '+width,async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width,height:1000});await page.goto('./#rtds-presentation-35');
 const b=page.locator('.udp-bench'),s=b.locator('.udp-stage'),pick=k=>b.locator('[data-udp="'+k+'"]');
 await expect(b).toBeVisible();await expect(s).toHaveAttribute('data-loaded','true');expect(Number(await s.getAttribute('data-triangles'))).toBeGreaterThan(1000);
 await expect(b).toHaveAttribute('data-status','disconnected');await b.locator('[data-udp-port=udp]').click();
 await b.locator('[data-udp-connect]').focus();await page.keyboard.press('Enter');await expect(b).toHaveAttribute('data-status','ready');await expect(s).toHaveAttribute('data-links',/N.udp/);
 for(const k of ['configured','unique']){await pick(k).uncheck();await expect(b).toHaveAttribute('data-status','blocked');await expect(b.locator('.udp-direction')).toContainText('无数据传输');await pick(k).check();}
 await pick('medium').selectOption('fiber');await expect(b).toHaveAttribute('data-status','blocked');await pick('medium').selectOption('ethernet');
 for(const port of ['wif','gt21']){await pick('port').selectOption(port);await expect(b).toHaveAttribute('data-status','blocked');}await pick('port').selectOption('udp');
 await pick('topology').selectOption('switch');await b.locator('[data-udp-connect]').click();await expect(b).toHaveAttribute('data-status','disconnected');await b.locator('[data-udp-second]').click();await expect(b).toHaveAttribute('data-status','ready');await expect(s).toHaveAttribute('data-wires','2');
 await pick('mode').selectOption('duplex');await expect(b).toHaveAttribute('data-status','blocked');await pick('receiver').check();await expect(b).toHaveAttribute('data-status','ready');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await mkdir('screenshots',{recursive:true});await s.screenshot({path:'screenshots/udp-p35-'+width+'.png'});await b.screenshot({path:'screenshots/udp-p35-full-'+width+'.png'});
 await b.locator('[data-udp-play]').click();await expect(b).toHaveAttribute('data-playing','true');await b.locator('[data-udp-second]').click();await expect(b).toHaveAttribute('data-playing','false');await expect(b).toHaveAttribute('data-status','disconnected');await b.locator('[data-udp-second]').click();
 await b.locator('[data-udp-play]').click();await page.evaluate(()=>location.hash='#rtds-presentation-34');await expect(b).toBeHidden();await expect(b).toHaveAttribute('data-playing','false');await page.waitForTimeout(150);const stopped=await s.getAttribute('data-frames');await page.waitForTimeout(150);await expect(s).toHaveAttribute('data-frames',stopped);await page.goBack();await expect(b).toBeVisible();await page.goForward();await expect(b).toBeHidden();await page.goBack();await expect(b).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await expect(b.locator('[data-udp-play]')).toBeDisabled();await b.locator('[data-udp-step]').click();
 await s.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(s).toHaveAttribute('data-loaded','false');await b.locator('[data-udp-retry]').click();await expect(s).toHaveAttribute('data-loaded','true');await expect(s.locator('canvas')).toHaveCount(1);
});
