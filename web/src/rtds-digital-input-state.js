// Teaching input circuit only. No physical commissioning or real GT/RSCAD link.
export const terminals=['out','common','plus','minus','input','ground','wet'];
export const wireDefinitions={
 signal:{ends:['out','input'],label:'信号 → CH1',color:'#237cbd'},
 return:{ends:['common','ground'],label:'公共端 → GND',color:'#40515e'},
 wetPlus:{ends:['plus','wet'],label:'电源 + → V+(WET)',color:'#d7811c'},
 wetReturn:{ends:['minus','ground'],label:'电源 − → GND',color:'#786e96'}
};
export function createDigitalState(mode='dry'){return {mode:mode==='wet'?'wet':'dry',wires:[],power:false,closed:false,voltage:24,wetVoltage:24,selected:null,notice:'先保持信号电源 OFF，点两个端子连接一根线。'};}
function valid(s){return !!s&&['dry','wet'].includes(s.mode)&&Array.isArray(s.wires)&&s.wires.every(w=>Object.hasOwn(wireDefinitions,w))&&new Set(s.wires).size===s.wires.length&&typeof s.power==='boolean'&&typeof s.closed==='boolean'&&Number.isFinite(s.voltage)&&s.voltage>=0&&s.voltage<=50&&Number.isFinite(s.wetVoltage)&&s.wetVoltage>=12&&s.wetVoltage<=40;}
export function evaluateDigital(s){
 const result=(status,raw,voltageLabel,message,flow=false)=>({status,raw,voltageLabel,message,flow});
 if(!valid(s))return result('unsafe',null,'不可判定','参数无效；停止电气状态示意。');
 const has=w=>s.wires.includes(w);
 if(s.mode==='wet'&&has('wetPlus'))return result('unsafe',null,'禁止送电','有源输入所在 BANK 不得给 V+(WET) 供电，可能损坏外部信号源。先断电并移除润湿电源连接。');
 if(!s.power)return result('off',null,'信号电源 OFF','先完成接线，再开启信号电源。板卡逻辑侧 24 V 是独立的预设条件，不代表现场已供电。');
 if(s.mode==='wet'){
  if(!has('signal')||!has('return'))return result('incomplete',null,'参考不完整','有源输出需要 OUT → CH1 和 0 V → 同组 GND。缺信号线或公共参考时不保证输入位。');
  if(s.voltage>1.5&&s.voltage<3)return result('undefined',null,`${s.voltage} V（教学设定）`,'1.5 V < 输入 < 3 V：手册未保证逻辑状态，不能强行显示 0 或 1。');
  const raw=s.voltage<=1.5?0:1;
  return result('ready',raw,`${s.voltage} V（教学设定）`,raw?'有源输出相对同组 GND 为高电平。V+(WET) 保持不接电。':'有源输出相对同组 GND 为低电平。低电平不等于断线。',raw===1);
 }
 if(!has('wetPlus')||!has('wetReturn'))return result('incomplete',null,'润湿回路未建立','干接点本身不提供电压。需要 12–40 V 润湿电源接到本组 V+(WET) 与 GND，缺任一条均不保证输入位。');
 if(!has('signal')||!has('return'))return result('incomplete',1,'上拉为高（非测量值）','上拉已供电，但触点回路缺线，即使机械触点闭合也仍为开路高电平。原始 1 不能证明接线正确。');
 return s.closed?result('ready',0,'约 0 V（理想触点示意）','触点闭合，把 CH1 拉向同组 GND；实物闭合电压必须低于 1.5 V。原始位为 0。',true):result('ready',1,'上拉为高（非测量值）','无源触点打开，润湿回路使输入为高，原始位为 1；外部触点支路没有闭合电流。');
}
export function transitionDigital(s,a){
 if(!valid(s)||!a||typeof a!=='object')return s;
 if(a.type==='reset')return {...createDigitalState(s.mode),notice:'已先关闭信号电源（断电），再清空接线。'};
 const wiring=['terminal','remove','example','mode'].includes(a.type);
 if(wiring&&s.power)return {...s,selected:null,notice:'请先关闭信号电源并确认断电，再改接线或切换外部设备。'};
 if(a.type==='mode'&&['dry','wet'].includes(a.mode))return {...createDigitalState(a.mode),notice:'外部设备已切换；旧接线已断开，信号电源保持 OFF。'};
 if(a.type==='power'){
  if(!s.power&&evaluateDigital({...s,power:true}).status==='unsafe')return {...s,selected:null,notice:evaluateDigital({...s,power:true}).message};
  return {...s,power:!s.power,selected:null,notice:s.power?'信号电源已关闭，可以改接线。':'信号电源已开启；接线锁定，可以操作触点或输出电平。'};
 }
 if(a.type==='contact')return s.mode==='dry'?{...s,closed:!s.closed,notice:!s.closed?'机械触点已闭合。观察原始电气位，而不是把“闭合”直接写成 1。':'机械触点已打开。'}:s;
 if(a.type==='voltage'&&Number.isFinite(a.value)&&a.value>=0&&a.value<=50)return {...s,voltage:a.value};
 if(a.type==='wetVoltage'&&Number.isFinite(a.value)&&a.value>=12&&a.value<=40)return {...s,wetVoltage:a.value};
 if(a.type==='remove'&&Object.hasOwn(wireDefinitions,a.id))return {...s,wires:s.wires.filter(w=>w!==a.id),selected:null,notice:'已移除 '+wireDefinitions[a.id].label+'。'};
 if(a.type==='example'&&['correct','return','wetting'].includes(a.kind)){
  let wires=s.mode==='dry'?['signal','return','wetPlus','wetReturn']:['signal','return'];
  if(a.kind==='return')wires=wires.filter(w=>w!=='return');
  if(a.kind==='wetting')wires=['signal','return','wetPlus','wetReturn'];
  return {...s,wires,selected:null,closed:a.kind==='return',notice:a.kind==='correct'?'正确示例已接好，电源仍 OFF。请自己开启并观察。':a.kind==='return'?'已设置缺公共端错误：机械触点闭合也未形成回路。':'已设置错误润湿连接：安全检查阻止有源输入与上拉同时送电。'};
 }
 if(a.type==='terminal'&&terminals.includes(a.id)){
  if(!s.selected)return {...s,selected:a.id,notice:'起点已选，请点对应终点；再点同一端子可取消。'};
  if(s.selected===a.id)return {...s,selected:null,notice:'已取消端子选择。'};
  const key=Object.keys(wireDefinitions).find(k=>wireDefinitions[k].ends.includes(s.selected)&&wireDefinitions[k].ends.includes(a.id));
  if(!key)return {...s,selected:null,notice:'本实验不允许这对端子直接相连。按信号、公共参考或润湿电源路径连接。'};
  const exists=s.wires.includes(key);
  return {...s,wires:exists?s.wires.filter(w=>w!==key):[...s.wires,key],selected:null,notice:(exists?'已移除：':'已连接：')+wireDefinitions[key].label};
 }
 return s;
}
