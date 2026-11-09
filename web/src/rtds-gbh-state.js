// GBH V3, PDF197–205. Recommended sequential mapping only; offline checks.
export function checkGbh({capacity,count,start,fleet,cases}){
 const bad=message=>({status:'invalid',message,groups:[],mapping:[],unused:[]});
 if(![36,72,108,144].includes(capacity)||![count,start].every(n=>Number.isSafeInteger(n)&&n>0)||count>capacity||!Number.isSafeInteger(start+(count-1))||!['novacor','legacy'].includes(fleet))return bad('请确认容量、接入数量、起始机架号及硬件类型；数量不能超过通道容量。');
 if(fleet==='legacy'&&start+(count-1)>128)return bad('机架编号大于128仅支持NovaCor；此限制针对编号，不是接入数量。');
 const mapping=Array.from({length:count},(_,i)=>({port:i+1,rack:start+i}));
 if(typeof cases!=='string'||!cases.trim())return bad('请填写案例机架号；每行一个案例，逗号分隔，按升序连续排列。');
 const groups=[],used=new Set();
 for(const [i,line]of cases.trim().split(/\r?\n/).entries()){
 const raw=line.split(',').map(s=>s.trim());if(raw.some(s=>!/^\d+$/.test(s)))return bad(`案例${i+1}：请输入正整数机架号，勿留空。`);
 const racks=raw.map(Number);if(racks.some(n=>!Number.isSafeInteger(n)||n<start||n>start+(count-1)))return bad(`案例${i+1}：所选机架不在本例已连接映射内。`);
 if(racks.some((n,j)=>j&&n!==racks[j-1]+1))return bad(`案例${i+1}：机架号必须升序连续，不能跳号或重复。`);
 if(racks.some(n=>used.has(n)))return bad(`案例${i+1}：与另一个并行案例重复占用机架。`);
 racks.forEach(n=>used.add(n));groups.push({master:racks[0],racks});
 }
 return {status:'match',message:'分组条件通过。每个案例有自己的首机架master；这不是实物接线或运行确认。',mapping,groups,unused:mapping.map(m=>m.rack).filter(n=>!used.has(n))};
}
