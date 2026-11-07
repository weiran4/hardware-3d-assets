// Original offline teaching, NovaCor 1.0 rev 20230523, PDF reading pages.
const syncOptions={unknown:'尚未选择',direct:'两台 GBH 端口直接相连',hub:'每台 GBH 端口连接 Global Bus Hub',none:'没有同步链路',irc:'误把 IRC 当同步口'};
const dataOptions={unknown:'尚未选择',direct:'机箱 IRC 端口之间直接连接',switch:'机箱 IRC 端口连接 IRC Switch',none:'没有机间数据链路',gbh:'误把 GBH 当数据口'};
const p2pOptions={unknown:'尚未确认',on:'两台均开启（离线假设）',off:'相关机箱均关闭（离线假设）'};
const familyOptions={unknown:'尚未确认',one:'全部为 NovaCor 1.0',legacy:'NovaCor 1.0 + PB5 / GPC（经 GTWIF）',other:'含其他系列（本检查器未核对）'};
const protocolOptions={unknown:'尚未确认',a:'协议 A（线缆条件另核）',b:'协议 B（仅 NovaCor，线缆/GBHv3 条件另核）'};
const subnetOptions={unknown:'尚未确认',normal:'常规机间连接',small:'跨机箱小时间步子网连接'};
const has=(o,k)=>typeof k==='string'&&Object.hasOwn(o,k);
const boundary='仅检查所列机间连接类别和配置假设，不证明真实系统可运行。未校验具体端口分配、收发器、固件、配置文件内容或交换机容量，也不提供端到端延时。';
export function checkNovaOneSync(input){
 const result={status:'invalid',issues:[],sourcePages:[156,157,164,169,170,171,172,173,174,175,177,178,179,180],boundary,configuration:null};
 const add=(code,message,unknown=false)=>result.issues.push({code,message,unknown});
 if(!input||typeof input!=='object'||Array.isArray(input)||!Number.isSafeInteger(input.count)||input.count<2||!has(syncOptions,input.sync)||!has(dataOptions,input.data)||!has(p2pOptions,input.p2p)||!has(familyOptions,input.family)||typeof input.addresses!=='boolean'||typeof input.files!=='boolean'||!has(protocolOptions,input.protocol)||!has(subnetOptions,input.subnet)||typeof input.legacyStep!=='boolean'){
  add('input','填写至少两台机箱的整数数量，选择明确的连接类别与配置假设。');return result;
 }
 const {count,sync,data,p2p,addresses,files,family,protocol,subnet,legacyStep}=input;
 if(family==='unknown')add('family-unknown','机箱系列尚未确认。',true);
 if(family==='other')add('family-other','其他系列与具体固件组合不在本检查器范围，不能据此批准。',true);
 if(protocol==='unknown')add('protocol-unknown','GBH 协议尚未确认。',true);
 if(subnet==='unknown')add('subnet-unknown','机间连接的时间步类型尚未确认。',true);
 if(family==='legacy'&&protocol==='b')add('legacy-protocol','协议 B 仅兼容 NovaCor 类型硬件，不能用于本页 PB5 / GPC 混用方案。');
 if(family==='legacy'&&subnet==='small')add('legacy-subnet','不允许 NovaCor 与 PB5 / GPC 之间的小时间步子网连接。');
 if(family!=='legacy'&&subnet==='small')add('small-unverified','本工具不验证小时间步子网连接条件。',true);
 if(family==='legacy'&&!legacyStep)add('legacy-step','混用时仿真时间步受旧一代硬件制约，尚未确认这一限制。',true);
 if(sync==='unknown')add('sync-unknown','同步路径尚未选择。',true);
 if(data==='unknown')add('data-unknown','机间数据路径尚未选择。',true);
 if(p2p==='unknown')add('p2p-unknown','Point-to-point 设置尚未确认。',true);
 if(sync==='none')add('sync-missing','多机仿真缺少 GBH 时间同步链路；IRC 数据线不能替代它。');
 if(sync==='irc')add('sync-role','同步应走 GBH 端口；IRC 是机间数据口，GTSYNC / WIF / ETH 也不能据此替代 GBH。');
 if(data==='none')add('data-missing','缺少 IRC 机间数据链路；只有 GBH 同步连接还不够。');
 if(data==='gbh')add('data-role','机间数据应走 IRC 端口；GBH 同步链路不替代 IRC 数据。');
 if(count>=3&&sync==='direct')add('hub-required','三台及以上需要 Global Bus Hub，不能沿用两台 GBH 直连方案。');
 if(count>7&&data==='direct')add('switch-required','本章六个 IRC 通道的直连类别最多涉及七台；更多机箱需要 IRC Switch。此处不是整网容量计算。');
 if(sync==='direct'){
  if(p2p==='off')add('p2p-on','无 hub 的两台直连配置 #1 要求两台都开启 point-to-point。');
  if(!addresses)add('addresses','两台 point-to-point 地址尚未确认；本页不输入或修改真实 IP。',true);
  if(data==='switch')add('unlisted','无 hub 却使用 IRC Switch 的组合不在本页三种来源配置中，不能据此批准。',true);
 }
 if(sync==='hub'&&p2p==='on')add('p2p-off','使用 Global Bus Hub 的配置 #2 / #3 要关闭 point-to-point。');
 if(!files)add('files','对应硬件配置文件及适用的 hub 配置尚未确认与实际连接一致。',true);
 if(count===2&&sync==='direct'&&data==='direct')result.configuration=1;
 if(sync==='hub'&&data==='direct'&&count<=7)result.configuration=2;
 if(sync==='hub'&&data==='switch')result.configuration=3;
 result.status=result.issues.some(x=>!x.unknown)?'invalid':result.issues.length?'unknown':'match';
 return result;
}
export function initNovaOneSync(root){
 if(!root)return null;
 const opts=o=>Object.entries(o).map(([v,t])=>`<option value="${v}">${t}</option>`).join('');
 root.innerHTML=`<h4 id="one-sync-heading">NovaCor 1.0 多机连接：GBH 同步与 IRC 数据分开检查</h4>
 <p class="cabinet-note">NovaCor 1.0 · 修订 20230523 · PDF 156–157、164、169–175、177–180。下面是连接类别演练，不执行设备命令、不连接设备。GBH 负责多机仿真的时间同步；IRC 承载机间数据。两条链路都要考虑。</p>
 <div class="one-grid"><article class="cabinet-v1-controls"><h4>01 · 选择机间连接</h4>
 <label for="one-sync-family">参与硬件系列</label><select id="one-sync-family">${opts(familyOptions)}</select>
 <label for="one-sync-protocol">GBH 协议（假设各端匹配）</label><select id="one-sync-protocol">${opts(protocolOptions)}</select>
 <label for="one-sync-subnet">机间时间步连接类型</label><select id="one-sync-subnet">${opts(subnetOptions)}</select>
 <label><input id="one-sync-legacy-step" type="checkbox"> 假设已核对混用时受旧硬件时间步制约</label>
 <label for="one-sync-count">参与机箱／机架总数</label><input id="one-sync-count" type="number" min="2" step="1" value="2">
 <label for="one-sync-path">同步连接</label><select id="one-sync-path">${opts(syncOptions)}</select>
 <label for="one-sync-data">机间数据连接</label><select id="one-sync-data">${opts(dataOptions)}</select>
 <label for="one-sync-p2p">Point-to-point 配置</label><select id="one-sync-p2p">${opts(p2pOptions)}</select>
 <label><input id="one-sync-addresses" type="checkbox"> 假设两台 P2P 地址配置已核对</label>
 <label><input id="one-sync-files" type="checkbox"> 假设硬件配置与适用 hub 配置已核对</label>
 </article><article><h4>02 · 分别看连接两端</h4>
 <p class="wiring-path" id="one-sync-path-view"></p><p class="wiring-path" id="one-sync-data-view"></p>
 <p>示意只表达端口角色，不指定多机全网的网状、环状或逐端口配线方案。GTSYNC、WIF、ETH 不在这里充当替代链路。</p>
 <p>NovaCor 1.0 的 IRC1–6 与 GBH 是不同用途。含 PB5 / GPC 时，对端应使用机架的 GTWIF 接口，不是直接插入处理卡。本页不借用其他版本三维端口定位。</p>
 <h4>03 · 检查当前假设</h4><output id="one-sync-result" aria-live="polite" aria-atomic="true"></output><ul id="one-sync-issues"></ul><p>${boundary}</p></article></div>
 <div class="cabinet-tabs"><button type="button" data-one-sync-example="pair">配置 #1：两台双链路直连</button><button type="button" data-one-sync-example="hub">配置 #2：hub 同步 + IRC 直连</button><button type="button" data-one-sync-example="switch">配置 #3：hub 同步 + IRC Switch</button><button type="button" data-one-sync-example="missing">错误：只有数据，没有同步</button><button type="button" data-one-sync-example="wrong-p2p">错误：使用 hub 仍开启 P2P</button><button type="button" data-one-sync-example="legacy">混用例：NovaCor + GTWIF</button><button type="button" data-one-sync-example="legacy-small">错误：跨代小时间步子网</button><button type="button" data-one-sync-example="reset">重置机间选择</button></div>
 <details class="cabinet-evidence"><summary>三种配置、混用限制与来源</summary><p>配置 #1（PDF169–170）：两台 GBH 端口经 Global Bus 光缆直连，另用一条 IRC 光通信通道连接；两端开启 P2P。PDF164 的地址设置不对称：第一台填写第二台 IP，第二台填写 0.0.0.0；不把双方都填对方作为默认。本页不选择主从角色，不收集真实地址。</p><p>配置 #2（PDF170–171）：各单元 GBH 连接 hub，IRC 端口负责机间数据，关闭 P2P。配置 #3（PDF171–172）：GBH 连接 hub，IRC 连接 IRC Switch，关闭 P2P。三台及以上需 hub（PDF156）。六个 IRC 通道的直连类别最多七台，更多需要 IRC Switch；不等于交换机系统总容量，也不指定网状、环状或逐端口表。</p><p>PB5 / GPC 混用（PDF177–180）：使用旧机架 GTWIF 的 Global Bus 和 IRC 接口，保留上述双链路和 P2P 条件；不能把 PB5/GPC 处理卡当对端连接口。仿真时间步受旧一代硬件制约，禁止 NovaCor 与 PB5/GPC 之间的小时间步子网连接。系列支持不代表所有版本组合已验证。</p><p>PDF157：协议 A 为通常默认；协议 B 仅兼容 NovaCor 类型硬件，适用于特定点对点或 GBHv3 线缆条件，不能用于 PB5/GPC 混用。这里仅检查这一代际约束，仍须另核各端协议、光缆和收发器；不按线长估计延时。</p><p>配置更新（PDF172–175、180）：连接改变后更新硬件 config_file 和 hubConfig。生成前相关机箱／机架需开机且没有案例运行；Hub Detect 对应选择单机、双机无 hub 的 P2P，或一台／多台 hub。文中是旧版 Config File Editor / Hub Detect 路径，不把它当作所有 RSCAD 版本的当前界面，也不运行 Telnet、SSH 或实际生成命令。</p></details>`;
 const el=id=>root.querySelector(`#one-sync-${id}`);
 const protocol=el('protocol'),subnet=el('subnet'),legacyStep=el('legacy-step');
 const family=el('family'),count=el('count'),sync=el('path'),data=el('data'),p2p=el('p2p'),addresses=el('addresses'),files=el('files');
 function update(){
  const r=checkNovaOneSync({protocol:protocol.value,subnet:subnet.value,legacyStep:legacyStep.checked,family:family.value,count:count.valueAsNumber,sync:sync.value,data:data.value,p2p:p2p.value,addresses:addresses.checked,files:files.checked});
  const out=el('result');out.dataset.status=r.status;
  out.textContent=r.status==='match'?`配置 #${r.configuration}：所列连接类别与配置假设未发现冲突。仍须核对真实端口、线缆、固件组合和配置内容。`:r.status==='invalid'?'所选条件存在错误，先查看原因。':'信息或来源不足，暂不判断匹配。';
  count.setAttribute('aria-invalid',String(!Number.isSafeInteger(count.valueAsNumber)||count.valueAsNumber<2));
  const list=el('issues');list.replaceChildren();for(const issue of r.issues){const li=root.ownerDocument.createElement('li');li.textContent=issue.message;list.append(li);}
  const peer=family.value==='legacy'?'旧机架 GTWIF':family.value==='one'?'对端 NovaCor 1.0':'待确认对端（非接线许可）';
  el('path-view').textContent=sync.value==='direct'?`同步：NovaCor 1.0 GBH ↔ Global Bus 光缆 ↔ ${peer} GBH`:sync.value==='hub'?`同步：NovaCor 1.0 / ${peer} GBH ↔ Global Bus 光缆 ↔ GBH hub`:`同步：${syncOptions[sync.value]}`;
  el('data-view').textContent=data.value==='direct'?`数据：NovaCor 1.0 IRC ↔ IRC 光通信链路 ↔ ${peer} IRC`:data.value==='switch'?`数据：NovaCor 1.0 / ${peer} IRC ↔ IRC 光通信链路 ↔ IRC Switch`:`数据：${dataOptions[data.value]}`;
  legacyStep.disabled=family.value!=='legacy';
  addresses.disabled=sync.value!=='direct';
 }
 for(const item of [protocol,subnet,legacyStep,family,count,sync,data,p2p,addresses,files])item.addEventListener(item===count?'input':'change',update);
 const examples={pair:[2,'direct','direct','on'],hub:[3,'hub','direct','off'],switch:[8,'hub','switch','off'],missing:[2,'none','direct','on'],'wrong-p2p':[3,'hub','direct','on'],legacy:[2,'direct','direct','on'],'legacy-small':[2,'direct','direct','on'],reset:[2,'unknown','unknown','unknown']};
 root.querySelectorAll('[data-one-sync-example]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.oneSyncExample;const values=examples[key];[count.value,sync.value,data.value,p2p.value]=values;family.value=key==='reset'?'unknown':key==='legacy'||key==='legacy-small'?'legacy':'one';protocol.value=key==='reset'?'unknown':'a';subnet.value=key==='reset'?'unknown':key==='legacy-small'?'small':'normal';legacyStep.checked=key!=='reset';addresses.checked=key!=='reset';files.checked=key!=='reset';update();}));
 update();return root;
}
