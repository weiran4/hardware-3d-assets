import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publishedModels} from '../src/rtds-models.js';
import {catalog} from '../src/rtds-catalog.js';
import {portGroups} from '../src/rtds-state.js';
import {functionalSubtypes,sharedContent} from '../src/rtds-functional-groups.js';
import {portContent} from '../src/rtds-port-content.js';

const fpi='gtfpi-v2-2.01-capped',soc='gtsoc-v2-2a-copper16';
const port=(asset,id,group,extra={})=>({id:`${asset}.${id}`,label:id,group,...extra});
const meta=(asset,ports=[])=>({asset_id:asset,ports});
const prose=content=>JSON.stringify(content);
const group=(m,id)=>portGroups(m).find(g=>g.id===id);

for(const [asset,count,contacts]of [[fpi,9,94],[soc,25,151]])test(`${asset} registers exact additive identity and matching audited public asset pair`,()=>{
 const variant=asset===fpi?'gtfpi-v2':'gtsoc-v2',info=publishedModels[variant];assert.ok(info,'exact populated variant is not integrated');
 const entry=catalog.find(c=>c.id===variant);assert.ok(entry);assert.match(entry.revision,asset===fpi?/2\.01.*防尘盖/:/GTSOC-2A.*铜/);assert.equal(catalog.filter(c=>c.id.startsWith(variant)).length,1,'upgrade the matching placeholder without duplicate version rows');
 const data=JSON.parse(readFileSync('public/'+info.metadata.replace('./','')));assert.equal(data.asset_id,asset);assert.equal(data.ports.length,count);assert.equal(data.ports.reduce((n,p)=>n+(p.visible_contact_count||0),0),contacts);
 const b=readFileSync('public/'+info.glb.replace('./','')),doc=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12))),nodes=new Map(doc.nodes.filter(n=>n.extras?.sid).map(n=>[n.extras.sid,n]));
 assert.equal(doc.images?.length??0,0);
 for(const p of data.ports){assert.ok(nodes.has(p.id),p.id);assert.deepEqual(JSON.parse(nodes.get(p.id).extras.port_record),p);assert.equal(p.validated_mating,false);assert.equal(p.insertion_animation_ready,false);assert.equal(p.physical_compatibility,'unknown');assert.equal(p.normal.length,3);}
 if(asset===fpi){assert.equal(data.pcb_revision,'2.01');assert.deepEqual(data.ports.filter(p=>p.group==='ribbon_header').map(p=>p.visible_contact_count),[50,34]);for(const p of data.ports.filter(p=>p.group==='power'))assert.deepEqual(p.contact_labels,[null,null,null,null]);assert.equal(group(data,'service_unresolved').interactive,false);}
 else {assert.equal(data.model_plate,'GTSOC-2A');const rear=data.ports.filter(p=>p.group==='rear_optical');assert.equal(rear.length,4);assert.equal(rear.reduce((n,p)=>n+p.visible_face_feature_count,0),8);assert.ok(rear.every(p=>p.visible_contact_count===0&&p.cap_status==='unknown'));}
});

test('GTFPI separates HV/LV roles, merges unassigned power roles and preserves two optical directions',()=>{
 const m=meta(fpi,[port(fpi,'hv','ribbon_header'),port(fpi,'lv','ribbon_header'),port(fpi,'power1','power'),port(fpi,'power2','power'),port(fpi,'gt1','optical'),port(fpi,'gt2','optical')]);
 assert.deepEqual(functionalSubtypes(m,group(m,'ribbon_header')).map(t=>t.ports.map(p=>p.id)),[[`${fpi}.hv`],[`${fpi}.lv`]]);
 const power=functionalSubtypes(m,group(m,'power'));assert.equal(power.length,1);assert.equal(power[0].ports.length,2);assert.doesNotMatch(power[0].label,/主电源|上部/);
 assert.deepEqual(functionalSubtypes(m,group(m,'optical')).map(t=>t.id),['upstream','downstream']);
});

test('GTFPI 03 distinguishes bridge, panel capacity, contact count and LV marks without a guessed pinout',()=>{
 const m=meta(fpi),hv=prose(portContent(m,port(fpi,'hv','ribbon_header'))),lv=prose(portContent(m,port(fpi,'lv','ribbon_header')));
 assert.match(hv,/外接.*HV|HV.*面板/);assert.match(hv,/50/);assert.match(hv,/不能|不适用/);assert.match(hv,/针脚|引脚/);
 assert.match(lv,/34/);assert.match(lv,/16.*输入.*16.*输出/);assert.match(lv,/1.*外.*2.*内/);assert.match(lv,/未确认|未建立/);
});

test('GTFPI primary connection facts retain capped optical and both unknown power mappings',()=>{
 const m=meta(fpi);
 for(const id of ['power1','power2']){const c=prose(portContent(m,port(fpi,id,'power')));assert.match(c,/24.*V/);assert.match(c,/5.*W/);assert.match(c,/顺序.*未|空间.*未/);assert.doesNotMatch(c,/已核对引脚|自上而下/);}
 const aux=prose(portContent(m,port(fpi,'hv5v','aux_power')));assert.match(aux,/5.*V/);assert.match(aux,/开放式.*2.*针/);assert.match(aux,/极性.*未/);assert.doesNotMatch(aux,/螺钉端子/);
 for(const id of ['gt1','gt2']){const c=prose(portContent(m,port(fpi,id,'optical')));assert.match(c,/防尘盖/);assert.match(c,/盖下.*未/);assert.match(c,/双工/);}
 assert.equal(portContent(m,port(fpi,'service_header','service_unresolved',{interactive:false})),null);
});

test('GTSOC groups sixteen copper sockets, distinguishes all service purposes and rear1 firmware role',()=>{
 const m=meta(soc,[...Array.from({length:16},(_,i)=>port(soc,`front${i+1}`,'front_sfp')),...['monitor_ps','monitor_pl','prog_jtag'].map(id=>port(soc,id,'service')),...Array.from({length:4},(_,i)=>port(soc,`rear${i+1}`,'rear_optical'))]);
 assert.deepEqual(functionalSubtypes(m,group(m,'front_sfp')).map(t=>t.ports.length),[16]);
 assert.deepEqual(functionalSubtypes(m,group(m,'service')).map(t=>t.ports.length),[1,1,1]);
 assert.deepEqual(functionalSubtypes(m,group(m,'rear_optical')).map(t=>t.ports.length),[1,3]);
 const types=functionalSubtypes(m,group(m,'service'));for(const t of types)assert.ok(sharedContent(m,t));
});

test('GTSOC copper population is SV-specific and firmware capacity is not inferred from socket count',()=>{
 const c=prose(portContent(meta(soc),port(soc,'front1','front_sfp')));assert.match(c,/铜.*SFP/);assert.match(c,/SV/);assert.match(c,/主时间步/);assert.match(c,/子步/);assert.match(c,/固件/);assert.match(c,/模块/);assert.match(c,/许可/);assert.match(c,/不.*Aurora/);
});

test('GTSOC service descriptions use source purposes rather than runtime signal I/O',()=>{
 const m=meta(soc);for(const [id,role]of [['monitor_ps',/应用.*调试.*UART/],['monitor_pl',/RTDS.*硬件测试/],['prog_jtag',/编程/]]){const c=prose(portContent(m,port(soc,id,'service')));assert.match(c,role);assert.match(c,/不.*运行时/);}
});

test('GTSOC rear links keep blackbox rear assignment and white-face uncertainty in primary text',()=>{
 const m=meta(soc);for(const id of ['rear1','rear2']){const c=prose(portContent(m,port(soc,id,'rear_optical')));assert.match(c,/NovaCor/);assert.match(c,/黑盒/);assert.match(c,/4.*双工|双工.*4/);assert.match(c,/8.*白色/);assert.match(c,/盖.*套筒/);assert.match(c,/未确认|无法确认/);assert.match(c,/不.*电气接点/);}
 assert.match(prose(portContent(m,port(soc,'rear1','rear_optical'))),/固件.*更新/);
 assert.match(prose(portContent(m,port(soc,'eth','rear_eth'))),/MMC.*子模块.*工作站|工作站.*MMC.*子模块/);
});

test('GTSOC power distinguishes input range, maximum consumption and fuse specification',()=>{
 const c=prose(portContent(meta(soc),port(soc,'ac','ac_power')));assert.match(c,/100–240.*V/);assert.match(c,/50\/60.*Hz/);assert.match(c,/32.*W/);assert.match(c,/3.*A.*250.*V/);assert.match(c,/保险丝/);
});

test('new group labels and citations are readable without exposing private container provenance',()=>{
 for(const [asset,id,family]of [[fpi,'hv','ribbon_header'],[fpi,'hv5v','aux_power'],[soc,'front1','front_sfp'],[soc,'monitor_ps','service'],[soc,'rear1','rear_optical'],[soc,'eth','rear_eth']]){
  const m=meta(asset,[port(asset,id,family)]);assert.match(group(m,family).label,/[\u4e00-\u9fff]/);const c=portContent(m,m.ports[0]);assert.ok(c?.source);assert.equal(c.source.pageKind,'章节印刷页');assert.doesNotMatch(prose(c),/\/workspace\/|private|\.pdf|Library|sha256|PDF \d/i);
 }
});
