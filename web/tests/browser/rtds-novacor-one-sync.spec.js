import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
for(const mode of ['desktop','mobile','fallback'])test(`2C multi-unit and legacy checker ${mode}`,async({page})=>{
 test.setTimeout(60000);
 if(mode!=='desktop'){await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});}
 if(mode==='fallback')await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return /webgl/.test(t)?null:old.call(this,t,...args);};});
 await page.goto('./#rtds-chapter-2c');const root=page.locator('#one-sync-lesson'),out=page.locator('#one-sync-result');await expect(root).toBeVisible();await expect(out).toHaveAttribute('data-status','unknown');
 const example=key=>page.locator(`[data-one-sync-example="${key}"]`);
 await example('pair').focus();await page.keyboard.press('Enter');await expect(out).toHaveAttribute('data-status','match');await expect(page.locator('#one-sync-path-view')).toContainText('GBH');await expect(page.locator('#one-sync-data-view')).toContainText('IRC');
 await example('hub').click();await page.locator('#one-sync-count').fill('7');await expect(out).toHaveAttribute('data-status','match');await page.locator('#one-sync-count').fill('8');await expect(out).toHaveAttribute('data-status','invalid');await expect(page.locator('#one-sync-issues')).toContainText('七台');
 await page.locator('#one-sync-data').selectOption('switch');await expect(out).toHaveAttribute('data-status','match');
 await example('switch').click();await expect(out).toHaveAttribute('data-status','match');
 await example('hub').click();await page.locator('#one-sync-family').selectOption('legacy');await page.locator('#one-sync-legacy-step').check();await page.locator('#one-sync-count').fill('7');await expect(out).toHaveAttribute('data-status','match');await page.locator('#one-sync-count').fill('8');await expect(out).toHaveAttribute('data-status','invalid');
 await example('legacy').click();await expect(out).toHaveAttribute('data-status','match');await expect(page.locator('#one-sync-data-view')).toContainText('GTWIF');await page.locator('#one-sync-protocol').selectOption('b');await expect(out).toHaveAttribute('data-status','invalid');await page.locator('#one-sync-protocol').selectOption('a');await page.locator('#one-sync-legacy-step').uncheck();await expect(out).toHaveAttribute('data-status','unknown');
 await example('legacy-small').click();await expect(out).toHaveAttribute('data-status','invalid');await expect(page.locator('#one-sync-issues')).toContainText('小时间步');await example('legacy').click();await expect(out).toHaveAttribute('data-status','match');
 for(const key of ['missing','wrong-p2p']){await example(key).click();await expect(out).toHaveAttribute('data-status','invalid');}
 await example('reset').click();await expect(out).toHaveAttribute('data-status','unknown');await example('hub').click();await page.locator('#one-sync-count').fill('');await expect(out).toHaveAttribute('data-status','invalid');await expect(page.locator('#one-sync-count')).toHaveAttribute('aria-invalid','true');await example('legacy').click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect((await page.locator('#one-sync-family').boundingBox()).height).toBeGreaterThanOrEqual(44);
 await mkdir('screenshots',{recursive:true});await root.screenshot({path:`screenshots/chapter-2c-sync-${mode}.png`});
 await page.locator('#rtds-chapter-2c a[href="#rtds-chapter-2b"]').click();await expect(root).toBeHidden();await page.goBack();await expect(root).toBeVisible();await expect(out).toHaveAttribute('data-status','match');await page.goForward();await expect(root).toBeHidden();await page.goBack();
 for(const variant of ['novacor-2.0','novacor-1.0','novacor-light','novacor-1.0']){await page.locator(`[data-variant="${variant}"]`).click();await expect(root)[variant==='novacor-1.0'?'toBeVisible':'toBeHidden']();}
 expect(await page.locator('[id]').evaluateAll(a=>a.length===new Set(a.map(n=>n.id)).size)).toBe(true);await expect(page.locator('#rtds-analog-lesson')).toHaveAttribute('data-playing','false');
});
