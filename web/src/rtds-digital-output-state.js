// Offline ideal resistive-load lesson. It is not a load-rating or commissioning tool.
export const outputTerminals=['plus','minus','vplus','vminus','output','loadIn','loadReturn'];
export const outputWires={
 supply:{ends:['plus','vplus'],label:'电源 + → BANK1 V+',color:'#c65f45'},
 reference:{ends:['minus','vminus'],label:'电源 − → BANK1 V−',color:'#667680'},
 signal:{ends:['output','loadIn'],label:'CH1 输出 → 负载 +',color:'#397e9b'},
 return:{ends:['loadReturn','vminus'],label:'负载 − → BANK1 V−',color:'#756792'},
 conflict:{ends:['plus','output'],label:'错误：电源 + → CH1 输出',color:'#d33b43'}
};
export const outputVoltages=[5,12,18,24,30];
export const outputResistances=[1000,2000,5000];
export function createOutputState(page=17){return {page:[15,16,17].includes(page)?page:17,wires:[],power:false,logic:false,voltage:24,resistance:1000,selected:null,notice:'先保持外部信号电源 OFF，再点两个端子接一根线。'};}
function valid(s){return !!s&&[15,16,17].includes(s.page)&&Array.isArray(s.wires)&&s.wires.every(w=>Object.hasOwn(outputWires,w))&&new Set(s.wires).size===s.wires.length&&typeof s.power==='boolean'&&typeof s.logic==='boolean'&&outputVoltages.includes(s.voltage)&&Number.isFinite(s.resistance)&&s.resistance>0;}
export function evaluateOutput(s){
 const result=(status,driver,currentMa,loadVolts,message,flow=false)=>({status,driver,currentMa,loadVolts,message,flow});
 if(!valid(s))return result('unsafe','?',null,null,'参数无效。停止输出示意。');
 const has=w=>s.wires.includes(w),driver=s.logic?'V+':'HIGH-Z';
 if(has('conflict'))return result('unsafe','?',null,null,'禁止把独立电源直接接到 CH1 输出。先断电，移除冲突线，再把电源接至本组 V+ / V−。');
 if(!outputResistances.includes(s.resistance))return result('unsafe','?',null,null,'本教学实验仅开放 1 / 2 / 5 kΩ 电阻负载，不用未核对的 V2 单通道额定电流批准低阻或短路负载。');
 if(!s.power)return result('off','未演示',null,null,'外部信号电源 OFF。板卡逻辑侧独立 24 V 与 GT 光纤/RSCAD 连接是本实验预设条件，不代表实物已投运。');
 if(!has('supply')||!has('reference'))return result('incomplete','?',null,null,'本组 V+ 与 V− 必须接独立外部电源。缺供电线或公共参考，不能保证输出电位和负载电流。');
 if(!has('signal')||!has('return'))return result('incomplete',driver,null,null,s.logic?'负载回路不完整，不能把输出命令 1 当作负载已工作。':'驱动器为高阻；负载未形成完整参考。内部有弱下拉，但不保证瞬间输出为 0 V，也不模拟未给出的下降时间。');
 if(!s.logic)return result('ready','HIGH-Z',0,0,'命令 0：驱动器高阻，不主动输出 0 V。本例的电阻负载返回 V−，理想稳态负载电压为 0 V；内部另有弱下拉，不演示真实放电时间。');
 return result('ready','V+',1000*s.voltage/s.resistance,s.voltage,'命令 1：CH1 从本组 V+ 向外部电阻负载供电。显示负载理想 I = V / R，不含驱动压降与内部电流，不是实测或额定认证。',true);
}
export function transitionOutput(s,a){
 if(!valid(s)||!a||typeof a!=='object')return s;
 if(a.type==='reset')return {...createOutputState(s.page),notice:'已先断电，再清空全部接线与输出命令。'};
 if(['terminal','remove','example','page','voltage','resistance'].includes(a.type)&&s.power)return {...s,selected:null,notice:'请先关闭外部信号电源并确认断电，再修改接线、参数或课件页。'};
 if(a.type==='page'&&[15,16,17].includes(a.page))return {...s,page:a.page,selected:null};
 if(a.type==='power'){
  const r=evaluateOutput({...s,power:true});
  if(!s.power&&r.status==='unsafe')return {...s,selected:null,notice:r.message};
  return {...s,power:!s.power,selected:null,notice:s.power?'外部信号电源已关闭，可以改接线。':'外部信号电源已开启，接线锁定；可以切换离线输出命令。'};
 }
 if(a.type==='logic')return {...s,logic:!s.logic,notice:!s.logic?'离线命令置 1，观察驱动器与负载。':'离线命令置 0，观察高阻与负载状态。'};
 if(a.type==='voltage'&&outputVoltages.includes(a.value))return {...s,voltage:a.value};
 if(a.type==='resistance'&&outputResistances.includes(a.value))return {...s,resistance:a.value};
 if(a.type==='remove'&&Object.hasOwn(outputWires,a.id))return {...s,wires:s.wires.filter(w=>w!==a.id),selected:null,notice:'已移除 '+outputWires[a.id].label};
 if(a.type==='example'&&['correct','return','conflict'].includes(a.kind))return {...s,wires:a.kind==='correct'?['supply','reference','signal','return']:a.kind==='return'?['supply','reference','signal']:['supply','reference','signal','return','conflict'],selected:null,notice:a.kind==='correct'?'正确示例已接好，电源仍 OFF。请开启电源并置命令 1。':a.kind==='return'?'错误示例：负载返回线缺失。':'错误示例：外部电源直接接输出；禁止送电。'};
 if(a.type==='terminal'&&outputTerminals.includes(a.id)){
  if(!s.selected)return {...s,selected:a.id,notice:'起点已选，请点终点。再点同一端子取消。'};
  if(s.selected===a.id)return {...s,selected:null,notice:'已取消选择。'};
  const key=Object.keys(outputWires).find(k=>outputWires[k].ends.includes(s.selected)&&outputWires[k].ends.includes(a.id));
  if(!key)return {...s,selected:null,notice:'此接法不在实验支持的回路中，未连接。请按供电、输出与负载返回路径操作。'};
  const exists=s.wires.includes(key);return {...s,wires:exists?s.wires.filter(w=>w!==key):[...s.wires,key],selected:null,notice:(exists?'已移除：':'已连接：')+outputWires[key].label};
 }
 return s;
}

// Two independently powered groups, not a claim of galvanic isolation.
export function createBanksState(){return {banks:[createOutputState(16),{...createOutputState(16),voltage:12}],activeBank:0,notice:''};}
export function transitionBanks(s,a){
 if(a.type==='selectBank'&&[0,1].includes(a.index))return {...s,activeBank:a.index};
 if(a.type==='resetAll'||a.type==='reset')return createBanksState();
 const edit=['terminal','remove','example','page','voltage','resistance'].includes(a.type);
 if(edit&&s.banks.some(b=>b.power))return {...s,notice:'请先关闭两组外部信号电源，再修改接线或参数。'};
 if(a.type==='bothExample'){
  if(s.banks.some(b=>b.power))return {...s,notice:'请先关闭两组外部信号电源。'};
  return {...s,banks:s.banks.map((b,i)=>transitionOutput({...b,voltage:i?24:12},{type:'example',kind:i&&a.kind==='return'?'return':i&&a.kind==='conflict'?'conflict':'correct'})),notice:'两组示例已载入，电源均保持 OFF。'};
 }
 return {...s,banks:s.banks.map((b,i)=>i===s.activeBank?transitionOutput(b,a):b),notice:''};
}
