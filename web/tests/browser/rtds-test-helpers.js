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
 const box=await page.locator('#rtds-scene canvas').boundingBox(),result=[];
 // Locator screenshots are compositor crops, so exclude visible DOM chrome;
 // otherwise a changed caption could masquerade as changed model pixels.
 for(const selector of ['.rtds-view-caption','.rtds-card-identity','.rtds-card-identity-leader line']){
  const node=page.locator(selector);if(await node.count()&&await node.isVisible()){const r=await node.boundingBox();result.push({x:r.x-box.x-3,y:r.y-box.y-3,width:r.width+6,height:r.height+6});}
 }
 return result;
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
