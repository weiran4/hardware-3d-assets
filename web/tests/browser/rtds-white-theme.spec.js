import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const white='rgb(255, 255, 255)',red='rgb(228, 27, 72)',navy='rgb(10, 34, 64)',stage='rgb(237, 243, 239)',chrome='rgb(243, 246, 250)',selected='rgb(255, 241, 244)';
test.setTimeout(120000);
async function shot(page,name){await mkdir('screenshots',{recursive:true});await page.screenshot({path:`screenshots/rtds-polish-${name}.png`,fullPage:false});}
async function surfaces(page,selectors){for(const selector of selectors)await expect(page.locator(selector).first(),selector).toHaveCSS('background-color',white);}
async function stages(page,selectors){for(const selector of selectors){const n=page.locator(selector).first();await expect(n,selector).toHaveCSS('background-color',stage);expect(await n.evaluate(n=>getComputedStyle(n).backgroundImage),`${selector}: fine decorative grid`).toContain('linear-gradient');expect(await n.evaluate(n=>getComputedStyle(n).backgroundSize.split(',').every(size=>size.trim()==='24px 24px')),`${selector}: each grid layer stays 24px`).toBe(true);}}
async function pixels(page,selector,{backgroundVisible=true}={}){
 const canvas=page.locator(selector);await canvas.scrollIntoViewIfNeeded();
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const png=await canvas.screenshot();
 const result=await page.evaluate(async base64=>{
  const image=new Image();image.src=`data:image/png;base64,${base64}`;await image.decode();
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
  const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;
  let stage=0,dark=0;for(let i=0;i<data.length;i+=4){if(Math.abs(data[i]-237)<=2&&Math.abs(data[i+1]-243)<=2&&Math.abs(data[i+2]-239)<=2&&data[i+3]===255)stage++;if(Math.max(data[i],data[i+1],data[i+2])<180&&data[i+3]>200)dark++;}
  return {stage:stage/(c.width*c.height),dark:dark/(c.width*c.height)};
 },png.toString('base64'));
 if(backgroundVisible)expect(result.stage,`${selector}: real composited pale-green stage pixels`).toBeGreaterThan(.15);
 expect(result.dark,`${selector}: real hardware remains rendered`).toBeGreaterThan(.01);
}

test('white-body UI, colored chrome and rounded controls stay readable across desktop and mobile',async({page})=>{
 for(const width of [1440,1024,390,320]){
  await page.setViewportSize({width,height:900});await page.goto('./#rtds');
  await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
  await page.locator('#rtds-reset').click();
  await surfaces(page,['html','body','.page','#rtds-panel','.rtds-workbench','.rtds-library','.rtds-inspection']);
  await stages(page,['.rtds-viewer-wrap']);await expect(page.locator('.masthead')).toHaveCSS('background-color',navy);await expect(page.locator('.brand')).toHaveCSS('color',white);await expect(page.locator('.rtds-region-heading').first()).toHaveCSS('background-color',chrome);
  await expect(page.locator('#mode-rtds')).toHaveCSS('border-bottom-color',red);
  await expect(page.locator('body')).toHaveCSS('font-size','16px');
  expect(await page.locator('body').evaluate(n=>getComputedStyle(n).fontFamily)).toContain('Arial');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.evaluate(()=>scrollTo(0,0));await shot(page,`first-screen-${width}`);
  await page.locator('[data-group="gbh"]').click();await surfaces(page,['#rtds-port-facts','.rtds-detail']);
  await expect(page.locator('[data-group="gbh"]')).toHaveCSS('border-color',red);
  await page.locator('.rtds-detail').scrollIntoViewIfNeeded();await shot(page,`reading-02-03-${width}`);
  await expect(page.locator('#analog-play')).toHaveCSS('background-color',red);
  await expect(page.locator('#analog-play')).toHaveCSS('border-radius','6px');
  await expect(page.locator('#analog-play')).toHaveCSS('border-top-width','3px');
 }
});

test('all seven original models render against actual green-grid stages, including floating PiP',async({page})=>{
 await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await expect(page.locator('#rtds-catalog button')).toHaveCount(18);
 const variants=await page.locator('.rtds-catalog-item.modeled').evaluateAll(nodes=>nodes.map(n=>n.dataset.variant));expect(variants).toHaveLength(7);
 for(const variant of variants){
  await page.locator(`[data-variant="${variant}"]`).click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
  await page.locator('.rtds-pip-slot').scrollIntoViewIfNeeded();await expect(page.locator('.rtds-pip')).toBeHidden();
  await expect.poll(()=>page.locator('#rtds-scene').getAttribute('data-triangles').then(Number)).toBeGreaterThan(0);
  await pixels(page,'#rtds-scene canvas');await shot(page,`model-${variant}`);
 }
 await page.locator('[data-variant="novacor-2.0"]').click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await page.locator('[data-group="aurora"]').click();
 await expect(page.locator('.rtds-highlight')).toHaveCount(0);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-highlight-kind','group');await expect(page.locator('#rtds-inspection-summary')).toBeVisible();await pixels(page,'#rtds-scene canvas',{backgroundVisible:false});
 await page.locator('#rtds-tour').click();await page.mouse.move(0,0);await expect(page.locator('#rtds-tour')).toHaveCSS('background-color',red);await shot(page,'tour-active');await page.locator('#rtds-tour').click();
 // Return to overview so the floating canvas has exposed background to measure.
 await page.locator('#rtds-reset').click();
 await page.locator('#rtds-analog-lesson').scrollIntoViewIfNeeded();await expect(page.locator('.rtds-pip')).toBeVisible();await surfaces(page,['.rtds-pip']);await stages(page,['.rtds-pip .rtds-viewer-wrap']);await expect(page.locator('.rtds-pip-header')).toHaveCSS('background-color',navy);await pixels(page,'.rtds-pip canvas');await shot(page,'floating-pip');
});

test('white analog cards preserve the real model, meter and distinct red-black probes; generic mode matches',async({page})=>{
 await page.setViewportSize({width:1366,height:768});await page.goto('./#rtds');await expect(page.locator('#analog-model-scene')).toHaveAttribute('data-loaded','true');
 await surfaces(page,['#rtds-analog-lesson','.analog-dashboard','.analog-bench','.analog-hardware','.analog-signals','.analog-source-card','.analog-scale-card','.analog-output-card']);
 await stages(page,['.analog-model-wrap']);await page.locator('#analog-play').click();await expect(page.locator('#analog-meter-value')).toHaveText('3.54');await page.locator('#analog-pause').click();
 if(await page.locator('.rtds-pip').isVisible())await page.locator('[data-pip-action="close"]').click();
 await expect(page.locator('#analog-red-wire')).toHaveCSS('stroke','rgb(183, 68, 49)');await expect(page.locator('#analog-black-wire')).toHaveCSS('stroke','rgb(52, 73, 64)');await expect(page.locator('.analog-meter')).toHaveCSS('background-color','rgb(203, 164, 79)');
 // The contact closeup may legitimately fill the canvas with the physical chassis.
 await pixels(page,'#analog-model-scene canvas',{backgroundVisible:false});await shot(page,'analog-model-and-meter');
 await page.locator('#analog-model-front').click();await expect(page.locator('#analog-model-scene')).toHaveAttribute('data-view','front');
 await pixels(page,'#analog-model-scene canvas');await shot(page,'analog-green-overview');
 await page.setViewportSize({width:390,height:900});await page.locator('.analog-signals').scrollIntoViewIfNeeded();await shot(page,'analog-mobile-waves');
 await page.locator('#mode-generic').click();await expect(page.locator('#scene')).toHaveAttribute('data-loaded','true');await surfaces(page,['#generic-panel','.exhibit']);await stages(page,['.scene-wrap']);await pixels(page,'#scene canvas');await shot(page,'generic-mobile');
});


test('control states and compact footer are intentional, distinct and keyboard-visible',async({page})=>{
 await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 const chosen=page.locator('[data-group="gbh"]'),other=page.locator('[data-group="gtsync"]');
 await chosen.click();await other.hover();
 await expect(chosen).toHaveCSS('background-color',selected);await expect(chosen).toHaveCSS('border-color',red);
 await expect(other).toHaveCSS('background-color',chrome);await expect(other).not.toHaveCSS('border-color',red);
 await shot(page,'selected-and-hover');await chosen.focus();await page.keyboard.press('Enter');await expect(chosen).toHaveCSS('outline-color',red);await expect(chosen).toHaveCSS('outline-style','solid');await shot(page,'keyboard-focus');
 await page.locator('#analog-play').scrollIntoViewIfNeeded();await page.mouse.move(0,0);await expect(page.locator('#analog-play')).toHaveCSS('background-color',red);await page.locator('#analog-play').hover();await expect(page.locator('#analog-play')).toHaveCSS('background-color',navy);await shot(page,'primary-hover');
 if(await page.locator('.rtds-pip').isVisible())await page.locator('[data-pip-action="close"]').click();await page.locator('footer').scrollIntoViewIfNeeded();await expect(page.locator('footer')).toHaveCSS('background-color',chrome);await shot(page,'footer');
 await page.locator('[data-variant="novacor-light"]').click();await expect(page.locator('#rtds-tour')).toBeDisabled();await page.locator('#rtds-interface-region').scrollIntoViewIfNeeded();await expect(page.locator('#rtds-tour')).toHaveCSS('background-color','rgb(234, 238, 242)');await expect(page.locator('#rtds-isolate')).toHaveCSS('color','rgb(98, 112, 126)');await shot(page,'reference-disabled');
 await page.locator('#mode-generic').click();await expect(page.locator('#scene')).toHaveAttribute('data-loaded','true');await page.locator('#reset-lesson').click();
 await expect(page.locator('#send-pulse')).toBeDisabled();await expect(page.locator('#send-pulse')).toHaveCSS('background-color','rgb(234, 238, 242)');await expect(page.locator('#send-pulse')).toHaveCSS('color','rgb(98, 112, 126)');await shot(page,'disabled-generic');
 await page.locator('#port-out').click();await page.locator('#port-ch1').click();await expect(page.locator('#send-pulse')).toBeEnabled();await page.mouse.move(0,0);await expect(page.locator('#send-pulse')).toHaveCSS('background-color',red);await shot(page,'enabled-generic');
 await page.locator('#view-in').focus();await page.keyboard.press('Enter');await expect(page.locator('#view-in')).toHaveCSS('outline-offset','-3px');await expect(page.locator('#view-in')).toHaveCSS('outline-style','solid');await shot(page,'generic-camera-focus');
 await page.route('**/assets/rtds/novacor-2.0-2023.glb',route=>route.abort());await page.goto('./#rtds');await expect(page.locator('#analog-model-scene')).toHaveAttribute('data-loaded','error');await expect(page.locator('#analog-model-detail')).toBeDisabled();await page.locator('#analog-model-detail').hover();await expect(page.locator('#analog-model-detail')).toHaveCSS('background-color','rgb(234, 238, 242)');await expect(page.locator('#analog-model-detail')).toHaveCSS('color','rgb(98, 112, 126)');await shot(page,'disabled-model-controls');
});
