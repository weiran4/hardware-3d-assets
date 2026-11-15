// Qualitative course37 model: synthetic unitless budget, no hardware execution.
export const defaultBlackbox=Object.freeze({connected:false,socPort:'rear',hostPort:'gtio',medium:'fiber',firmware:'blackbox',artifact:'firmware',mapping:true,feedback:true,sample:4,work:2,exposed:true,gain:1});
export function evaluateBlackbox(input={}){
 const s={...defaultBlackbox,...input},issues=[];
 if(s.socPort!=='rear')issues.push('此应用使用GTSOC V2后部主机光接口组，不选前部应用SFP组；不指定编号。');
 if(s.hostPort!=='gtio')issues.push('NovaCor端使用普通GT I/O组，不使用Aurora专用口或WIF。');
 if(s.medium!=='fiber')issues.push('主机接口为受支持的光链路，不用Ethernet铜缆代替。');
 if(s.artifact!=='firmware')issues.push('.a库不是可直接刷写的完整固件：需RTDS工具链按接口生成应用固件；本页仅说明流程。');
 if(s.firmware!=='blackbox')issues.push('活动固件必须与黑盒控制应用匹配，SV固件不能运行此控制闭环。');
 if(!s.mapping)issues.push('测量/命令接口、数据映射及采样配置必须匹配。');
 if(!s.feedback)issues.push('命令返回路径不完整：不能形成闭环。');
 if(!Number.isFinite(s.sample)||!Number.isFinite(s.work)||s.sample<=0||s.work<0)issues.push('教学预算需有效正采样间隔和非负工作量。');
 const budget=issues.length?null:{remaining:s.sample-s.work,period:s.sample,work:s.work};
 return {issues,budget,status:issues.length?'blocked':!s.connected?'disconnected':budget.remaining<0?'overbudget':'ready',ready:!issues.length&&s.connected&&budget.remaining>=0};
}
