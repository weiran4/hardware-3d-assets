// Original offline teaching. Page numbers refer to the private manual's PDF reader.
const versions={unknown:'尚未选择',v2:'GTSYNCv2 · 修订 20260603',v1:'旧 GTSYNC · 修订 20240924'};
const hosts={unknown:'尚未选择',gtsync:'NovaCor 专用 GTSYNC 口',gtio:'普通 GT 1–20 / I/O 卡链',irc:'IRC 数据口',gbh:'GBH 同步总线口',eth:'ETH / UDP 铜 SFP 口'};
const cardPorts={unknown:'尚未选择','v2-gt':'GTSYNCv2 前右 GT 口','v1-gt1':'旧 GTSYNC 的 GT #1','v1-gt2':'旧 GTSYNC 的 GT #2','time-input':'时源 BNC / ST 接口',ethernet:'Ethernet LAN 口'};
const media={unknown:'尚未选择','gt-fiber':'GT 光纤通信链路',ethernet:'以太网线',electrical:'BNC / 电气信号线'};
const locks={unknown:'时源锁定尚未确认',locked:'假设已确认锁定外部时源',unlocked:'假设未锁定 / 时源丢失'};
const has=(o,k)=>typeof k==='string'&&Object.hasOwn(o,k);
const boundary='只核对本页列出的端点与离线配置假设，不证明固件兼容、光学选型或实际同步成功；不提供实测端到端延时。';
export function checkGtsyncConnection(input){
 const r={status:'invalid',issues:[],sourcePages:[71,72],boundary,lockState:'unknown'};
 const add=(code,message,unknown=false)=>r.issues.push({code,message,unknown});
 if(!input||typeof input!=='object'||Array.isArray(input)||!has(versions,input.version)||!has(hosts,input.hostPort)||!has(cardPorts,input.cardPort)||!has(media,input.medium)||!has(locks,input.lockState)||typeof input.hardwareConfigured!=='boolean'||typeof input.caseComponent!=='boolean'){
  add('input','请使用本页列出的版本、接口和明确的离线配置选项。');return r;
 }
 const {version,hostPort,cardPort,medium,hardwareConfigured,caseComponent,lockState}=input;
 r.lockState=lockState;
 if(version==='v2')r.sourcePages.push(470,471,482,487);
 if(version==='v1')r.sourcePages.push(489,491,504,509,510);
 for(const [key,value] of Object.entries({version,hostPort,cardPort,medium}))if(value==='unknown')add(`${key}-unknown`,'版本、两端接口或连接介质仍有未选择项。',true);
 if(hostPort!=='unknown'&&hostPort!=='gtsync')add('host-port','使用 NovaCor 的专用 GTSYNC 口，不能接普通 GT I/O 链、IRC、GBH 或 ETH / UDP。');
 if(cardPort!=='unknown'){
  if(['v1-gt2','time-input','ethernet'].includes(cardPort))add('card-port','主机链路应接 GTSYNCv2 的 GT 口或旧 GTSYNC 的 GT #1；时源与 LAN 接口不是这个链路的对端。');
  else if(version!=='unknown'&&cardPort!==(version==='v2'?'v2-gt':'v1-gt1'))add('version-port','所选接口标签与对端版本不一致，请按版本确认 GT 口。');
 }
 if(medium!=='unknown'&&medium!=='gt-fiber')add('medium','NovaCor 与 GTSYNC 之间采用 GT 光纤通信；不能用以太网线或电气时源线替代。');
 if(!hardwareConfigured)add('hardware-config','尚未假设 Hardware Manager 中的 GTSYNC 存在/连接项已核对。',true);
 if(!caseComponent)add('case-component','若要让仿真同步到 GTSYNC，案例还需 rtds_GTSYNC 元件；此处尚未确认。',true);
 r.status=r.issues.some(x=>!x.unknown)?'invalid':r.issues.length?'unknown':'match';return r;
}
export function calculateGtsyncSkew(lengthM){
 const r={status:'invalid',settingNs:null,sourcePages:[481,503],boundary:'这是 GTSYNC→NovaCor skew 的来源推荐配置算术，不是实测端到端延时、同步精度或光纤最大允许长度。'};
 if(typeof lengthM!=='number'||!Number.isFinite(lengthM)||lengthM<0)return r;
 const settingNs=750+5*lengthM;if(!Number.isFinite(settingNs))return r;
 r.settingNs=settingNs;r.status=settingNs<=999?'within':'outside';return r;
}
export function initNovacorGtsync(root){
 if(!root)return null;
 const options=o=>Object.entries(o).map(([v,label])=>`<option value="${v}">${label}</option>`).join('');
 root.innerHTML=`<h4 id="novacor-gtsync-heading">专用 GTSYNC：主机接哪一个口？</h4>
 <p class="cabinet-note">NovaCor 2.0 · 修订 20250916 · PDF 71–72；对端按 GTSYNCv2（20260603，PDF 471）或旧 GTSYNC（20240924，PDF 491）区分。仅作离线演练，不执行设备命令。</p>
 <div class="cabinet-wiring-grid"><article class="cabinet-v1-controls"><h4>01 · 对照版本与接口</h4>
 <label for="novacor-gtsync-version">对端版本</label><select id="novacor-gtsync-version">${options(versions)}</select>
 <label for="novacor-gtsync-host">NovaCor 接口</label><select id="novacor-gtsync-host">${options(hosts)}</select>
 <label for="novacor-gtsync-card">GTSYNC 接口</label><select id="novacor-gtsync-card">${options(cardPorts)}</select>
 <label for="novacor-gtsync-medium">连接介质</label><select id="novacor-gtsync-medium">${options(media)}</select>
 <label><input id="novacor-gtsync-hardware" type="checkbox"> 假设 Hardware Manager 存在/连接项已核对</label>
 <label><input id="novacor-gtsync-component" type="checkbox"> 假设同步案例已包含 rtds_GTSYNC 元件</label>
 </article><article><h4>02 · 看两端，不混用时源口</h4><p id="novacor-gtsync-path" class="wiring-path"></p><p>主机链路是 GT 光通信。外部时源的 BNC / ST 输入、Ethernet LAN 和机间 GBH 同步不是同一条连接；不要把 GTSYNC 串入普通 GT I/O 卡链。</p><p><a href="#rtds-interface:novacor-2.0:gtsync">定位 NovaCor 2.0 的真实 GTSYNC 接口 ↗</a></p><p>只定位已有 NovaCor 模型；不以旧版 NovaCor 插图推定 2.0 的物理位置，也不虚构 GTSYNC 对端模型。</p></article>
 <article class="cabinet-v1-controls"><h4>03 · 接线与锁定分开检查</h4><output id="novacor-gtsync-result" aria-live="polite" aria-atomic="true"></output><ul id="novacor-gtsync-issues"></ul>
 <label for="novacor-gtsync-lock">外部时源状态（独立的离线假设）</label><select id="novacor-gtsync-lock">${options(locks)}</select><p id="novacor-gtsync-lock-result" aria-live="polite"></p><p>${boundary}</p></article></div>
 <div class="cabinet-tabs"><button type="button" data-gtsync-example="v2">正常例：GTSYNCv2 对端</button><button type="button" data-gtsync-example="v1">正常例：旧 GTSYNC 对端</button><button type="button" data-gtsync-example="wrong-port">错误例：接普通 GT 口</button><button type="button" data-gtsync-example="wrong-end">错误例：接时源输入口</button><button type="button" data-gtsync-example="unlocked">区别：接线匹配但未锁定</button><button type="button" data-gtsync-example="reset">重置 GTSYNC 选择</button></div>
 <details class="cabinet-evidence"><summary>补偿设定：不是实测端到端延时</summary><p>PDF 481（v2）、503（旧版）对 GTSYNC→NovaCor skew 给出推荐算术：750 ns + 5 ns/m × 两者之间光纤长度；设置范围为 0–999 ns。这里只比较计算值是否落在设置范围内，不配置设备、不证明光纤可用距离或固件支持的设定分辨率。</p><label for="novacor-gtsync-length">该段光纤长度（m，仅用于补偿算术）</label><input id="novacor-gtsync-length" type="number" min="0" step="any" placeholder="例如 2"><output id="novacor-gtsync-skew" aria-live="polite" aria-atomic="true"></output><p>例如 2 m 得 760 ns。50 m 得 1000 ns，超出所列设置范围，需要核对适用条件；不能截为 999 ns，也不能据此断言光纤链路物理不通。</p><p>PDF 484 的参数名称使用 GTWIF，而 PDF 481 正文使用 NovaCor，名称差异待核对；本演练按正文说明，不替你写入设备参数。“Sync correction”是另一项补偿，不能和这里相加后当作测得延时。</p></details>
 <details class="cabinet-evidence"><summary>版本、配置与尚未覆盖</summary><p>Hardware Manager 的勾选表示设备存在和连接；案例同步还需 rtds_GTSYNC 元件（v2 PDF 482；旧版 PDF 504）。GT1 link / 连接 PASS 与 SYNC 时源锁定是不同检查（v2 PDF 487；旧版 PDF 509–510），都须在实际系统独立确认，本页不读取真实状态。</p><p>NovaCor GTSYNC 支持的光 SFP 包括 Finisar FTLF8519P3BNL（PDF 72）；同型号收发器不意味着不同端口协议互换。最低固件组合、完整光学选型和实测端到端延时仍待证据。外部时源电平、PTP配置、Holdover与时间质量留待 GTSYNC 专章；2A仍为完善中。</p></details>`;
 const el=id=>root.querySelector(`#novacor-gtsync-${id}`);
 function update(){
  const r=checkGtsyncConnection({version:el('version').value,hostPort:el('host').value,cardPort:el('card').value,medium:el('medium').value,hardwareConfigured:el('hardware').checked,caseComponent:el('component').checked,lockState:el('lock').value});
  el('result').dataset.status=r.status;el('result').textContent=r.status==='match'?'所列端点与配置假设匹配；这不代表时源已锁定或实际系统可运行。':r.status==='invalid'?'所选接口或介质有冲突，请看原因。':'连接或配置仍有未确认项，暂不判断匹配。';
  el('issues').replaceChildren();for(const issue of r.issues){const li=root.ownerDocument.createElement('li');li.textContent=issue.message;el('issues').append(li);}
  const version=el('version').value;
  el('path').textContent=version==='unknown'?'先选择对端版本，再对照主机和卡侧接口。':`预期：NovaCor 专用 GTSYNC ↔ GT 光纤 ↔ ${version==='v2'?'GTSYNCv2 前右 GT':'旧 GTSYNC GT #1'}`;
  const lockText={unknown:'锁定状态未知：连接检查不能替代时源确认。',locked:'仅在当前离线假设中已确认锁定；网页没有读取设备。',unlocked:'当前假设未锁定：即使端点匹配，也不能宣称同步成功。'};
  el('lock-result').textContent=lockText[r.lockState];el('lock-result').dataset.state=r.lockState;
 }
 for(const id of ['version','host','card','medium','hardware','component','lock'])el(id).addEventListener('change',update);
 function updateSkew(){const r=calculateGtsyncSkew(el('length').valueAsNumber);el('length').setAttribute('aria-invalid',String(r.status==='invalid'));el('skew').dataset.status=r.status;el('skew').textContent=r.status==='invalid'?'请输入有限的非负长度；未计算补偿值。':`${r.settingNs} ns：${r.status==='within'?'计算值在所列 0–999 ns 设置范围内，仍需核对实际参数。':'计算值超出所列 0–999 ns 设置范围，不截断、不当作物理链路失败。'}`;}
 el('length').addEventListener('input',updateSkew);
 root.querySelectorAll('[data-gtsync-example]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.gtsyncExample,reset=key==='reset';el('version').value=reset?'unknown':key==='v1'?'v1':'v2';el('host').value=reset?'unknown':key==='wrong-port'?'gtio':'gtsync';el('card').value=reset?'unknown':key==='wrong-end'?'time-input':key==='v1'?'v1-gt1':'v2-gt';el('medium').value=reset?'unknown':'gt-fiber';el('hardware').checked=!reset;el('component').checked=!reset;el('lock').value=key==='unlocked'?'unlocked':'unknown';if(reset){el('length').value='';updateSkew();}update();}));
 update();updateSkew();return root;
}
