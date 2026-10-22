import './rtds-analog.css';
import {createRtdsScene} from './rtds-scene.js';
import {publishedModels} from './rtds-models.js';
import {lessonCameraLimits,lessonDetailMinimum} from './rtds-anchor-projection.js';
import {analogLesson,analogDisplaySample,createAnalogLessonState,analogLessonTransition,analogPresentation,analogProbeProgress} from './rtds-analog-state.js';
const $=id=>document.getElementById(id);
const captions=[
 '在虚拟仿真中取一个正弦电压数值。220 V 是有效值，正负峰值约为 ±311.13 V。',
 '用等效系数 k ≈ 0.01607061 缩放，再由 FPAO 对应前面板 D/A 输出：±311.13 V 仿真峰值 → ±5 V 低压峰值。',
 '红表笔接触输出 1，黑表笔接触模拟地。两支表笔只测低压输出；没有把 220 V 接进 NovaCor。',
 '万用表选择交流电压 V~。理想正弦读数为 5 / √2 ≈ 3.54 V RMS，不随正负瞬时值跳动。'
];
const voltage=value=>`${value<-0.005?'−':'+'}${Math.abs(value).toFixed(2)} V`;
export function initAnalogLesson(inspectEndpoint){
 let state=createAnalogLessonState(),active=false,frame=0,lastTime=null,lastCaption=-1,inspection=0,geometry=null,model=null,modelLoading=false,modelToken=0,disposed=false,unsubscribe=null,projected=null,modelInView=false,modelStage=-1,modelView='front',modelSettleFrame=0;
 const endpointIds=[analogLesson.endpoint.portId,analogLesson.endpoint.groundId];
 const section=$('rtds-analog-lesson'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const trace=Array.from({length:141},(_,i)=>`${i?'L':'M'}${i*2} ${(60-50*Math.sin(i/140*Math.PI*2)).toFixed(3)}`).join('');
 $('analog-source-trace').setAttribute('d',trace);$('analog-output-trace').setAttribute('d',trace);
 function hideContacts(){
  geometry=null;projected=null;$('analog-probe-overlay').setAttribute('hidden','');section.dataset.probesConnected='false';
  for(const id of ['analog-output-socket','analog-ground-socket','analog-output-anchor-label','analog-ground-anchor-label'])$(id).hidden=true;
 }
 function setModelControls(ready){for(const id of ['front','detail','in','out'])$('analog-model-'+id).disabled=!ready;}
 function settleModel(){
  cancelAnimationFrame(modelSettleFrame);if(!model)return;if(!active||document.hidden){model.setActive(false);return;}model.setActive(true);modelSettleFrame=requestAnimationFrame(()=>{modelSettleFrame=0;model?.setActive(active&&!document.hidden&&modelInView);});
 }
 function modelCamera(mode){
  if(!model)return;modelView=mode;projected=null;hideContacts();
  model.inspect(endpointIds,null,false,'前部模拟输出 1 + 模拟地 1');
  if(mode==='detail')model.focus(endpointIds);else model.view('front');settleModel();
  $('analog-model-front').setAttribute('aria-pressed',String(mode==='front'));$('analog-model-detail').setAttribute('aria-pressed',String(mode==='detail'));
  $('analog-model-context').textContent=mode==='detail'?'接点近看 · 周围仍是原有机箱面板与接口，不是替代图形':'机箱正面全貌 · 拖动小幅转动，观察真实前部位置';
 }
 function syncModelStage(){if(model&&modelStage!==state.stage){modelStage=state.stage;modelCamera(state.stage>=2?'detail':'front');}}
 async function loadModel(){
  if(model||modelLoading||disposed)return;modelLoading=true;const token=++modelToken;
  $('analog-model-scene').dataset.loaded='loading';$('analog-model-loading').hidden=false;$('analog-model-loading').textContent='正在载入原有 NovaCor 3D 模型…';$('analog-model-retry').hidden=true;setModelControls(false);hideContacts();
  try{
   const info=publishedModels['novacor-2.0'],response=await fetch(new URL(info.metadata,document.baseURI));if(!response.ok)throw Error('NovaCor 接口数据加载失败');const metadata=await response.json();
   if(disposed||token!==modelToken)return;
   const loaded=await createRtdsScene($('analog-model-scene'),$('analog-model-label'),info,metadata,()=>{},()=>!disposed&&token===modelToken,{overlayPrefix:'analog-model',frontOnly:true,controlsLimits:lessonCameraLimits,detailMinimum:lessonDetailMinimum});
   if(!loaded)return;if(disposed||token!==modelToken){loaded.dispose();return;}model=loaded;model.setActive(false);modelStage=-1;
   unsubscribe=model.subscribeAnchors(endpointIds,points=>{projected=points;measure();});syncModelStage();settleModel();
   $('analog-model-loading').hidden=true;setModelControls(true);render();
  }catch(error){
   if(disposed||token!==modelToken)return;console.warn('NovaCor lesson model unavailable:',error);$('analog-model-scene').dataset.loaded='error';$('analog-model-loading').textContent='原有 NovaCor 3D 模型未能载入。不会用抽象面板替代；请重试。';$('analog-model-retry').hidden=false;hideContacts();render();
  }finally{if(token===modelToken)modelLoading=false;}
 }
 function measure(){
  if(!model||!projected){hideContacts();return;}
  const bench=$('analog-bench'),box=bench.getBoundingClientRect(),canvas=$('analog-model-scene').getBoundingClientRect();if(!box.width||!box.height){geometry=null;return;}
  const center=id=>{const b=$(id).getBoundingClientRect();return{x:b.x-box.x+b.width/2,y:b.y-box.y+b.height/2};};
  const contacts={};let allVisible=true;
  for(const [color,id,socketId,labelId]of [['red',endpointIds[0],'analog-output-socket','analog-output-anchor-label'],['black',endpointIds[1],'analog-ground-socket','analog-ground-anchor-label']]){
   const point=projected[id],marker=$(socketId),label=$(labelId),visible=!!point?.visible;marker.hidden=!visible;label.hidden=!visible;allVisible&&=visible;if(!visible)continue;
   marker.style.left=point.x+'px';marker.style.top=point.y+'px';marker.dataset.world=point.world.join(',');
   label.style.left=Math.max(60,Math.min(canvas.width-60,point.x))+'px';label.style.top=Math.max(8,point.y-(color==='red'?57:32))+'px';
   contacts[color]={socket:{x:point.x+canvas.x-box.x,y:point.y+canvas.y-box.y},jack:center(color==='red'?'analog-meter-v':'analog-meter-com')};
  }
  $('analog-probe-overlay').toggleAttribute('hidden',!allVisible);if(!allVisible){geometry=null;section.dataset.probesConnected='false';renderMeter();return;}
  geometry={width:box.width,height:box.height,...contacts};$('analog-probe-overlay').setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);renderProbes();
 }
 function renderProbes(){
  if(!geometry)return;
  const progress=analogProbeProgress(state,reduce.matches);
  for(const color of ['black','red']){
   const {socket,jack}=geometry[color],tip={x:socket.x,y:socket.y+30*(1-progress)},start={x:tip.x,y:tip.y+40};
   $(`analog-${color}-probe`).setAttribute('transform',`translate(${tip.x} ${tip.y})`);
   // Mobile routes around (not through) the meter face; desktop hangs beneath it.
   const stacked=jack.y-socket.y>250,edge=color==='red'?geometry.width-9:9,bottom=Math.max(start.y,jack.y)+38;
   const d=stacked?`M${start.x} ${start.y} C${start.x} ${start.y+40},${edge} ${start.y+30},${edge} ${start.y+70} L${edge} ${bottom-30} Q${edge} ${bottom},${edge+(color==='red'?-30:30)} ${bottom} L${jack.x} ${bottom} Q${jack.x} ${bottom},${jack.x} ${jack.y}`:`M${start.x} ${start.y} C${start.x} ${bottom},${jack.x} ${bottom},${jack.x} ${jack.y}`;
   $(`analog-${color}-wire`).setAttribute('d',d);
  }
  section.dataset.probesConnected=String(progress>=1);renderMeter();
 }
 function render(){
  syncModelStage();
  const presentation=analogPresentation(state);
  // Reduced motion samples discrete quarter-cycles; no sweeping cursor or moving probe.
  const displayTime=reduce.matches?Math.floor(state.elapsedMs/1000)*1000:state.elapsedMs;
  const sample=analogDisplaySample(displayTime),phase=(displayTime%analogLesson.displayCycleMs)/analogLesson.displayCycleMs,x=phase*280,y=60-50*Math.sin(phase*Math.PI*2);
  section.dataset.stage=String(state.stage);section.dataset.playing=String(state.playing);section.dataset.elapsed=String(Math.round(state.elapsedMs));
  $('analog-play').textContent=state.playing?'Ⅱ 暂停动画':state.elapsedMs>=analogLesson.durationMs?'↺ 再播放一次':'▶ 播放动画';$('analog-play').setAttribute('aria-pressed',String(state.playing));$('analog-step').disabled=state.stage===3;
  if(lastCaption!==state.stage){$('analog-caption').textContent=captions[state.stage];$('analog-stage-number').textContent=`0${state.stage+1} / 04`;lastCaption=state.stage;}
  for(const button of section.querySelectorAll('[data-analog-stage]')){if(Number(button.dataset.analogStage)===state.stage)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');}
  for(const card of section.querySelectorAll('[data-analog-card]'))card.classList.toggle('active',Number(card.dataset.analogCard)===state.stage);
  $('analog-source-value').textContent=voltage(sample.source);$('analog-output-value').textContent=presentation.scaled?voltage(sample.output):'等待缩放';
  $('analog-virtual-probe').setAttribute('transform',`translate(${x} ${y})`);
  for(const kind of ['source','output']){const cursor=$(`analog-${kind}-cursor`);cursor.setAttribute('x1',x);cursor.setAttribute('x2',x);}
  $('analog-output-dot').setAttribute('cx',x);$('analog-output-dot').setAttribute('cy',y);
  $('analog-output-wave').style.opacity=presentation.scaled?'1':'.25';
  renderMeter();renderProbes();
 }
 function renderMeter(){
  const presentation=analogPresentation(state),contact=!!geometry&&analogProbeProgress(state,reduce.matches)>=1;
  $('analog-meter-value').textContent=presentation.meterReady&&model&&contact?analogLesson.outputRms.toFixed(2):'— —';
  $('analog-meter-status').textContent=!model?'等待 3D 模型':!geometry?'接点不在当前视野中':presentation.meterReady&&contact?'V AC · 理想有效值':contact?'表笔就位 · 等待读数':presentation.probesConnected?'表笔正在接近':'等待表笔接触';
 }
 function cancel(){cancelAnimationFrame(frame);frame=0;lastTime=null;}
 function pause(){cancel();state=analogLessonTransition(state,{type:'pause'});render();}
 function tick(time){
  if(!active||document.hidden||!state.playing){pause();return;}
  if(lastTime!==null)state=analogLessonTransition(state,{type:'tick',deltaMs:Math.min(time-lastTime,100)});
  lastTime=time;render();if(state.playing)frame=requestAnimationFrame(tick);else cancel();
 }
 function act(action){cancel();state=analogLessonTransition(state,action);render();measure();if(state.playing&&active)frame=requestAnimationFrame(tick);}
 $('analog-play').addEventListener('click',()=>{if(!active)return;act({type:state.playing?'pause':'play'});});
 $('analog-step').addEventListener('click',()=>act({type:'step'}));$('analog-restart').addEventListener('click',()=>act({type:'restart'}));
 for(const button of section.querySelectorAll('[data-analog-stage]'))button.addEventListener('click',()=>act({type:'stage',stage:Number(button.dataset.analogStage)}));
 $('analog-inspect-output').addEventListener('click',async()=>{
  pause();const token=++inspection;$('analog-inspect-status').textContent='正在定位前面板输出 1…';
  try{const ok=await inspectEndpoint(analogLesson.endpoint);if(token!==inspection)return;$('analog-inspect-status').textContent=ok?'已定位输出 1。表笔示意不验证插孔配接或安全接线。':'未能定位接口；教学动画仍可使用，不代表硬件状态。';}catch{if(token===inspection)$('analog-inspect-status').textContent='未能定位接口；请重新选择 NovaCor 2.0 后再试。';}
 });
 for(const action of ['front','detail'])$('analog-model-'+action).addEventListener('click',()=>{pause();modelCamera(action);});
 for(const action of ['in','out'])$('analog-model-'+action).addEventListener('click',()=>{pause();model?.view(action);});
 $('analog-model-retry').addEventListener('click',loadModel);
 const inView=new IntersectionObserver(entries=>{modelInView=entries.some(e=>e.isIntersecting);model?.setActive(active&&!document.hidden&&modelInView);},{rootMargin:'150px'});inView.observe($('analog-model-scene'));
 const resize=new ResizeObserver(()=>{measure();settleModel();});resize.observe($('analog-bench'));const reducedChange=()=>{pause();measure();};reduce.addEventListener('change',reducedChange);
 render();
 return{
  setActive(value){active=!!value;model?.setActive(active&&!document.hidden&&modelInView);if(!active){inspection++;pause();}else{loadModel();measure();}},
  dispose(){disposed=true;modelToken++;cancel();cancelAnimationFrame(modelSettleFrame);unsubscribe?.();resize.disconnect();inView.disconnect();reduce.removeEventListener('change',reducedChange);model?.dispose();model=null;hideContacts();},
  pause,
  open(){pause();section.scrollIntoView({block:'start',behavior:reduce.matches?'instant':'smooth'});$('analog-heading').focus({preventScroll:true});measure();}
 };
}
