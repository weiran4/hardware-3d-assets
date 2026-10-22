import {test,expect} from '@playwright/test';
import {canvasCapture,canvasChromeRegions,imageDifference,renderedFrame} from './rtds-test-helpers.js';
import {meshProjection} from './rtds-mesh-test-helpers.js';

test.setTimeout(120000);
const cards=[
 {variant:'novacor-2.0',asset:'novacor-2.0-2023',group:'aurora',port:'gt23',fact:'双工 LC'},
 {variant:'gtdi-v2',asset:'gtdi-v2-2.01',group:'digital_input',port:'bank1_even',fact:'2 · 4 · 6 · 8 · GND'},
 {variant:'gtdo-v2',asset:'gtdo-v2-2.00',group:'digital_output',port:'bank1_even',fact:'2 · 4 · 6 · 8 · V-'},
 {variant:'gtai-v2',asset:'gtai-v2-2.31',group:'analogue_input',port:'input2',fact:'±10 V'},
 {variant:'gtao-v2',asset:'gtao-v2-2.20',group:'analog_output',port:'channel16',fact:'第 16 路；第 13–16 路仅 NovaCor 可用'},
 {variant:'gtfpi-v2',asset:'gtfpi-v2-2.01-capped',group:'ribbon_header',port:'lv',fact:'34 个可见针脚'},
 {variant:'gtsoc-v2',asset:'gtsoc-v2-2a-copper16',group:'front_sfp',port:'front16',fact:'SV 通信配置'}
];
const scene=page=>page.locator('#rtds-scene');
async function inline(page){await page.locator('.rtds-pip-slot').evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));await expect(page.locator('.rtds-pip')).toBeHidden();await renderedFrame(page);}
async function ready(page,c){
 await page.goto('./#rtds');await expect(scene(page)).toHaveAttribute('data-loaded','true');
 await page.locator(`[data-variant="${c.variant}"]`).click();await expect(scene(page)).toHaveAttribute('data-asset',c.asset);await expect(scene(page)).toHaveAttribute('data-loaded','true');
}
async function unselectedGroupCamera(page,c){
 await page.locator(`[data-group="${c.group}"]`).click();await page.locator('#rtds-inspection-close').click();await page.mouse.move(0,0);await inline(page);
 await expect(scene(page)).toHaveAttribute('data-selection','');await expect(page.locator('#rtds-inspection-summary')).toBeHidden();
 const box=await page.locator('#rtds-scene canvas').boundingBox(),projection=await meshProjection(c,box.width,box.height);
 return {...projection,box,x:box.x+projection.point.x,y:box.y+projection.point.y};
}
async function attach(page,name,png){await test.info().attach(name,{body:png,contentType:'image/png'});}

for(const c of cards)test(`${c.asset}: actual mesh hover, persistent direct pick, exact adjacent facts and material restoration`,async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.setViewportSize({width:800,height:1000});await ready(page,c);
 const hit=await unselectedGroupCamera(page,c),target=`${c.asset}.${c.port}`,before=await canvasCapture(page),ignore=await canvasChromeRegions(page),view=await scene(page).getAttribute('data-view'),direction=await scene(page).getAttribute('data-direction'),focus=await page.evaluate(()=>document.activeElement.id);
 expect(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)===document.querySelector('#rtds-scene canvas'),hit),'pointer reaches the visible model canvas').toBe(true);
 await page.mouse.move(hit.x,hit.y);await expect(scene(page)).toHaveAttribute('data-hover',target);await expect(page.locator('#rtds-scene canvas')).toHaveCSS('cursor','pointer');await expect(scene(page)).toHaveAttribute('data-selection','');await expect(page.locator('#rtds-inspection-summary')).toBeHidden();expect(await page.evaluate(()=>document.activeElement.id)).toBe(focus);
 const hovered=await canvasCapture(page),hoverDelta=await imageDifference(page,before,hovered,{bounds:hit.bounds,ignore});expect(hoverDelta.darkFraction).toBeGreaterThan(.01);expect(hoverDelta.changed,'hover must alter actual rendered mesh pixels').toBeGreaterThan(4);expect(hoverDelta.light,'hover softly lights the connector').toBeGreaterThan(0);expect(hoverDelta.outside,'shared board/materials must not light outside this connector').toBeLessThanOrEqual(Math.max(8,hoverDelta.changed*.01));
 await page.mouse.click(hit.x,hit.y);await expect(scene(page)).toHaveAttribute('data-selection',target);await expect(scene(page)).toHaveAttribute('data-highlight-ids',target);await expect(scene(page)).toHaveAttribute('data-highlight-kind','port');await expect(scene(page)).toHaveAttribute('data-view',view);await expect(scene(page)).toHaveAttribute('data-direction',direction);expect(await page.evaluate(()=>document.querySelector('#rtds-inspection-summary').contains(document.activeElement)),'direct click does not jump keyboard focus to the brief').toBe(false);
 await expect(page.locator('#rtds-inspection-summary')).toBeVisible();await expect(page.locator('#rtds-inspection-title')).toHaveText(hit.port.label);await expect(page.locator('#rtds-inspection-summary')).toContainText(c.fact);await expect(page.locator(`[data-group="${c.group}"]`)).toHaveAttribute('aria-pressed','true');await expect(page.locator('#rtds-physical-port')).toHaveValue(target);await expect(page.locator('#rtds-detail-title')).toContainText(hit.port.label);
 expect(await page.locator('#rtds-inspection-summary dd').count()).toBeLessThanOrEqual(4);await expect(page.locator('.rtds-highlight')).toHaveCount(0);await expect(page.locator('#rtds-label')).toBeHidden();
 const chosen=await canvasCapture(page),selectDelta=await imageDifference(page,before,chosen,{bounds:hit.bounds,ignore});expect(selectDelta.light,'committed mesh emission is stronger than hover').toBeGreaterThan(hoverDelta.light*1.2);expect(selectDelta.outside,'direct pick must not change the camera or tint the board').toBeLessThanOrEqual(Math.max(8,selectDelta.changed*.01));
 await page.mouse.move(0,0);await expect(scene(page)).toHaveAttribute('data-hover','');await expect(scene(page)).toHaveAttribute('data-selection',target);expect((await imageDifference(page,chosen,await canvasCapture(page))).fraction,'selected material survives pointer leave').toBeLessThan(.0001);
 await attach(page,`${c.variant}-unselected`,before);await attach(page,`${c.variant}-hover`,hovered);await attach(page,`${c.variant}-selected`,chosen);
 await page.locator('#rtds-summary-details').click();await expect(page.locator('#rtds-details-heading')).toBeFocused();await expect(page.locator('#rtds-detail')).toBeInViewport();
 await page.locator('#rtds-inspection-close').click();await page.mouse.move(0,0);await inline(page);await expect(scene(page)).toHaveAttribute('data-selection','');await expect(page.locator('#rtds-inspection-summary')).toBeHidden();await expect(scene(page)).toHaveAttribute('data-view',view);
 const restored=await canvasCapture(page);expect((await imageDifference(page,before,restored)).fraction,'authored model colors and camera restored exactly on clear').toBeLessThan(.0005);await attach(page,`${c.variant}-restored`,restored);expect(errors).toEqual([]);
});

test('visible chassis occludes rear connectors: pointer cannot hover or select through the model',async({page})=>{
 const c=cards[0];await page.setViewportSize({width:800,height:1000});await ready(page,c);await page.locator('#rtds-front').click();await inline(page);
 const box=await page.locator('#rtds-scene canvas').boundingBox(),projected=await meshProjection(c,box.width,box.height,{view:'front',requireVisible:false});expect(projected.point).toBeUndefined();expect(projected.occluded,'rear GT23 projects behind a frontmost opaque chassis triangle').toBeTruthy();
 const x=box.x+projected.occluded.x,y=box.y+projected.occluded.y,before=await canvasCapture(page);await page.mouse.move(x,y);await expect(scene(page)).toHaveAttribute('data-hover','');await page.mouse.click(x,y);await expect(scene(page)).toHaveAttribute('data-selection','');await expect(page.locator('#rtds-inspection-summary')).toBeHidden();expect((await imageDifference(page,before,await canvasCapture(page))).fraction).toBeLessThan(.0001);
});

test('visible unresolved service geometry never offers hover or direct selection',async({page})=>{
 const c={...cards[1],port:'service_jtag'};await page.setViewportSize({width:800,height:1000});await ready(page,c);await page.locator('#rtds-top').click();await inline(page);
 const box=await page.locator('#rtds-scene canvas').boundingBox(),hit=await meshProjection(c,box.width,box.height,{view:'top',includeExcluded:true});expect(hit.port.interactive).toBe(false);
 const before=await canvasCapture(page),x=box.x+hit.point.x,y=box.y+hit.point.y;await page.mouse.move(x,y);await expect(scene(page)).toHaveAttribute('data-hover','');await expect(page.locator('#rtds-scene canvas')).not.toHaveCSS('cursor','pointer');await page.mouse.click(x,y);await expect(scene(page)).toHaveAttribute('data-selection','');await expect(page.locator('#rtds-inspection-summary')).toBeHidden();expect((await imageDifference(page,before,await canvasCapture(page))).fraction).toBeLessThan(.0001);
});

test('drag, away-and-return drag, pointer cancellation and secondary buttons never commit an inspection',async({page})=>{
 const c=cards[0];await page.setViewportSize({width:800,height:1000});await ready(page,c);
 for(const gesture of ['drag','return','cancel','secondary']){
  const hit=await unselectedGroupCamera(page,c);await page.mouse.move(hit.x,hit.y);
  if(gesture==='secondary')await page.mouse.click(hit.x,hit.y,{button:'right'});
  else{await page.mouse.down();if(gesture==='cancel')await page.locator('#rtds-scene canvas').dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse',isPrimary:true,clientX:hit.x,clientY:hit.y});else{await page.mouse.move(hit.x+40,hit.y+15,{steps:6});if(gesture==='return')await page.mouse.move(hit.x,hit.y,{steps:6});}await page.mouse.up();}
  await expect(scene(page)).toHaveAttribute('data-selection','');await expect(page.locator('#rtds-inspection-summary')).toBeHidden();
 }
 const hit=await unselectedGroupCamera(page,c);await page.mouse.click(hit.x,hit.y);await expect(scene(page)).toHaveAttribute('data-selection',`${c.asset}.${c.port}`);
});

test('real mobile touch tap selects; multi-touch and cancellation cannot become accidental taps',async({browser})=>{
 const context=await browser.newContext({baseURL:test.info().project.use.baseURL,viewport:{width:390,height:1000},hasTouch:true,isMobile:true,deviceScaleFactor:1}),page=await context.newPage(),c=cards[0];
 try{await ready(page,c);let hit=await unselectedGroupCamera(page,c);const session=await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:hit.x,y:hit.y,id:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:hit.x,y:hit.y,id:1},{x:hit.x+25,y:hit.y+25,id:2}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{x:hit.x,y:hit.y,id:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(scene(page)).toHaveAttribute('data-selection','');
  hit=await unselectedGroupCamera(page,c);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:hit.x,y:hit.y,id:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await expect(scene(page)).toHaveAttribute('data-selection','');
  hit=await unselectedGroupCamera(page,c);await page.touchscreen.tap(hit.x,hit.y);await expect(scene(page)).toHaveAttribute('data-selection',`${c.asset}.${c.port}`);await expect(page.locator('#rtds-inspection-title')).toHaveText('GT23');await expect(scene(page)).toHaveAttribute('data-hover','');await expect(page.locator('.rtds-pip')).toBeHidden();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await inline(page);await attach(page,'mobile-390-selected-model-and-stacked-brief',await page.locator('#rtds-viewer-region').screenshot());
 }finally{await context.close();}
});

test('desktop summary sits beside the canvas only when selected, while keyboard 02/03 remains a complete fallback',async({page})=>{
 await ready(page,cards[1]);await inline(page);const full=await page.locator('.rtds-pip-slot').boundingBox();await expect(page.locator('#rtds-inspection-summary')).toBeHidden();
 const button=page.locator('[data-group="digital_input"]');await button.focus();await button.press('Enter');await expect(button).toBeFocused();await expect(scene(page)).toHaveAttribute('data-highlight-kind','group');await expect(page.locator('#rtds-inspection-summary')).toBeVisible();await inline(page);await attach(page,'desktop-GTDI-group-emission-and-adjacent-brief',await page.locator('#rtds-viewer-region').screenshot());
 await page.locator('.rtds-model-notes summary').focus();await page.keyboard.press('Enter');const select=page.locator('#rtds-physical-port');await select.focus();await select.press('Home');await select.press('ArrowDown');await select.press('ArrowDown');await expect(select).toBeFocused();await expect(scene(page)).toHaveAttribute('data-selection','gtdi-v2-2.01.bank1_even');await expect(page.locator('#rtds-inspection-summary')).toContainText('2 · 4 · 6 · 8 · GND');
 await inline(page);const viewer=await page.locator('.rtds-pip-slot').boundingBox(),brief=await page.locator('#rtds-inspection-summary').boundingBox();expect(viewer.width).toBeLessThan(full.width);expect(brief.x).toBeGreaterThanOrEqual(viewer.x+viewer.width);expect(Math.abs(brief.y-viewer.y)).toBeLessThan(1);await attach(page,'desktop-GTDI-exact-port-emission-and-adjacent-brief',await page.locator('#rtds-viewer-region').screenshot());
 await page.locator('#rtds-inspection-close').focus();await page.keyboard.press('Enter');await expect(page.locator('#rtds-reset')).toBeFocused();await expect(page.locator('#rtds-inspection-summary')).toBeHidden();await inline(page);expect((await page.locator('.rtds-pip-slot').boundingBox()).width).toBe(full.width);
 await page.locator('[data-group="service_unresolved"]').click();await expect(page.locator('#rtds-inspection-summary')).toBeHidden();await expect(scene(page)).toHaveAttribute('data-highlight-ids','');await expect(page.locator('#rtds-physical-port')).toHaveCount(0);
 await page.locator('[data-variant="gtdi-v1"]').click();await expect(scene(page)).toHaveAttribute('data-loaded','reference');await expect(page.locator('#rtds-inspection-summary')).toBeHidden();await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);
});
