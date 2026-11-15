// Offline teaching; course 35 and NovaCor 2.0 manual PDF 71–72.
export const defaultUdp=Object.freeze({port:'udp',medium:'ethernet',topology:'direct',mode:'storage',configured:true,unique:true,receiver:false,connected:false,secondConnected:false});
export function evaluateUdp(input=defaultUdp){
 const s={...defaultUdp,...input},issues=[];
 if(s.port!=='udp')issues.push('只使用后面板 ETH UDP；WIF 管理口、GT I/O 或 Aurora 不能替代。');
 if(s.medium!=='ethernet')issues.push('本例选择 FCLF8522P2BTL 铜 SFP 与铜缆 Ethernet；不据课件泛称 fibre 推断光模块兼容。');
 if(!s.configured)issues.push('目的 IP / UDP 端口、对端接收程序、数据映射和网络配置尚未匹配；插好电缆不等于 UDP 应用就绪。');
 if(!s.unique)issues.push('多机箱时各 UDP 口必须使用各自唯一的 IP 和 MAC，不能复制同一身份。');
 if(s.mode==='duplex'&&!s.receiver)issues.push('双向示例还需配置 NovaCor 接收与 PC 发送路径；存储功能不自动提供控制返回。');
 const wired=s.connected&&(s.topology==='direct'||s.secondConnected);
 return {status:issues.length?'blocked':wired?'ready':'disconnected',ready:!issues.length&&wired,issues};
}
export function udpLinks(input,phase=0){const s={...defaultUdp,...input},reverse=s.mode==='duplex'&&Math.floor(phase)%2===1,edge=(a,b)=>({a,b,network:s.medium,reverse});return s.topology==='switch'?[...(s.connected?[edge('N.'+s.port,'SW.in')]:[]),...(s.secondConnected?[edge('SW.out','PC.nic')]:[])]:s.connected?[edge('N.'+s.port,'PC.nic')]:[];}
