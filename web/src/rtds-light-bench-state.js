// NovaCor Light manual PDF111,114–116; voltage is Vpeak or a DC teaching value.
export const defaultLightBench=Object.freeze({mode:'ao',port:'ao',loop:'i2',paired:true,connected:false,channel:1,voltage:5,resistance:1000});
export function evaluateLightBench(input={}){
 const s={...defaultLightBench,...input},issues=[];
 if(!['ao','ai'].includes(s.mode)||s.port!==s.mode)issues.push('示波器接AO输出组，发生器接AI输入组；不能输入/输出互换。');
 if(s.loop!=='i2')issues.push('模拟I/O必须以光纤连接上部I2与下部I2；I1用于数字I/O，不能代替。');
 if(!s.paired)issues.push('必须连接该通道Signal和配对Return，不把其他通道或AO pin13当回线。');
 if(!Number.isInteger(s.channel)||s.channel<1||s.channel>12)issues.push('模拟通道为1–12。');
 if(!Number.isFinite(s.voltage)||Math.abs(s.voltage)>10)issues.push('模拟通道范围为±10 Vpeak，不能输入或要求输出超范围信号。');
 let currentMA=null;
 if(s.mode==='ao'){
 if(!Number.isFinite(s.resistance)||s.resistance<=0)issues.push('负载阻抗须大于0。');
 else{currentMA=1000*Math.abs(s.voltage)/s.resistance;if(currentMA>10)issues.push('AO所需峰值电流超过每通道10mA；停止信号示意，不把过载当作正常输出。');}
 }
 return {status:issues.length?'blocked':s.connected?'ready':'disconnected',ready:!issues.length&&s.connected,issues,currentMA,signalPin:s.channel,returnPin:s.channel+13};
}
