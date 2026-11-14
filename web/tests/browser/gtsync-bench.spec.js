import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const width of [1200,390])test(`course33 external reference 3D ${width}`,async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width,height:1000});await page.goto('./#rtds-presentation-33');
 const bench=page.locator('.gtsync-bench'),stage=bench.locator('.sync-stage'),pick=k=>bench.locator(`[data-sync="${k}"]`);
 await expect(bench).toBeVisible();await expect(stage).toHaveAttribute('data-loaded','true');
 expect(Number(await stage.getAttribute('data-triangles'))).toBeGreaterThan(1000);
 expect(await stage.locator('canvas').evaluate(c=>!!c.getContext('webgl2'))).toBe(true);
 await expect(bench).toHaveAttribute('data-status','ready');
 await bench.locator('[data-sync-event="loss"]').click();await expect(bench).toHaveAttribute('data-status','lost');await expect(bench.locator('.sync-status')).not.toContainText('overflow');await bench.locator('[data-sync-event="restore"]').click();
 await pick('holdover').uncheck();await bench.locator('[data-sync-event="acquire"]').click();await bench.locator('[data-sync-event="loss"]').click();await expect(bench.locator('.sync-status')).toContainText('overflow');const stopFrame=Number(await stage.getAttribute('data-frames'));await bench.locator('[data-sync-step]').click();await expect.poll(async()=>Number(await stage.getAttribute('data-frames'))).toBeGreaterThan(stopFrame);await expect(stage).toHaveAttribute('data-sim-phase','0.0000');await pick('configured').uncheck();await expect(bench).toHaveAttribute('data-status','unconfigured');await pick('configured').check();await expect(bench.locator('.sync-status')).not.toContainText('overflow');await bench.locator('[data-sync-event="restore"]').click();await pick('holdover').check();

 await bench.locator('[data-sync-event="acquire"]').focus();await page.keyboard.press('Enter');await expect(bench).toHaveAttribute('data-status','locked');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await stage.scrollIntoViewIfNeeded();await mkdir('screenshots',{recursive:true});await stage.screenshot({path:`screenshots/gtsync-p33-${width}.png`});await bench.screenshot({path:`screenshots/gtsync-p33-full-${width}.png`});
 await bench.locator('[data-sync-event="loss"]').click();await expect(bench).toHaveAttribute('data-status','holdover');
 await bench.locator('[data-sync-event="restore"]').click();
 await pick('host').selectOption('gtio');await expect(bench).toHaveAttribute('data-status','miswired');await expect(stage).toHaveAttribute('data-links',/N.GT1/);
 await pick('host').selectOption('dedicated');await pick('input').selectOption('st-time');await pick('medium').selectOption('st-ethernet-fiber');await expect(bench).toHaveAttribute('data-status','miswired');await expect(stage).toHaveAttribute('data-links',/G.st-time/);await pick('input').selectOption('bnc');await pick('medium').selectOption('ethernet');await expect(bench).toHaveAttribute('data-status','miswired');
 await pick('medium').selectOption('coax');await pick('source').selectOption('ptp');await pick('input').selectOption('rj45');await pick('medium').selectOption('ethernet');await bench.locator('[data-sync-event="acquire"]').click();await expect(bench).toHaveAttribute('data-status','locked');
 await bench.locator('[data-sync-play]').click();await expect(bench).toHaveAttribute('data-playing','true');await expect(bench.locator('[data-sync-play]')).toHaveText('暂停');
 await page.evaluate(()=>{location.hash='#rtds-presentation-32';});await expect(bench).toBeHidden();await expect(bench).toHaveAttribute('data-playing','false');await page.goBack();await expect(bench).toBeVisible();await expect(stage).toHaveAttribute('data-loaded','true');
 await page.emulateMedia({reducedMotion:'reduce'});await expect(bench.locator('[data-sync-play]')).toBeDisabled();await bench.locator('[data-sync-step]').click();await expect(bench.locator('.sync-phase')).toContainText('示意');
 await stage.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(stage).toHaveAttribute('data-loaded','false');await expect(bench.locator('[data-sync-play]')).toBeDisabled();await bench.locator('[data-sync-retry]').click();await expect(stage).toHaveAttribute('data-loaded','true');await expect(stage.locator('canvas')).toHaveCount(1);
 await bench.getByText('GT 主机链路补偿算术',{exact:true}).click();await bench.locator('[data-sync-length]').fill('20');await expect(bench.locator('.sync-skew')).toContainText('850 ns');await bench.locator('[data-sync-correction]').fill('500');await expect(bench.locator('.sync-correction')).toContainText('更晚');await bench.locator('[data-sync-correction]').fill('-500');await expect(bench.locator('.sync-correction')).toContainText('更早');
 await page.evaluate(()=>{location.hash='#rtds-chapter-2a';});await expect(bench).toBeHidden();await page.goBack();await expect(bench).toBeVisible();await expect(stage.locator('canvas')).toHaveCount(1);
});
