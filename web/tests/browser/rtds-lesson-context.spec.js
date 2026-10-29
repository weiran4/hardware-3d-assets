import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const lessonIds={analog:'#rtds-analog-lesson',power:'#rtds-power-lesson',cabinet:'#rtds-chapter-1a'};
async function only(page,key){for(const [id,selector]of Object.entries(lessonIds))await expect(page.locator(selector))[id===key?'toBeVisible':'toBeHidden']();}
async function selected(page,id){await expect(page.locator(`[data-variant="${id}"]`)).toHaveAttribute('aria-pressed','true');}

test('initial markup and implicit hardware selection never expose a global lesson stack',async({page,request})=>{
 const html=await(await request.get('./')).text();for(const id of Object.values(lessonIds))expect(html).toMatch(new RegExp('id="'+id.slice(1)+'" hidden'));
 await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await only(page,null);await expect(page.locator('#rtds-teaching')).toBeHidden();
 expect(await page.locator('#rtds-teaching').evaluate(n=>!!n.closest('.rtds-workbench'))).toBe(true);
 await page.locator('[data-variant="novacor-2.0"]').focus();await page.keyboard.press('Enter');await only(page,'analog');await selected(page,'novacor-2.0');
 await page.locator('#rtds-open-teaching').click();await expect(page.locator('#analog-heading')).toBeFocused();
 await page.locator('[data-variant="novacor-light"]').click();await only(page,null);await expect(page.locator('#rtds-teaching')).toBeHidden();
});

test('hardware changes stop hidden playback and back-forward restores exact teaching context',async({page})=>{
 await page.goto('./#rtds-analog');await expect(page.locator('#analog-model-scene')).toHaveAttribute('data-loaded','true');await page.locator('#analog-play').click();await expect(page.locator(lessonIds.analog)).toHaveAttribute('data-playing','true');
 await page.locator('[data-variant="gtdi-v2"]').click();await selected(page,'gtdi-v2');await only(page,'power');await expect(page.locator(lessonIds.analog)).toHaveAttribute('data-playing','false');await expect(page.locator('#rtds-teaching-version')).toContainText('GTAO V2 双卡与 Cubicle V1');
 const elapsed=await page.locator(lessonIds.analog).getAttribute('data-elapsed');await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.locator(lessonIds.analog)).toHaveAttribute('data-elapsed',elapsed);
 await page.locator('[data-variant="cubicle-v2"]').click();await only(page,'cabinet');await selected(page,'cubicle-v2');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');
 await page.goBack();await selected(page,'gtdi-v2');await only(page,'power');await page.goBack();await selected(page,'novacor-2.0');await only(page,'analog');await expect(page.locator(lessonIds.analog)).toHaveAttribute('data-playing','false');
 await page.goForward();await selected(page,'gtdi-v2');await only(page,'power');
 for(const id of ['novacor-light','cubicle-v2','novacor-2.0','gtdi-v2','novacor-light']){await page.locator(`[data-variant="${id}"]`).click();await selected(page,id);}
 await only(page,null);expect(await page.locator('[id]').evaluateAll(ns=>new Set(ns.map(n=>n.id)).size===ns.length)).toBe(true);
});

test('legacy lesson links route the matching hardware and mobile layout stays contained',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 for(const [hash,hardware,lesson]of [['#rtds-analog-lesson','novacor-2.0','analog'],['#rtds-power','gtao-v2','power'],['#rtds-power-lesson','gtao-v2','power'],['#rtds-chapter-1a','cubicle-v2','cabinet']]){await page.goto('./'+hash);await selected(page,hardware);await only(page,lesson);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await mkdir('screenshots',{recursive:true});await page.locator('#rtds-teaching').screenshot({path:'screenshots/context-cabinet-mobile.png'});
 await page.getByRole('link',{name:'已有真实模型：GTIO 供电演示 ↗'}).click();await selected(page,'gtao-v2');await only(page,'power');
});

test('late analog loading cannot wake hidden teaching after an incompatible hardware selection',async({page})=>{
 await page.goto('./');let release,seen;const held=new Promise(r=>release=r),requested=new Promise(r=>seen=r);
 await page.route('**/assets/rtds/novacor-2.0-2023.glb',async route=>{seen();await held;await route.continue();});
 await page.locator('#mode-rtds').click();await page.locator('[data-variant="novacor-2.0"]').click();await requested;await expect(page.locator('#analog-model-scene')).toHaveAttribute('data-loaded','loading');
 await page.locator('[data-variant="novacor-light"]').click();await selected(page,'novacor-light');await only(page,null);release();await expect(page.locator('#analog-model-scene')).toHaveAttribute('data-loaded','true');
 const frames=await page.locator('#analog-model-scene').getAttribute('data-frames');await page.waitForTimeout(250);await expect(page.locator('#analog-model-scene')).toHaveAttribute('data-frames',frames);await expect(page.locator(lessonIds.analog)).toHaveAttribute('data-playing','false');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');
});
