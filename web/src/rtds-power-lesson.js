import './rtds-power.css';
import {publishedModels} from './rtds-models.js';
import {createPowerScene} from './rtds-power-scene.js';
import {powerLesson,createPowerLessonState,powerLessonTransition,powerPresentation} from './rtds-power-state.js';
const $=id=>document.getElementById(id);
const markers={upperInput:'upper-input',lowerInput:'lower-input',lowerLink:'lower-link',supplyOutput:'supply-output',feedPlug:'feed-plug',jumperPlug:'jumper-plug',jumperStartPlug:'jumper-start-plug',upperBoard:'upper-board',lowerBoard:'lower-board',supplyLabel:'supply-label'};
export function initPowerLesson(){
 const section=$('rtds-power-lesson'),container=$('power-model-scene'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let state=createPowerLessonState(),active=false,inView=false,scene=null,loading=false,disposed=false,generation=0,frame=0,lastTime=null;
 const listeners=[];function listen(node,event,callback,options){node.addEventListener(event,callback,options);listeners.push(()=>node.removeEventListener(event,callback,options));}
 function hideMarkers(){for(const name of Object.values(markers))$('power-'+name).hidden=true;for(const node of section.querySelectorAll('.power-connector-label'))node.hidden=true;}
 function projection(points){
  for(const [key,name]of Object.entries(markers)){
   const p=points[key],node=$('power-'+name);node.hidden=!p?.visible;if(!p?.visible)continue;
   const isBoard=key==='upperBoard'||key==='lowerBoard',x=isBoard?Math.max(7,Math.min(p.x,container.clientWidth-node.offsetWidth-14)):p.x;
   node.style.left=x+'px';node.style.top=p.y+'px';node.dataset.world=p.world.join(',');
   const label=$('power-'+name+'-label');if(label){label.hidden=false;label.style.left=p.x+'px';label.style.top=p.y+'px';}
  }
  for(const key of ['upperInput','lowerInput','lowerLink','supplyOutput'])if(!points[key]?.visible)$('power-'+markers[key]+'-label').hidden=true;
 }
 function cancel(){cancelAnimationFrame(frame);frame=0;lastTime=null;}
 function render(){
  const p=powerPresentation(state,reduce.matches),ready=!!scene;section.dataset.playing=String(state.playing);section.dataset.elapsed=String(Math.round(state.elapsedMs));section.dataset.connected=String(ready&&p.connected);section.dataset.energized=String(ready&&p.energized);
  $('power-play').disabled=!ready;$('power-play').textContent=state.started?'↻ 重放':'▶ 一键播放';$('power-pause').hidden=!state.started||state.elapsedMs>=powerLesson.durationMs;$('power-pause').textContent=state.playing?'Ⅱ 暂停':'▶ 继续';
  for(const id of ['upper','lower'])$('power-'+id+'-voltage').textContent=ready&&p.energized?'24 V DC':'未供电';
  $('power-supply-status').textContent=ready&&p.energized?'24 V DC · ON':'输出 OFF';
  $('power-feed-state').textContent=!ready?'等待模型':p.connected?'电源线已接到下卡下侧口':state.started?'电源线：断电 · 接入中':'电源线：待接线 · 保持断电';$('power-jumper-state').textContent=!ready?'等待模型':p.connected?'跳线已就位 · 共用 24 V 母线':state.started?'跳线：断电 · 接入中':'卡间跳线：待连接';
  const caption=!ready?'等待原有 GTAO 3D 模型；不以抽象板卡代替。':!state.started?'一键同时接入电源线与卡间跳线；接好后再开启 24 V 供电。':!p.connected?'供电保持 OFF：电源线、跳线同时接近真实模型的供电接头。':!p.energized?'两条线束已就位，仍保持断电；随后两卡共同接入 24 V 母线。':'两卡同时获得 24 V DC。线束逐卡连接，电气上并联，不是把两卡串联分压。';
  if($('power-caption').textContent!==caption)$('power-caption').textContent=caption;scene?.update(p);
 }
 function pause(){cancel();state=powerLessonTransition(state,{type:'pause'});render();}
 function tick(time){if(!active||!inView||document.hidden||!state.playing){pause();return;}if(lastTime!==null)state=powerLessonTransition(state,{type:'tick',deltaMs:Math.min(time-lastTime,100)});lastTime=time;render();if(state.playing)frame=requestAnimationFrame(tick);else cancel();}
 function act(action){cancel();state=powerLessonTransition(state,action);render();if(state.playing&&active)frame=requestAnimationFrame(tick);}
 async function load(){
  if(scene||loading||disposed)return;loading=true;const token=++generation;container.dataset.loaded='loading';$('power-model-loading').hidden=false;$('power-model-loading').textContent='正在载入两张原有 GTAO V2 模型…';$('power-model-retry').hidden=true;hideMarkers();
  try{
   const info=publishedModels[powerLesson.variantId],r=await fetch(new URL(info.metadata,document.baseURI));if(!r.ok)throw Error('GTAO 接口资料加载失败');const metadata=await r.json();if(disposed||token!==generation)return;
   const result=await createPowerScene(container,info,metadata,projection,()=>!disposed&&token===generation);if(!result)return;if(disposed||token!==generation){result.dispose();return;}scene=result;scene.setActive(active&&inView&&!document.hidden);$('power-model-loading').hidden=true;
   for(const action of ['front','detail','in','out'])$('power-model-'+action).disabled=false;render();
  }catch(error){if(disposed||token!==generation)return;console.warn('GTIO power model unavailable:',error);container.dataset.loaded='error';$('power-model-loading').textContent='原有 GTAO 3D 模型未能载入。不会用抽象板卡替代；请重试。';$('power-model-retry').hidden=false;hideMarkers();render();}finally{if(token===generation)loading=false;}
 }
 listen($('power-play'),'click',()=>{if(active&&scene)act({type:'replay'});});listen($('power-pause'),'click',()=>{if(active&&scene)act({type:state.playing?'pause':'play'});});listen($('power-model-retry'),'click',load);
 for(const action of ['front','detail','in','out'])listen($('power-model-'+action),'click',()=>{pause();scene?.view(action);if(action==='front'||action==='detail'){for(const mode of ['front','detail'])$('power-model-'+mode).setAttribute('aria-pressed',String(action===mode));}});
 listen(container,'pointerdown',pause);listen(container,'wheel',pause,{passive:true});
 const observer=new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);scene?.setActive(active&&inView&&!document.hidden);if(!inView)pause();else if(active)load();},{rootMargin:'100px'});observer.observe(container);
 const reducedChange=()=>pause();reduce.addEventListener('change',reducedChange);render();
 return{setActive(value){if(disposed)return;active=!!value;if(!active)pause();scene?.setActive(active&&inView&&!document.hidden);if(active&&inView)load();},pause,open(){if(disposed)return;pause();section.scrollIntoView({block:'start',behavior:reduce.matches?'instant':'smooth'});$('power-heading').focus({preventScroll:true});if(active)load();},dispose(){disposed=true;generation++;cancel();observer.disconnect();reduce.removeEventListener('change',reducedChange);for(const stop of listeners)stop();scene?.dispose();scene=null;hideMarkers();}};
}
