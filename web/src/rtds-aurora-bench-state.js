// Offline lesson only. NovaCor 2.0 manual PDF 71/74 and course p34.
export const defaultAurora=Object.freeze({port:'gt21',medium:'fiber',licensed:true,compatible:true,connected:false});
export function evaluateAurora(input=defaultAurora){
 const s={...defaultAurora,...input},issues=[];
 if(!['gt21','gt22','gt23','gt24'].includes(s.port))issues.push('选择 NovaCor 2.0 的 21–24；普通 GT I/O 不能代替 Aurora。');
 if(s.medium!=='fiber')issues.push('本接口使用匹配光学收发器的光纤，不是 Ethernet 铜缆；相同光插头不保证协议兼容。');
 if(!s.licensed)issues.push('未配备独立 Aurora 许可，专用端口不能使用，也不能改作普通 I/O。');
 if(!s.compatible)issues.push('须先核对双方 Aurora 实现、固件、变量映射、配置和光学条件；普通光口设备不自动兼容。');
 return {status:issues.length?'blocked':s.connected?'ready':'disconnected',ready:!issues.length&&s.connected,issues};
}
