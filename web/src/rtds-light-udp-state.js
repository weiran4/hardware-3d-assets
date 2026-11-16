// Offline teaching state, Light manual PDF109–110,127. Never opens a network connection.
export const defaultLightUdp=Object.freeze({connected:false,port:'eth',medium:'copper',topology:'direct',listener:true,identitiesDistinct:true,destinationPort:5000,receiverPort:5000});
export function evaluateLightUdp(input={}){
 const s={...defaultLightUdp,...input},issues=[];
 const physical=s.connected&&s.port==='eth'&&s.medium==='copper'&&['direct','switch'].includes(s.topology);
 if(s.port!=='eth')issues.push('本练习使用专用ETH UDP接口，不使用工作站WIF管理口。');
 if(s.medium!=='copper')issues.push('本练习的ETH须配受支持铜SFP及RJ45网线；不能直接插光纤。');
 if(!['direct','switch'].includes(s.topology))issues.push('本练习只覆盖直连或普通以太网交换机路径。');
 if(!s.identitiesDistinct)issues.push('UDP接口需要独立配置且不冲突的IP与MAC；不要照抄WIF或其他机箱的地址。');
 const validPort=n=>Number.isInteger(n)&&n>=1&&n<=65535;
 if(!validPort(s.destinationPort)||!validPort(s.receiverPort))issues.push('UDP端口需为1–65535的整数；此处是示例接收设置。');
 else if(s.destinationPort!==s.receiverPort)issues.push('连线条件通过时仍可能接收失败：目标UDP端口与接收程序监听端口不匹配。');
 if(!s.listener)issues.push('接收程序未监听：有网线不等于应用收到数据。');
 return {ready:physical&&!issues.length,physical,status:issues.length?'blocked':s.connected?'ready':'disconnected',issues};
}
export function stepLightUdp(s,values,count){if(!evaluateLightUdp(s).ready)return values;if(!Number.isInteger(count)||count<0)throw new RangeError('Explicit nonnegative event count required');return [...values,Math.sin(count*Math.PI/6)].slice(-24);}
