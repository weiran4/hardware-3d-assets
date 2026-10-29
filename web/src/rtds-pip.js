// Presentation only: the original viewer, renderer, selection and OrbitControls
// stay alive. Moving the whole wrap also keeps its semantic-mesh hover and selection.
export function rtdsPipState({active,ready,desktop,pastViewer,dismissed,minimized,suppressed=false}){
 if(suppressed||!active||!ready||!desktop||!pastViewer||dismissed)return 'inline';
 return minimized?'minimized':'expanded';
}

const PIP_GAP=18,DEFAULT_PIP={width:320,height:306,right:PIP_GAP,bottom:PIP_GAP};
const clamp=(value,min,max)=>Math.max(min,Math.min(value,max));
function fitRtdsPip(rect,view){
 const width=clamp(rect.width,Math.min(280,view.width-2*PIP_GAP),view.width-2*PIP_GAP);
 const height=clamp(rect.height,Math.min(240,view.height-2*PIP_GAP),view.height-2*PIP_GAP);
 return {width,height,right:clamp(rect.right,PIP_GAP,view.width-PIP_GAP-width),bottom:clamp(rect.bottom,PIP_GAP,view.height-PIP_GAP-height)};
}
// Each dragged edge follows the pointer; its opposite edge stays put. Keep this
// geometry independent of the viewer/camera and of the full-width document layout.
export function resizeRtdsPip(rect,edge,dx,dy,view){
 const start=fitRtdsPip(rect,view),minWidth=Math.min(280,view.width-2*PIP_GAP),minHeight=Math.min(240,view.height-2*PIP_GAP);
 let right=view.width-start.right,bottom=view.height-start.bottom,left=right-start.width,top=bottom-start.height;
 if(edge.includes('w'))left=clamp(left+dx,PIP_GAP,right-minWidth);
 if(edge.includes('e'))right=clamp(right+dx,left+minWidth,view.width-PIP_GAP);
 if(edge.includes('n'))top=clamp(top+dy,PIP_GAP,bottom-minHeight);
 if(edge.includes('s'))bottom=clamp(bottom+dy,top+minHeight,view.height-PIP_GAP);
 return {width:right-left,height:bottom-top,right:view.width-right,bottom:view.height-bottom};
}

export function initRtdsPip({wrap,onView=()=>{}}){
 if(!wrap?.parentNode)throw new TypeError('A connected RTDS viewer wrap is required');
 const doc=wrap.ownerDocument,win=doc.defaultView,desktop=win.matchMedia('(min-width: 1024px)');
 let active=false,ready=false,suppressed=false,dismissed=false,minimized=false,disposed=false,frame=0,lastExternalFocus=null;
 let geometry={...DEFAULT_PIP},drag=null;
 const removers=[];
 function listen(target,type,handler,options){target.addEventListener(type,handler,options);removers.push(()=>target.removeEventListener(type,handler,options));}
 function element(tag,className,text){const node=doc.createElement(tag);node.className=className;if(text)node.textContent=text;return node;}
 const slot=element('div','rtds-pip-slot');slot.tabIndex=-1;slot.setAttribute('aria-label','RTDS 主 3D 视图');
 wrap.parentNode.insertBefore(slot,wrap);slot.append(wrap);
 const panel=element('section','rtds-pip');panel.hidden=true;panel.setAttribute('aria-label','RTDS 3D 缩略视图');
 const header=element('div','rtds-pip-header'),title=element('strong','rtds-pip-title','3D 随行视图');
 title.append(element('small','rtds-pip-hint','拖动边框调整大小'));
 const stage=element('div','rtds-pip-stage'),camera=element('div','rtds-pip-camera');camera.setAttribute('role','group');camera.setAttribute('aria-label','缩略视图视角控制');
 function button(action,text,label,handler){const node=element('button','',text);node.type='button';node.dataset.pipAction=action;node.setAttribute('aria-label',label);node.title=label;listen(node,'click',handler);return node;}
 const returnButton=button('return','↗','返回主 3D 视图',()=>{
  dismissed=true;minimized=false;sync();
  slot.scrollIntoView({block:'center',behavior:'instant'});slot.focus({preventScroll:true});sync();
 });
 const minimizeButton=button('minimize','−','最小化 3D 缩略视图',()=>{minimized=!minimized;sync();});
 const closeButton=button('close','×','关闭 3D 缩略视图',()=>{dismissed=true;minimized=false;sync();});
 header.append(title,returnButton,minimizeButton,closeButton);
 for(const [action,text,label]of [['front','正面','缩略视图：正面'],['rear','背面','缩略视图：背面'],['top','顶部','缩略视图：顶部'],['in','＋','放大缩略视图'],['out','−','缩小缩略视图']]){
  camera.append(button(action,text,label,()=>{if(active&&ready&&!disposed)onView(action);}));
 }
 panel.append(header,stage,camera);doc.body.append(panel);
 const resizeHandles=[];
 const resizeHelp='调整随行窗口大小：拖动边框；方向键调整，Shift 加快，Home 恢复默认大小';
 for(const edge of ['nw','n','ne','e','se','s','sw','w']){
  const handle=element(edge==='nw'?'button':'div','rtds-pip-resize');handle.dataset.pipResize=edge;handle.title=resizeHelp;
  if(edge==='nw'){handle.type='button';handle.setAttribute('aria-label',resizeHelp);listen(handle,'keydown',resizeKey);}
  else handle.setAttribute('aria-hidden','true');
  listen(handle,'pointerdown',event=>startResize(event,handle,edge));resizeHandles.push(handle);panel.append(handle);
 }
 function viewport(){return {width:win.innerWidth,height:win.innerHeight};}
 function applyGeometry(){
  // Keep the user's desired expanded size separate from temporary viewport
  // clamps; maximizing a browser again restores that size, not a shrunken copy.
  const fitted=fitRtdsPip(geometry,viewport());
  panel.style.width=`${minimized?Math.min(DEFAULT_PIP.width,fitted.width):fitted.width}px`;
  panel.style.height=minimized?'auto':`${fitted.height}px`;
  panel.style.right=`${fitted.right}px`;panel.style.bottom=`${fitted.bottom}px`;
 }
 function stopResize(){
  if(!drag)return;
  const current=drag;drag=null;
  for(const [type,handler]of current.listeners)current.handle.removeEventListener(type,handler);
  if(current.handle.hasPointerCapture(current.pointerId))current.handle.releasePointerCapture(current.pointerId);
  doc.body.classList.remove('rtds-pip-resizing');panel.removeAttribute('data-resizing');
 }
 function startResize(event,handle,edge){
  if(disposed||panel.hidden||minimized||event.button!==0||event.isPrimary===false||drag)return;
  event.preventDefault();event.stopPropagation();resizeHandles[0].focus({preventScroll:true});
  const start=fitRtdsPip(geometry,viewport());
  const move=event=>{
   if(!drag||event.pointerId!==drag.pointerId)return;
   event.preventDefault();event.stopPropagation();
   geometry=resizeRtdsPip(start,edge,event.clientX-drag.x,event.clientY-drag.y,viewport());applyGeometry();
  };
  const finish=event=>{if(event.pointerId===drag?.pointerId){event.preventDefault();event.stopPropagation();stopResize();}};
  drag={handle,pointerId:event.pointerId,x:event.clientX,y:event.clientY,original:{...geometry},listeners:[['pointermove',move],['pointerup',finish],['pointercancel',finish],['lostpointercapture',finish]]};
  for(const [type,handler]of drag.listeners)handle.addEventListener(type,handler);
  handle.setPointerCapture(event.pointerId);doc.body.classList.add('rtds-pip-resizing');panel.setAttribute('data-resizing',edge);
 }
 function resizeKey(event){
  if(panel.hidden||minimized)return;
  const step=event.shiftKey?48:16,deltas={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
  if(event.key!=='Home'&&!deltas[event.key])return;
  event.preventDefault();event.stopPropagation();stopResize();
  geometry=event.key==='Home'?{...DEFAULT_PIP}:resizeRtdsPip(geometry,'nw',...deltas[event.key],viewport());applyGeometry();
 }

 function restoreFocus(){const target=lastExternalFocus?.isConnected?lastExternalFocus:slot;target.focus({preventScroll:true});}
 function restoreInline(){
  stopResize();
  const focusWasInPanel=panel.contains(doc.activeElement);
  if(wrap.parentNode!==slot)slot.append(wrap);
  slot.style.removeProperty('height');panel.hidden=true;stage.hidden=false;camera.hidden=false;
  panel.dataset.state='inline';doc.body.classList.remove('rtds-pip-active');
  if(focusWasInPanel)restoreFocus();
 }
 function sync(){
  if(disposed)return;
  // Eligibility is lifecycle state only. Content layout never depends on it:
  // the fixed overlay must not reserve space or rewrap the paragraph being read.
  doc.body.classList.toggle('rtds-pip-capable',active&&ready&&desktop.matches);
  const rect=slot.getBoundingClientRect(),hasLayout=rect.width>0&&rect.height>0;
  const sourceVisible=hasLayout&&rect.bottom>0&&rect.top<win.innerHeight;
  if(sourceVisible||!active||!ready||!desktop.matches){dismissed=false;minimized=false;}
  const state=rtdsPipState({active,ready,desktop:desktop.matches,pastViewer:hasLayout&&rect.bottom<=0,dismissed,minimized,suppressed});
  if(state==='inline'){restoreInline();return;}
  if(wrap.parentNode===slot){
   // Keep the original footprint before detaching: docking must not shorten the
   // page, move the user's reading position or use the floating frame as a sentinel.
   slot.style.height=`${rect.height}px`;stage.append(wrap);
  }
  if(minimized)stopResize();
  panel.hidden=false;panel.dataset.state=state;stage.hidden=minimized;camera.hidden=minimized;
  for(const handle of resizeHandles)handle.hidden=minimized;applyGeometry();
  doc.body.classList.add('rtds-pip-active');
  minimizeButton.textContent=minimized?'□':'−';
  const label=minimized?'展开 3D 缩略视图':'最小化 3D 缩略视图';
  minimizeButton.setAttribute('aria-label',label);minimizeButton.title=label;minimizeButton.setAttribute('aria-expanded',String(!minimized));
 }
 function schedule(){if(!disposed&&!frame)frame=win.requestAnimationFrame(()=>{frame=0;sync();});}
 // Restoring inline removes the frozen placeholder height. At a responsive
 // breakpoint the real source can then become shorter and fully offscreen;
 // recheck that measured footprint rather than waiting for another scroll.
 // Docking freezes this same measured height, so the observer settles at idle.
 const sourceObserver=new win.ResizeObserver(schedule);sourceObserver.observe(slot);
 listen(win,'scroll',schedule,{passive:true});listen(win,'resize',()=>{stopResize();schedule();});listen(desktop,'change',()=>{stopResize();schedule();});listen(win,'blur',stopResize);
 listen(doc,'focusin',event=>{if(!panel.contains(event.target)&&event.target!==doc.body)lastExternalFocus=event.target;});
 listen(panel,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();if(drag){geometry=drag.original;stopResize();applyGeometry();return;}dismissed=true;minimized=false;sync();}});
 sync();
 return {
  setActive(value){if(disposed)return;active=!!value;sync();},
  setSuppressed(value){if(disposed)return;suppressed=!!value;sync();},
  setReady(value){if(disposed)return;ready=!!value;sync();},
  dispose(){
   if(disposed)return;win.cancelAnimationFrame(frame);frame=0;sourceObserver.disconnect();restoreInline();disposed=true;
   doc.body.classList.remove('rtds-pip-capable');
   for(const remove of removers)remove();
   slot.parentNode?.insertBefore(wrap,slot);slot.remove();panel.remove();
  }
 };
}
