// Offline conceptual HV OUTPUT demonstration. Never sends commands to hardware.
export const hvTerminals=['vp','lp','lm','sp','sn','rp','rm'];
export const hvWires={dryA:{ends:['vp','rp'],label:'HV +Vdc ↔ 继电器状态端A'},dryB:{ends:['lp','rm'],label:'HV +Load ↔ 继电器状态端B'},supply:{ends:['sp','vp'],label:'外供+ → HV +Vdc'},return:{ends:['sn','lm'],label:'外供− → HV −Load'},load:{ends:['lp','rp'],label:'HV +Load → 状态输入+'},common:{ends:['lm','rm'],label:'HV −Load → 状态输入−'}};
const required={dry:['dryA','dryB'],wet:['supply','return','load','common']};
export function createHvState(){return {mode:'dry',receiver:'dry',supply:125,external:false,wires:[],selected:null,simulating:false,closed:false,notice:'只在离线示意中选择连接；不是实物高压操作指南。'};}
function valid(s){return !!s&&['dry','wet'].includes(s.mode)&&['dry','wet125','logic5'].includes(s.receiver)&&Number.isFinite(s.supply)&&s.supply>=0&&s.supply<=250&&['external','simulating','closed'].every(k=>typeof s[k]==='boolean')&&Array.isArray(s.wires)&&s.wires.every(k=>Object.hasOwn(hvWires,k))&&new Set(s.wires).size===s.wires.length;}
export function evaluateHv(s){
 const base={status:'off',contact:null,voltage:null,receiver:null,flow:false,message:'离线模型未运行。HV背板由GTFPI的+5V与排线控制，这不是继电器状态回路的125V电源。'};
 if(!valid(s))return {...base,status:'unsafe',message:'参数无效，不能判定电气状态。'};
 if(s.mode==='dry'&&(s.external||s.wires.some(k=>!required.dry.includes(k))))return {...base,status:'unsafe',message:'干接点示例不接外部电源，只使用+Vdc与+Load两个开关端。当前连接有外供或混用，禁止演示。'};
 if(s.mode==='wet'&&(s.receiver!=='wet125'||s.supply!==125||s.wires.some(k=>!required.wet.includes(k))))return {...base,status:'unsafe',message:'本外供示例仅假设125V兼容状态输入与125V电源；5V接收器或模式混接不兼容。250V是面板能力边界，不是任意接收器可接受电压。'};
 if(s.mode==='dry'&&s.receiver!=='dry')return {...base,status:'unsafe',message:'接收器必须明确支持干接点输入，不能把无源开关当作电压源。'};
 if(!s.simulating)return base;
 const complete=required[s.mode].every(k=>s.wires.includes(k))&&(s.mode==='dry'||s.external);
 if(!complete)return {...base,status:'incomplete',message:'状态回路缺线或缺外部电源。接收端状态不确定，不能判作0V或开路正常。'};
 return {status:'ready',contact:s.closed?'closed':'open',voltage:s.mode==='wet'?(s.closed?125:0):null,receiver:s.closed?'asserted':'released',flow:s.closed,message:s.mode==='dry'?`固态开关${s.closed?'闭合':'断开'}：继电器使用自身干接点检测回路；HV面板不提供外部状态电压。`:`固态开关${s.closed?'闭合':'断开'}：理想离线负载两端${s.closed?125:0}V；来源是外部电源，不是GTFPI逻辑输出。`};
}
export function transitionHv(s,a){
 if(!valid(s)||!a)return s;
 if(a.type==='reset')return createHvState();
 if(['terminal','remove','mode','example'].includes(a.type)&&s.simulating)return {...s,selected:null,notice:'先停止离线演示，再改变连接或设备。实物高压操作仅由受训人员依正式规程完成。'};
 if(a.type==='simulate'){const r=evaluateHv({...s,simulating:true});return !s.simulating&&r.status==='unsafe'?{...s,notice:r.message}:{...s,simulating:!s.simulating,selected:null,notice:'仅改变离线示意状态，没有连接真实RTDS设备。'};}
 if(a.type==='switch')return {...s,closed:!s.closed};
 if(a.type==='mode'&&['dry','wet'].includes(a.mode))return {...createHvState(),mode:a.mode,receiver:a.mode==='dry'?'dry':'wet125',external:a.mode==='wet'};
 if(a.type==='example'&&['dry','wet','missing','drySupply','mismatch'].includes(a.kind)){
  const mode=['wet','missing','mismatch'].includes(a.kind)?'wet':'dry';return {...createHvState(),mode,receiver:a.kind==='mismatch'?'logic5':mode==='dry'?'dry':'wet125',external:mode==='wet'||a.kind==='drySupply',wires:required[mode].filter(k=>a.kind!=='missing'||k!=='return'),notice:'已载入离线示例；点击“运行离线示意”观察。'};
 }
 if(a.type==='remove'&&Object.hasOwn(hvWires,a.id))return {...s,wires:s.wires.filter(k=>k!==a.id),selected:null};
 if(a.type==='terminal'&&hvTerminals.includes(a.id)){
  if(!s.selected)return {...s,selected:a.id};if(s.selected===a.id)return {...s,selected:null};
  const key=Object.keys(hvWires).find(k=>hvWires[k].ends.includes(s.selected)&&hvWires[k].ends.includes(a.id));
  if(!key)return {...s,selected:null,notice:'此端子组合不在已核实的本示例连接中，未添加。'};
  return {...s,wires:s.wires.includes(key)?s.wires.filter(k=>k!==key):[...s.wires,key],selected:null,notice:hvWires[key].label};
 }
 return s;
}
