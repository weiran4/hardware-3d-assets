// Presentation only: the original viewer, renderer, selection and OrbitControls
// stay alive. Moving the whole wrap also keeps its projected highlight and label.
export function rtdsPipState({active,ready,desktop,pastViewer,dismissed,minimized}){
 if(!active||!ready||!desktop||!pastViewer||dismissed)return 'inline';
 return minimized?'minimized':'expanded';
}

export function initRtdsPip({wrap,onView=()=>{}}){
 if(!wrap?.parentNode)throw new TypeError('A connected RTDS viewer wrap is required');
 const doc=wrap.ownerDocument,win=doc.defaultView,desktop=win.matchMedia('(min-width: 1024px)');
 let active=false,ready=false,dismissed=false,minimized=false,disposed=false,frame=0,lastExternalFocus=null;
 const removers=[];
 function listen(target,type,handler,options){target.addEventListener(type,handler,options);removers.push(()=>target.removeEventListener(type,handler,options));}
 function element(tag,className,text){const node=doc.createElement(tag);node.className=className;if(text)node.textContent=text;return node;}
 const slot=element('div','rtds-pip-slot');slot.tabIndex=-1;slot.setAttribute('aria-label','RTDS 主 3D 视图');
 wrap.parentNode.insertBefore(slot,wrap);slot.append(wrap);
 const panel=element('section','rtds-pip');panel.hidden=true;panel.setAttribute('aria-label','RTDS 3D 缩略视图');
 const header=element('div','rtds-pip-header'),title=element('strong','rtds-pip-title','3D 随行视图');
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

 function restoreFocus(){const target=lastExternalFocus?.isConnected?lastExternalFocus:slot;target.focus({preventScroll:true});}
 function restoreInline(){
  const focusWasInPanel=panel.contains(doc.activeElement);
  if(wrap.parentNode!==slot)slot.append(wrap);
  slot.style.removeProperty('height');panel.hidden=true;stage.hidden=false;camera.hidden=false;
  panel.dataset.state='inline';doc.body.classList.remove('rtds-pip-active');
  if(focusWasInPanel)restoreFocus();
 }
 function sync(){
  if(disposed)return;
  // Reserve reading space for the whole ready desktop session, not just while
  // floating: dock/minimize/close must not rewrap the paragraph being read.
  doc.body.classList.toggle('rtds-pip-capable',active&&ready&&desktop.matches);
  const rect=slot.getBoundingClientRect(),hasLayout=rect.width>0&&rect.height>0;
  const sourceVisible=hasLayout&&rect.bottom>0&&rect.top<win.innerHeight;
  if(sourceVisible||!active||!ready||!desktop.matches){dismissed=false;minimized=false;}
  const state=rtdsPipState({active,ready,desktop:desktop.matches,pastViewer:hasLayout&&rect.bottom<=0,dismissed,minimized});
  if(state==='inline'){restoreInline();return;}
  if(wrap.parentNode===slot){
   // Keep the original footprint before detaching: docking must not shorten the
   // page, move the user's reading position or use the floating frame as a sentinel.
   slot.style.height=`${rect.height}px`;stage.append(wrap);
  }
  panel.hidden=false;panel.dataset.state=state;stage.hidden=minimized;camera.hidden=minimized;
  doc.body.classList.add('rtds-pip-active');
  minimizeButton.textContent=minimized?'□':'−';
  const label=minimized?'展开 3D 缩略视图':'最小化 3D 缩略视图';
  minimizeButton.setAttribute('aria-label',label);minimizeButton.title=label;minimizeButton.setAttribute('aria-expanded',String(!minimized));
 }
 function schedule(){if(!disposed&&!frame)frame=win.requestAnimationFrame(()=>{frame=0;sync();});}
 listen(win,'scroll',schedule,{passive:true});listen(win,'resize',schedule);listen(desktop,'change',schedule);
 listen(doc,'focusin',event=>{if(!panel.contains(event.target)&&event.target!==doc.body)lastExternalFocus=event.target;});
 listen(panel,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();dismissed=true;minimized=false;sync();}});
 sync();
 return {
  setActive(value){if(disposed)return;active=!!value;sync();},
  setReady(value){if(disposed)return;ready=!!value;sync();},
  dispose(){
   if(disposed)return;win.cancelAnimationFrame(frame);frame=0;restoreInline();disposed=true;
   doc.body.classList.remove('rtds-pip-capable');
   for(const remove of removers)remove();
   slot.parentNode?.insertBefore(wrap,slot);slot.remove();panel.remove();
  }
 };
}
