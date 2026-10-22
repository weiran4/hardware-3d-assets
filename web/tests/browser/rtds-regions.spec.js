import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {renderedFrame,imageDifference,canvasChromeRegions} from './rtds-test-helpers.js';

test.setTimeout(120000);
const white='rgb(255, 255, 255)',navy='rgb(10, 34, 64)',red='rgb(228, 27, 72)';
async function loaded(page,width){
 await page.setViewportSize({width,height:900});await page.goto('./#rtds');
 await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await page.locator('[data-variant="novacor-2.0"]').click();
 await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','novacor-2.0-2023');
 await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
}
async function shot(page,name){
 // Settled region pictures must wait for reparenting/ResizeObserver and the new
 // compositor frame. This does not affect deliberately immediate held-drag tests.
 if(await page.locator('#rtds-scene').getAttribute('data-loaded')==='true'){
  await renderedFrame(page);
  if(await page.locator('.rtds-pip').isVisible())await expect.poll(async()=>{
   const box=await page.locator('#rtds-scene canvas').boundingBox(),png=await page.screenshot({clip:box});
   return (await imageDifference(page,png,png,{ignore:await canvasChromeRegions(page)})).darkFraction;
  },{message:'settled PiP screenshot contains real hardware, not a resized blank buffer'}).toBeGreaterThan(.01);
 }
 await mkdir('screenshots',{recursive:true});await page.screenshot({path:`screenshots/rtds-regions-${name}.png`,fullPage:false});
}
async function hierarchy(page,width){
 await expect(page.getByRole('complementary',{name:'选择版本'})).toHaveCount(1);
 for(const name of ['选择版本','接口巡览','用途与参数'])await expect(page.getByRole('heading',{name,exact:true,level:3})).toHaveCount(1);
 await expect(page.getByRole('region',{name:'3D 模型观察 NovaCor 2.0',exact:true})).toHaveCount(1);
 await expect(page.getByRole('region',{name:'接口巡览',exact:true})).toHaveCount(1);
 await expect(page.getByRole('region',{name:'用途与参数',exact:true})).toHaveCount(1);
 await expect(page.locator('#rtds-viewer-region > .rtds-model-head')).toHaveCount(1);
 await expect(page.locator('#rtds-viewer-region > .rtds-viewer-layout > .rtds-pip-slot')).toHaveCount(1);
 await expect(page.locator('#rtds-viewer-region > .rtds-camera')).toHaveCount(1);
 await expect(page.locator('#rtds-interface-region #rtds-group-list')).toHaveCount(1);
 await expect(page.locator('#rtds-interface-region #rtds-detail')).toHaveCount(0);
 for(const selector of ['.rtds-library','#rtds-viewer-region','#rtds-interface-region','#rtds-detail']){
  const region=page.locator(selector);await expect(region).toHaveCSS('background-color',white);await expect(region).toHaveCSS('border-radius','10px');
  const border=await region.evaluate(n=>{const s=getComputedStyle(n);return ['Top','Right','Bottom','Left'].map(side=>({width:parseFloat(s[`border${side}Width`]),style:s[`border${side}Style`]}));});
  expect(border[0].width).toBe(3);for(const side of border){expect(side.width).toBeGreaterThanOrEqual(1);expect(side.style).toBe('solid');}
 }
 for(const heading of ['#rtds-library-heading','#rtds-interfaces-heading','#rtds-details-heading']){
  await expect(page.locator(heading)).toHaveCSS('font-size','18px');await expect(page.locator(heading)).toHaveCSS('font-weight','700');
 }
 await expect(page.locator('#rtds-interfaces-heading .rtds-region-number')).toHaveCSS('background-color',navy);
 await expect(page.locator('#rtds-details-heading .rtds-region-number')).toHaveCSS('background-color',red);
 const layout=await page.evaluate(()=>{
  const rect=selector=>{const n=document.querySelector(selector),r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};};
  return {library:rect('.rtds-library'),inspection:rect('.rtds-inspection'),regions:['#rtds-viewer-region','#rtds-interface-region','#rtds-detail'].map(rect)};
 });
 for(const region of layout.regions){expect(Math.abs(region.left-layout.inspection.left)).toBeLessThan(1);expect(Math.abs(region.right-layout.inspection.right)).toBeLessThan(1);}
 for(let i=1;i<layout.regions.length;i++)expect(layout.regions[i].top-layout.regions[i-1].bottom).toBe(20);
 if(width>800){expect(layout.inspection.left-layout.library.right).toBe(20);expect(Math.abs(layout.library.top-layout.regions[0].top)).toBeLessThan(1);}
 else expect(layout.regions[0].top-layout.library.bottom).toBe(20);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
}

test('desktop catalog and 3D/02/03 are independently framed, named full-width regions',async({page})=>{
 for(const width of [1440,1366,1024]){
  await loaded(page,width);await hierarchy(page,width);await page.evaluate(()=>scrollTo(0,0));await shot(page,`overview-${width}`);
  await page.locator('[data-group="aurora"]').focus();await page.keyboard.press('Enter');
  await expect(page.locator('[data-group="aurora"]')).toBeFocused();await expect(page.locator('[data-group="aurora"]')).toHaveCSS('outline-color',red);
  const focus=await page.locator('[data-group="aurora"]').evaluate(n=>{const r=n.getBoundingClientRect(),p=n.closest('.rtds-region').getBoundingClientRect(),s=getComputedStyle(n),extent=parseFloat(s.outlineWidth)+parseFloat(s.outlineOffset);return {left:r.left-extent,right:r.right+extent,top:r.top-extent,bottom:r.bottom+extent,panel:{left:p.left,right:p.right,top:p.top,bottom:p.bottom}};});
  expect(focus.left).toBeGreaterThanOrEqual(focus.panel.left);expect(focus.right).toBeLessThanOrEqual(focus.panel.right);expect(focus.top).toBeGreaterThanOrEqual(focus.panel.top);expect(focus.bottom).toBeLessThanOrEqual(focus.panel.bottom);
  await expect(page.locator('#rtds-detail-title')).toHaveText('GT 21–24 · Aurora');
  await expect(page.locator('#rtds-detail')).toHaveAccessibleDescription('GT 21–24 · Aurora');
  await expect(page.locator('.rtds-context-label')).toHaveText('当前查看');
  await page.locator('#rtds-interface-region').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));await shot(page,`choices-and-parameters-${width}`);
 }
});

test('mobile keeps separate white functional panels, readable headings and all controls in bounds',async({page})=>{
 for(const width of [800,390,320]){
  await loaded(page,width);await hierarchy(page,width);await page.locator('[data-group="gbh"]').click();
  await expect(page.locator('#rtds-detail-copy')).toHaveCSS('font-size','16px');
  const controls=await page.locator('.rtds-tour-row button,.rtds-camera button,.rtds-group').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),p=n.closest('.rtds-region').getBoundingClientRect();return {left:r.left,right:r.right,containerLeft:p.left,containerRight:p.right,height:r.height};}));
  for(const button of controls){expect(button.left).toBeGreaterThanOrEqual(button.containerLeft);expect(button.right).toBeLessThanOrEqual(button.containerRight);expect(button.height).toBeGreaterThanOrEqual(40);}
  await page.locator('.rtds-library').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));await shot(page,`catalog-and-viewer-${width}`);
  await page.locator('#rtds-interface-region').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));await shot(page,`choices-and-parameters-${width}`);
 }
});

test('the framed 3D region retains the same source slot and canvas through PiP and reference transitions',async({page})=>{
 await loaded(page,1440);
 await page.evaluate(()=>{window.__regionCanvas=document.querySelector('#rtds-scene canvas');window.__regionSlot=document.querySelector('#rtds-viewer-region > .rtds-viewer-layout > .rtds-pip-slot');});
 const originalHeight=await page.locator('#rtds-viewer-region').evaluate(n=>n.getBoundingClientRect().height);
 await page.locator('#rtds-detail').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));await expect(page.locator('.rtds-pip')).toBeVisible();
 expect(await page.evaluate(()=>document.querySelector('.rtds-pip canvas')===window.__regionCanvas&&document.querySelector('#rtds-viewer-region > .rtds-viewer-layout > .rtds-pip-slot')===window.__regionSlot)).toBe(true);
 expect(await page.locator('#rtds-viewer-region').evaluate(n=>n.getBoundingClientRect().height)).toBe(originalHeight);
 await page.locator('[data-pip-action="return"]').click();await expect(page.locator('.rtds-pip')).toBeHidden();
 expect(await page.evaluate(()=>document.querySelector('#rtds-viewer-region canvas')===window.__regionCanvas)).toBe(true);
 await page.locator('.rtds-catalog-item:not(.modeled)').first().click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');
 await expect(page.locator('#rtds-viewer-region #rtds-reference-placeholder')).toBeVisible();
 await expect(page.getByRole('heading',{name:'接口巡览',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'用途与参数',exact:true})).toBeVisible();
 await expect(page.locator('.rtds-pip')).toBeHidden();await shot(page,'reference-regions');
});
