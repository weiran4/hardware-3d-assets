// Original, offline category teaching. NovaCor 2.0 chapter revision 20250916.
// Source page numbers are PDF reading pages, not the chapter's printed pages.
const purposes=Object.freeze({
 gtio:{label:'GT I/O 卡通信',port:'gt1-20',cable:'optical',endpoint:'GT I/O 卡的光通信接口；允许的卡型与链长见下方检查器',detail:'GT 1–20 用于 I/O。每端口最多 8 张卡，卡型组合仍受限制；光数据链路不向板卡提供 24 V 电源。',pages:[71,74]},
 aurora:{label:'Aurora 通信',port:'gt21-24',cable:'optical',endpoint:'Aurora 对端；本章未核对具体对端型号、协议配置或速率',detail:'GT 21–24 为 Aurora 专用。该功能单独购买，未配备时端口禁用，不能改作 GT I/O 或其他连接。',pages:[71,72]},
 interrack:{label:'机架间数据通信',port:'irc1-6',cable:'optical',endpoint:'另一台 NovaCor 的 IRC 端口，或 IRC Switch 的机箱连接端口；具体拓扑仍须核对',detail:'IRC 1–6 是机架间数据通信，不是同步口。数据链路匹配不能替代 GBH 同步链路与系统配置。',pages:[71,97,98,99,100]},
 sync:{label:'专用 GTSYNC 光通信',port:'gtsync',cable:'optical',endpoint:'专用 GTSYNC 对端；本章未建立具体对端接法与同步协议',detail:'GTSYNC、IRC 和 GBH 是分别列出的端口。不能因为同用光收发器，就把它们当成可互换接口。',pages:[71,72]},
 host:{label:'工作站 / RSCAD 主机连接',port:'wif',cable:'ethernet',endpoint:'工作站 / PC 的局域网接口，可直连或经以太网交换机',detail:'使用独立 WIF Gigabit Ethernet 端口；WIF 的工作站通信路径不是实时仿真数据通路，也不是 ETH 铜 SFP UDP 口。',pages:[66,67,79,80]},
 udp:{label:'以太网 UDP 数据通信',port:'eth',cable:'ethernet',endpoint:'UDP 网络对端；对端设备与应用通信配置须按任务核对',detail:'ETH 使用受支持的铜 SFP，再接以太网线。各机箱 UDP 口须配置互不重复的 IP 和 MAC 地址；不能拿 WIF 管理地址代替。',pages:[71,72,95]}
});
const ports=Object.freeze({unknown:'尚未选择', 'gt1-20':'GT 1–20 · I/O 光通信', 'gt21-24':'GT 21–24 · Aurora 专用', 'irc1-6':'IRC 1–6 · 机架间通信',gtsync:'GTSYNC · 专用光通信',wif:'WIF · 工作站以太网',eth:'ETH · 铜 SFP UDP',gbh:'GBH · 机架同步',analog:'前面板模拟监视输出'});
const cables=Object.freeze({unknown:'尚未选择',optical:'光纤链路（配支持的光 SFP）',ethernet:'以太网线（ETH 端还需支持的铜 SFP）',signal:'外部电气信号线',power:'板卡电源线'});
const licenses=Object.freeze({unknown:'尚未确认',absent:'假设未购买 / 未配备',present:'假设已购买并配备'});
const portGroups=Object.freeze({'gt1-20':'gtio','gt21-24':'aurora','irc1-6':'irc',gtsync:'gtsync',wif:'wif',eth:'udp',gbh:'gbh',analog:'analogue'});
const cardTypes=new Set(['GTAI','GTAO','GTDI','GTDO','GTFPI','GTNET','GTFPGA','GTSOC']);
const exclusiveTypes=new Set(['GTNET','GTFPGA','GTSOC']);
const has=(object,key)=>typeof key==='string'&&Object.hasOwn(object,key);

/** Check role and cable family only, never actual hardware readiness or mating. */
export function checkNovacorConnection(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return {status:'invalid',categoryMatch:false,endpoint:'',sourcePages:[],message:'选择无效，请重新选择。'};
 const {purpose,port,cable,auroraLicense='unknown'}=input;
 if(!has(purposes,purpose)||!has(ports,port)||!has(cables,cable)||!has(licenses,auroraLicense))return {status:'invalid',categoryMatch:false,endpoint:'',sourcePages:[],message:'选择无效，请重新选择。'};
 const expected=purposes[purpose];
 const result={status:'unknown',categoryMatch:false,endpoint:expected.endpoint,sourcePages:[...expected.pages],expectedPort:expected.port,expectedCable:expected.cable,message:''};
 if((port!=='unknown'&&port!==expected.port)||(cable!=='unknown'&&cable!==expected.cable)){
  return {...result,status:'mismatch',message:`类别错配：此任务应使用 ${ports[expected.port]}，以及${cables[expected.cable]}。端口作用不同，不能因外观或收发器相同而互换。`};
 }
 if(purpose==='aurora'&&auroraLicense==='absent')return {...result,status:'blocked',categoryMatch:port===expected.port&&cable===expected.cable,message:'条件不符：未配备单独购买的 Aurora 功能时，GT 21–24 禁用；不能借作 I/O 或其他连接。'};
 if(port==='unknown'||cable==='unknown')return {...result,message:'尚未选定源端口或线缆类别，不判定匹配。'};
 result.categoryMatch=true;
 if(purpose==='aurora')return {...result,message:auroraLicense==='unknown'?'类别相符，但 Aurora 许可尚未确认；对端型号、协议配置和速率也未核对。':'类别相符且已假设配备 Aurora，但本章未确认具体对端和协议配置，仍不能判断整条连接可用。'};
 if(purpose==='sync')return {...result,message:'光口类别相符，但具体 GTSYNC 对端、同步协议和接法尚未核对；不能替代 IRC 或 GBH。'};
 return {...result,status:'match',message:'类别匹配：仅核对本页列出的用途、源端口和线缆类别，不代表具体对端、配置或真实接线已获确认。'};
}

/** Ordered chain rules from PDF 74 only. Unknown cards never produce a pass. */
export function checkGtioChain(input){
 const result={status:'invalid',cards:[],cardCount:0,errors:[],unknowns:[],warnings:[],sourcePages:[74]};
 const issue=(code,message)=>({code,message});
 if(!input||typeof input!=='object'||Array.isArray(input)||!(typeof input.cards==='string'||Array.isArray(input.cards))||(input.timeCritical!==undefined&&typeof input.timeCritical!=='boolean')){
  result.errors.push(issue('invalid-input','请输入按顺序排列的卡型，时敏选项必须是明确的开 / 关假设。'));return result;
 }
 const raw=typeof input.cards==='string'?(input.cards.trim()===''?[]:input.cards.split(',')):Array.from(input.cards);
 if(raw.some(card=>typeof card!=='string')){result.errors.push(issue('invalid-input','每个位置都须填写有效卡型文字。'));return result;}
 result.cards=raw.map(card=>card.trim().toUpperCase());result.cardCount=result.cards.length;
 if(!result.cardCount){result.status='unknown';result.unknowns.push(issue('empty-chain','尚未填写卡链，不判断组合。'));return result;}
 if(result.cards.some(card=>card===''))result.errors.push(issue('empty-position','卡链存在空位置；请填写卡型，不要使用连续逗号或末尾逗号。'));
 if(result.cardCount>8)result.errors.push(issue('too-many-cards',`当前 ${result.cardCount} 张卡，超过每个 GT 1–20 端口最多 8 张的上限。`));
 if(result.cardCount>1&&result.cards.some(card=>exclusiveTypes.has(card)))result.errors.push(issue('exclusive-port','GTNET、GTFPGA、GTSOC 各自需要独占主机光端口，不支持在同端口级联其他卡。'));
 const gtaiCount=result.cards.filter(card=>card==='GTAI').length;
 if(gtaiCount>1||(gtaiCount&&result.cards.includes('GTDI')))result.errors.push(issue('gtai-other-input','含 GTAI 的链不能有其他输入卡，包括 GTDI 或第二张 GTAI。'));
 if(gtaiCount&&result.cards.includes('GTFPI'))result.unknowns.push(issue('gtai-gtfpi-unverified','GTFPI 在本章支持列表内，但本页不据此推断它与 GTAI 共链时的输入约束；须核对 GTFPI 专章。'));
 for(const card of new Set(result.cards.filter(card=>card&&!cardTypes.has(card))))result.unknowns.push(issue('unknown-card',`未核对卡型“${card}”；不会把未知卡型当成可兼容的输出卡。`));
 if(input.timeCritical&&result.cards.some((card,index)=>card==='GTDI'&&index>0))result.warnings.push(issue('time-critical-input-order','时序提醒：已假设 GTDI 接收时敏输入，应优先放在链首以考虑延时；这是顺序建议，不是新增的硬性禁配规则。'));
 result.status=result.errors.length?'invalid':result.unknowns.length?'unknown':result.warnings.length?'warning':'match';
 return result;
}

/** Populate an optional chapter root. Native controls remain keyboard accessible. */
export function initNovacorConnections(root=globalThis.document?.getElementById('rtds-chapter-2a')){
 if(!root)return null;
 const options=records=>Object.entries(records).map(([value,label])=>`<option value="${value}">${typeof label==='string'?label:label.label}</option>`).join('');
 root.innerHTML=`<header class="cabinet-heading"><div><p class="eyebrow">2A · NOVACOR 2.0 · 修订 20250916</p><h3 id="novacor-connections-heading" tabindex="-1">先选通信用途，再配源端口与卡链。</h3><p>接线基础版 · PDF 65–105 · 本页检查接口类别，不操作真实设备</p></div></header>
 <section class="cabinet-wiring-focus" aria-label="NovaCor 2.0 连接类别检查">
 <p class="cabinet-note">相同外形的光口，不代表协议和用途相同。GT 1–20、Aurora 21–24、IRC、GTSYNC 与 GBH 各有角色；工作站 WIF 和铜 SFP 的 ETH / UDP 也不能混用。</p>
 <div class="cabinet-wiring-grid"><article class="cabinet-v1-controls"><h4>01 · 选择连接</h4>
 <label for="novacor-purpose">连接用途</label><select id="novacor-purpose" aria-describedby="novacor-connection-result">${options(purposes)}</select>
 <label for="novacor-port">你选择的 NovaCor 源端口</label><select id="novacor-port" aria-describedby="novacor-connection-result">${options(ports)}</select>
 <label for="novacor-cable">线缆类别</label><select id="novacor-cable" aria-describedby="novacor-connection-result">${options(cables)}</select>
 <label for="novacor-aurora-license">Aurora 功能状态（离线假设）</label><select id="novacor-aurora-license" aria-describedby="novacor-connection-result">${options(licenses)}</select>
 </article><article><h4>02 · 预期连接两端</h4><p id="novacor-connection-path" class="wiring-path"></p><p id="novacor-connection-detail"></p><p id="novacor-connection-source" class="cabinet-note"></p><a id="novacor-inspect-port" hidden>在真实模型中定位所选接口 ↗</a></article>
 <article><h4>03 · 仅检查类别</h4><output id="novacor-connection-result" aria-live="polite" aria-atomic="true"></output><p>匹配不证明物理配合、针脚、信号电平、固件、许可或系统配置已完成。本页没有连接真实硬件。</p></article></div>
 <details class="cabinet-evidence"><summary>光 SFP 与铜 SFP：同一器件不等于同一协议</summary><p>PDF 72：GT 1–24、IRC 1–6、GTSYNC 列出受支持的光 SFP Finisar FTLF8519P3BNL，但这些口的用途并不互换。这里不推断收发器的全部线缆规格、距离或未列出的替代型号。</p><p>ETH 的受支持铜 SFP 包括 Finisar FCLF8522P2BTL（1000BaseX，仅 1G）及 Avago ABCU-5731R（10/100/1000）。原文另列“Avago ABCU-1000baseX”，型号不完整，不在本页补成可采购料号。UDP 地址要求见 PDF 72、95；WIF 工作站直连 / 交换机连接见 PDF 79–80。</p></details>
 </section>
 <section class="cabinet-wiring-focus" aria-labelledby="novacor-chain-heading"><h4 id="novacor-chain-heading">一个 GT 1–20 端口，可以怎样排 I/O 卡？</h4>
 <p class="cabinet-note" id="novacor-chain-help">从主机近端到远端，用英文逗号依次填写卡型。支持 GTAI、GTAO、GTDI、GTDO、GTFPI、GTNET、GTFPGA、GTSOC；不识别的卡型会阻止“匹配”结论。每端口 1–8 张；9 张示例用于检查超限。来源：PDF 74 §2.5.2（章节印刷页 10）。</p>
 <div class="cabinet-wiring-grid"><article class="cabinet-v1-controls"><h4>有序卡链</h4><label for="novacor-chain">近端 → 远端卡型</label><input id="novacor-chain" type="text" maxlength="160" value="GTAI, GTAO, GTAO, GTDO" spellcheck="false" autocomplete="off" aria-describedby="novacor-chain-help novacor-chain-result"><label><input id="novacor-time-critical" type="checkbox"> 假设 GTDI 接收时敏输入</label><p id="novacor-chain-path" class="wiring-path"></p></article><article><h4>已知组合规则</h4><p>GTNET、GTFPGA、GTSOC 不级联，各自独占端口。含 GTAI 的链不能加入其他输入卡，包括 GTDI 和第二张 GTAI。GTFPI 的具体输入角色须按其专章核对，本页不批准 GTAI + GTFPI 组合。</p><p>时敏输入如 GTDI 应放在链首，属于定性的延时提醒，不是把所有非链首 GTDI 判为硬件禁配。来源：PDF 74。</p></article><article><h4>当前卡链检查</h4><output id="novacor-chain-result" aria-live="polite" aria-atomic="true"></output><ul id="novacor-chain-reasons"></ul></article></div>
 <div class="cabinet-tabs"><button type="button" data-novacor-example="normal">正常例：GTAI → GTAO → GTAO → GTDO</button><button type="button" data-novacor-example="mixed-input">错误例：GTDI 与 GTAI 共链</button><button type="button" data-novacor-example="exclusive">错误例：GTNET 未独占端口</button><button type="button" data-novacor-example="over">错误例：9 张卡超过上限</button><button type="button" data-novacor-example="latency">时序提醒：时敏 GTDI 在链尾</button><button type="button" data-novacor-example="reset">重置选择</button></div>
 <p class="cabinet-note">这里的 GTAI / GTAO 等是卡型规则，不是对所有版本混接的许可。具体卡侧 GT1 / GT2、供电、外部信号端子与配置，应转到对应版本接口课程核对；本章不补造未确认针脚。</p></section>
 <div class="cabinet-timing-note"><h4>延时：有顺序建议，没有本链路的端到端数值</h4><p>PDF 74 提醒对时敏输入优先考虑链首，但没有给出这条 GT I/O 链的数值延时。本页不把采样 / 更新间隔、网页响应或动画速度当作端到端延时，也不从卡数编造每跳耗时。Aurora、IRC、WIF / UDP 和 GTSYNC 同样不在本页推算端到端延时。</p></div>
 <p><a href="#rtds-interface:novacor-2.0:gtio">定位 NovaCor 2.0 的 GT I/O 真实模型接口 ↗</a> · <a href="#rtds-analog">继续：前面板模拟监视输出与测量 ↗</a></p>
 <details class="cabinet-evidence"><summary>适用版本、来源与本单元边界</summary><p>仅适用 NovaCor 2.0，修订 20250916。端口区分：PDF 71–72；GT I/O 卡链：PDF 74；工作站连接：PDF 66–67、79–80；UDP 地址：PDF 95；IRC 与同步分别配置：PDF 97–100。页码为 PDF 阅读页，不是章节印刷页。</p><p>本单元为接线基础版，不等于整章完成。真实机间 / 同步拓扑、线缆细项、板卡版本约束及运行配置须另行核对。未核对的端点和组合保持“待确认”，不以模型外观补齐。公开内容是原创交互与事实摘要，不包含手册原图或文件。</p></details>`;
 const control=id=>root.querySelector(`#novacor-${id}`);
 const purpose=control('purpose'),port=control('port'),cable=control('cable'),license=control('aurora-license'),connectionOut=control('connection-result');
 const chainInput=control('chain'),timeCritical=control('time-critical'),chainOut=control('chain-result'),reasons=control('chain-reasons');
 function updateConnection(){
  const result=checkNovacorConnection({purpose:purpose.value,port:port.value,cable:cable.value,auroraLicense:license.value});
  const expected=purposes[purpose.value];connectionOut.dataset.status=result.status;connectionOut.textContent=result.message;
  control('connection-path').textContent=expected?`${ports[expected.port]} ↔ ${result.endpoint}`:'选择无效';
  control('connection-detail').textContent=expected?.detail||'';
  control('connection-source').textContent=`来源：PDF ${result.sourcePages.join('、')} · NovaCor 2.0 · 修订 20250916`;
  license.disabled=purpose.value!=='aurora';
  const inspect=control('inspect-port'),group=portGroups[port.value];inspect.hidden=!group;
  if(group)inspect.href=`#rtds-interface:novacor-2.0:${group}`;else inspect.removeAttribute('href');
 }
 function updateChain(){
  const result=checkGtioChain({cards:chainInput.value,timeCritical:timeCritical.checked});
  chainInput.setAttribute('aria-invalid',String(result.status==='invalid'));
  chainOut.dataset.status=result.status;
  const summary={match:'本页已知组合规则未发现冲突；仍须核对具体板卡版本与应用配置。',warning:'有时敏输入顺序提醒；未发现本页列出的硬性组合冲突。',invalid:'已发现不满足本页规则的配置，查看下方原因。',unknown:'存在尚未核对的卡型或组合，不判断整链匹配。'};
  chainOut.textContent=`${result.cardCount} 张卡 / 每端口最多 8 张。${summary[result.status]}`;
  control('chain-path').textContent=result.cardCount?`NovaCor GT 1–20 → ${result.cards.join(' → ')}`:'尚未填写有序卡链。';
  reasons.replaceChildren();
  for(const entry of [...result.errors,...result.unknowns,...result.warnings]){const item=root.ownerDocument.createElement('li');item.textContent=entry.message;reasons.append(item);}
 }
 for(const element of [purpose,port,cable,license])element.addEventListener('change',updateConnection);
 chainInput.addEventListener('input',updateChain);timeCritical.addEventListener('change',updateChain);
 const examples={normal:'GTAI, GTAO, GTAO, GTDO','mixed-input':'GTDI, GTAI, GTAO, GTAO',exclusive:'GTNET, GTAO',over:Array(9).fill('GTDO').join(', '),latency:'GTAO, GTDO, GTDI',reset:''};
 root.querySelectorAll('[data-novacor-example]').forEach(button=>button.addEventListener('click',()=>{
  const name=button.dataset.novacorExample;chainInput.value=examples[name];timeCritical.checked=name==='latency';
  purpose.value='gtio';port.value=name==='reset'?'unknown':'gt1-20';cable.value=name==='reset'?'unknown':'optical';license.value='unknown';updateConnection();updateChain();
 }));
 updateConnection();updateChain();return root;
}
