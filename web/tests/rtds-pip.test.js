import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';

const pip=existsSync(new URL('../src/rtds-pip.js',import.meta.url))?await import('../src/rtds-pip.js'):{};

// A deliberately small DOM harness. Geometry and events are inputs; the real
// controller owns every node move, lifecycle decision and callback under test.
class Target extends EventTarget {
 listeners=new Map();
 addEventListener(type,listener,options){super.addEventListener(type,listener,options);if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(listener);}
 removeEventListener(type,listener,options){super.removeEventListener(type,listener,options);this.listeners.get(type)?.delete(listener);}
 listenerCount(){return [...this.listeners.values()].reduce((n,set)=>n+set.size,0);}
}
class Node extends Target {
 constructor(tag,doc){super();this.tagName=tag.toUpperCase();this.ownerDocument=doc;this.children=[];this.parentNode=null;this.dataset={};this.attributes=new Map();this.className='';this.hidden=false;this.style={removeProperty(name){delete this[name];}};this.textContent='';this.tabIndex=-1;this.classList={contains:name=>this.className.split(' ').includes(name),add:(...names)=>{this.className=[...new Set([...this.className.split(' ').filter(Boolean),...names])].join(' ');},remove:(...names)=>{this.className=this.className.split(' ').filter(name=>!names.includes(name)).join(' ');},toggle:(name,force)=>{const value=force??!this.classList.contains(name);this.classList[value?'add':'remove'](name);return value;}};}
 append(...nodes){for(const node of nodes){node.remove();node.parentNode=this;this.children.push(node);}}
 insertBefore(node,before){node.remove();const index=this.children.indexOf(before);assert.notEqual(index,-1);node.parentNode=this;this.children.splice(index,0,node);}
 remove(){if(this.parentNode){this.parentNode.children.splice(this.parentNode.children.indexOf(this),1);this.parentNode=null;}}
 setAttribute(name,value){this.attributes.set(name,String(value));}
 getAttribute(name){return this.attributes.get(name)??null;}
 removeAttribute(name){this.attributes.delete(name);}
 contains(node){return node===this||this.children.some(child=>child.contains(node));}
 get isConnected(){return this===this.ownerDocument.body||!!this.parentNode?.isConnected;}
 getBoundingClientRect(){if(this.classList.contains('rtds-pip-slot'))return {...this.ownerDocument.rect};if(this.classList.contains('rtds-pip')){const width=parseFloat(this.style.width)||320,height=parseFloat(this.style.height)||306,right=this.ownerDocument.defaultView.innerWidth-(parseFloat(this.style.right)||18),bottom=this.ownerDocument.defaultView.innerHeight-(parseFloat(this.style.bottom)||18);return {x:right-width,y:bottom-height,left:right-width,top:bottom-height,right,bottom,width,height};}return {top:100,bottom:550,width:900,height:450};}
 setPointerCapture(id){this.captured=id;}
 hasPointerCapture(id){return this.captured===id;}
 releasePointerCapture(id){if(this.captured===id)this.captured=null;}
 focus(){this.ownerDocument.activeElement=this;const event=new Event('focusin');Object.defineProperty(event,'target',{value:this});this.ownerDocument.dispatchEvent(event);}
 click(){this.dispatchEvent(new Event('click'));}
 scrollIntoView(options){this.scrollOptions=options;Object.assign(this.ownerDocument.rect,{top:120,bottom:570});}
}
function fixture(){
 assert.equal(typeof pip.initRtdsPip,'function','the desktop mini-viewer controller must exist');
 const doc=new Target();doc.rect={top:100,bottom:550,width:900,height:450};doc.createElement=tag=>new Node(tag,doc);doc.body=doc.createElement('body');doc.activeElement=doc.body;
 const win=new Target(),media=new Target();media.matches=true;win.innerWidth=1440;win.innerHeight=900;win.matchMedia=()=>media;const pending=new Map();let next=0;win.requestAnimationFrame=fn=>{pending.set(++next,fn);return next;};win.cancelAnimationFrame=id=>pending.delete(id);doc.defaultView=win;
 const original=doc.createElement('section'),before=doc.createElement('p'),wrap=doc.createElement('div'),canvas=doc.createElement('canvas'),after=doc.createElement('button');wrap.className='rtds-viewer-wrap';canvas.modelState={selection:'GT23',zoom:2,orbit:[1,2,3]};wrap.append(canvas);original.append(before,wrap,after);doc.body.append(original);const views=[];
 const api=pip.initRtdsPip({wrap,onView:action=>views.push(action)});
 const walk=(node)=>[node,...node.children.flatMap(walk)];const find=(name)=>walk(doc.body).find(node=>node.classList.contains(name));const action=(name)=>walk(doc.body).find(node=>node.dataset.pipAction===name);const handle=(edge)=>walk(doc.body).find(node=>node.dataset.pipResize===edge);
 const flush=()=>{for(const [id,fn]of [...pending]){pending.delete(id);fn();}};
 const scroll=(top)=>{Object.assign(doc.rect,{top,bottom:top+450});win.dispatchEvent(new Event('scroll'));flush();};
 const desktop=(value)=>{media.matches=value;media.dispatchEvent(new Event('change'));win.dispatchEvent(new Event('resize'));flush();};
 const ready=()=>{api.setActive(true);api.setReady(true);};
 return {api,doc,win,media,wrap,canvas,original,before,after,views,find,action,handle,flush,scroll,desktop,ready,pending};
}

test('eligibility requires ready desktop RTDS, a passed source frame and no dismissal',()=>{
 assert.equal(typeof pip.rtdsPipState,'function','eligibility logic must exist');
 const state={active:true,ready:true,desktop:true,pastViewer:true,dismissed:false,minimized:false};
 assert.equal(pip.rtdsPipState(state),'expanded');
 for(const key of ['active','ready','desktop','pastViewer'])assert.equal(pip.rtdsPipState({...state,[key]:false}),'inline',key);
 assert.equal(pip.rtdsPipState({...state,dismissed:true}),'inline');
 assert.equal(pip.rtdsPipState({...state,minimized:true}),'minimized');
});

test('desktop reading gutter capability stays stable across inline, dock, minimize and close, but cleans up on lifecycle changes',()=>{
 const f=fixture(),capable=()=>f.doc.body.classList.contains('rtds-pip-capable');
 assert.equal(capable(),false);f.api.setActive(true);assert.equal(capable(),false);f.api.setReady(true);assert.equal(capable(),true,'reserve the reading gutter before docking');
 f.scroll(-500);assert.equal(capable(),true);f.action('minimize').click();assert.equal(capable(),true);f.action('close').click();assert.equal(capable(),true);f.scroll(100);assert.equal(capable(),true);
 for(const [disable,enable]of [[()=>f.api.setReady(false),()=>f.api.setReady(true)],[()=>f.api.setActive(false),()=>f.api.setActive(true)],[()=>f.desktop(false),()=>f.desktop(true)]]){disable();assert.equal(capable(),false);enable();assert.equal(capable(),true);}
 f.api.dispose();assert.equal(capable(),false);
});

test('scroll moves the exact canvas and whole wrap, preserving its state and source height',()=>{
 const f=fixture();f.ready();const slot=f.find('rtds-pip-slot'),panel=f.find('rtds-pip');
 assert.equal(f.wrap.parentNode,slot);assert.equal(panel.hidden,true);
 f.scroll(1000);assert.equal(panel.hidden,true,'a source below the viewport must not dock');
 f.scroll(-449);assert.equal(panel.hidden,true,'a source still partly visible remains inline');
 const state=f.canvas.modelState;f.scroll(-450);
 assert.equal(panel.hidden,false);assert.equal(panel.dataset.state,'expanded');assert.equal(slot.style.height,'450px');
 assert.equal(f.wrap.parentNode,f.find('rtds-pip-stage'));assert.equal(f.wrap.children[0],f.canvas);assert.equal(f.canvas.modelState,state);assert.ok(f.doc.body.classList.contains('rtds-pip-active'));
 f.scroll(-449);assert.equal(f.wrap.parentNode,slot);assert.equal(slot.style.height,undefined);assert.equal(panel.hidden,true);assert.ok(!f.doc.body.classList.contains('rtds-pip-active'));
 f.api.dispose();
});

test('not-ready, inactive, hidden-source and mobile states never detach the canvas',()=>{
 const f=fixture(),slot=f.find('rtds-pip-slot');f.scroll(-500);assert.equal(f.wrap.parentNode,slot);
 f.api.setActive(true);assert.equal(f.wrap.parentNode,slot);f.api.setReady(true);assert.notEqual(f.wrap.parentNode,slot);
 for(const [disable,enable] of [[()=>f.api.setReady(false),()=>f.api.setReady(true)],[()=>f.api.setActive(false),()=>f.api.setActive(true)],[()=>f.desktop(false),()=>f.desktop(true)]]){
  disable();assert.equal(f.wrap.parentNode,slot);assert.equal(f.find('rtds-pip').hidden,true);assert.ok(!f.doc.body.classList.contains('rtds-pip-active'));enable();assert.notEqual(f.wrap.parentNode,slot);
 }
 Object.assign(f.doc.rect,{width:0,height:0,top:0,bottom:0});f.win.dispatchEvent(new Event('scroll'));f.flush();assert.equal(f.wrap.parentNode,slot);f.api.dispose();
});

test('minimize keeps the same model, exposes an expand button and resets when the main frame returns',()=>{
 const f=fixture();f.ready();f.scroll(-500);const stage=f.find('rtds-pip-stage'),toggle=f.action('minimize');
 toggle.focus();toggle.click();assert.equal(f.find('rtds-pip').dataset.state,'minimized');assert.equal(stage.hidden,true);assert.equal(toggle.getAttribute('aria-expanded'),'false');assert.equal(toggle.getAttribute('aria-label'),'展开 3D 缩略视图');assert.equal(f.wrap.parentNode,stage);assert.equal(f.doc.activeElement,toggle);
 toggle.click();assert.equal(stage.hidden,false);assert.equal(toggle.getAttribute('aria-expanded'),'true');assert.equal(f.canvas.modelState.selection,'GT23');
 toggle.click();f.scroll(100);f.scroll(-500);assert.equal(f.find('rtds-pip').dataset.state,'expanded');f.api.dispose();
});

test('close and Escape restore inline, return focus, and suppress redocking until source reappears',()=>{
 const f=fixture();f.ready();f.after.focus();f.scroll(-500);f.action('close').focus();f.action('close').click();assert.equal(f.find('rtds-pip').hidden,true);assert.equal(f.doc.activeElement,f.after);
 f.scroll(-700);assert.equal(f.find('rtds-pip').hidden,true);f.scroll(100);f.scroll(-500);assert.equal(f.find('rtds-pip').hidden,false);
 f.action('minimize').focus();const escape=new Event('keydown',{cancelable:true});Object.defineProperty(escape,'key',{value:'Escape'});f.find('rtds-pip').dispatchEvent(escape);assert.equal(escape.defaultPrevented,true);assert.equal(f.find('rtds-pip').hidden,true);f.api.dispose();
});

test('new model and mode transitions clear dismissal while loading never shows a stale dock',()=>{
 const f=fixture();f.ready();f.scroll(-500);f.action('close').click();f.api.setReady(false);f.scroll(-700);assert.equal(f.find('rtds-pip').hidden,true);f.api.setReady(true);assert.equal(f.find('rtds-pip').hidden,false);
 f.action('close').click();f.api.setActive(false);f.api.setActive(true);assert.equal(f.find('rtds-pip').hidden,false);f.api.dispose();
});

test('keyboard-operable view buttons dispatch only their intended camera actions',()=>{
 const f=fixture();f.ready();f.scroll(-500);
 for(const action of ['front','rear','top','in','out']){const button=f.action(action);assert.equal(button.tagName,'BUTTON');assert.equal(button.type,'button');assert.ok(button.getAttribute('aria-label'));button.click();}
 assert.deepEqual(f.views,['front','rear','top','in','out']);f.api.dispose();
});

test('return-to-main restores before scrolling and focuses the source without altering canvas state',()=>{
 const f=fixture();f.ready();f.scroll(-500);f.action('return').focus();f.action('return').click();const slot=f.find('rtds-pip-slot');
 assert.equal(f.wrap.parentNode,slot);assert.equal(f.find('rtds-pip').hidden,true);assert.equal(f.doc.activeElement,slot);assert.deepEqual(slot.scrollOptions,{block:'center',behavior:'instant'});assert.equal(f.canvas.modelState.zoom,2);
 f.scroll(-500);assert.equal(f.find('rtds-pip').hidden,false);f.api.dispose();
});

test('dispose cancels queued frames and listeners, restores exact DOM order and is idempotent',()=>{
 const f=fixture();f.ready();f.scroll(-500);f.win.dispatchEvent(new Event('scroll'));assert.equal(f.pending.size,1);f.api.dispose();f.api.dispose();
 assert.deepEqual(f.original.children,[f.before,f.wrap,f.after]);assert.equal(f.find('rtds-pip'),undefined);assert.equal(f.find('rtds-pip-slot'),undefined);assert.equal(f.win.listenerCount(),0);assert.equal(f.media.listenerCount(),0);assert.equal(f.doc.listenerCount(),0);assert.equal(f.pending.size,0);assert.ok(!f.doc.body.classList.contains('rtds-pip-active'));
 f.api.setActive(true);f.api.setReady(true);f.scroll(-500);assert.equal(f.wrap.parentNode,f.original);
});

test('mini styling is desktop-only and retains readable non-blocking captions without restyling the orange highlight',()=>{
 assert.ok(existsSync('src/rtds-pip.css'),'mini-viewer stylesheet must exist');const css=readFileSync('src/rtds-pip.css','utf8');
 assert.match(css,/@media\s*\(min-width:\s*1024px\)/);assert.match(css,/--rtds-pip-width:\s*320px/);assert.match(css,/pointer-events:\s*none/);assert.ok(!/\.rtds-highlight[^}]*stroke/.test(css));
});


function pointer(node,type,values={}){const event=new Event(type,{cancelable:true});for(const [key,value]of Object.entries({pointerId:1,button:0,isPrimary:true,clientX:0,clientY:0,...values}))Object.defineProperty(event,key,{value});node.dispatchEvent(event);return event;}
function key(node,key,shiftKey=false){return pointer(node,'keydown',{key,shiftKey});}
function size(f){const panel=f.find('rtds-pip');return Object.fromEntries(['width','height','right','bottom'].map(key=>[key,parseFloat(panel.style[key])]));}

test('resize geometry clamps every edge and corner without moving the opposite anchor',()=>{
 assert.equal(typeof pip.resizeRtdsPip,'function','resize geometry must exist');
 const view={width:1440,height:900},start={width:320,height:306,right:18,bottom:18};
 assert.deepEqual(pip.resizeRtdsPip(start,'nw',-180,-120,view),{width:500,height:426,right:18,bottom:18});
 assert.deepEqual(pip.resizeRtdsPip(start,'nw',1000,1000,view),{width:280,height:240,right:18,bottom:18});
 assert.deepEqual(pip.resizeRtdsPip(start,'nw',-9999,-9999,view),{width:1404,height:864,right:18,bottom:18});
 assert.deepEqual(pip.resizeRtdsPip(start,'nw',-9999,-9999,{width:1024,height:280}),{width:988,height:244,right:18,bottom:18});
 const inset={width:400,height:350,right:150,bottom:140};
 assert.deepEqual(pip.resizeRtdsPip(inset,'se',80,50,view),{width:480,height:400,right:70,bottom:90});
 for(const edge of ['n','e','s','w','ne','nw','se','sw']){
  const next=pip.resizeRtdsPip(inset,edge,20,20,view);
  if(!edge.includes('n')&&!edge.includes('s'))assert.equal(next.height,inset.height);
  if(!edge.includes('w')&&!edge.includes('e'))assert.equal(next.width,inset.width);
 }
});

test('dragging the visible corner resizes only the frame and preserves source, selection and camera state',()=>{
 const f=fixture();f.ready();f.scroll(-500);const handle=f.handle('nw');assert.ok(handle,'a top-left resize grip must exist');
 const state=f.canvas.modelState,slot=f.find('rtds-pip-slot'),before=size(f);const down=pointer(handle,'pointerdown',{clientX:1102,clientY:576});
 assert.equal(down.defaultPrevented,true);assert.equal(handle.captured,1);assert.ok(f.doc.body.classList.contains('rtds-pip-resizing'));
 pointer(handle,'pointermove',{pointerId:2,clientX:922,clientY:456});assert.deepEqual(size(f),before);
 pointer(handle,'pointermove',{clientX:922,clientY:456});assert.equal(size(f).width,before.width+180);assert.equal(size(f).height,before.height+120);
 assert.equal(slot.style.height,'450px');assert.equal(f.canvas.modelState,state);assert.deepEqual(f.views,[]);assert.equal(f.wrap.children[0],f.canvas);
 pointer(handle,'pointerup');assert.equal(handle.captured,null);assert.ok(!f.doc.body.classList.contains('rtds-pip-resizing'));const end=size(f);
 pointer(handle,'pointermove',{clientX:100,clientY:100});assert.deepEqual(size(f),end);f.api.dispose();
});

test('expanded geometry survives minimize, return, close, viewport clamps and mobile restoration',()=>{
 const f=fixture();f.ready();f.scroll(-500);const handle=f.handle('nw');assert.ok(handle);key(handle,'ArrowLeft',true);key(handle,'ArrowUp',true);const expanded=size(f);
 f.action('minimize').click();assert.equal(f.find('rtds-pip').dataset.state,'minimized');assert.equal(handle.hidden,true);f.action('minimize').click();assert.deepEqual(size(f),expanded);
 f.action('return').click();f.scroll(-500);assert.deepEqual(size(f),expanded);f.action('close').click();f.scroll(100);f.scroll(-500);assert.deepEqual(size(f),expanded);
 f.win.innerHeight=280;f.win.dispatchEvent(new Event('resize'));f.flush();assert.equal(size(f).height,244);assert.equal(size(f).bottom,18);
 f.desktop(false);assert.equal(f.wrap.parentNode,f.find('rtds-pip-slot'));f.win.innerHeight=900;f.desktop(true);assert.deepEqual(size(f),expanded);f.api.dispose();
});

test('resize grip offers keyboard dimensions, reset and no camera action',()=>{
 const f=fixture();f.ready();f.scroll(-500);const handle=f.handle('nw');assert.ok(handle);assert.equal(handle.tagName,'BUTTON');assert.match(handle.getAttribute('aria-label'),/调整/);
 const before=size(f);assert.equal(key(handle,'ArrowLeft').defaultPrevented,true);assert.equal(size(f).width,before.width+16);key(handle,'ArrowUp',true);assert.equal(size(f).height,before.height+48);
 key(handle,'ArrowRight');key(handle,'ArrowDown',true);assert.deepEqual(size(f),before);key(handle,'ArrowLeft');key(handle,'Home');assert.deepEqual(size(f),before);assert.deepEqual(f.views,[]);f.api.dispose();
});

test('interrupted resizing releases capture and transient listeners on every lifecycle boundary',()=>{
 for(const stop of [f=>f.action('minimize').click(),f=>f.action('close').click(),f=>f.action('return').click(),f=>f.api.setActive(false),f=>f.api.setReady(false),f=>f.desktop(false),f=>f.scroll(100),f=>f.win.dispatchEvent(new Event('blur')),f=>pointer(f.handle('nw'),'pointercancel'),f=>pointer(f.handle('nw'),'lostpointercapture'),f=>{f.win.dispatchEvent(new Event('resize'));f.flush();},f=>f.api.dispose()]){
  const f=fixture();f.ready();f.scroll(-500);const handle=f.handle('nw');assert.ok(handle);const count=handle.listenerCount();pointer(handle,'pointerdown');assert.equal(handle.captured,1);assert.ok(handle.listenerCount()>count);stop(f);assert.equal(handle.captured,null);assert.ok(handle.listenerCount()<=count);assert.ok(!f.doc.body.classList.contains('rtds-pip-resizing'));const after={...f.find('rtds-pip')?.style};pointer(handle,'pointermove',{clientX:-100,clientY:-100});assert.deepEqual({...f.find('rtds-pip')?.style},after);f.api.dispose();
 }
});

test('non-primary buttons and pointers cannot start a resize',()=>{
 const f=fixture();f.ready();f.scroll(-500);const handle=f.handle('nw');assert.ok(handle);const before=size(f);
 for(const values of [{button:2},{isPrimary:false}]){assert.equal(pointer(handle,'pointerdown',values).defaultPrevented,false);assert.equal(handle.captured,undefined);}
 assert.deepEqual(size(f),before);f.api.dispose();
});

test('Escape cancels an active drag without closing the window or leaving capture behind',()=>{
 const f=fixture();f.ready();f.scroll(-500);const handle=f.handle('nw');assert.ok(handle);const before=size(f);pointer(handle,'pointerdown',{clientX:1102,clientY:576});pointer(handle,'pointermove',{clientX:1002,clientY:476});assert.notDeepEqual(size(f),before);key(f.find('rtds-pip'),'Escape');assert.equal(f.find('rtds-pip').hidden,false);assert.deepEqual(size(f),before);assert.equal(handle.captured,null);f.api.dispose();
});
