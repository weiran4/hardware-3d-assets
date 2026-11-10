// GBH V2, revision 20190606, PDF214–218. Single enclosure, fixed Pn→Rn only.
export function checkGbhV2({boards,count,cases}){
 const bad=message=>({status:'invalid',message,mapping:[],groups:[],litBoundaries:[],unused:[]});
 if(![1,2,3].includes(boards)||!Number.isSafeInteger(count)||count<1||count>boards*10)return bad('V2每板10通道，单箱1–3板；已接入数量须为正整数且不超过板卡容量。');
 if(typeof cases!=='string'||!cases.trim())return bad('请填写案例；每行一个案例，机架号按升序连续，用逗号分隔。');
 const groups=[],used=new Set(),litBoundaries=[];
 for(const [i,line]of cases.trim().split(/\r?\n/).entries()){
  const tokens=line.split(',').map(s=>s.trim());
  if(tokens.some(s=>!/^\d+$/.test(s)))return bad(`案例${i+1}：请输入正整数机架号，不能留空。`);
  const racks=tokens.map(Number);
  if(racks.some(n=>!Number.isSafeInteger(n)||n<1||n>count))return bad(`案例${i+1}：机架不在本例已接入范围内。`);
  if(racks.some((n,j)=>j>0&&n!==racks[j-1]+1))return bad(`案例${i+1}：机架必须升序连续，不能跳号或重复。`);
  if(racks.some(n=>used.has(n)))return bad(`案例${i+1}：与其他并行案例重复占用机架。`);
  racks.forEach(n=>used.add(n));groups.push({master:racks[0],racks});litBoundaries.push(...racks.slice(0,-1));
 }
 const mapping=Array.from({length:count},(_,i)=>({port:i+1,rack:i+1}));
 return {status:'match',message:'本例连续分组条件通过。边界灯仅示意这些案例运行时的归属，不表示已连接或正在运行真实设备。',mapping,groups,litBoundaries:litBoundaries.sort((a,b)=>a-b),unused:mapping.map(m=>m.rack).filter(n=>!used.has(n))};
}
// Cable-role check, not a connector/pinout validator or operating authorization.
export function checkGbhV2Connection({role,medium,length,mapped}){
 const result=(status,message)=>({status,message});
 const media={sync:'global-bus',lan:'ethernet',usb:'usb'};
 if(!Object.hasOwn(media,role)||medium!==media[role])return result('invalid','连接用途与介质不符：同步须用Global Bus光缆；Ethernet管理与USB初始化不能替代同步光路。');
 if(role==='lan')return result('match','主LAN交换机 ↔ GBH前部Ethernet，用于案例启动配置；先经USB完成LAN初始化。本检查不验证IP参数或实际网络。');
 if(role==='usb')return result('match','Windows电脑 ↔ GBH前部USB，用于初始LAN参数设置；V2手册列115200 baud。仅离线用途说明，不连接设备或生成命令。');
 if(!Number.isFinite(length)||length<=0||length>30)return result('invalid','V2本章Global Bus光缆上限30m；输入须为大于0且不超过30的有限数值，不能套用V3的50/100m条件。');
 if(mapped!==true)return result('invalid','本例要求NovaCor机架号与GBH通道号一一对应，并与配置一致；映射未核实不能判定通过。');
 return result('match','本例同步条件通过：NovaCor后部GBH口 ↔ Global Bus光缆 ↔ GBH V2对应通道，长度≤30m。仍须核对实物光端部件及配置，不是针脚、完整兼容性或时延验证。');
}
