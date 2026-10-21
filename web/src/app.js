import {createInitialState,transition} from './lesson.js';
import {createLabScene} from './scene.js';
const $=id=>document.getElementById(id);
let state=createInitialState(),lab=null,traceFrame=0;
const notes={
 overview:['01—03','先认识这张实验台','左边发出信号，右边把信号画出来。点设备或接口，读一张小注解。'],
 controller:['01 / SOURCE','脉冲控制器','这里扮演信号的起点。OUT 表示输出；本实验用它发出一个概念脉冲，不规定真实电平或频率。'],
 scope:['02 / OBSERVE','示波器','把随时间变化的信号画出来。本实验选择 CH1 作为观察入口；屏幕只显示示意，不是测量结果。'],
 cable:['03 / CONNECT','信号线','线缆把起点和终点联系起来。这里的接头只作外观演示；形状相似不代表实际可以互接。'],
 out:['PORT / OUT','OUT · 信号的起点','OUT 是控制器的输出口。选中它，再选示波器 CH1，完成这条概念信号路径。'],
 ch1:['PORT / CH1','CH1 · 观察的入口','CH1 是第一路观察输入。本次练习把信号送到这里，再用下方脉冲按钮观察示意响应。'],
 trig:['PORT / TRIG','TRIG · 不是这次的终点','触发用于帮助确定波形显示的时机。本次目标是观察信号，所以请选择 CH1；这不表示真实设备中 TRIG 永远不能接线。']
};
const feedback={start:'先点 OUT，给这根线一个起点。','choose-input':'起点选好了。现在点 CH1，把线接到观察入口。','choose-output':'先从信号的起点 OUT 开始，再连接 CH1。','wrong-port':'这次要看波形，请接 CH1。TRIG 用来帮助确定显示时机。',connected:'接好了：OUT → CH1。试着发一个脉冲吧。',pulse:'脉冲已发出。线上的亮点与下方波形都是概念示意。','trig-info':'当前仍连接 OUT → CH1。TRIG 不是本次观察入口。'};
function draw(){const connected=state.stage==='connected',source=state.stage==='source';$('status-text').textContent=feedback[state.feedback];$('status').className='status-line '+(state.feedback==='wrong-port'||state.feedback==='choose-output'?'error':connected?'success':'');$('progress-label').textContent=state.pulseCount?'3 / 3':connected?'2 / 3':source?'1 / 3':'0 / 3';
  for(let i=1;i<=3;i++){$('step-'+i).className=(i===1?(connected||source):i===2?connected:!!state.pulseCount)?'done':(i===1&&!source&&!connected||i===2&&source||i===3&&connected&&!state.pulseCount)?'active':'';}
  $('send-pulse').disabled=!connected;$('scene-state').textContent=connected?'OUT → CH1 已连接':source?'已选择 OUT · 等待 CH1':'线缆未连接';
  $('trace-status').textContent=connected?(state.pulseCount?'脉冲 × '+state.pulseCount:'已连接 · 待发送'):'等待连接';$('trace-led').className=connected?'active':'';document.querySelector('.signal-path').classList.toggle('active',connected);
  $('response-copy').textContent=state.pulseCount?'每一次脉冲，都是一次“输出 → 观察”。':connected?'路径已就绪。发送一次，观察一次。':'连好线后，发送一个示意脉冲。';
  const note=notes[state.selected]||notes.overview;['note-index','note-title','note-body'].forEach((id,i)=>$(id).textContent=note[i]);
  document.querySelectorAll('[data-port]').forEach(b=>b.setAttribute('aria-pressed',String(state.selected===b.dataset.port)));
  document.querySelectorAll('[data-inspect]').forEach(b=>b.setAttribute('aria-pressed',String(state.selected===b.dataset.inspect)));
  lab?.update(state);
}
function animateTrace(){cancelAnimationFrame(traceFrame);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const start=performance.now();const final='M0 90H150V32H235V90H600';if(reduced){$('trace-line').setAttribute('d',final);return;}
  function tick(now){const t=Math.min((now-start)/1800,1),head=600*t;const points=[[0,90],[150,90],[150,32],[235,32],[235,90],[600,90]];let d='M0 90';for(let i=1;i<points.length;i++){const [x,y]=points[i],prev=points[i-1];if(x<=head)d+=`L${x} ${y}`;else{d+=`L${head} ${prev[1]}`;break;}}d+=`M${head} 90H600`;$('trace-line').setAttribute('d',d);$('trace-sweep').setAttribute('x1',head);$('trace-sweep').setAttribute('x2',head);$('trace-sweep').setAttribute('stroke-opacity',t<1?'.12':'0');if(t<1)traceFrame=requestAnimationFrame(tick);}
  traceFrame=requestAnimationFrame(tick);
}
function dispatch(action){const prev=state;state=transition(state,action);draw();if(state.pulseCount>prev.pulseCount){lab?.pulse();animateTrace();}if(action.type==='reset'){cancelAnimationFrame(traceFrame);$('trace-line').setAttribute('d','M0 90H600');$('trace-sweep').setAttribute('stroke-opacity','0');}}
for(const btn of document.querySelectorAll('.port-btn'))btn.addEventListener('click',()=>dispatch({type:'port',port:btn.dataset.port}));
for(const btn of document.querySelectorAll('[data-inspect]'))btn.addEventListener('click',()=>dispatch({type:'inspect',target:btn.dataset.inspect}));
$('reset-lesson').addEventListener('click',()=>dispatch({type:'reset'}));$('send-pulse').addEventListener('click',()=>dispatch({type:'pulse'}));
for(const action of ['left','right','in','out','reset'])$('view-'+action).addEventListener('click',()=>lab?.view(action));
draw();
try{lab=await createLabScene($('scene'),$('port-labels'),dispatch);$('loading').remove();draw();}catch(error){console.error('3D scene load failed:',error);$('loading').textContent='三维场景暂时无法加载。请检查网络或使用支持 WebGL 的浏览器。下方文字练习仍可使用。';$('scene').dataset.loaded='error';document.querySelectorAll('.view-controls button').forEach(b=>b.disabled=true);}
