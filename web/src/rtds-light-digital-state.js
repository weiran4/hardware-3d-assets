// Light PDF109,111–113,116; referenced GTDO PDF371–372. Representative Bank1 CH1 only.
export const defaultLightDigital=Object.freeze({mode:'di',port:'di',loop:'i1',paired:true,connected:false,high:true,supplied:true,bankVoltage:24});
export function evaluateLightDigital(input={}){
 const s={...defaultLightDigital,...input},issues=[];
 if(!['di','do'].includes(s.mode)||s.port!==s.mode)issues.push('外部有源输出接下方DI；外接负载接上方DO。不能接到模拟组或交换DI/DO。');
 if(s.loop!=='i1')issues.push('数字I/O需要上部I1与下部I1光回环；I2只用于模拟I/O。');
 if(!s.paired)issues.push('缺少公共参考/负载回路：信号线不能代替回线。');
 if(s.mode==='do'&&(!s.supplied||!Number.isFinite(s.bankVoltage)||s.bankVoltage<5||s.bankVoltage>30))issues.push('DO通道组须接外部5–30 Vdc电源及公共回线；Light本身不会代替外部负载电源。');
 const ready=!issues.length&&s.connected;
 return {ready,status:issues.length?'blocked':s.connected?'ready':'disconnected',issues,reading:!ready?'无有效状态':s.mode==='di'?(s.high?'1 · 24 V示例':'0 · 0 V示例'):(s.high?'输出驱动 · '+s.bankVoltage+' V':'输出关闭 · 不保证0 V'),energized:ready&&s.high};
}
