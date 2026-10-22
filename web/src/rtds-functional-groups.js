import {portContent} from './rtds-port-content.js';
// Merge only within an existing interface family and only by documented function.
// No source IDs/anchors are removed; positional labels remain in the mapping/inspector.
export function functionalSubtypes(metadata,group){
 const ports=group?.ports.filter(p=>p.interactive!==false)||[];if(!ports.length)return[];
 const make=(id,label,items)=>({id,label,ports:items});
 if(metadata.asset_id==='gtfpi-v2-2.01-capped'){
  if(group.id==='ribbon_header')return ports.map(p=>make(p.id.endsWith('.hv')?'hv':'lv',p.id.endsWith('.hv')?'HV · 外接输出面板':'LV · 外接数字 I/O 面板',[p]));
  if(group.id==='power')return[make('shared','24 V · 供电 / 跨接',ports)];
 }
 if(metadata.asset_id==='gtsoc-v2-2a-copper16'){
  if(group.id==='service')return ports.map(p=>make(p.id.split('.').at(-1),p.label,[p]));
  if(group.id==='rear_optical')return[make('rear1','后部 1 · 链路 / 固件更新',ports.filter(p=>p.id.endsWith('.rear1'))),make('rear2-4','后部 2–4 · 应用链路',ports.filter(p=>!p.id.endsWith('.rear1')))];
 }
 if(group.id==='optical')return ports.map(p=>make(p.id.endsWith('.gt1')?'upstream':'downstream',p.id.endsWith('.gt1')?'GT1 · 上游连接':'GT2 · 下游连接',[p]));
 if(group.id==='power')return ports.map(p=>make(p.id.endsWith('.power1')?'upper':'lower',p.id.endsWith('.power1')?'POWER 1 · 上部主电源':'POWER 2 · 下部连接',[p]));
 if(metadata.asset_id==='gtao-v2-2.20'&&group.id==='analog_output')return[make('outputs-1-12','通道 1–12',ports.filter(p=>p.channel<=12)),make('outputs-13-16','通道 13–16 · 仅 NovaCor',ports.filter(p=>p.channel>=13))];
 return[make('shared',group.label,ports)];
}
export function bankContactMap(ports){
 const banks=new Map();for(const p of ports){if(!p.bank||!p.contact_labels)continue;if(!banks.has(p.bank))banks.set(p.bank,{bank:p.bank});const row=banks.get(p.bank),tier=p.tier;row[tier]=p.contact_labels.slice(0,4);row[tier+'Common']=p.contact_labels[4];row[tier+'Id']=p.id;}
 return [...banks.values()].sort((a,b)=>a.bank-b.bank);
}
export function sharedContent(metadata,type){
 if(!type)return null;const original=portContent(metadata,type.ports[0]);if(!original)return null;const content={...original,rows:original.rows.map(row=>[...row])};
 const group=type.ports[0].group;
 if(group==='digital_input'||group==='digital_output'){content.rows=content.rows.filter(([key])=>key!=='本插头标识');content.rows.push(['端子分工',group==='digital_input'?'每 BANK：奇数排 4 路输入 + V+(WET)；偶数排 4 路输入 + GND。':'每 BANK：奇数排 4 路输出 + V+；偶数排 4 路输出 + V−。']);}
 if(group==='analog_output')content.rows=content.rows.map(row=>row[0]==='版本条件'?['版本条件',type.id==='outputs-13-16'?'通道 13–16 仅 NovaCor 可用。':'本组为通道 1–12；另列的通道 13–16 仅 NovaCor 可用。']:row);
 return content;
}
