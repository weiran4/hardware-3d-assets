// Offline teaching only; input sampling and breaker steps are not real-time emulation.
export const wires={trip:{ends:['no','input'],label:'继电器 NO → IN1'},common:{ends:['com','ground'],label:'继电器 COM → GND1'},feedback:{ends:['output','sense'],label:'OUT1 → 5V接收器 IN'},feedbackGround:{ends:['ground','zero'],label:'GND1 → 接收器 0V'}};
export const terminals=['no','com','input','ground','output','sense','zero'];
export function createGtfpiState(){return {wires:[],selected:null,power:false,closed:false,inv:true,breakerClosed:true,receiverType:'logic5',inputType:'dry',sampled:null,notice:'离线教学：先保持电源关闭，再连接低压面板与外部设备。'};}
function valid(s){return s&&Array.isArray(s.wires)&&s.wires.every(w=>Object.hasOwn(wires,w))&&new Set(s.wires).size===s.wires.length&&['power','closed','inv','breakerClosed'].every(k=>typeof s[k]==='boolean')&&['logic5','hv125','overload'].includes(s.receiverType)&&['dry','active24'].includes(s.inputType);}
export function evaluateGtfpi(s){
 const r={status:'off',raw:null,processed:null,output:null,receiver:null,flow:false,message:'电源关闭；板卡24V、板内5V上拉/逻辑电源与GT仿真链路仅作为本离线模型的预设条件。'};
 if(!valid(s))return {...r,status:'unsafe',message:'参数无效，不能判定电气状态。'};
 if(s.inputType!=='dry')return {...r,status:'unsafe',message:'本实验输入是内置5V上拉的干接点回路，不能接24V有源信号。'};
 if(s.receiverType==='hv125')return {...r,status:'unsafe',message:'5V低压输出不能直接驱动要求125V的继电器状态输入。需另行核对HV接口方案，本实验不送电。'};
 if(s.receiverType==='overload')return {...r,status:'unsafe',message:'所选负载要求30mA，超过24mA最大源/吸电流。禁止送电，不以保护限流替代额定约束。'};
 if(!s.power)return r;
 const has=k=>s.wires.includes(k),inputOK=has('trip')&&has('common'),outputOK=has('feedback')&&has('feedbackGround');
 const raw=inputOK&&s.closed?0:1,processed=s.inv?1-raw:raw,output=s.breakerClosed?5:0;
 return {status:inputOK&&outputOK?'ready':'incomplete',raw,processed,output,receiver:outputOK?output:null,flow:inputOK&&outputOK,message:!inputOK?'触点回路缺线：内置上拉仍可能读到1，不能把原始1当作接线正常。':!outputOK?'状态返回缺信号或参考线，接收器状态不确定。':`触点${s.closed?'闭合，原始0':'打开，原始1'}；Inv ${s.inv?'开启':'关闭'}。点击“采样一步”把处理后位送入离线断路器；状态输出主动驱动${output}V。`};
}
export function transitionGtfpi(s,a){
 if(!valid(s)||!a)return s;
 if(a.type==='reset')return {...createGtfpiState(),notice:'已断电并重置接线和教学断路器。'};
 if(['terminal','remove','example'].includes(a.type)&&s.power)return {...s,selected:null,notice:'先关闭电源并确认断电，再改变接线或设备。'};
 if(a.type==='power'){const r=evaluateGtfpi({...s,power:true});return !s.power&&r.status==='unsafe'?{...s,notice:r.message}:{...s,power:!s.power,selected:null,notice:s.power?'已关闭电源。':'离线电源条件开启；不操作真实设备。'};}
 if(a.type==='contact')return {...s,closed:!s.closed};
 if(a.type==='inv')return {...s,inv:!s.inv,notice:'Inv 对全部16个输入位反相；本实验显示第1位。'};
 if(a.type==='sample'){const r=evaluateGtfpi(s);return r.status==='ready'?{...s,sampled:r.processed,breakerClosed:r.processed===1?false:s.breakerClosed,notice:'离线采样一步：处理后位1触发跳闸并保持断开；未使用实物延时。'}:{...s,notice:'先完成正确接线及供电，才可执行完整保护闭环。'};}
 if(a.type==='reclose'){const r=evaluateGtfpi(s);return r.status==='ready'&&r.processed===0?{...s,breakerClosed:true,notice:'教学合闸已执行。此按钮不是第二个实物重合闸输入。'}:{...s,notice:'先恢复非跳闸输入并正确接线，再教学合闸。'};}
 if(a.type==='example'&&['correct','missing','active','hv','overload'].includes(a.kind))return {...createGtfpiState(),wires:Object.keys(wires).filter(k=>a.kind!=='missing'||k!=='common'),inputType:a.kind==='active'?'active24':'dry',receiverType:a.kind==='hv'?'hv125':a.kind==='overload'?'overload':'logic5',notice:'示例已载入，电源仍关闭。'};
 if(a.type==='remove'&&Object.hasOwn(wires,a.id))return {...s,wires:s.wires.filter(k=>k!==a.id),selected:null};
 if(a.type==='terminal'&&terminals.includes(a.id)){
  if(!s.selected)return {...s,selected:a.id};if(s.selected===a.id)return {...s,selected:null};
  const key=Object.keys(wires).find(k=>wires[k].ends.includes(s.selected)&&wires[k].ends.includes(a.id));
  if(!key)return {...s,selected:null,notice:'这对端子不是本实验核实过的连接，不添加线缆。'};
  return {...s,selected:null,wires:s.wires.includes(key)?s.wires.filter(k=>k!==key):[...s.wires,key],notice:wires[key].label};
 }
 return s;
}
