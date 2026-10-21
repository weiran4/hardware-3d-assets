export const defaultCamera={position:[.66,.54,.85],target:[.038,.065,.028]};
export function viewFrustum(width,height){const aspect=width/height;const span=Math.max(.54,.66/aspect);return{left:-span*aspect/2,right:span*aspect/2,top:span/2,bottom:-span/2};}
export function pulseVisualState(now,start,reducedMotion=false){const elapsed=(now-start)/1800;const started=Number.isFinite(start)&&elapsed>=0;return{elapsed,particleVisible:started&&!reducedMotion&&elapsed<1,traceVisible:started&&(reducedMotion||elapsed>.78)};}
export function layoutPortLabels(points,width,height){
 const placed=[];const offsets={out:[0,30],ch1:[-18,31],trig:[18,63]};
 for(const p of points){const [dx,dy]=offsets[p.key];const candidates=[[dx,dy],[dx,dy+34],[dx,dy-34],[dx-55,dy],[dx+55,dy],[dx,dy+68],[dx,dy-68]];let chosen;
  for(const [ox,oy]of candidates){const q={...p,x:Math.min(width-29,Math.max(29,p.x+ox)),y:Math.min(height-25,Math.max(25,p.y+oy))};if(!placed.some(o=>Math.abs(o.x-q.x)<58&&Math.abs(o.y-q.y)<34)){chosen=q;break;}}
  placed.push(chosen||{...p,x:Math.min(width-29,Math.max(29,p.x+dx)),y:Math.min(height-25,Math.max(25,p.y+dy))});
 }return placed;
}
