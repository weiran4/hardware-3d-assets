import {Vector3,Box3} from 'three';
import {projectHighlightBounds} from './rtds-state.js';
let maskSequence=0;
const identities={
 'gtdi-v2-2.01':{code:'DI',label:'数字输入'},
 'gtdo-v2-2.00':{code:'DO',label:'数字输出'},
 'gtai-v2-2.31':{code:'AI',label:'模拟输入'},
 'gtao-v2-2.20':{code:'AO',label:'模拟输出'}
};
export function cardIdentity(assetId){return identities[assetId]||null;}
// An existing decorative component locates a UI annotation; neither its geometry
// nor the manufacturer's physical markings/materials are changed.
export function identityAnchor(assetId,nodes){const node=nodes.get(`${assetId}.heatsink_top`);return node?node.getWorldPosition(new Vector3()):null;}
export function identityLayout(point,width,height,obstacles=[],badge={width:144,height:48}){
 const margin=8,gap=6,w=badge.width,h=badge.height;
 if(!point||!Number.isFinite(point.x+point.y+point.z)||point.z< -1||point.z>1||point.x<0||point.y<0||point.x>width||point.y>height||width<w+margin*2||height<h+margin*2)return null;
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const positions=[[point.x-w/2,point.y-h-14],[point.x-w/2,point.y-h/2],[point.x-w/2,point.y+14],[point.x-w-14,point.y-h/2],[point.x+14,point.y-h/2]];
 function place(candidates){for(const [left,top]of candidates){
  const x=clamp(left,margin,width-w-margin),y=clamp(top,margin,height-h-margin);
  if(obstacles.some(o=>x<o.x+o.width+gap&&x+w>o.x-gap&&y<o.y+o.height+gap&&y+h>o.y-gap))continue;
  return{x,y,width:w,height:h,lineEnd:{x:clamp(point.x,x,x+w),y:clamp(point.y,y,y+h)}};
 }return null;}
 const preferred=place(positions);if(preferred)return preferred;
 // Test exact obstacle edges instead of a coarse pixel grid, which can miss a
 // narrow safe gap in the 320px floating viewer.
 const xs=[margin,width-w-margin,...obstacles.flatMap(o=>[o.x-w-gap,o.x+o.width+gap])],ys=[margin,height-h-margin,...obstacles.flatMap(o=>[o.y-h-gap,o.y+o.height+gap])],spare=[];
 for(const y of ys)for(const x of xs)spare.push([x,y]);
 spare.sort((a,b)=>Math.hypot(a[0]+w/2-point.x,a[1]+h/2-point.y)-Math.hypot(b[0]+w/2-point.x,b[1]+h/2-point.y));
 return place(spare);
}
export function createCardIdentityOverlay(container,metadata,nodes){
 const identity=cardIdentity(metadata.asset_id),anchor=identityAnchor(metadata.asset_id,nodes);
 if(!identity||!anchor)return{update(){},dispose(){}};
 const doc=container.ownerDocument,badge=doc.createElement('div');badge.className='rtds-card-identity';badge.dataset.cardType=identity.code;badge.hidden=true;
 badge.setAttribute('role','img');badge.setAttribute('aria-label',`${identity.code} · ${identity.label}；视觉标注，非实体丝印`);
 const code=doc.createElement('strong'),label=doc.createElement('span'),note=doc.createElement('small');code.textContent=identity.code;label.textContent=identity.label;note.textContent='视觉标注';badge.append(code,label,note);
 const svg=tag=>doc.createElementNS('http://www.w3.org/2000/svg',tag),leader=svg('svg'),line=svg('line'),dot=svg('circle');leader.classList.add('rtds-card-identity-leader');leader.setAttribute('aria-hidden','true');leader.setAttribute('hidden','');dot.setAttribute('r','3');const defs=svg('defs'),mask=svg('mask'),background=svg('rect'),connector=svg('g');mask.id=`rtds-identity-mask-${++maskSequence}`;mask.setAttribute('maskUnits','userSpaceOnUse');mask.setAttribute('x','0');mask.setAttribute('y','0');background.setAttribute('fill','white');mask.append(background);defs.append(mask);connector.setAttribute('mask',`url(#${mask.id})`);connector.append(line,dot);leader.append(defs,connector);container.append(leader,badge);
 const cutouts=metadata.ports.map(()=>{const rect=svg('rect');rect.setAttribute('fill','black');mask.append(rect);return rect;});
 const boxes=metadata.ports.map(p=>nodes.get(p.id)).filter(Boolean).map(node=>new Box3().setFromObject(node));
 return{
  update(camera,width,height,inspecting){
   if(inspecting){badge.hidden=true;leader.setAttribute('hidden','');return;}
   const projected=anchor.clone().project(camera),point={x:(projected.x*.5+.5)*width,y:(-.5*projected.y+.5)*height,z:projected.z};
   const obstacles=boxes.map(box=>projectHighlightBounds(box,camera,width,height,2)).filter(Boolean),layout=identityLayout(point,width,height,obstacles);
   badge.hidden=!layout;leader.toggleAttribute('hidden',!layout);if(!layout)return;
   badge.style.left=`${layout.x}px`;badge.style.top=`${layout.y}px`;leader.setAttribute('viewBox',`0 0 ${width} ${height}`);
   mask.setAttribute('width',width);mask.setAttribute('height',height);background.setAttribute('width',width);background.setAttribute('height',height);
   // The thin leader also yields to connector/numbering regions, not only the badge.
   cutouts.forEach((rect,index)=>{const o=obstacles[index];rect.setAttribute('visibility',o?'visible':'hidden');if(o){rect.setAttribute('x',o.x-3);rect.setAttribute('y',o.y-3);rect.setAttribute('width',o.width+6);rect.setAttribute('height',o.height+6);}});
   line.setAttribute('x1',point.x);line.setAttribute('y1',point.y);line.setAttribute('x2',layout.lineEnd.x);line.setAttribute('y2',layout.lineEnd.y);dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);
  },
  dispose(){badge.remove();leader.remove();}
 };
}
