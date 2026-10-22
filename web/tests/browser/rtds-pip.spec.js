import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

let pageErrors=[];
test.beforeEach(async({page})=>{pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));});
test.afterEach(()=>{expect(pageErrors).toEqual([]);});

async function loaded(page){
 await page.goto('./#rtds');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await page.evaluate(()=>{window.__pipOriginalCanvas=document.querySelector('#rtds-scene canvas');window.__pipOriginalWrap=document.querySelector('.rtds-viewer-wrap');});
}
async function dock(page){
 const targetY=await page.evaluate(()=>{const slot=document.querySelector('.rtds-pip-slot');scrollTo(0,scrollY+slot.getBoundingClientRect().bottom+24);return scrollY;});
 await expect(page.locator('.rtds-pip')).toBeVisible();await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','expanded');
 expect(Math.abs(await page.evaluate(()=>scrollY)-targetY)).toBeLessThan(1);
}
async function sourceVisible(page){
 await page.locator('.rtds-pip-slot').evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
 await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);
}
async function sameCanvas(page){
 await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);
 expect(await page.evaluate(()=>document.querySelector('#rtds-scene canvas')===window.__pipOriginalCanvas&&document.querySelector('.rtds-viewer-wrap')===window.__pipOriginalWrap)).toBe(true);
 expect(await page.locator('[id]').evaluateAll(nodes=>{const ids=nodes.map(node=>node.id);return ids.length===new Set(ids).size;})).toBe(true);
}
async function rect(page){
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 return page.locator('.rtds-highlight-main').evaluate(node=>Object.fromEntries(['x','y','width','height'].map(key=>[key,Number(node.getAttribute(key))])));
}
async function insideFrame(page){
 const bounds=await rect(page);await expect(page.locator('#rtds-label')).toBeVisible();
 const scene=await page.locator('#rtds-scene').boundingBox(),label=await page.locator('#rtds-label').boundingBox();
 expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.y).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(scene.width+.1);expect(bounds.y+bounds.height).toBeLessThanOrEqual(scene.height+.1);
 expect(label.x).toBeGreaterThanOrEqual(scene.x-.1);expect(label.y).toBeGreaterThanOrEqual(scene.y-.1);expect(label.x+label.width).toBeLessThanOrEqual(scene.x+scene.width+.1);expect(label.y+label.height).toBeLessThanOrEqual(scene.y+scene.height+.1);
}
async function shot(page,name){await mkdir('screenshots',{recursive:true});await page.screenshot({path:`screenshots/rtds-pip-${name}.png`,fullPage:false});}
async function selectAurora(page){await page.locator('[data-group=aurora]').click();await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');}
const action=(page,name)=>page.locator(`[data-pip-action="${name}"]`);

test('desktop scroll docks one real canvas, preserves orbit/zoom and restores its original footprint',async({page})=>{
 await loaded(page);await selectAurora(page);await sourceVisible(page);await page.locator('#rtds-in').click();
 const canvas=page.locator('#rtds-scene canvas'),box=await canvas.boundingBox();
 await page.mouse.move(box.x+box.width*.45,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.48,box.y+box.height*.52,{steps:8});await page.mouse.up();
 await expect(page.locator('.rtds-highlight')).toBeVisible();const before=await rect(page),height=await page.locator('.rtds-pip-slot').evaluate(node=>node.getBoundingClientRect().height),instance=await page.locator('#rtds-scene').getAttribute('data-instance');
 await dock(page);await sameCanvas(page);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-instance',instance);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-view','in');
 await expect(page.locator('.rtds-pip .rtds-viewer-wrap')).toHaveCount(1);await expect(page.locator('body')).toHaveClass(/rtds-pip-active/);
 expect(await page.locator('.rtds-pip-slot').evaluate(node=>node.getBoundingClientRect().height)).toBe(height);
 const panel=await page.locator('.rtds-pip').boundingBox();expect(panel.width).toBe(320);expect(panel.x+panel.width).toBe(page.viewportSize().width-18);expect(panel.y+panel.height).toBe(page.viewportSize().height-18);
 await expect(page.locator('.rtds-highlight')).toBeVisible();await insideFrame(page);await shot(page,'desktop-orbit-preserved');
 await action(page,'return').click();await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot')).toBeFocused();await sameCanvas(page);
 const restored=await rect(page);for(const key of Object.keys(before))expect(Math.abs(restored[key]-before[key])).toBeLessThan(.5);
 await expect(page.locator('body')).not.toHaveClass(/rtds-pip-active/);
 await shot(page,'restored-inline-after-return');
});

test('03 paragraph and DI/DO bank rows keep their reading position through dock, minimize, expand and close',async({page})=>{
 await loaded(page);
 for(const {variant,group,selector}of [
  {variant:'novacor-2.0',group:'aurora',selector:'#rtds-detail-copy'},
  {variant:'gtdi-v2',group:'digital_input',selector:'.rtds-bank-map tbody tr:nth-child(3)'},
  {variant:'gtdo-v2',group:'digital_output',selector:'.rtds-bank-map tbody tr:nth-child(3)'}
 ]){
  await page.locator(`[data-variant="${variant}"]`).click();await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await page.locator(`[data-group="${group}"]`).click();await sourceVisible(page);
  const before=await page.locator(selector).evaluate(node=>{const target=scrollY+node.getBoundingClientRect().top-innerHeight*.35,sourceEnd=scrollY+document.querySelector('.rtds-pip-slot').getBoundingClientRect().bottom+24;scrollTo(0,Math.max(target,sourceEnd));const r=node.getBoundingClientRect();return {scrollY,top:r.top,width:r.width,height:r.height};});
  expect(before.top).toBeGreaterThanOrEqual(0);expect(before.top).toBeLessThan(page.viewportSize().height);
  async function unchanged(){
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const after=await page.locator(selector).evaluate(node=>{const r=node.getBoundingClientRect();return {scrollY,top:r.top,width:r.width,height:r.height};});
   for(const key of Object.keys(before))expect(Math.abs(after[key]-before[key]),`${variant} reading ${key}`).toBeLessThan(1);
   await expect(page.locator('body')).toHaveClass(/rtds-pip-capable/);
  }
  await expect(page.locator('.rtds-pip')).toBeVisible();await unchanged();
  await action(page,'minimize').click();await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','minimized');await unchanged();
  await action(page,'minimize').click();await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','expanded');await unchanged();
  await action(page,'close').click();await expect(page.locator('.rtds-pip')).toBeHidden();await unchanged();await shot(page,`${variant}-reading-anchor-after-close`);
 }
});

test('dock tracks shared-group and physical-port selection, orbit and keyboard camera controls without covering reading',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);
 const overlay=page.locator('.rtds-highlight');await expect(overlay).toHaveAttribute('data-ids',[21,22,23,24].map(n=>`novacor-2.0-2023.gt${n}`).join(','));await expect(page.locator('#rtds-label')).toHaveText('GT 21–24 · Aurora');
 const old=await rect(page);await action(page,'in').focus();await page.keyboard.press('Enter');await expect.poll(async()=>(await rect(page)).width).toBeGreaterThan(old.width);
 const canvas=page.locator('#rtds-scene canvas'),box=await canvas.boundingBox(),zoomed=await rect(page);
 await page.mouse.move(box.x+box.width*.42,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.48,box.y+box.height*.5,{steps:8});await page.mouse.up();await expect.poll(()=>rect(page)).not.toEqual(zoomed);
 await page.locator('.rtds-model-notes summary').click();await page.locator('#rtds-physical-port').selectOption('novacor-2.0-2023.gt23');await dock(page);
 await expect(overlay).toHaveAttribute('data-kind','port');await expect(overlay).toHaveAttribute('data-ids','novacor-2.0-2023.gt23');await expect(page.locator('#rtds-label')).toHaveText('GT23');await insideFrame(page);
 const panel=await page.locator('.rtds-pip').boundingBox();
 for(const selector of ['#rtds-detail-copy','.rtds-functional-facts','#rtds-physical-port']){const text=await page.locator(selector).boundingBox();expect(text.x+text.width).toBeLessThan(panel.x);}
 expect(await overlay.locator('.rtds-highlight-main').evaluate(node=>getComputedStyle(node).stroke)).toBe('rgb(255, 106, 0)');expect(await overlay.evaluate(node=>getComputedStyle(node).pointerEvents)).toBe('none');
 for(const view of ['front','rear','top','out']){await action(page,view).focus();await page.keyboard.press('Enter');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-view',view);}
 await action(page,'rear').click();await insideFrame(page);await sameCanvas(page);await shot(page,'physical-port-and-reading');
});

test('keyboard minimize, expand, Escape, close and return have predictable dismissal and focus lifecycles',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);
 await action(page,'minimize').focus();await page.keyboard.press('Enter');await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','minimized');await expect(page.locator('.rtds-pip-stage')).toBeHidden();await expect(action(page,'minimize')).toHaveAttribute('aria-expanded','false');await expect(action(page,'minimize')).toBeFocused();await sameCanvas(page);await shot(page,'minimized');
 await page.keyboard.press('Enter');await expect(page.locator('.rtds-pip-stage')).toBeVisible();await expect(action(page,'minimize')).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Escape');await expect(page.locator('.rtds-pip')).toBeHidden();await page.evaluate(()=>scrollBy(0,40));await expect(page.locator('.rtds-pip')).toBeHidden();await sameCanvas(page);
 await sourceVisible(page);await dock(page);await action(page,'close').focus();await page.keyboard.press('Enter');await expect(page.locator('.rtds-pip')).toBeHidden();await page.evaluate(()=>scrollBy(0,30));await expect(page.locator('.rtds-pip')).toBeHidden();
 await sourceVisible(page);await dock(page);await action(page,'return').focus();await page.keyboard.press('Enter');await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot')).toBeFocused();await expect(page.locator('#rtds-label')).toHaveText('GT 21–24 · Aurora');await sameCanvas(page);
});

test('mode, reference-only, failed model and recovery transitions never leave an old model floating',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);
 await page.evaluate(()=>{location.hash='#generic';});await expect(page.locator('#generic-panel')).toBeVisible();await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);await expect(page.locator('body')).not.toHaveClass(/rtds-pip-active/);
 await page.evaluate(()=>{location.hash='#rtds';});await expect(page.locator('#rtds-panel')).toBeVisible();await dock(page);
 // DOM activation deliberately keeps the reading scroll position unchanged so
 // these checks exercise lifecycle restoration, not auto-restoration on scroll-up.
 await page.locator('[data-variant="novacor-light"]').evaluate(node=>node.click());await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);
 await page.route('**/assets/rtds/gtdi-v2-2.01.glb',route=>route.abort());await page.locator('[data-variant="gtdi-v2"]').evaluate(node=>node.click());await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','error');await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);await expect(page.locator('body')).not.toHaveClass(/rtds-pip-active/);
 await page.locator('[data-variant="novacor-2.0"]').evaluate(node=>node.click());await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await dock(page);await expect(page.locator('#rtds-scene canvas')).toHaveCount(1);await expect(page.locator('.rtds-highlight')).toBeHidden();await shot(page,'recovered-model');
});

test('pending or superseded model loads hide the dock until the current renderer is ready',async({page})=>{
 await loaded(page);await dock(page);let release,requested;const held=new Promise(resolve=>{release=resolve;}),seen=new Promise(resolve=>{requested=resolve;});
 await page.route('**/assets/rtds/gtdi-v2-2.01.glb',async route=>{requested();await held;await route.continue();});
 await page.locator('[data-variant="gtdi-v2"]').evaluate(node=>node.click());await seen;await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);
 await page.locator('[data-variant="novacor-light"]').evaluate(node=>node.click());release();await page.waitForLoadState('networkidle');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','reference');await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('#rtds-scene canvas')).toHaveCount(0);
});

test('mobile widths never dock; desktop/mobile resize restores minimized viewers without overflow or duplicate canvases',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);await action(page,'minimize').click();
 for(const width of [1023,768,390,320]){
  await page.setViewportSize({width,height:900});await page.evaluate(()=>{const slot=document.querySelector('.rtds-pip-slot');scrollTo(0,scrollY+slot.getBoundingClientRect().bottom+24);});
  await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);await expect(page.locator('body')).not.toHaveClass(/rtds-pip-active/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await sameCanvas(page);await shot(page,`mobile-inline-${width}`);
 }
 for(const width of [1024,1440]){
  await page.setViewportSize({width,height:900});await dock(page);await expect(page.locator('.rtds-pip-stage')).toBeVisible();await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');await insideFrame(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await sameCanvas(page);await shot(page,`desktop-${width}`);
 }
});

const grip=(page,edge='nw')=>page.locator(`[data-pip-resize="${edge}"]`);
async function resizeDrag(page,edge,dx,dy,release=true){
 const box=await grip(page,edge).boundingBox();expect(box).not.toBeNull();
 const x=box.x+box.width/2,y=box.y+box.height/2;
 await page.mouse.move(x,y);await page.mouse.down();
 await expect(page.locator('.rtds-pip')).toHaveAttribute('data-resizing',edge);
 await page.mouse.move(x+dx,y+dy,{steps:8});if(release)await page.mouse.up();
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 return page.locator('.rtds-pip').boundingBox();
}
function closeRect(actual,expected,keys=['x','y','width','height']){for(const key of keys)expect(Math.abs(actual[key]-expected[key]),key).toBeLessThan(.6);}
async function resetSize(page){await grip(page).focus();await page.keyboard.press('Home');}
async function readingAnchor(page){return page.locator('#rtds-detail-copy').evaluate(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,scrollY};});}
// A DOM highlight can survive a cleared WebGL backing buffer. Inspect actual
// compositor screenshot pixels too: the selected NovaCor chassis covers far more
// than 5% of this canvas; its label/outline alone cover less than 2%.
async function renderedModelPixels(page,name='resize-returned-inline',immediate=false){
 await mkdir('screenshots',{recursive:true});
 const canvas=page.locator('#rtds-scene canvas'),path=`screenshots/rtds-pip-${name}-canvas.png`;
 // Page-level capture avoids locator.screenshot's stable-element wait while a
 // pointer is held; the immediate path intentionally adds no RAF/frame wait.
 const png=immediate?await page.screenshot({path,clip:await canvas.boundingBox()}):await canvas.screenshot({path});
 const fraction=await page.evaluate(async base64=>{
  const image=new Image();image.src=`data:image/png;base64,${base64}`;await image.decode();
  const sample=document.createElement('canvas');sample.width=image.width;sample.height=image.height;const context=sample.getContext('2d');context.drawImage(image,0,0);
  const pixels=context.getImageData(0,0,sample.width,sample.height).data;let model=0;
  for(let i=0;i<pixels.length;i+=4){const max=Math.max(pixels[i],pixels[i+1],pixels[i+2]),min=Math.min(pixels[i],pixels[i+1],pixels[i+2]);if(pixels[i+3]>200&&max<180&&max-min<32)model++;}
  return model/(sample.width*sample.height);
 },png.toString('base64'));
 expect(fraction,'rendered chassis pixels, not only SVG highlight/label').toBeGreaterThan(.05);
}

test('mouse corner enlargement preserves the exact camera, highlight, canvas and reading position',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;window.__pipContexts=new Set();HTMLCanvasElement.prototype.getContext=function(type,...args){const context=original.call(this,type,...args);if(context&&['webgl','webgl2','experimental-webgl'].includes(type))window.__pipContexts.add(context);return context;};});
 await loaded(page);await selectAurora(page);await dock(page);await action(page,'in').click();
 const canvas=await page.locator('#rtds-scene canvas').boundingBox();await page.mouse.move(canvas.x+canvas.width*.45,canvas.y+canvas.height*.5);await page.mouse.down();await page.mouse.move(canvas.x+canvas.width*.48,canvas.y+canvas.height*.52,{steps:5});await page.mouse.up();
 const projected=await rect(page),before=await page.locator('.rtds-pip').boundingBox(),anchor=await readingAnchor(page),slot=await page.locator('.rtds-pip-slot').boundingBox(),instance=await page.locator('#rtds-scene').getAttribute('data-instance'),contexts=await page.evaluate(()=>window.__pipContexts.size);
 await shot(page,'resize-default');const enlarged=await resizeDrag(page,'nw',-180,-120);
 expect(enlarged.width).toBe(before.width+180);expect(enlarged.height).toBe(before.height+120);expect(enlarged.x+enlarged.width).toBe(before.x+before.width);expect(enlarged.y+enlarged.height).toBe(before.y+before.height);
 closeRect(await readingAnchor(page),anchor,['x','y','width','height','scrollY']);closeRect(await page.locator('.rtds-pip-slot').boundingBox(),slot);await sameCanvas(page);
 await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids',[21,22,23,24].map(n=>`novacor-2.0-2023.gt${n}`).join(','));await expect(page.locator('#rtds-scene')).toHaveAttribute('data-instance',instance);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-view','in');await insideFrame(page);
 const scene=await page.locator('#rtds-scene').boundingBox(),adapted=await page.locator('#rtds-scene canvas').boundingBox();closeRect(adapted,scene);expect(scene.height).toBeGreaterThan(canvas.height);expect(await page.evaluate(()=>getSelection().toString())).toBe('');expect(await page.evaluate(()=>window.__pipContexts.size)).toBe(contexts);await shot(page,'resize-enlarged');
 await resizeDrag(page,'nw',180,120);closeRect(await page.locator('.rtds-pip').boundingBox(),before);closeRect(await rect(page),projected);closeRect(await readingAnchor(page),anchor,['x','y','width','height','scrollY']);await sameCanvas(page);expect(await page.evaluate(()=>window.__pipContexts.size)).toBe(contexts);
});

test('all eight mouse resize handles follow their edge and retain the opposite anchor',async({page})=>{
 await loaded(page);await dock(page);
 for(const edge of ['n','e','s','w','nw','ne','se','sw']){
  await resetSize(page);await resizeDrag(page,'nw',-160,-140);const before=await page.locator('.rtds-pip').boundingBox();
  const cursor=edge.length===1?(edge==='n'||edge==='s'?'ns-resize':'ew-resize'):(edge==='nw'||edge==='se'?'nwse-resize':'nesw-resize');expect(await grip(page,edge).evaluate(node=>getComputedStyle(node).cursor)).toBe(cursor);
  const after=await resizeDrag(page,edge,-50,-40);
  expect(after.width).toBe(before.width+(edge.includes('w')?50:edge.includes('e')?-50:0));expect(after.height).toBe(before.height+(edge.includes('n')?40:edge.includes('s')?-40:0));
  if(edge.includes('w'))expect(after.x+after.width).toBe(before.x+before.width);else expect(after.x).toBe(before.x);
  if(edge.includes('n'))expect(after.y+after.height).toBe(before.y+before.height);else expect(after.y).toBe(before.y);
  await expect(page.locator('body')).not.toHaveClass(/rtds-pip-resizing/);await sameCanvas(page);
 }
});

test('mouse sizing stops at viewport and minimum bounds while all window controls stay reachable',async({page})=>{
 await loaded(page);await dock(page);const anchor=await readingAnchor(page),view=page.viewportSize();
 const largest=await resizeDrag(page,'nw',-5000,-5000);closeRect(largest,{x:18,y:18,width:view.width-36,height:view.height-36});await shot(page,'resize-viewport-bound');
 const smallest=await resizeDrag(page,'nw',5000,5000);expect(smallest.width).toBe(280);expect(smallest.height).toBe(240);expect(smallest.x+smallest.width).toBe(view.width-18);expect(smallest.y+smallest.height).toBe(view.height-18);
 for(const name of ['return','minimize','close','front','rear','top','in','out']){const bounds=await action(page,name).boundingBox();expect(bounds.x).toBeGreaterThanOrEqual(smallest.x);expect(bounds.x+bounds.width).toBeLessThanOrEqual(smallest.x+smallest.width);expect(bounds.y+bounds.height).toBeLessThanOrEqual(smallest.y+smallest.height);await expect(action(page,name)).toBeVisible();}
 closeRect(await readingAnchor(page),anchor,['x','y','width','height','scrollY']);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await sameCanvas(page);await shot(page,'resize-minimum');
});

test('keyboard resize and Escape cancellation leave camera and selection untouched',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);await action(page,'out').focus();await page.keyboard.press('Tab');await expect(grip(page)).toBeFocused();await expect(grip(page)).toHaveAccessibleName(/方向键.*Shift.*Home/);
 const before=await page.locator('.rtds-pip').boundingBox(),projected=await rect(page);await page.keyboard.press('ArrowLeft');await page.keyboard.press('Shift+ArrowUp');const larger=await page.locator('.rtds-pip').boundingBox();expect(larger.width).toBe(before.width+16);expect(larger.height).toBe(before.height+48);await page.keyboard.press('Home');closeRect(await page.locator('.rtds-pip').boundingBox(),before);closeRect(await rect(page),projected);
 await resizeDrag(page,'nw',-120,-80,false);await page.keyboard.press('Escape');await expect(page.locator('.rtds-pip')).toBeVisible();await expect(page.locator('body')).not.toHaveClass(/rtds-pip-resizing/);closeRect(await page.locator('.rtds-pip').boundingBox(),before);await page.mouse.move(100,100);await page.mouse.up();closeRect(await page.locator('.rtds-pip').boundingBox(),before);closeRect(await rect(page),projected);await sameCanvas(page);await shot(page,'resize-keyboard-and-cancel');
 await page.keyboard.press('Escape');await expect(page.locator('.rtds-pip')).toBeHidden();
});

test('user size survives minimize and viewport changes; interrupted drag restores safe mobile and generic behavior',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);await resizeDrag(page,'nw',-200,-180);const enlarged=await page.locator('.rtds-pip').boundingBox(),anchor=await readingAnchor(page);
 await action(page,'minimize').click();await expect(grip(page)).toBeHidden();await expect(page.locator('.rtds-pip')).toHaveAttribute('data-state','minimized');await action(page,'minimize').click();closeRect(await page.locator('.rtds-pip').boundingBox(),enlarged);closeRect(await readingAnchor(page),anchor,['x','y','width','height','scrollY']);
 await page.setViewportSize({width:1024,height:280});await expect.poll(async()=>(await page.locator('.rtds-pip').boundingBox()).height).toBe(244);const bounded=await page.locator('.rtds-pip').boundingBox();expect(bounded.y).toBe(18);await shot(page,'resize-short-viewport');await page.setViewportSize({width:1440,height:1050});await expect.poll(async()=>(await page.locator('.rtds-pip').boundingBox()).height).toBe(enlarged.height);closeRect(await page.locator('.rtds-pip').boundingBox(),enlarged);
 await resizeDrag(page,'nw',-30,-20,false);await page.setViewportSize({width:390,height:900});await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('body')).not.toHaveClass(/rtds-pip-resizing/);await page.mouse.up();await sameCanvas(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.rtds-pip-slot > .rtds-viewer-wrap')).toHaveCount(1);await shot(page,'resize-interrupted-mobile');
 await page.setViewportSize({width:1440,height:1050});await dock(page);await resizeDrag(page,'nw',-20,-20,false);await page.evaluate(()=>{location.hash='#generic';});await expect(page.locator('.rtds-pip')).toBeHidden();await expect(page.locator('body')).not.toHaveClass(/rtds-pip-resizing/);await page.mouse.up();await expect(page.locator('#generic-panel')).toBeVisible();await expect(page.locator('#scene canvas')).toHaveCount(1);
 await page.evaluate(()=>{location.hash='#rtds';});await dock(page);await sameCanvas(page);const frames=Number(await page.locator('#rtds-scene').getAttribute('data-frames'));await action(page,'return').click();await expect(page.locator('.rtds-pip-slot')).toBeFocused();await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');
 // Restoring inline changes the backing-buffer size in ResizeObserver, then the
 // demand renderer draws on the next RAF. Wait for that observable render, not
 // just DOM relocation; an immediate screenshot can otherwise catch the clear.
 await expect.poll(async()=>Number(await page.locator('#rtds-scene').getAttribute('data-frames'))).toBeGreaterThan(frames);await rect(page);
 const drawn=await page.locator('#rtds-scene').evaluate(node=>{const canvas=node.querySelector('canvas');return {width:node.clientWidth,height:node.clientHeight,buffer:[canvas.width,canvas.height],ratio:Number(node.dataset.pixelRatio),viewBox:node.querySelector('.rtds-highlight').getAttribute('viewBox'),triangles:Number(node.dataset.triangles)};});
 expect(drawn.buffer).toEqual([Math.floor(drawn.width*drawn.ratio),Math.floor(drawn.height*drawn.ratio)]);expect(drawn.viewBox).toBe(`0 0 ${drawn.width} ${drawn.height}`);expect(drawn.triangles).toBeGreaterThan(0);await renderedModelPixels(page);await shot(page,'resize-returned-inline');
});

test('resized card overview keeps its identity badge and model changes safely interrupt a captured resize',async({page})=>{
 test.setTimeout(60000);
 await loaded(page);await dock(page);const oldInstance=await page.locator('#rtds-scene').getAttribute('data-instance');
 const chosen=await resizeDrag(page,'nw',-200,-150,false);
 // Trigger the actual model selector without scrolling back to the source; the
 // pending model transition, not a scroll event, must release the old capture.
 await page.locator('[data-variant="gtai-v2"]').evaluate(node=>node.click());await expect(page.locator('body')).not.toHaveClass(/rtds-pip-resizing/);await expect(page.locator('#rtds-scene')).toHaveAttribute('data-asset','gtai-v2-2.31');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await page.mouse.up();await dock(page);
 closeRect(await page.locator('.rtds-pip').boundingBox(),chosen);expect(await page.locator('#rtds-scene').getAttribute('data-instance')).not.toBe(oldInstance);expect(await page.evaluate(()=>window.__pipOriginalCanvas.isConnected)).toBe(false);
 const badge=page.locator('.rtds-card-identity');await expect(badge).toHaveCount(1);await expect(badge).toBeVisible();await expect(badge.locator('strong')).toHaveText('AI');
 await page.evaluate(()=>{window.__pipOriginalCanvas=document.querySelector('#rtds-scene canvas');window.__pipOriginalWrap=document.querySelector('.rtds-viewer-wrap');window.__pipIdentity=document.querySelector('.rtds-card-identity');});
 const font=await badge.locator('strong').evaluate(node=>getComputedStyle(node).fontSize);await resizeDrag(page,'nw',-120,-80);await expect(badge).toBeVisible();
 const scene=await page.locator('#rtds-scene').boundingBox(),identity=await badge.boundingBox();expect(identity.x).toBeGreaterThanOrEqual(scene.x);expect(identity.y).toBeGreaterThanOrEqual(scene.y);expect(identity.x+identity.width).toBeLessThanOrEqual(scene.x+scene.width);expect(identity.y+identity.height).toBeLessThanOrEqual(scene.y+scene.height);expect(await badge.locator('strong').evaluate(node=>getComputedStyle(node).fontSize)).toBe(font);expect(await page.evaluate(()=>document.querySelector('.rtds-card-identity')===window.__pipIdentity)).toBe(true);await sameCanvas(page);await shot(page,'resize-AI-identity-enlarged');
 await page.locator('[data-group="analogue_input"]').evaluate(node=>node.click());await expect(badge).toBeHidden();await expect(page.locator('.rtds-card-identity-leader')).toBeHidden();await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');await insideFrame(page);
 await page.locator('.rtds-model-notes').evaluate(node=>{node.open=true;});await page.locator('#rtds-physical-port').selectOption('gtai-v2-2.31.input1');await dock(page);await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-ids','gtai-v2-2.31.input1');await expect(badge).toBeHidden();const selected=await rect(page);await resizeDrag(page,'nw',-40,-40);await insideFrame(page);await shot(page,'resize-AI-selected-port');await resizeDrag(page,'nw',40,40);closeRect(await rect(page),selected);await sameCanvas(page);
 await page.locator('#rtds-reset').evaluate(node=>node.click());await expect(badge).toBeVisible();expect(await page.evaluate(()=>document.querySelector('.rtds-card-identity')===window.__pipIdentity)).toBe(true);await action(page,'return').click();await expect(page.locator('.rtds-pip')).toBeHidden();await sameCanvas(page);
});


test('held-pointer intermediate resize frames keep actual model pixels visible before mouseup',async({page})=>{
 await loaded(page);await selectAurora(page);await dock(page);await rect(page);
 const handle=await grip(page).boundingBox(),x=handle.x+handle.width/2,y=handle.y+handle.height/2;
 await page.mouse.move(x,y);await page.mouse.down();
 for(let step=1;step<=3;step++){
  await page.mouse.move(x-step*50,y-step*35,{steps:6});
  // Deliberately capture the compositor immediately after an intermediate move:
  // no mouseup, explicit frame settling or stable-element screenshot here.
  await renderedModelPixels(page,`resize-held-drag-${step}`,true);
  await expect(page.locator('.rtds-pip')).toHaveAttribute('data-resizing','nw');await expect(page.locator('body')).toHaveClass(/rtds-pip-resizing/);await sameCanvas(page);
 }
 await page.mouse.up();await expect(page.locator('body')).not.toHaveClass(/rtds-pip-resizing/);await expect(page.locator('.rtds-highlight')).toHaveAttribute('data-kind','group');await shot(page,'resize-held-drag-finished');
});
