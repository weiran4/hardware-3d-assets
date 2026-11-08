// Original offline rules from IRC Switch V2, revision 20250910, PDF181,187–189,193–194.
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const integer=(x,a,b)=>Number.isSafeInteger(x)&&x>=a&&x<=b;
const result=(status,message,capacity)=>({status,message,capacity});
function readRows(text,capacity){
 if(typeof text!=='string'||text.length>10000)return {error:'输入须为不超过10000字符的连接列表。'};
 if(!text.trim())return {rows:[]};
 const lines=text.trim().split(/\r?\n/);if(lines.length>144)return {error:'连接条目超过单机箱144端口上限。'};
 const rows=[],ports=new Set(),racks=new Set();
 for(const line of lines){const parts=line.split(',').map(x=>x.trim());if(parts.length!==3||parts.some(x=>!/^\d+$/.test(x)))return {error:'每行填写三个正整数：交换机端口,机架号,机架IRC端口。'};
 const [port,rack,irc]=parts.map(Number);if(!integer(port,1,capacity)||!integer(rack,1,Number.MAX_SAFE_INTEGER)||!integer(irc,1,6))return {error:'端口超出已装卡容量，或机架号/IRC端口不在本例范围内。'};
 if(ports.has(port)||racks.has(`${rack}:${irc}`))return {error:'交换机端口或同一机架的同一IRC端口不能重复占用。'};
 ports.add(port);racks.add(`${rack}:${irc}`);rows.push([port,rack,irc]);}
 return {rows};
}
export function checkSwitchMap(x){
 if(!obj(x)||!integer(x.cards,1,6)||typeof x.saved!=='boolean')return result('invalid','请选择1–6张卡并确认配置保存状态。');
 const capacity=x.cards*24,p=readRows(x.physical,capacity),c=readRows(x.configured,capacity);
 if(p.error||c.error)return result('invalid',p.error||c.error,capacity);
 if(!p.rows.length||!c.rows.length)return result('unknown','实际连接和配置列表均需填写，空白不能判为匹配。',capacity);
 const canonical=rows=>rows.map(r=>r.join(',')).sort().join(';');
 if(canonical(p.rows)!==canonical(c.rows))return result('invalid','实际连接与配置的端口、机架号或IRC通道不一致，或存在缺失/多余条目。',capacity);
 if(!x.saved)return result('unknown','条目一致，但尚未确认保存Hardware Manager配置。',capacity);
 return result('match','已列映射规则匹配；不代表固件、光学、同步或真实通信已就绪。',capacity);
}
export function checkSwitchManagement(x){
 if(!obj(x)||!integer(x.cards,1,6)||!integer(x.card,1,x.cards)||!['ethernet','usb'].includes(x.medium))return result('invalid','管理接口选择无效或该卡未安装。');
 if(x.card!==1)return result('invalid','仅第1张IRC Switch卡的Ethernet和USB用于管理；不要接第2–6张卡的管理口。');
 return result('match',x.medium==='ethernet'?'第1卡前面板Ethernet → 工作站LAN（100BASE-TX或千兆）；还须核对静态IP和网络配置。':'第1卡前面板USB → Windows工作站配置接口；驱动与COM口需确认，手册波特率115200。');
}
