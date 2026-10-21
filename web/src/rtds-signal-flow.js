import {createSignalFlowState,signalFlowTransition,signalFlowEndpoints} from './rtds-signal-state.js';
const $=id=>document.getElementById(id);
export function initSignalFlow(inspectEndpoint){
 let state=createSignalFlowState(),timer=null,active=false,inspection=0;
 const descriptions={idle:'选择虚拟 0 / 1，然后单步或播放。尚未传递示意数据。',field:'第 1 步：把当前逻辑值作为这一轮的虚拟输入。不是端子接线或电压。',optical:'第 2 步：说明 GTDI 向仿真侧传递应用数据。箭头不表示光纤 Tx / Rx 线序。',received:'第 3 步：更新示意接收值。这里没有运行 RTDS 仿真，也没有读取真实设备。'};
 function render(){
  $('rtds-signal-flow').dataset.phase=state.phase;$('rtds-signal-flow').dataset.playing=String(state.playing);
  for(const value of [0,1])$('flow-input-'+value).setAttribute('aria-pressed',String(state.input===value));
  $('flow-source-value').textContent=String(state.input);$('flow-sampled').textContent=state.sampled===null?'—':String(state.sampled);$('flow-received').textContent=state.received===null?'—':String(state.received);
  $('flow-description').textContent=descriptions[state.phase];$('flow-count').textContent=`示意传递 ${state.transfers} 次`;
  $('flow-play').textContent=state.playing?'暂停示意':'播放示意';$('flow-play').setAttribute('aria-pressed',String(state.playing));
  for(const node of $('rtds-signal-flow').querySelectorAll('[data-flow-phase]'))node.classList.toggle('active',node.dataset.flowPhase===state.phase);
 }
 function stop(){clearInterval(timer);timer=null;state=signalFlowTransition(state,{type:'pause'});render();}
 for(const value of [0,1])$('flow-input-'+value).addEventListener('click',()=>{state=signalFlowTransition(state,{type:'input',value});render();});
 $('flow-step').addEventListener('click',()=>{stop();state=signalFlowTransition(state,{type:'step'});render();});
 $('flow-reset').addEventListener('click',()=>{stop();state=signalFlowTransition(state,{type:'reset'});render();});
 $('flow-play').addEventListener('click',()=>{if(state.playing){stop();return;}if(!active)return;state=signalFlowTransition(state,{type:'play'});state=signalFlowTransition(state,{type:'tick'});render();timer=setInterval(()=>{state=signalFlowTransition(state,{type:'tick'});render();},1200);});
 for(const [index,id]of ['flow-inspect-gtdi','flow-inspect-novacor'].entries())$(id).addEventListener('click',async()=>{
  stop();const token=++inspection;$('flow-inspect-status').textContent='正在定位这个版本的接口…';
  try{const found=await inspectEndpoint(signalFlowEndpoints[index]);if(token===inspection)$('flow-inspect-status').textContent=found?'已在上方定位接口；高亮仅帮助观察，不验证配接。':'当前未能定位接口；示意说明不受影响，可稍后重试。';}
  catch{if(token===inspection)$('flow-inspect-status').textContent='接口模型暂时不可用；这不表示真实链路状态。';}
 });
 render();return{setActive(value){active=value;if(!value){inspection++;stop();}}};
}
