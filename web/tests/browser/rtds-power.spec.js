import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {imageDifference} from './rtds-test-helpers.js';

// Browser execution and compositor screenshots use the existing official CI jobs.
// Local browser launch is restricted; --list is safe but is not execution evidence.
test.setTimeout(120000);
const lesson='#rtds-power-lesson',scene='#power-model-scene';
const contactPairs=[['power-feed-plug','power-lower-input'],['power-jumper-plug','power-upper-input'],['power-jumper-start-plug','power-lower-link']];
let errors=[];
test.beforeEach(async({page})=>{errors=[];page.on('pageerror',error=>errors.push(error.message));});
test.afterEach(()=>expect(errors).toEqual([]));

async function ready(page){
 await page.goto('./#rtds');
 await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await page.locator('[data-variant="gtao-v2"]').click();
 await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');
 await page.locator('[data-group="power"]').click();
 await page.locator('#rtds-open-power').click();
 await expect(page.locator('#power-heading')).toBeFocused();
 await expect(page.locator(scene)).toHaveAttribute('data-loaded','true');
 await expect.poll(async()=>Number(await page.locator(scene).getAttribute('data-frames'))).toBeGreaterThan(0);
 // A frozen clock must not mask unfinished smooth-scroll / responsive rendering.
 await expect.poll(()=>page.evaluate(()=>{
  const s=document.getElementById('rtds-power-lesson'),b=s.getBoundingClientRect(),m=parseFloat(getComputedStyle(s).scrollMarginTop)||0;
  const target=Math.max(0,Math.min(scrollY+b.top-m,document.documentElement.scrollHeight-innerHeight));
  return Math.abs(scrollY-target)<2;
 })).toBe(true);
}
async function freeze(page){await page.clock.install();await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));await page.clock.runFor(50);}
async function capture(page,name,{viewport=true}={}){
 await mkdir('screenshots',{recursive:true});
 const path=`screenshots/gtio-power-${name}.png`;
 const png=viewport?await page.screenshot({path,fullPage:false}):await page.locator(scene).screenshot({path});
 await test.info().attach(`gtio-power-${name}`,{body:png,contentType:'image/png'});
 return png;
}
async function contacts(page,{connected=true,pairs=contactPairs}={}){
 const distances=await page.evaluate(pairs=>pairs.map(([plugId,targetId])=>{
  const a=document.getElementById(plugId),b=document.getElementById(targetId),p=a.getBoundingClientRect(),t=b.getBoundingClientRect();
  return {plugId,targetId,distance:Math.hypot(p.x+p.width/2-t.x-t.width/2,p.y+p.height/2-t.y-t.height/2),plugVisible:!a.hidden,targetVisible:!b.hidden,world:a.dataset.world};
 }),pairs);
 for(const p of distances){expect(p.plugVisible,p.plugId).toBe(true);expect(p.targetVisible,p.targetId).toBe(true);expect(p.world,p.plugId+' follows a real 3D node').toMatch(/^-?[\d.e+-]+,-?[\d.e+-]+,-?[\d.e+-]+$/);if(connected)expect(p.distance,p.plugId+' seats at its actual connector').toBeLessThan(1.5);}
 if(!connected)expect(Math.max(...distances.map(p=>p.distance)),'unseated harness is visibly separate from its target').toBeGreaterThan(3);
 return distances;
}
async function powerOff(page){
 await expect(page.locator(lesson)).toHaveAttribute('data-energized','false');
 await expect(page.locator('#power-supply-status')).toContainText(/OFF|断电|关闭/);
 for(const id of ['upper','lower'])await expect(page.locator(`#power-${id}-voltage`)).toContainText(/0\s?V|OFF|断电|未供电/);
}
async function powered(page){
 await expect(page.locator(lesson)).toHaveAttribute('data-connected','true');
 await expect(page.locator(lesson)).toHaveAttribute('data-energized','true');
 for(const id of ['upper','lower'])await expect(page.locator(`#power-${id}-voltage`)).toContainText(/24\s?V/);
 await expect(page.locator('#power-supply-status')).toContainText(/24\s?V|ON|开启|通电/);
 await contacts(page);
}
async function essentials(page,name){
 const evidence=await page.evaluate(()=>{
  const selectors=['#power-heading','#power-play','#power-model-scene canvas','#power-upper-board','#power-lower-board','#power-supply-label','#power-upper-input-label','#power-lower-input-label','#power-lower-link-label','#power-supply-output-label','.power-safety','.power-parallel','.power-note:last-child','#power-caption'];
  const panel=document.querySelector('.rtds-pip'),p=panel.getBoundingClientRect(),items=[],violations=[];
  if(!document.getElementById('power-pause').hidden)selectors.push('#power-pause');
  for(const selector of selectors){const n=document.querySelector(selector),r=n.getBoundingClientRect(),s=getComputedStyle(n),visible=!n.closest('[hidden]')&&s.visibility!=='hidden'&&s.opacity!=='0';
   const item={selector,x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,visible,overlap:!panel.hidden&&r.left<p.right&&r.right>p.left&&r.top<p.bottom&&r.bottom>p.top};items.push(item);
   if(!visible||!r.width||!r.height||r.left<0||r.right>innerWidth||r.top<0||r.bottom>innerHeight||item.overlap)violations.push(item);
  }
  return {viewport:{width:innerWidth,height:innerHeight},items,violations};
 });
 await test.info().attach(`gtio-power-bounds-${name}`,{body:Buffer.from(JSON.stringify(evidence,null,2)),contentType:'application/json'});
 expect(evidence.violations,'all primary teaching content is visible, without PiP covering it').toEqual([]);
}
// ResizeObserver / IntersectionObserver are native browser deliveries. A single
// fake-clock burst can finish before they schedule the resized draw; require a
// real render handshake, not elapsed wall time or retained contact attributes.
async function responsiveFrame(page,width,{clockPaused=true}={}){
 const beforeFrames=Number(await page.locator(scene).getAttribute('data-frames')||0);
 await page.setViewportSize({width,height:1000});
 const advance=async()=>{if(clockPaused)await page.clock.runFor(50);else await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
 const measure=()=>page.locator(scene).evaluate(n=>{
  const r=n.getBoundingClientRect(),c=n.querySelector('canvas'),p=document.querySelector('.rtds-pip');
  return{width:innerWidth,height:innerHeight,x:r.x,y:r.y,right:r.right,bottom:r.bottom,sceneWidth:n.clientWidth,sceneHeight:n.clientHeight,docTop:r.top+scrollY,documentHeight:document.documentElement.scrollHeight,scrollY,target:Math.max(0,Math.min(r.top+scrollY+(r.height-innerHeight)/2,document.documentElement.scrollHeight-innerHeight)),frames:Number(n.dataset.frames||0),pixelRatio:Math.min(devicePixelRatio,1.5),canvas:c?{width:c.width,height:c.height,cssWidth:c.clientWidth,cssHeight:c.clientHeight}:null,capable:document.body.classList.contains('rtds-pip-capable'),expectedCapable:matchMedia('(min-width:1024px)').matches,pipHidden:p.hidden,labels:['upper-board','lower-board','supply-label','upper-input','lower-input','lower-link'].map(id=>document.getElementById('power-'+id).getAttribute('style'))};
 });
 const stable=(a,b)=>['x','sceneWidth','sceneHeight','docTop','documentHeight'].every(k=>Math.abs(a[k]-b[k])<.25)&&a.capable===b.capable&&JSON.stringify(a.labels)===JSON.stringify(b.labels);
 let evidence;
 try{await expect.poll(async()=>{
  await advance();const first=await measure();await advance();const before=await measure();evidence={beforeFrames,first,before};
  if(!stable(first,before)||before.capable!==before.expectedCapable)return false;
  await page.locator(scene).evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));
  await advance();const placed=await measure();await advance();const settled=await measure();evidence={...evidence,placed,settled};
  const c=settled.canvas,sized=!!c&&c.cssWidth===settled.sceneWidth&&c.cssHeight===settled.sceneHeight&&c.width===Math.floor(settled.sceneWidth*settled.pixelRatio)&&c.height===Math.floor(settled.sceneHeight*settled.pixelRatio);
  const visible=settled.x>=0&&settled.y>=0&&settled.right<=settled.width&&settled.bottom<=settled.height;
  return stable(placed,settled)&&Math.abs(placed.scrollY-settled.scrollY)<.25&&Math.abs(settled.scrollY-settled.target)<1&&settled.frames>beforeFrames&&sized&&visible&&settled.capable===settled.expectedCapable&&settled.pipHidden;
 },{timeout:10000,message:'responsive scene reaches a fresh rendered frame and settled native observer layout'}).toBe(true);}finally{await test.info().attach(`gtio-power-resize-${clockPaused?'controlled':'native'}-${width}`,{body:Buffer.from(JSON.stringify(evidence,null,2)),contentType:'application/json'});}
}
async function annotationsInside(page,name){
 const evidence=await page.locator(scene).evaluate(node=>{
  const scene=node.getBoundingClientRect(),ids=['power-upper-board','power-lower-board','power-supply-label','power-upper-input-label','power-lower-input-label','power-lower-link-label','power-supply-output-label'];
  const labels=ids.map(id=>{const n=document.getElementById(id),r=n.getBoundingClientRect();return{id,hidden:n.hidden,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};});
  return{scene:{x:scene.x,y:scene.y,right:scene.right,bottom:scene.bottom},labels,violations:labels.filter(r=>r.hidden||!r.width||!r.height||r.x<scene.x||r.y<scene.y||r.right>scene.right||r.bottom>scene.bottom)};
 });
 await test.info().attach(`gtio-power-annotations-${name}`,{body:Buffer.from(JSON.stringify(evidence,null,2)),contentType:'application/json'});
 expect(evidence.violations,'projected labels remain fully painted, not clipped by scene overflow').toEqual([]);
}
async function chromeRegions(page){
 return page.locator(scene).evaluate(n=>{const origin=n.querySelector('canvas').getBoundingClientRect();return[...n.parentElement.querySelectorAll('.power-board-label,.power-connector-label,.power-contact,.power-plug')].filter(n=>!n.hidden).map(n=>{const r=n.getBoundingClientRect();return{x:r.x-origin.x-2,y:r.y-origin.y-2,width:r.width+4,height:r.height+4};});});
}
async function renderedBoards(page,name){
 const png=await page.locator(scene+' canvas').screenshot();
 const overlay=await page.locator(scene).evaluate(n=>{
  const c=n.querySelector('canvas').getBoundingClientRect();
  const ids=['power-upper-board','power-lower-board','power-supply-label','power-upper-input-label','power-lower-input-label','power-lower-link-label','power-supply-output-label',...['power-feed-plug','power-jumper-plug','power-jumper-start-plug','power-upper-input','power-lower-input','power-lower-link','power-supply-output']];
  // Infer a conservative enclosure crop from visible semantic projections, not
  // a production test API or a painted region rectangle. Board centers are .21 m apart.
  const label=document.getElementById('power-supply-label'),scale=(parseFloat(document.getElementById('power-lower-board').style.top)-parseFloat(document.getElementById('power-upper-board').style.top))/.21;
  const supply={x:parseFloat(label.style.left)-.045*scale,y:parseFloat(label.style.top)-.042*scale,width:.09*scale,height:.084*scale};
  return {width:c.width,height:c.height,supply,scale,ignore:ids.map(id=>document.getElementById(id)).filter(Boolean).filter(n=>!n.hidden).map(n=>{const r=n.getBoundingClientRect();return{x:r.x-c.x-2,y:r.y-c.y-2,width:r.width+4,height:r.height+4};}),centers:['upper','lower'].map(key=>{const r=document.getElementById('power-'+key+'-board').getBoundingClientRect();return r.y-c.y+r.height/2;})};
 });
 const pixels=await page.evaluate(async({base64,overlay})=>{
  const im=new Image();im.src=`data:image/png;base64,${base64}`;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;
  const sx=c.width/overlay.width,sy=c.height/overlay.height;
  const bands=[{count:0,left:c.width,top:c.height,right:-1,bottom:-1},{count:0,left:c.width,top:c.height,right:-1,bottom:-1}];let dark=0,supplyDark=0;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
   if(overlay.ignore.some(r=>x/sx>=r.x&&x/sx<=r.x+r.width&&y/sy>=r.y&&y/sy<=r.y+r.height))continue;
   const i=(y*c.width+x)*4,r=data[i],g=data[i+1],b=data[i+2];if(data[i+3]>200&&Math.max(r,g,b)<180){dark++;if(x/sx>=overlay.supply.x&&x/sx<=overlay.supply.x+overlay.supply.width&&y/sy>=overlay.supply.y&&y/sy<=overlay.supply.y+overlay.supply.height)supplyDark++;}
   // Actual immutable GTAO PCB material is blue, unlike the white scene and text.
   if(data[i+3]>200&&b>r*1.15&&b>g*1.04&&b<240&&g>12){const index=overlay.centers.findIndex(center=>Math.abs(y/sy-center)<.101*overlay.scale);if(index<0)continue;const band=bands[index];band.count++;band.left=Math.min(band.left,x);band.top=Math.min(band.top,y);band.right=Math.max(band.right,x);band.bottom=Math.max(band.bottom,y);}
  }
  return {bands,darkFraction:dark/(c.width*c.height),supplyDark,supplyDarkFraction:supplyDark/(overlay.supply.width*sx*overlay.supply.height*sy)};
 },{base64:png.toString('base64'),overlay});
 expect(overlay.centers[0]).toBeLessThan(overlay.centers[1]);
 for(const [i,b]of pixels.bands.entries()){expect(b.count,`${name}: board ${i+1} must have real blue PCB pixels after DOM overlay exclusion`).toBeGreaterThan(50);expect(b.right-b.left).toBeGreaterThan(25);expect(b.bottom-b.top).toBeGreaterThan(45);}
 expect(pixels.bands[0].bottom).toBeLessThan(pixels.bands[1].top);
 expect(pixels.darkFraction).toBeGreaterThan(.015);expect(pixels.supplyDark,'original supply enclosure has actual compositor pixels').toBeGreaterThan(30);expect(pixels.supplyDarkFraction).toBeGreaterThan(.03);
 await test.info().attach(`gtio-power-render-${name}`,{body:Buffer.from(JSON.stringify({overlay,pixels},null,2)),contentType:'application/json'});
 return png;
}

for(const [width,height]of [[1366,768],[1440,900]])test(`power assembly uses two real boards and shows off, hookup and parallel 24 V within ${width}×${height}`,async({page})=>{
 await page.setViewportSize({width,height});await ready(page);await freeze(page);
 // Capture the normal optional inspector, then close it for unoccluded visual QA.
 if(await page.locator('.rtds-pip').isVisible()){await capture(page,`entry-pip-${width}x${height}`);await page.locator('[data-pip-action="close"]').click();}
 await expect(page.locator(scene)).toHaveAttribute('data-asset','gtao-v2-2.20');await expect(page.locator(scene)).toHaveAttribute('data-board-count','2');await expect(page.locator(scene+' canvas')).toHaveCount(1);
 await powerOff(page);await expect(page.locator(lesson)).toHaveAttribute('data-connected','false');await contacts(page,{connected:false});await essentials(page,'ready-'+width);await renderedBoards(page,'ready-'+width);await capture(page,`ready-${width}x${height}`);
 const before=await page.locator(scene+' canvas').screenshot(),beforeChrome=await chromeRegions(page);await page.locator('#power-play').click();await page.clock.runFor(500);await powerOff(page);await contacts(page,{connected:false});const approach=await page.locator(scene+' canvas').screenshot();expect((await imageDifference(page,before,approach,{ignore:[...beforeChrome,...await chromeRegions(page)]})).changed,'3D conductors/plugs visibly move, not only status attributes').toBeGreaterThan(80);await capture(page,`approach-${width}x${height}`);
 await page.clock.runFor(1200);await expect(page.locator(lesson)).toHaveAttribute('data-connected','true');await contacts(page);await powerOff(page);await capture(page,`seated-off-${width}x${height}`);
 await page.clock.runFor(500);await powered(page);await capture(page,`powered-running-${width}x${height}`);await page.locator('#power-pause').click();await page.clock.runFor(50);await essentials(page,'powered-'+width);await renderedBoards(page,'powered-'+width);await capture(page,`powered-${width}x${height}`);
 await expect(page.locator(lesson)).toContainText(/并联/);await expect(page.locator(lesson)).toContainText(/100\s?W/);await expect(page.locator(lesson)).toContainText(/Cubicle V1/);
});

test('one click, pause, resume and replay control the real harness and reset both board supplies',async({page})=>{
 await ready(page);await freeze(page);await page.locator('#power-play').click();await page.clock.runFor(500);await page.locator('#power-pause').click();await page.clock.runFor(50);
 const elapsed=await page.locator(lesson).getAttribute('data-elapsed'),before=await contacts(page,{connected:false}),png=await page.locator(scene+' canvas').screenshot();
 await page.clock.runFor(800);await expect(page.locator(lesson)).toHaveAttribute('data-elapsed',elapsed);expect(await contacts(page,{connected:false})).toEqual(before);expect((await imageDifference(page,png,await page.locator(scene+' canvas').screenshot())).changed).toBe(0);
 await page.locator('#power-pause').click();await page.clock.runFor(6200);await powered(page);await expect(page.locator(lesson)).toHaveAttribute('data-playing','false');await expect(page.locator(lesson)).toHaveAttribute('data-elapsed','6000');await expect(page.locator('#power-pause')).toBeHidden();await expect(page.locator('#power-play')).toContainText('重放');
 await page.locator('#power-play').click();await expect(page.locator(lesson)).toHaveAttribute('data-elapsed','0');await expect(page.locator(lesson)).toHaveAttribute('data-playing','true');await page.clock.runFor(50);await powerOff(page);await contacts(page,{connected:false});await capture(page,'replay-reset');
});

test('projected opaque plugs stay on real connector-level anchors after camera controls and responsive resize',async({page})=>{
 await ready(page);await freeze(page);await page.locator('#power-play').click();await page.clock.runFor(2300);await page.locator('#power-pause').click();await page.clock.runFor(50);await powered(page);
 const instance=await page.locator(scene).getAttribute('data-instance'),start=await page.locator('#power-lower-input').getAttribute('style');
 await page.locator('#power-model-detail').click();await page.clock.runFor(100);await contacts(page,{pairs:contactPairs.slice(1)});await page.locator('#power-model-front').click();await page.clock.runFor(100);await contacts(page);
 const box=await page.locator(scene+' canvas').boundingBox();await page.mouse.move(box.x+box.width*.45,box.y+box.height*.45);await page.mouse.down();await page.mouse.move(box.x+box.width*.50,box.y+box.height*.48,{steps:8});await page.mouse.up();await page.clock.runFor(100);await expect(page.locator('#power-lower-input')).not.toHaveAttribute('style',start);await contacts(page);await capture(page,'after-orbit',{viewport:false});
 for(const width of [320,390,768]){
  await responsiveFrame(page,width);await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await contacts(page);await powered(page);await annotationsInside(page,'mobile-'+width);await renderedBoards(page,'mobile-'+width);await capture(page,'mobile-'+width);
  const c=await page.locator(scene+' canvas').boundingBox();expect(c.x).toBeGreaterThanOrEqual(0);expect(c.y).toBeGreaterThanOrEqual(0);expect(c.x+c.width).toBeLessThanOrEqual(width);expect(c.y+c.height).toBeLessThanOrEqual(1000);
 }
 await expect(page.locator(scene+' canvas')).toHaveCount(1);if(instance!==null)await expect(page.locator(scene)).toHaveAttribute('data-instance',instance);
});

test('mode, card selection and document-hidden interruptions pause without silently resuming power hookup',async({page})=>{
 await ready(page);await freeze(page);await page.locator('#power-play').click();await page.clock.runFor(500);await page.locator('[data-variant="gtdi-v2"]').click();await expect(page.locator(lesson)).toHaveAttribute('data-playing','false');
 await page.locator('#power-play').click();await page.clock.runFor(500);await page.locator('#mode-generic').click();await expect(page.locator(lesson)).toHaveAttribute('data-playing','false');const elapsed=await page.locator(lesson).getAttribute('data-elapsed');await page.clock.runFor(1000);await expect(page.locator(lesson)).toHaveAttribute('data-elapsed',elapsed);await page.locator('#mode-rtds').click();await expect(page.locator(lesson)).toHaveAttribute('data-playing','false');
 await page.locator('#power-play').click();await page.clock.runFor(500);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator(lesson)).toHaveAttribute('data-playing','false');const hidden=await page.locator(lesson).getAttribute('data-elapsed');await page.clock.runFor(1000);await expect(page.locator(lesson)).toHaveAttribute('data-elapsed',hidden);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator(lesson)).toHaveAttribute('data-playing','false');
 await expect(page.locator('#rtds-library-count')).toContainText('19 个版本条目 / 7 个 3D');
});

test('keyboard reduced-motion playback preserves safe initial state and static connected 24 V outcome',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await ready(page);await freeze(page);await powerOff(page);await expect(page.locator(lesson)).toHaveAttribute('data-connected','false');
 await page.locator('#power-play').focus();await page.keyboard.press('Enter');await expect(page.locator(lesson)).toHaveAttribute('data-connected','true');await powerOff(page);await page.clock.runFor(2200);await powered(page);await capture(page,'reduced-motion');
 await page.locator('#power-pause').click();await page.clock.runFor(50);const before=await page.locator(scene+' canvas').screenshot();await page.clock.runFor(1000);expect((await imageDifference(page,before,await page.locator(scene+' canvas').screenshot())).changed).toBe(0);
});

test('failed real-card loads stay visibly unavailable and retry creates one truthful scene, not substitute boards',async({page})=>{
 await page.goto('./');await page.route('**/assets/rtds/gtao-v2-2.20.glb',route=>route.abort());await page.locator('#mode-rtds').click();await page.locator('[data-variant="gtao-v2"]').click();await page.locator(scene).scrollIntoViewIfNeeded();
 await expect(page.locator(scene)).toHaveAttribute('data-loaded','error');await expect(page.locator('#power-model-loading')).toContainText(/未能|失败/);await expect(page.locator(scene+' canvas')).toHaveCount(0);await powerOff(page);
 await page.unroute('**/assets/rtds/gtao-v2-2.20.glb');await page.locator('#power-model-retry').click();await expect(page.locator(scene)).toHaveAttribute('data-loaded','true');await page.locator(scene).scrollIntoViewIfNeeded();await expect.poll(async()=>Number(await page.locator(scene).getAttribute('data-frames'))).toBeGreaterThan(0);await expect(page.locator(scene+' canvas')).toHaveCount(1);await renderedBoards(page,'retried');await capture(page,'retried',{viewport:false});
});

test('late real-card completion cannot wake a hidden or inactive power scene',async({page})=>{
 for(const interruption of ['generic','document-hidden']){
  await page.goto('./');let release,seen;const hold=new Promise(resolve=>release=resolve),requested=new Promise(resolve=>seen=resolve);
  await page.route('**/assets/rtds/gtao-v2-2.20.glb',async route=>{seen();await hold;await route.continue();});await page.locator('#mode-rtds').click();await page.locator('[data-variant="gtao-v2"]').click();await page.locator(scene).scrollIntoViewIfNeeded();await requested;await expect(page.locator(scene)).toHaveAttribute('data-loaded','loading');
  if(interruption==='generic')await page.locator('#mode-generic').click();else await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  release();await expect(page.locator(scene)).toHaveAttribute('data-loaded','true');const frames=await page.locator(scene).getAttribute('data-frames');await page.waitForTimeout(250);expect(await page.locator(scene).getAttribute('data-frames')).toBe(frames);expect(Number(frames||0)).toBe(0);await expect(page.locator(lesson)).toHaveAttribute('data-playing','false');await page.unroute('**/assets/rtds/gtao-v2-2.20.glb');
  if(interruption==='generic')await page.locator('#mode-rtds').click();else await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
  await page.locator(scene).scrollIntoViewIfNeeded();await expect.poll(async()=>Number(await page.locator(scene).getAttribute('data-frames'))).toBeGreaterThan(0);await expect(page.locator(scene+' canvas')).toHaveCount(1);await powerOff(page);
 }
});


test('direct power-lesson link remains focused and in view after asynchronous gallery layout settles',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('./#rtds-power');await expect(page.locator('#rtds-scene')).toHaveAttribute('data-loaded','true');await expect(page.locator('#rtds-group-list button').first()).toBeAttached();await expect(page.locator(scene)).toHaveAttribute('data-loaded','true');await expect(page.locator('#power-heading')).toBeFocused();
 await expect.poll(()=>page.locator(lesson).evaluate(n=>{const b=n.getBoundingClientRect(),m=parseFloat(getComputedStyle(n).scrollMarginTop)||0,target=Math.max(0,Math.min(scrollY+b.top-m,document.documentElement.scrollHeight-innerHeight));return Math.abs(scrollY-target)<2;})).toBe(true);
 await expect.poll(()=>page.locator('#power-heading').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;})).toBe(true);
 await expect(page.locator('#power-play')).toBeInViewport();await expect(page.locator(scene+' canvas')).toBeInViewport({ratio:1});if(await page.locator('.rtds-pip').isVisible())await page.locator('[data-pip-action="close"]').click();await essentials(page,'direct-entry');await renderedBoards(page,'direct-entry');await capture(page,'direct-entry');
});


test('native-clock responsive playback preserves the real powered assembly and unclipped labels',async({page})=>{
 await ready(page);await page.locator('#power-play').click();await expect(page.locator(lesson)).toHaveAttribute('data-energized','true',{timeout:15000});await page.locator('#power-pause').click();await expect(page.locator(lesson)).toHaveAttribute('data-playing','false');
 for(const width of [320,390,768]){await responsiveFrame(page,width,{clockPaused:false});await powered(page);await annotationsInside(page,'native-mobile-'+width);await renderedBoards(page,'native-mobile-'+width);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await capture(page,'native-mobile-'+width);}
});
