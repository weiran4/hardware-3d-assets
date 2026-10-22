import './rtds-analog.css';
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
 let state=createAnalogLessonState(),active=false,frame=0,lastTime=null,lastCaption=-1,inspection=0,geometry=null;
 const section=$('rtds-analog-lesson'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const trace=Array.from({length:141},(_,i)=>`${i?'L':'M'}${i*2} ${(60-50*Math.sin(i/140*Math.PI*2)).toFixed(3)}`).join('');
 $('analog-source-trace').setAttribute('d',trace);$('analog-output-trace').setAttribute('d',trace);
 function measure(){
  const bench=$('analog-bench'),box=bench.getBoundingClientRect();if(!box.width||!box.height){geometry=null;return;}
  const center=id=>{const b=$(id).getBoundingClientRect();return{x:b.x-box.x+b.width/2,y:b.y-box.y+b.height/2};};
  geometry={width:box.width,height:box.height,red:{socket:center('analog-output-socket'),jack:center('analog-meter-v')},black:{socket:center('analog-ground-socket'),jack:center('analog-meter-com')}};
  $('analog-probe-overlay').setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);renderProbes();
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
  section.dataset.probesConnected=String(progress>=1);
 }
 function render(){
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
  $('analog-meter-value').textContent=presentation.meterReady?sample.meterRms.toFixed(2):'— —';
  $('analog-meter-status').textContent=presentation.meterReady?'V AC · 理想有效值':analogProbeProgress(state,reduce.matches)>=1?'表笔就位 · 等待读数':presentation.probesConnected?'表笔正在接近':'等待表笔接触';renderProbes();
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
 const resize=new ResizeObserver(measure);resize.observe($('analog-bench'));reduce.addEventListener('change',()=>{pause();measure();});
 render();
 return{
  setActive(value){active=!!value;if(!active){inspection++;pause();}else measure();},
  pause,
  open(){pause();section.scrollIntoView({block:'start',behavior:reduce.matches?'instant':'smooth'});$('analog-heading').focus({preventScroll:true});measure();}
 };
}
