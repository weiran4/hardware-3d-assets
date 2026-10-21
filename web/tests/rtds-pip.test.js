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
 getBoundingClientRect(){if(this.classList.contains('rtds-pip-slot'))return {...this.ownerDocument.rect};return {top:100,bottom:550,width:900,height:450};}
 focus(){this.ownerDocument.activeElement=this;const event=new Event('focusin');Object.defineProperty(event,'target',{value:this});this.ownerDocument.dispatchEvent(event);}
 click(){this.dispatchEvent(new Event('click'));}
 scrollIntoView(options){this.scrollOptions=options;Object.assign(this.ownerDocument.rect,{top:120,bottom:570});}
}
function fixture(){
 assert.equal(typeof pip.initRtdsPip,'function','the desktop mini-viewer controller must exist');
 const doc=new Target();doc.rect={top:100,bottom:550,width:900,height:450};doc.createElement=tag=>new Node(tag,doc);doc.body=doc.createElement('body');doc.activeElement=doc.body;
 const win=new Target(),media=new Target();media.matches=true;win.innerHeight=900;win.matchMedia=()=>media;const pending=new Map();let next=0;win.requestAnimationFrame=fn=>{pending.set(++next,fn);return next;};win.cancelAnimationFrame=id=>pending.delete(id);doc.defaultView=win;
 const original=doc.createElement('section'),before=doc.createElement('p'),wrap=doc.createElement('div'),canvas=doc.createElement('canvas'),after=doc.createElement('button');wrap.className='rtds-viewer-wrap';canvas.modelState={selection:'GT23',zoom:2,orbit:[1,2,3]};wrap.append(canvas);original.append(before,wrap,after);doc.body.append(original);const views=[];
 const api=pip.initRtdsPip({wrap,onView:action=>views.push(action)});
 const walk=(node)=>[node,...node.children.flatMap(walk)];const find=(name)=>walk(doc.body).find(node=>node.classList.contains(name));const action=(name)=>walk(doc.body).find(node=>node.dataset.pipAction===name);
 const flush=()=>{for(const [id,fn]of [...pending]){pending.delete(id);fn();}};
 const scroll=(top)=>{Object.assign(doc.rect,{top,bottom:top+450});win.dispatchEvent(new Event('scroll'));flush();};
 const desktop=(value)=>{media.matches=value;media.dispatchEvent(new Event('change'));win.dispatchEvent(new Event('resize'));flush();};
 const ready=()=>{api.setActive(true);api.setReady(true);};
 return {api,doc,win,media,wrap,canvas,original,before,after,views,find,action,flush,scroll,desktop,ready,pending};
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
