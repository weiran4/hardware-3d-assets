import {checkGtnetX2,defaultGtnetX2} from './rtds-gtnet-x2-state.js';
const yesNo=[['true','已确认'],['false','未确认']];
const choices={
 mode:['模式',[['normal','普通双协议示例'],['prp','PRP整卡单SV示例']]],
 stage:['阶段',[['runtime','运行路径'],['setup','初始配置接线（静态）']]],
 gtA:['GT A独立接NovaCor',[['true','已接'],['false','未接']]],gtB:['GT B独立接NovaCor',[['true','已接'],['false','未接']]],
 lanA:['LAN A外部网络连接',[['true','已接'],['false','未接']]],lanB:['LAN B外部网络连接',[['true','已接'],['false','未接']]],
 activeA:['普通模式A活动协议',[['SV','SV发布（本例）'],['GOOSE','GOOSE'],['SKT','SKT（出厂）']]],activeB:['普通模式B活动协议',[['GOOSE','GOOSE订阅（本例）'],['SV','SV'],['SKT','SKT（出厂）']]],
 prpSingleProtocol:['PRP资源分配',[['true','整卡仅单SV协议'],['false','试图同时运行SV与GOOSE（不允许）']]],
 independent:['PRP LAN A/B网络',[['true','两个独立网络'],['false','接成同一网络']]],
 prpProtocolVerified:['PRP活动协议与适用固件兼容条件',yesNo],versionsVerified:['PRP下表全部适用最低版本',yesNo],configurationComplete:['PRP初始配置已经完成',yesNo],resetApplied:['当前冗余设置已按要求复位生效',yesNo],
 medium:['两端匹配Ethernet介质',[['copper','100/1000Base-T 铜'],['fx','100Base-FX 光'],['sx','1000Base-SX 光']]],speed:['Ethernet速率（Mbps）',[['1000','1000'],['100','100'],['10','10（不支持）']]],duplex:['双工',[['full','全双工'],['half','半双工（不支持）']]],direct:['外部连接方式',[['false','经交换机'],['true','直连外部设备']]],crossoverVerified:['直接铜缆所需线序已按两端核对',yesNo]
};
const versionRows=[['RSCAD','FX2.3'],['GTNETx2 FPGA','0061'],['NovaCor 1.0（如使用）','OS5.144 build6 / FPGA363'],['NovaCor 2.0（如使用）','OS6.144 build6 / FPGA363'],['PB / SKT / DNP','3.26 / 2.12 / 4.22'],['MODBUS / IEC104','1.28 / 4.12'],['SV / GSE','6.14 / 7.25'],['PMU / MU','3.25 / 1.19']];
export function initGtnetX2(root=document.getElementById('rtds-chapter-5b')){
 if(!root)return null;
 root.innerHTML=`<header><p class="eyebrow">第5B章 · GTNETx2 · 核心接线基础版</p><h3 id="gtnet-x2-heading" tabindex="-1">普通双协议，PRP整卡单协议</h3><p>20250318修订 · PDF249–275。四个功能口：GT A、LAN A、GT B、LAN B。以下为角色和信号路径示意，不是端口左右位置或背板几何图；此版本暂无实物模型。</p></header>
 <div class="gbh-grid"><div><h4 id="gtnet-x2-path-heading">信号路径</h4><p id="gtnet-x2-mode-copy"></p><ol id="gtnet-x2-path" aria-labelledby="gtnet-x2-path-heading"></ol><div class="gbh-buttons"><button id="gtnet-x2-play" aria-pressed="false">播放路径</button><button id="gtnet-x2-step">下一步</button></div><p id="gtnet-x2-phase" role="status">等待播放</p><p>步进没有硬件时间比例，不表示网络、硬件或闭环延时。PRP两条支路同一步同时高亮，同一数据经独立网络冗余传输，不是先后两次发送。减少动态效果时使用“下一步”。</p><p>本例固定同一NovaCor。普通模式GT A/B各用独立GT光纤；禁止GT菊花链。实际可接同一或不同模拟器，但需核对映射，不能从本例推广（PDF253、257、259–261、267）。</p></div>
 <div><h4>接线条件检查</h4><p>按钮载入<strong>预填教学条件</strong>，不读取真实硬件。绿色只表示本例所列条件一致。</p><div class="gbh-buttons"><button data-gtnet-x2-example="normal">正常示例：双协议</button><button data-gtnet-x2-example="prp">正常示例：PRP单SV</button><button data-gtnet-x2-example="fiber">错误：普通模式漏GT B</button><button data-gtnet-x2-example="dual">错误：PRP占用两协议</button><button data-gtnet-x2-example="lan">错误：PRP共用LAN</button><button data-gtnet-x2-example="speed">错误：10Mbps</button><button data-gtnet-x2-example="firmware">错误：活动协议不符</button></div><output id="gtnet-x2-result" aria-live="polite" aria-atomic="true"></output><details><summary>修改连接、阶段与确认条件</summary><div class="gbh-fields">${Object.entries(choices).map(([key,[label,options]])=>`<label>${label}<select id="gtnet-x2-${key}">${options.map(([value,text])=>`<option value="${value}">${text}</option>`).join('')}</select></label>`).join('')}</div><p>切换阶段不自动确认配置完成或设置生效。“未确认”不是实物故障。本课不根据两个版本号相等判定兼容；应核对所用协议和整卡适用固件条件。不演示内部激活步骤。</p><div class="gtnet-x2-versions"><table><caption>PRP最低版本（PDF265表1），核对全部适用项</caption><thead><tr><th scope="col">项目</th><th scope="col">最低版本</th></tr></thead><tbody>${versionRows.map(([name,value])=>`<tr><th scope="row">${name}</th><td>${value}</td></tr>`).join('')}</tbody></table></div><p>普通模式不借用此表作为完整兼容认证。PRP应核对所用NovaCor代际、卡上固件和所用协议等全部适用项；安装RSCAD不表示设备固件已更新，不套用v3的RSCAD2.8条件。</p></details></div></div>
 <details><summary>四口角色与PRP为什么不同于v3</summary><p>普通模式每模块同时一个活动协议，整卡可同时两种协议；可安装多个固件不等于同时激活。出厂SKT。A=SV发布、B=GOOSE订阅只是本课固定例，不是硬件固定分工。GT A/B是各模块到NovaCor的GT光纤，LAN A/B是到交换机或外部设备的Ethernet口（PDF249、251–254、257、259–261、267）。物理GT链路可双向，箭头只表示本例数据方向。</p><p>PRP一个协议占满整卡两个模块；本例只发布SV，不能保留同卡SV加GOOSE闭环。LAN A接PRP LAN A，LAN B接独立PRP LAN B。运行仅需A的GT；B的GT用于初始固件安装与PRP配置，不能说永远不需B。初始配置清单要求两GT以访问模块，不声称整个配置过程必须同时保持两线。网络冗余设置变更后需复位卡才生效，并非每次运行都要复位（PDF264图5.15、265–266）。不据此假定所有PRP场景都需GTSYNC或RED box。</p></details>
 <details><summary>介质、诊断与覆盖边界</summary><p>支持100/1000Base-T铜，可选100Base-FX或1000Base-SX，全双工；10Mbps或半双工不支持。无自动MDI/MDIX，直连某些设备需交叉线，未核对保持待确认。两端介质、速率和光学参数均需匹配；相同SFP型号不代表GT与Ethernet口可互换（PDF254–255、269）。2022年5月后硬件及新SFP有固件限制，旧型号资料不是采购清单（PDF272）。</p><p>USB仅为可选本地诊断，不能代替GT/LAN；供电来自机箱（PDF260–261、268）。部分协议另需许可（PDF266），本章不是完整许可矩阵。不演示带电维护、固件写入、复位或真实设备控制。</p><p>核心基础版／手册部分覆盖：普通双协议、PRP单协议资源与双网络、初始配置与运行区别、适用版本确认、介质速率双工和直连线序。尚未覆盖完整协议/IP/多播/VLAN/IED配置、精确针脚和尺寸、全部固件及许可矩阵、实测网络/闭环延时。接线符合不保证通信成功。PDF263子网掩码疑点不用于计算；USB诊断速率与GSE排错阈值都不是延时。</p></details><p><a href="#rtds-chapter-5a">上一章：GTNETv3 ↗</a> · <a href="#rtds-chapter-1a">章节导航 ↗</a></p>`;
 const q=k=>root.querySelector('#gtnet-x2-'+k);
 const prpFields=['prpSingleProtocol','independent','prpProtocolVerified','versionsVerified','configurationComplete','resetApplied'];
 let state={...defaultGtnetX2},timer=null,phase=-1,links=[];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const stepCount=()=>state.mode==='prp'&&links.length?1:links.length;
 function stop(){clearInterval(timer);timer=null;root.dataset.playing='false';q('play').setAttribute('aria-pressed','false');q('play').textContent=phase>=stepCount()-1&&phase>=0?'重放路径':phase>=0?'继续播放':'播放路径';}
 function advance(){if(root.hidden||document.hidden||!links.length){stop();return;}phase=(phase+1)%stepCount();root.dataset.phase=String(phase);q('path').querySelectorAll('li').forEach((li,i)=>li.setAttribute('aria-current',String(state.mode==='prp'||i===phase)));q('phase').textContent=state.mode==='prp'?'并行支路：LAN A与LAN B同时呈现同一SV数据的两条冗余路径（角色讲解，非时序测量）':`步骤${phase+1}/${links.length}：${links[phase]}（角色讲解，非时序测量）`;if(phase===stepCount()-1)stop();}
 function update(){
  stop();phase=-1;root.dataset.phase='-1';const r=checkGtnetX2(state);links=r.links;q('result').textContent=r.message;q('result').dataset.status=r.status;
  q('path').replaceChildren(...links.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
  q('mode-copy').textContent=state.mode==='normal'?'普通模式固定例：NovaCor → GT A → A发布SV → LAN A → 继电器；继电器 → LAN B → B订阅GOOSE → GT B → NovaCor。':'PRP固定例：GT A输入，单SV协议占整卡，LAN A和LAN B连接独立冗余网络。不是SV/GOOSE双协议闭环。配置阶段仅检查静态条件。';
  q('phase').textContent=links.length?'等待播放；先核对预填教学条件':state.stage==='setup'?'初始配置阶段：仅静态接线清单，不播放运行信号':'运行条件未确认，停止路径示意';
  q('step').disabled=!links.length;q('play').disabled=!links.length||reduced.matches;
  for(const key of prpFields)q(key).disabled=state.mode!=='prp';for(const key of ['activeA','activeB'])q(key).disabled=state.mode==='prp';q('crossoverVerified').disabled=!state.direct||state.medium!=='copper';stop();
 }
 function set(values){state={...values};for(const key of Object.keys(choices))q(key).value=String(state[key]);update();}
 for(const key of Object.keys(choices))q(key).addEventListener('change',()=>{state[key]=typeof defaultGtnetX2[key]==='boolean'?q(key).value==='true':key==='speed'?Number(q(key).value):q(key).value;update();});
 root.querySelectorAll('[data-gtnet-x2-example]').forEach(button=>button.addEventListener('click',()=>{const k=button.dataset.gtnetX2Example,s={...defaultGtnetX2};if(['prp','dual','lan'].includes(k))s.mode='prp';if(k==='dual')s.prpSingleProtocol=false;if(k==='lan')s.independent=false;if(k==='fiber')s.gtB=false;if(k==='speed')s.speed=10;if(k==='firmware')s.activeB='SV';set(s);}));
 q('play').addEventListener('click',()=>{if(timer){stop();return;}if(root.hidden||document.hidden||!links.length||reduced.matches)return;if(phase===stepCount()-1)phase=-1;advance();if(phase<stepCount()-1){timer=setInterval(advance,1300);root.dataset.playing='true';q('play').textContent='暂停路径';q('play').setAttribute('aria-pressed','true');}});
 q('step').addEventListener('click',()=>{stop();advance();});new MutationObserver(()=>{if(root.hidden)stop();}).observe(root,{attributes:true,attributeFilter:['hidden']});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});reduced.addEventListener('change',update);set(state);return {stop};
}
