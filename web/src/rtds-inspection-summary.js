import {functionalSubtypes,sharedContent} from './rtds-functional-groups.js';
import {portContent} from './rtds-port-content.js';

// The compact inspector is a view of the same verified content as section 03.
// Mixed-role groups must not advertise the first connector's rating for every port.
export function inspectionSummary(metadata,groups,state){
 const group=groups.find(g=>g.id===state.group);if(!metadata||!group?.interactive)return null;
 const types=functionalSubtypes(metadata,group),port=metadata.ports.find(p=>p.id===state.portId);
 if(state.inspectionMode==='group'&&types.length>1)return{title:group.label,type:'接口分组',scope:`${group.ports.filter(p=>p.interactive!==false).length} 个实体接口 · ${types.length} 种用途`,purpose:'本组接口用途不同，按角色分别说明；详细参数见下方 03。',rows:types.slice(0,4).map(t=>[t.label,sharedContent(metadata,t)?.purpose||'用途待核对']),source:null};
 const type=types.find(t=>t.id===state.subtypeId)||types.find(t=>t.ports.some(p=>p.id===state.portId))||types[0];
 const direct=state.inspectionMode==='port',content=direct?portContent(metadata,port):sharedContent(metadata,type);if(!content)return null;
 const caution=content.note?(content.note.match(/[^。；]*(?:不得|必须|不建议|未确认|未核对|不能)[^。；]*[。；]?/)?.[0]||content.note):null;
 const preferred=['主要参数','逻辑电平','输出形式','板卡供电','已核对引脚','引脚信息','版本条件','接口 / 线缆','接口形式','通道配置','端口范围','连接对象'];
 const rows=[...content.rows].sort((a,b)=>{const rank=row=>{const i=preferred.indexOf(row[0]);return i<0?99:i;};return rank(a)-rank(b);}).slice(0,direct&&port?.contact_labels?2:3);
 if(direct&&port?.contact_labels)rows.unshift(['本接口端子',port.contact_labels.map(v=>v??'未知').join(' · ')]);
 return{title:direct?port.label:type?.label||group.label,type:direct?group.label:'接口分组',scope:direct?'当前实体接口':`${type?.ports.length||0} 个实体接口 · 相同用途合并说明`,purpose:content.purpose,rows,caution:caution&&caution.length<=140?caution:caution?'本接口还有使用限制与未确认项，请查看 03 完整说明。':null,source:content.source};
}
