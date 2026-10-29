import {lessonForHardware,parseTeachingRoute,hardwareHash,teachingOwnsViewport} from './rtds-lesson-context.js';
import {chapterOwnsViewport} from './rtds-cabinet-state.js';
import {initPowerLesson} from './rtds-power-lesson.js';
import {initAnalogLesson} from './rtds-analog-lesson.js';
import {initRtdsPip} from './rtds-pip.js';
import {functionalSubtypes,sharedContent,bankContactMap} from './rtds-functional-groups.js';
import {catalog,sources} from './rtds-catalog.js';
import {publishedModels} from './rtds-models.js';
import {createGalleryState,galleryTransition,portGroups,galleryModeFromHash} from './rtds-state.js';
import {inspectionSummary} from './rtds-inspection-summary.js';
import {createRtdsScene} from './rtds-scene.js';
const $=id=>document.getElementById(id);
const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
const statusNames={documented:'资料明确记载',observed_and_documented:'图示与资料交叉核对',observed_not_mechanically_certified:'外观核对；未作机械认证',photo_estimated:'照片估计',not_validated:'未验证',unknown:'未知',partial:'部分已知',observed:'图示可见'};
const connectorNames={round_single_contact_socket_standard_unknown:'圆形单接点插孔 · 标准未确认（不是已确认 BNC）',lc_duplex_sfp_ftlf8519p3bnl_visual:'双 LC 光接口 / FTLF8519P3BNL 外观',copper_sfp_8p8c:'铜缆 SFP / 8P8C', '8p8c_ethernet':'8P8C Ethernet',gbh_duplex_pof_visual:'GBH 双孔 POF 外观 · 不等同于 LC',round_dc_power_visual_standard_unknown:'圆形供电入口 · 配接标准未确认',three_blade_ac_inlet_visual:'三片式交流入口 · 未验证配接'};
export function initRtdsGallery(onMode){
 let state=createGalleryState(),viewer=null,metadata=null,groups=[],generation=0,timer=null,active=false,initialized=false,isolate=false,initialLoad=null,contextActivated=false,routeGeneration=0;
 const pip=initRtdsPip({wrap:document.querySelector('.rtds-viewer-wrap'),onView:action=>{stopTour();viewer?.view(action);}});
 const powerLesson=initPowerLesson();
 const analogLesson=initAnalogLesson(async endpoint=>{const pending=selectVariant(endpoint.variantId),token=generation;await pending;if(token!==generation||!active||state.group||state.portId||state.variantId!==endpoint.variantId||!viewer||!metadata?.ports.some(p=>p.id===endpoint.portId))return false;selectPort(endpoint.portId);$('rtds-scene').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return true;});
 const count=Object.keys(publishedModels).length;$('rtds-library-count').textContent=`${catalog.length} 个版本条目 / ${count} 个 3D 素材 / 其余仅资料`;
 function drawCatalog(){const filter=$('rtds-filter').value,list=$('rtds-catalog');const focused=list.contains(document.activeElement)?document.activeElement.dataset.variant:null;list.replaceChildren();for(const item of catalog){const model=publishedModels[item.id];if(filter==='modeled'&&!model||filter==='reference'&&model)continue;const b=el('button',undefined,'rtds-catalog-item'+(model?' modeled':''));b.dataset.variant=item.id;b.setAttribute('aria-pressed',String(item.id===state.variantId));b.append(el('strong',item.name),el('small',item.revision),el('span',model?'3D 接口观察':'仅资料 · 未建模'));b.addEventListener('click',()=>navigate(hardwareHash(item.id)));list.append(b);}if(!list.children.length)list.append(el('p','暂无符合筛选的条目。','rtds-library-note'));if(focused)list.querySelector(`[data-variant="${focused}"]`)?.focus({preventScroll:true});}
 function stopTour(){clearInterval(timer);timer=null;state=galleryTransition(state,{type:'tour',playing:false});$('rtds-tour').textContent='播放巡览';$('rtds-tour').setAttribute('aria-pressed','false');}
 function setControls(ready){for(const id of ['front','rear','top','reset','in','out','next','tour'])$('rtds-'+id).disabled=!ready;$('rtds-isolate').disabled=!ready||!state.group;}
 function renderEvidence(item){$('rtds-summary').textContent=item.summary;const ready=!!publishedModels[item.id];$('rtds-known-copy').textContent=ready?'主要接口身份、数量与可核对键位按该版本资料整理。GTI/O 卡的辅助 / 服务区域仍有明确标注的未知项；不代表全部连接器已认证。':'当前只整理资料中可确认的版本与功能；尚未完成接口几何核对，不能当作现成模型。';$('rtds-estimate-copy').textContent=ready?'安装位置、PCB / 机箱局部尺寸与未标注构造来自照片估计。已知插头的厂商标称节距和尺寸另列，不能推广到整机公差。':'缺少匹配照片、尺寸或键位时保留未知，不用其他版本的外形代替。';
  $('rtds-scope-note').textContent=item.scopeNote|| (item.id==='novacor-2.0'?'尺寸口径：2023 宣传册整体包络 483 × 522 × 178 mm；手册另列前部 450 × 175 mm、后部 428 mm 等不同口径，未把这些尺寸合并为制造依据。正面圆孔的配接标准仍未知。':item.id==='gtdi-v2'?'装配状态：本模型展示 16 个五位端子插头已安装的状态，依据手册端子图；组件面照片可能未装齐或有遮挡。64 个输入通道 ≠ 80 个端子位置。': '这里保留版本边界；外观相近不代表端口数量、键位或电气条件相同。');
  const list=$('rtds-source-list');list.replaceChildren();for(const evidence of item.evidence){const source=sources[evidence.source_id];if(!source)continue;const li=el('li');if(source.url){const a=el('a',source.title);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);}else li.append(el('span','RTDS Hardware Manual · 私有参考，不提供下载'));li.append(el('small',evidence.locator));list.append(li);}
 }
 function renderBrief(){
  const brief=inspectionSummary(metadata,groups,state),panel=$('rtds-inspection-summary'),content=$('rtds-inspection-content');panel.hidden=!brief;document.querySelector('.rtds-viewer-layout').classList.toggle('has-inspection',!!brief);content.replaceChildren();if(!brief)return;
  const heading=el('h4',brief.title);heading.id='rtds-inspection-title';content.append(heading,el('p',brief.type+' · '+brief.scope,'rtds-inspection-type'),el('p',brief.purpose,'rtds-inspection-purpose'));
  const facts=el('dl');for(const [key,value]of brief.rows)facts.append(el('dt',key),el('dd',value));content.append(facts);if(brief.caution)content.append(el('p',brief.caution,'rtds-inspection-caution'));if(brief.source)content.append(el('p',`依据：${brief.source.chapter} 手册 · ${brief.source.revision}；页码见 03。`,'rtds-inspection-source'));
 }
 $('rtds-inspection-close').addEventListener('click',()=>{stopTour();state=galleryTransition(state,{type:'reset'});isolate=false;renderDetails();$('rtds-reset').focus({preventScroll:true});});
 $('rtds-summary-details').addEventListener('click',event=>{event.preventDefault();$('rtds-detail').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('rtds-details-heading').tabIndex=-1;$('rtds-details-heading').focus({preventScroll:true});});
 function renderDetails(){
  const group=groups.find(g=>g.id===state.group),port=metadata?.ports.find(p=>p.id===state.portId),types=functionalSubtypes(metadata,group),type=types.find(t=>t.id===state.subtypeId)||types.find(t=>t.ports.some(p=>p.id===state.portId))||types[0],content=sharedContent(metadata,type);
  const title=state.inspectionMode==='port'?`${type?.label||group?.label} · ${port?.label}`:type?.label||group?.label||'从一个分组开始';
  $('rtds-detail-title').textContent=title;$('rtds-detail-copy').textContent=content?content.purpose:group?'这些区域只保留定位记录；接点数量或类型未核对，暂不提供接口选择，也不纳入自动巡览。':'选择 02 分组，自动查看共同的用途、参数与连接对象。相同功能只说明一次；不同用途会单独列出。';
  const list=$('rtds-port-list'),focused=list.contains(document.activeElement)?document.activeElement.dataset.rtdsSubtype:null;list.replaceChildren();
  if(types.length>1){for(const t of types){const button=el('button',t.label);button.dataset.rtdsSubtype=t.id;button.setAttribute('aria-pressed',String(t.id===type.id));button.addEventListener('click',()=>selectSubtype(t.id));list.append(button);}}
  else if(type)list.append(el('p',`共 ${type.ports.length} 个实体接口 · 相同用途合并说明`,'rtds-shared-label'));
  else for(const p of group?.ports||[]){const n=el('span',p.label+' · 未核对','rtds-unresolved');n.dataset.unresolved=p.id;list.append(n);}
  if(focused)list.querySelector(`[data-rtds-subtype="${focused}"]`)?.focus({preventScroll:true});
  const facts=$('rtds-port-facts'),notesOpen=facts.querySelector('details')?.open,physicalFocused=document.activeElement?.id==='rtds-physical-port';facts.replaceChildren();if(port&&content){
   const dl=el('dl',undefined,'rtds-functional-facts');for(const [key,value]of content.rows)dl.append(el('dt',key),el('dd',value));facts.append(dl);if(content.note)facts.append(el('p',content.note,'rtds-functional-note'));
   const banks=bankContactMap(type.ports);if(banks.length){const box=el('div',undefined,'rtds-bank-map');box.append(el('h5','端子编号 · 每 BANK 8 路'));box.append(el('p','组件面正立观察，沿板卡顶部 → 底部读取每排的 5 个位置。橙色标出该排首个信号位置；不是电平或机械防呆认证。','rtds-bank-caption'));const table=el('table'),head=el('thead'),hr=el('tr');for(const label of ['BANK','奇数排 · 位置 1 → 5','偶数排 · 位置 1 → 5']){const th=el('th',label);th.scope='col';hr.append(th);}head.append(hr);table.append(head);const body=el('tbody');for(const row of banks){const tr=el('tr'),th=el('th',String(row.bank));th.scope='row';tr.append(th);for(const tier of ['odd','even']){const td=el('td');td.dataset.label=tier==='odd'?'奇数排':'偶数排';td.dataset.portId=row[tier+'Id'];if(row[tier+'Id']===state.portId&&state.inspectionMode==='port')td.className='selected';td.append(el('strong',row[tier][0],'rtds-terminal-first'),document.createTextNode(' · '+row[tier].slice(1).join(' · ')+' | '),el('b',row[tier+'Common'],'rtds-terminal-common'));tr.append(td);}body.append(tr);}table.append(body);box.append(table);facts.append(box);}
   const refs=el('div',undefined,'rtds-port-evidence');for(const ref of [content.source,...(content.extraSources||[])])refs.append(el('span',`手册 · ${ref.chapter} / 修订 ${ref.revision} / ${ref.pageKind||'PDF'} ${ref.pages.join('、')}`));for(const link of content.links||[]){const a=el('a',link.title+' ↗');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';refs.append(a);}facts.append(refs);
   const notes=el('details',undefined,'rtds-model-notes');notes.open=!!notesOpen;notes.append(el('summary','实体定位与模型记录（可选）'));const label=el('label','单独定位一个实体接口');label.htmlFor='rtds-physical-port';const select=el('select');select.id='rtds-physical-port';select.append(el('option','选择编号，仅改变定位'));select.firstChild.value='';for(const p of group.ports.filter(p=>p.interactive!==false)){const option=el('option',p.label+' · '+p.id);option.value=p.id;select.append(option);}select.value=state.inspectionMode==='port'?state.portId:'';select.addEventListener('change',()=>{if(select.value)selectPort(select.value);});notes.append(label,select);
   const record=el('dl');const rows=[['定位记录',state.inspectionMode==='port'?port.id:`${type.ports.length} 个实体接口；展开上方编号可单独定位。`],['几何连接器记录',connectorNames[port.connector]||port.connector],['可见接点 / 位置',port.visible_contact_count??'未知'],...(port.contact_labels?[['当前实体标识',port.contact_labels.map(v=>v??'未知').join(' · ')]]:[]),...(port.pitch_mm?[['插头标称节距',`${port.pitch_mm} mm · 厂商资料`]]:[]),['局部几何',statusNames[port.accuracy?.mechanical_dimensions]||'照片估计 / 未认证']];for(const [key,value]of rows)record.append(el('dt',key),el('dd',String(value)));notes.append(record,el('p','几何位置与形状用于观察，不是制造图，也未做机械配接检验。手册已记载的功能与线缆类型见上方。'));facts.append(notes);if(physicalFocused)select.focus({preventScroll:true});
  }
  if(state.variantId==='novacor-2.0'&&group?.id==='analogue'){const launch=el('button',undefined,'analog-launch');launch.id='rtds-open-analog';launch.append(el('span','▶ 看前部模拟输出动画'),el('small','220 V 仿真值 → 低压输出 → 万用表'));launch.addEventListener('click',()=>openTeaching('analog'));facts.append(launch);}
  if(['gtao-v2','gtai-v2','gtdi-v2','gtdo-v2'].includes(state.variantId)&&group?.id==='power'){const launch=el('button',undefined,'power-launch');launch.id='rtds-open-power';launch.append(el('span','▶ 看 GTIO 供电动画'),el('small','真实 GTAO 双卡 · 24 V 供电与卡间跳线'));launch.addEventListener('click',()=>openTeaching('power'));facts.append(launch);}
  for(const b of $('rtds-group-list').children)b.setAttribute('aria-pressed',String(b.dataset.group===state.group));$('rtds-isolate').disabled=!viewer||!group?.interactive;$('rtds-isolate').setAttribute('aria-pressed',String(isolate));$('rtds-view-state').textContent=state.inspectionMode==='port'?`接口 ${port?.label} · 观察高亮`:state.inspectionMode==='subtype'?type.label:group?`${group.label} · ${group.ports.length} 个接口`:'整体观察 · 尚未选择接口';
  const ids=(state.inspectionMode==='subtype'?type?.ports:group?.ports)?.filter(p=>p.interactive!==false).map(p=>p.id)||[],single=state.inspectionMode==='port'?state.portId:state.inspectionMode==='subtype'&&type.ports.length===1?type.ports[0].id:null;
  renderBrief();
  viewer?.inspect(ids,single,isolate,state.inspectionMode==='port'?port?.label:state.inspectionMode==='subtype'?type?.label:group?.label||'');
 }
 function selectSubtype(id){const type=functionalSubtypes(metadata,groups.find(g=>g.id===state.group)).find(t=>t.id===id);if(!type)return;stopTour();state=galleryTransition(state,{type:'subtype',subtypeId:id,portId:type.ports[0].id});renderDetails();viewer?.focus(type.ports.map(p=>p.id));}
 function selectGroup(id,fromTour=false){if(!fromTour)stopTour();if(!groups.some(g=>g.id===id))return;state=galleryTransition(state,{type:'group',group:id,firstPortId:groups.find(g=>g.id===id).ports.find(p=>p.interactive!==false)?.id});if(!groups.find(g=>g.id===id).interactive)isolate=false;renderDetails();const g=groups.find(g=>g.id===id);if(g.interactive)viewer?.focus(g.ports.filter(p=>p.interactive!==false).map(p=>p.id));}
 function selectPort(id,focus=true){const port=metadata?.ports.find(p=>p.id===id);if(!port||port.interactive===false)return;stopTour();state=galleryTransition(state,{type:'group',group:port.group});state=galleryTransition(state,{type:'port',portId:id});renderDetails();if(focus)viewer?.focus([id]);}
 function nextGroup(fromTour=false){if(!groups.length)return;const touring=groups.filter(g=>g.interactive);if(!touring.length)return;const i=touring.findIndex(g=>g.id===state.group);selectGroup(touring[(i+1)%touring.length].id,fromTour);}
 async function selectVariant(id,{teach=true}={}){const item=catalog.find(c=>c.id===id);if(!item)return;const token=++generation;analogLesson.pause();powerLesson.pause();stopTour();pip.setReady(false);viewer?.dispose();viewer=null;metadata=null;groups=[];isolate=false;state=galleryTransition(state,{type:'variant',variantId:id});contextActivated=teach;syncTeaching();$('rtds-scene').removeAttribute('data-loaded');$('rtds-scene').removeAttribute('data-asset');$('rtds-label').hidden=true;drawCatalog();renderEvidence(item);renderDetails();setControls(false);$('rtds-group-list').replaceChildren();$('rtds-model-title').textContent=item.name;$('rtds-model-revision').textContent=item.revision;$('rtds-model-kicker').textContent=item.type+' / VERSIONED ASSET';const info=publishedModels[id];$('rtds-model-status').textContent=info?(info.statusLabel||'3D 素材 · 原创几何'):'仅资料 · 未建模';$('rtds-model-status').className='rtds-badge'+(info?' known':'');$('rtds-reference-placeholder').hidden=!!info;$('rtds-loading').hidden=!info;$('rtds-loading').textContent='正在载入本版本的接口模型…';$('rtds-tour-copy').textContent=info?'仅巡览接口分组，不模拟设备运行。':'该版本没有三维巡览；下方保留事实与来源。';
  if(!info){$('rtds-scene').dataset.loaded='reference';return;}
  try{const response=await fetch(new URL(info.metadata,document.baseURI));if(!response.ok)throw Error('接口数据加载失败');const data=await response.json();if(token!==generation)return;metadata=data;groups=portGroups(data);for(const group of groups){const b=el('button',undefined,'rtds-group');b.dataset.group=group.id;b.append(document.createTextNode(group.label),el('span',group.interactive?`${group.ports.length}`:`${group.ports.length} 处待核对`));b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>selectGroup(group.id));$('rtds-group-list').append(b);}renderDetails();const loadedViewer=await createRtdsScene($('rtds-scene'),$('rtds-label'),info,data,id=>selectPort(id,false),()=>token===generation);if(token!==generation){loadedViewer?.dispose();return;}viewer=loadedViewer;viewer.setActive(active&&!document.hidden);$('rtds-loading').hidden=true;setControls(true);renderDetails();pip.setReady(true);}
  catch(error){if(token!==generation)return;console.warn('RTDS viewer unavailable:',error);$('rtds-scene').dataset.loaded='error';$('rtds-loading').hidden=false;$('rtds-loading').textContent='三维模型暂时无法加载。可继续查看下方接口数据与资料来源；请稍后切换版本重试，或使用支持 WebGL 的浏览器。';setControls(false);}
 }
 for(const action of ['front','rear','top','in','out'])$('rtds-'+action).addEventListener('click',()=>{stopTour();viewer?.view(action);});
 $('rtds-reset').addEventListener('click',()=>{stopTour();state=galleryTransition(state,{type:'reset'});isolate=false;renderDetails();viewer?.view('reset');});
 $('rtds-isolate').addEventListener('click',()=>{stopTour();isolate=!isolate;renderDetails();});
 $('rtds-next').addEventListener('click',()=>nextGroup());
 $('rtds-tour').addEventListener('click',()=>{if(state.playing){stopTour();return;}state=galleryTransition(state,{type:'tour',playing:true});$('rtds-tour').textContent='暂停巡览';$('rtds-tour').setAttribute('aria-pressed','true');nextGroup(true);timer=setInterval(()=>nextGroup(true),6500);});
 $('rtds-filter').addEventListener('change',drawCatalog);
 function syncChapterPip(){const chapter=$('rtds-chapter-1a'),lessons=[$('rtds-analog-lesson'),$('rtds-power-lesson')];pip.setSuppressed(!!(active&&((!chapter.hidden&&chapterOwnsViewport(chapter.getBoundingClientRect(),innerHeight))||lessons.some(section=>!section.hidden&&teachingOwnsViewport(section.getBoundingClientRect(),innerHeight)))));}
 window.addEventListener('scroll',syncChapterPip,{passive:true});window.addEventListener('resize',syncChapterPip);document.addEventListener('toggle',syncChapterPip,true);

 function syncTeaching(){
  const lesson=contextActivated?lessonForHardware(state.variantId):null,shown=active&&lesson;
  const sections={analog:'rtds-analog-lesson',power:'rtds-power-lesson',cabinet:'rtds-chapter-1a'};
  for(const [key,id]of Object.entries(sections))$(id).hidden=!shown||key!==lesson;
  $('rtds-teaching').hidden=!shown;$('rtds-open-teaching').hidden=!shown;
  const item=catalog.find(c=>c.id===state.variantId);
  $('rtds-teaching-heading').textContent=(item?.name||'所选硬件')+' · 教学演示';
  $('rtds-teaching-version').textContent=lesson==='power'?'本例使用 GTAO V2 双卡与 Cubicle V1 图示；用于理解 24 V 并联供电，不代表所选板卡的机械接线或新版机柜安装。':lesson==='analog'?'仅适用于 NovaCor 2.0；不借用到 NovaCor Light 或 NovaCor 1.0。':lesson==='cabinet'?'Cubicle V2 · PDF 16–36 · 基础版 / 完善中；参数教学，无机柜机械模型。':'';
  analogLesson.setActive(!!(active&&!document.hidden&&lesson==='analog'));
  powerLesson.setActive(!!(active&&!document.hidden&&lesson==='power'));
  syncChapterPip();
 }
 function openTeaching(lesson=lessonForHardware(state.variantId)){
  if(!active||!lesson||lesson!==lessonForHardware(state.variantId))return;
  contextActivated=true;syncTeaching();
  if(lesson==='analog')analogLesson.open();else if(lesson==='power')powerLesson.open();else{$('rtds-chapter-1a').scrollIntoView({block:'start',behavior:'instant'});$('cabinet-heading').focus({preventScroll:true});}
 }
 $('rtds-open-teaching').addEventListener('click',()=>openTeaching());
 function mode(modeName){active=modeName==='rtds';$('generic-panel').hidden=active;$('rtds-panel').hidden=!active;pip.setActive(active);syncTeaching();$('mode-generic').setAttribute('aria-pressed',String(!active));$('mode-rtds').setAttribute('aria-pressed',String(active));document.querySelector('.skip').href=active?'#rtds-heading':'#lesson';document.querySelector('.skip').textContent=active?'跳到 RTDS 素材库':'跳到接线操作';onMode(active);viewer?.setActive(active&&!document.hidden);if(!active)stopTour();}
 function navigate(hash){if(location.hash===hash)applyRoute();else location.hash=hash;}
 async function applyRoute(){
  const token=++routeGeneration,hash=location.hash,route=parseTeachingRoute(hash);
  mode(galleryModeFromHash(hash));if(!active)return;
  if(route){initialized=true;initialLoad=selectVariant(route.hardware,{teach:true});await initialLoad;}
  else if(!initialized){initialized=true;initialLoad=selectVariant(state.variantId,{teach:false});await initialLoad;}
  if(token!==routeGeneration||hash!==location.hash||!active)return;
  if(route?.lesson&&!hash.startsWith('#rtds-hardware-')){if(route.lesson==='analog')selectGroup('analogue');if(route.lesson==='power')selectGroup('power');openTeaching(route.lesson);}
 }
 $('mode-generic').addEventListener('click',()=>navigate('#generic'));$('mode-rtds').addEventListener('click',()=>navigate('#rtds'));
 window.addEventListener('hashchange',applyRoute);
 document.addEventListener('visibilitychange',()=>{viewer?.setActive(active&&!document.hidden);syncTeaching();if(document.hidden)stopTour();});
 drawCatalog();applyRoute();return{isActive:()=>active};
}
