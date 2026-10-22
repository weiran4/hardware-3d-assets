import {expect} from '@playwright/test';

export async function selectPhysical(page,id){
 const notes=page.locator('.rtds-model-notes');if(await notes.getAttribute('open')===null)await notes.locator('summary').click();
 await page.locator('#rtds-physical-port').selectOption(id);
}

// Let real ResizeObserver/scroll/RAF work settle before sampling the compositor.
// Never freeze Playwright's clock before this handshake, and never substitute an
// internal WebGL readback or a data-* value for visible rendered pixels.
export async function renderedFrame(page,{after=null}={}){
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await expect.poll(()=>page.locator('#rtds-scene').evaluate((scene,after)=>{
  const canvas=scene.querySelector('canvas'),ratio=Number(scene.dataset.pixelRatio),frames=Number(scene.dataset.frames||0);
  return !!canvas&&scene.clientWidth>0&&scene.clientHeight>0&&Number(scene.dataset.triangles)>0&&(after===null||frames>after)&&canvas.clientWidth===scene.clientWidth&&canvas.clientHeight===scene.clientHeight&&canvas.width===Math.floor(scene.clientWidth*ratio)&&canvas.height===Math.floor(scene.clientHeight*ratio);
 },after)).toBe(true);
}
export async function canvasCapture(page){
 await renderedFrame(page);const canvas=page.locator('#rtds-scene canvas');
 return canvas.screenshot();
}
export async function canvasChromeRegions(page){
 return page.locator('#rtds-scene canvas').evaluate(canvas=>{
  const origin=canvas.getBoundingClientRect(),result=[];
  const visible=node=>{for(let n=node;n;n=n.parentElement){const style=getComputedStyle(n);if(style.display==='none'||style.visibility==='hidden')return false;}return true;};
  const add=(rect,pad,kind,dx=0,dy=0)=>result.push({x:rect.x-origin.x+dx-pad,y:rect.y-origin.y+dy-pad,width:rect.width+pad*2,height:rect.height+pad*2,kind});
  // Compositor screenshots include sibling DOM paint. Keep a geometry-derived
  // exclusion for each painted annotation, not a large arbitrary board mask.
  const caption=document.querySelector('.rtds-view-caption');if(caption&&visible(caption))add(caption.getBoundingClientRect(),3,'caption');
  const badge=document.querySelector('.rtds-card-identity');if(badge&&visible(badge)){
   const rect=badge.getBoundingClientRect(),style=getComputedStyle(badge);add(rect,1,'identity-border');
   if(style.boxShadow!=='none'){
    // CSS blur radius is twice Gaussian sigma; its three-sigma paint support
    // plus the declared offset/spread and one antialias pixel bounds the shadow.
    for(const shadow of style.boxShadow.split(/,(?![^()]*\))/)){
     if(shadow.includes('inset'))continue;const px=[...shadow.matchAll(/(-?(?:\d*\.)?\d+)px/g)].map(m=>Number(m[1]));
     if(px.length>=2){const [x,y,blur=0,spread=0]=px;add(rect,Math.ceil(blur*1.5+spread+1),'identity-shadow',x,y);}
    }
   }
  }
  const leader=document.querySelector('.rtds-card-identity-leader');if(leader&&visible(leader))for(const shape of leader.querySelectorAll('line,circle')){
   // A vertical line has zero geometric width but still paints its stroke.
   // Testing locator.isVisible() on that line would incorrectly omit it.
   add(shape.getBoundingClientRect(),parseFloat(getComputedStyle(shape).strokeWidth)/2+1,`identity-${shape.tagName}`);
  }
  return result;
 });
}
export async function renderedBounds(page){
 const png=await canvasCapture(page),ignore=await canvasChromeRegions(page);
 return page.evaluate(async({base64,ignore})=>{
  const image=new Image();image.src=`data:image/png;base64,${base64}`;await image.decode();
  const sample=document.createElement('canvas');sample.width=image.width;sample.height=image.height;
  const context=sample.getContext('2d');context.drawImage(image,0,0);const pixels=context.getImageData(0,0,sample.width,sample.height).data;
  let left=sample.width,top=sample.height,right=-1,bottom=-1,count=0;
  for(let y=0;y<sample.height;y++)for(let x=0;x<sample.width;x++){if(ignore.some(r=>x>=r.x&&x<=r.x+r.width&&y>=r.y&&y<=r.y+r.height))continue;const i=(y*sample.width+x)*4,max=Math.max(pixels[i],pixels[i+1],pixels[i+2]);if(pixels[i+3]>200&&max<180){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);count++;}}
  if(!count)throw Error('No actual rendered hardware pixels in compositor capture');
  return {x:left,y:top,width:right-left+1,height:bottom-top+1};
 },{base64:png.toString('base64'),ignore});
}
export async function imageDifference(page,before,after,{bounds=null,ignore=[]}={}){
 return page.evaluate(async({before,after,bounds,ignore})=>{
  async function read(base64){const image=new Image();image.src=`data:image/png;base64,${base64}`;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);return {width:canvas.width,height:canvas.height,pixels:ctx.getImageData(0,0,canvas.width,canvas.height).data};}
  const a=await read(before),b=await read(after);if(a.width!==b.width||a.height!==b.height)throw Error(`Same-camera pixel comparison changed size: ${a.width}x${a.height} → ${b.width}x${b.height}`);
  const inside=(r,x,y)=>x>=r.x&&x<=r.x+r.width&&y>=r.y&&y<=r.y+r.height;
  let changed=0,outside=0,light=0,dark=0;for(let y=0;y<a.height;y++)for(let x=0;x<a.width;x++){if(ignore.some(r=>inside(r,x,y)))continue;const i=(y*a.width+x)*4,r=b.pixels[i]-a.pixels[i],g=b.pixels[i+1]-a.pixels[i+1],blue=b.pixels[i+2]-a.pixels[i+2];if(Math.max(Math.abs(r),Math.abs(g),Math.abs(blue))>3){changed++;if(bounds&&!inside(bounds,x,y))outside++;}if(!bounds||inside(bounds,x,y))light+=r+g+blue;if(Math.max(a.pixels[i],a.pixels[i+1],a.pixels[i+2])<180)dark++;}
  return {changed,outside,light,darkFraction:dark/(a.width*a.height),fraction:changed/(a.width*a.height)};
 },{before:before.toString('base64'),after:after.toString('base64'),bounds,ignore});
}

// Ordinary UI captures preserve the caller's scroll/framing, but wait for any
// substantially visible model to finish its responsive draw. Deliberate instant
// held-pointer captures must continue to use page.screenshot() directly.
export async function settledPageScreenshot(page,options={}){
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 for(const selector of ['#rtds-scene','#analog-model-scene','#scene']){
  const scene=page.locator(selector),canvas=scene.locator('canvas');
  if(await scene.count()===0||await scene.getAttribute('data-loaded')!=='true'||await canvas.count()===0)continue;
  const visible=()=>canvas.evaluate(canvas=>{const r=canvas.getBoundingClientRect(),x=Math.max(0,r.x),y=Math.max(0,r.y),right=Math.min(innerWidth,r.right),bottom=Math.min(innerHeight,r.bottom);return {x,y,width:Math.max(0,right-x),height:Math.max(0,bottom-y),fraction:r.width*r.height?Math.max(0,right-x)*Math.max(0,bottom-y)/(r.width*r.height):0};});
  if((await visible()).fraction<.5)continue;
  await expect.poll(()=>scene.evaluate(scene=>{const c=scene.querySelector('canvas'),ratio=Number(scene.dataset.pixelRatio)||Math.min(devicePixelRatio,2);return c.clientWidth===scene.clientWidth&&c.clientHeight===scene.clientHeight&&c.width===Math.floor(scene.clientWidth*ratio)&&c.height===Math.floor(scene.clientHeight*ratio)&&(!scene.dataset.frames||Number(scene.dataset.frames)>0);}),{message:`${selector}: visible canvas matches its responsive drawing buffer`}).toBe(true);
  await expect.poll(async()=>{
   const clip=await visible(),origin=await canvas.boundingBox();if(!origin||clip.fraction<.5)return 0;
   const ignore=selector==='#rtds-scene'?(await canvasChromeRegions(page)).map(r=>({...r,x:r.x+origin.x-clip.x,y:r.y+origin.y-clip.y})):[];
   // page.screenshot with viewport-clipped coordinates never scrolls the model
   // into view, unlike locator.screenshot; first-screen framing stays genuine.
   const png=await page.screenshot({clip:{x:clip.x,y:clip.y,width:clip.width,height:clip.height}});
   return (await imageDifference(page,png,png,{ignore})).darkFraction;
  },{message:`${selector}: settled visible capture contains real hardware, not a blank resized buffer`}).toBeGreaterThan(.01);
 }
 return page.screenshot(options);
}
