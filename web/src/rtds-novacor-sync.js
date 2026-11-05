// Original offline teaching, NovaCor 2.0 rev 20250916, PDF reading pages.
const syncOptions={unknown:'尚未选择',direct:'两台 GBH 端口直接相连',hub:'每台 GBH 端口连接 Global Bus Hub',none:'没有同步链路',irc:'误把 IRC 当同步口'};
const dataOptions={unknown:'尚未选择',direct:'机箱 IRC 端口之间直接连接',switch:'机箱 IRC 端口连接 IRC Switch',none:'没有机间数据链路',gbh:'误把 GBH 当数据口'};
const p2pOptions={unknown:'尚未确认',on:'两台均开启（离线假设）',off:'相关机箱均关闭（离线假设）'};
const has=(o,k)=>typeof k==='string'&&Object.hasOwn(o,k);
const boundary='仅检查所列机间连接类别和配置假设，不证明真实系统可运行。未校验具体端口分配、收发器、固件、配置文件内容或交换机容量，也不提供端到端延时。';
export function checkNovacorSync(input){
 const result={status:'invalid',issues:[],sourcePages:[80,97,98,99,100],boundary,configuration:null};
 const add=(code,message,unknown=false)=>result.issues.push({code,message,unknown});
 if(!input||typeof input!=='object'||Array.isArray(input)||!Number.isSafeInteger(input.count)||input.count<2||!has(syncOptions,input.sync)||!has(dataOptions,input.data)||!has(p2pOptions,input.p2p)||typeof input.addresses!=='boolean'||typeof input.files!=='boolean'){
  add('input','填写至少两台机箱的整数数量，选择明确的连接类别与配置假设。');return result;
 }
 const {count,sync,data,p2p,addresses,files}=input;
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
export function initNovacorSync(root){
 if(!root)return null;
 const opts=o=>Object.entries(o).map(([v,t])=>`<option value="${v}">${t}</option>`).join('');
 root.innerHTML=`<h4 id="novacor-sync-heading">多台 NovaCor：同步一条路，数据另一条路</h4>
 <p class="cabinet-note">NovaCor 2.0 · 修订 20250916 · PDF 80、97–100。下面是连接类别演练，不执行 SSH、不连接设备。GBH 负责多机仿真的时间同步；IRC 承载机间数据。两条链路都要考虑。</p>
 <div class="cabinet-wiring-grid"><article class="cabinet-v1-controls"><h4>01 · 选择机间连接</h4>
 <label for="novacor-sync-count">参与机箱数</label><input id="novacor-sync-count" type="number" min="2" step="1" value="2">
 <label for="novacor-sync-path">同步连接</label><select id="novacor-sync-path">${opts(syncOptions)}</select>
 <label for="novacor-sync-data">机间数据连接</label><select id="novacor-sync-data">${opts(dataOptions)}</select>
 <label for="novacor-sync-p2p">Point-to-point 配置</label><select id="novacor-sync-p2p">${opts(p2pOptions)}</select>
 <label><input id="novacor-sync-addresses" type="checkbox"> 假设两台 P2P 地址配置已核对</label>
 <label><input id="novacor-sync-files" type="checkbox"> 假设硬件配置与适用 hub 配置已核对</label>
 </article><article><h4>02 · 分别看连接两端</h4>
 <p class="wiring-path" id="novacor-sync-path-view"></p><p class="wiring-path" id="novacor-sync-data-view"></p>
 <p>示意只表达端口角色，不指定多机全网的网状、环状或逐端口配线方案。GTSYNC、WIF、ETH 不在这里充当替代链路。</p>
 <p><a href="#rtds-interface:novacor-2.0:gbh">定位 GBH 同步端口 ↗</a></p><p><a href="#rtds-interface:novacor-2.0:irc">定位 IRC 数据端口 ↗</a></p>
 </article><article><h4>03 · 检查当前假设</h4><output id="novacor-sync-result" aria-live="polite" aria-atomic="true"></output><ul id="novacor-sync-issues"></ul><p>${boundary}</p></article></div>
 <div class="cabinet-tabs"><button type="button" data-sync-example="pair">配置 #1：两台双链路直连</button><button type="button" data-sync-example="hub">配置 #2：hub 同步 + IRC 直连</button><button type="button" data-sync-example="switch">配置 #3：hub 同步 + IRC Switch</button><button type="button" data-sync-example="missing">错误：只有数据，没有同步</button><button type="button" data-sync-example="wrong-p2p">错误：使用 hub 仍开启 P2P</button><button type="button" data-sync-example="reset">重置机间选择</button></div>
 <details class="cabinet-evidence"><summary>三种配置的来源与不能推断的内容</summary><p>配置 #1（PDF97–98）：两台 GBH 端口用 Global Bus 光缆直接相连，另用一条 IRC 光通信通道相连；两台开启 P2P 并设置对应地址。配置 #2（PDF98–99）：各机箱 GBH 连 hub，IRC 通道负责机间数据，关闭 P2P。配置 #3（PDF99–100）：GBH 连 hub，同时 IRC 连 IRC Switch，关闭 P2P。连接改变后，硬件配置和适用的 hub 配置必须同步更新。</p><p>三台及以上需 hub（PDF80）。PDF98 提到六个 IRC 通道支持最多七台的直接连接类别，更多需要 IRC Switch；这不提供具体多机端口表，也不是 IRC Switch 系统总容量上限。</p><p>GBH 专用光缆与 IRC 光收发器链路不可因同属光纤而混用。GBH 协议 A/B、光缆和接头须按版本核对；PDF81 的点对点条件不能直接套到所有 GBHv3 hub 链路。数值光缆长度不是端到端延时。这里不增加长度工具，也不推算每跳耗时。</p></details>`;
 const el=id=>root.querySelector(`#novacor-sync-${id}`);
 const count=el('count'),sync=el('path'),data=el('data'),p2p=el('p2p'),addresses=el('addresses'),files=el('files');
 function update(){
  const r=checkNovacorSync({count:count.valueAsNumber,sync:sync.value,data:data.value,p2p:p2p.value,addresses:addresses.checked,files:files.checked});
  const out=el('result');out.dataset.status=r.status;
  out.textContent=r.status==='match'?`配置 #${r.configuration}：所列连接类别与配置假设未发现冲突。仍须核对真实端口、线缆和配置内容。`:r.status==='invalid'?'所选条件存在错误，先查看原因。':'信息或来源不足，暂不判断匹配。';
  count.setAttribute('aria-invalid',String(!Number.isSafeInteger(count.valueAsNumber)||count.valueAsNumber<2));
  const list=el('issues');list.replaceChildren();for(const issue of r.issues){const li=root.ownerDocument.createElement('li');li.textContent=issue.message;list.append(li);}
  el('path-view').textContent=sync.value==='direct'?'同步：机箱 A 的 GBH ↔ Global Bus 光缆 ↔ 机箱 B 的 GBH':sync.value==='hub'?'同步：各机箱 GBH ↔ Global Bus 光缆 ↔ GBH hub':`同步：${syncOptions[sync.value]}`;
  el('data-view').textContent=data.value==='direct'?'数据：机箱 IRC ↔ IRC 光通信链路 ↔ 对端机箱 IRC':data.value==='switch'?'数据：各机箱 IRC ↔ IRC 光通信链路 ↔ IRC Switch':`数据：${dataOptions[data.value]}`;
  addresses.disabled=sync.value!=='direct';
 }
 for(const item of [count,sync,data,p2p,addresses,files])item.addEventListener(item===count?'input':'change',update);
 const examples={pair:[2,'direct','direct','on'],hub:[3,'hub','direct','off'],switch:[8,'hub','switch','off'],missing:[2,'none','direct','on'],'wrong-p2p':[3,'hub','direct','on'],reset:[2,'unknown','unknown','unknown']};
 root.querySelectorAll('[data-sync-example]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.syncExample;const values=examples[key];[count.value,sync.value,data.value,p2p.value]=values;addresses.checked=key!=='reset';files.checked=key!=='reset';update();}));
 update();return root;
}
