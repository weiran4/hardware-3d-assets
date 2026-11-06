import {initLightSync} from './rtds-novacor-light-sync.js';
import {checkLightLoop,lightChannelPins,checkLightChain} from './rtds-novacor-light-state.js';
// Original offline teaching, NovaCor Light revision 20250529. No physical model is substituted.
export function initNovacorLight(root=globalThis.document?.getElementById('rtds-chapter-2b')){
 if(!root)return null;
 const options=items=>Object.entries(items).map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
 const ports={unknown:'尚未选择',i1:'I1 · 数字 I/O',i2:'I2 · 模拟 I/O',gt3:'GT 3 · 外部 I/O',aur1:'AUR1 · Aurora'};
 root.innerHTML=`<header class="cabinet-heading"><div><p class="eyebrow">2B · NOVACOR LIGHT · 修订 20250529</p><h3 id="novacor-light-heading" tabindex="-1">内置 I/O，先核对两条光纤回接。</h3><p>连接基础版 · PDF 106–142 · 仅限 RSCAD FX · 离线学习</p></div></header>
 <p class="cabinet-note">Light 有自己的 I1 / I2、DB25 和四个外接 GT 口，不能套用 NovaCor 2.0 的端口布局。本版本尚未建模；下面是接口名称与参数检查，不是实物插接图。</p>
 <section class="cabinet-wiring-focus light-loop" aria-labelledby="light-loop-heading"><h4 id="light-loop-heading">01 · 同名回接，启用对应内部 I/O</h4>
 <div class="light-grid"><article class="cabinet-v1-controls"><label for="light-kind">要使用的内部 I/O</label><select id="light-kind">${options({digital:'数字输入 / 输出',analogue:'模拟输入 / 输出'})}</select>
 <label for="light-source">下方计算端接口</label><select id="light-source" aria-describedby="light-loop-result">${options(ports)}</select><label for="light-target">上方 Internal I/O 接口</label><select id="light-target" aria-describedby="light-loop-result">${options({unknown:'尚未选择',i1:'I1 · 数字 I/O',i2:'I2 · 模拟 I/O'})}</select><label for="light-medium">连接介质</label><select id="light-medium" aria-describedby="light-loop-result">${options({unknown:'尚未选择',fibre:'光纤回接',copper:'以太网铜线',signal:'外部电气信号线'})}</select></article>
 <article class="light-result"><span class="light-kicker">NOVACOR LIGHT · 内部回接</span><p id="light-loop-path" class="wiring-path"></p><output id="light-loop-result" aria-live="polite" aria-atomic="true"></output><p>I1 ↔ I1 为数字，I2 ↔ I2 为模拟。这里的双向箭头表示光通信回路；外部信号的输入 / 输出方向由 DB25 功能决定。</p><p class="cabinet-note">来源：PDF 109–111。下方 I1 / I2 不属于四个外接 GT 3–6 端口；光纤不是外部电气信号线，也不代替供电。</p></article></div>
 <div class="cabinet-tabs"><button type="button" data-light-loop="digital">正常例：数字 I1 ↔ I1</button><button type="button" data-light-loop="analogue">正常例：模拟 I2 ↔ I2</button><button type="button" data-light-loop="crossed">错误例：I1 接 I2</button><button type="button" data-light-loop="reset">重置选择</button></div></section>
 <section class="cabinet-wiring-focus" aria-labelledby="light-pins-heading"><h4 id="light-pins-heading">02 · 查一个通道，不猜一个针脚</h4><p class="cabinet-note">按随附 DB25 转接端子块的编号查找，不是从插头正面或焊接面看的针位图。来源：PDF 112–118。</p>
 <div class="light-grid"><article class="cabinet-v1-controls"><label for="light-pin-kind">信号类别</label><select id="light-pin-kind">${options({analogue:'模拟 · 每方向 12 通道',digital:'数字 · 每方向 32 通道'})}</select><label for="light-direction">信号方向</label><select id="light-direction">${options({output:'输出 · Light → 外部设备',input:'输入 · 外部设备 → Light'})}</select><label for="light-channel">通道编号</label><input id="light-channel" type="number" min="1" max="12" step="1" value="1" inputmode="numeric" aria-describedby="light-pin-result"><p>模拟：上方 DB25 为输出，下方为输入。数字：上排两只为输出，下排两只为输入；分别对应 1–16 与 17–32。</p></article>
 <article class="light-result"><output id="light-pin-result" aria-live="polite" aria-atomic="true"></output><dl id="light-pin-facts" class="light-facts"></dl><ul id="light-pin-warnings"></ul><p class="cabinet-note">针脚名称核对不代表电气兼容或安全接线许可。实际连接先断电，并核对对端电平、负载、隔离与接地要求。</p></article></div>
 <details class="cabinet-evidence"><summary>两个来源疑点：不自动“纠正”后用于接线</summary><p>模拟输出 AO 的 pin 13 在 PDF115 写作“3 Return”，与 pin16 的通道3返回重复；本页不把 AO13 改成地、NC 或额外返回。模拟输入 AI 的 pin13 在 PDF116 明确为 Ground，两种端口不能混用这一结论。</p><p>数字输入 DI 表的 pin 14/15 在 PDF113 标成 Output 1/2。涉及第一只 DI 的通道9/10，本页不生成确定信号针脚；第二只 DI 只明确通道17–32，本章未明确复用针脚表和Bank编号，因此其全部针脚保持待核对，不套用DO的重复映射说明。其他未列针脚不当作 NC。完整数字电平、供电范围和驱动能力尚未在本单元核对。</p></details>
 <div class="light-specs"><article><h5>模拟输出 AO</h5><p>12 路 · 16 bit · ±10 V peak<br>每路驱动能力 10 mA<br>通道同步更新；1 µs 过采样间隔</p></article><article><h5>模拟输入 AI</h5><p>12 路差分 · 16 bit · ±10 V peak<br>输入阻抗 24 kΩ<br>同步采样；每 1.0 µs 发送新样本</p></article><article><h5>间隔不是延时</h5><p>来源 PDF114–115。采样 / 更新间隔不是完整闭环的端到端延时；本章未提供这条链路的数值延时，网页也不测量真实设备。</p></article></div></section>
 <section class="cabinet-wiring-focus" aria-labelledby="light-chain-heading"><h4 id="light-chain-heading">03 · 外接卡只走 GT 3–6，并核对 V2</h4><p id="light-chain-help" class="cabinet-note">从主机近端到远端，以英文逗号填写 GTAI、GTAO、GTDI、GTDO、GTFPI、GTNET 或 GTSOC。来源：PDF 119。四个外接口 × 每口最多8张 = 理论32张，不代表任意卡型组合都能达到。</p>
 <div class="light-grid"><article class="cabinet-v1-controls"><label for="light-chain-port">Light 源端口</label><select id="light-chain-port">${options({unknown:'尚未选择',gt3:'GT 3',gt4:'GT 4',gt5:'GT 5',gt6:'GT 6',i1:'I1 · 内部数字',i2:'I2 · 内部模拟',aur1:'AUR1 · Aurora'})}</select><label for="light-chain-version">整条卡链的版本（离线假设）</label><select id="light-chain-version">${options({unknown:'尚未确认',v2:'已核对为受支持的 V2',v1:'含 V1 外部 I/O 卡'})}</select><label for="light-chain">近端 → 远端卡型</label><input id="light-chain" type="text" maxlength="160" value="GTAI, GTAO, GTAO, GTDO" spellcheck="false" autocomplete="off" aria-describedby="light-chain-help light-chain-result"><label><input id="light-time-critical" type="checkbox"> GTDI 接收时敏输入（假设）</label></article>
 <article class="light-result"><p id="light-chain-path" class="wiring-path"></p><output id="light-chain-result" aria-live="polite" aria-atomic="true"></output><ul id="light-chain-reasons"></ul><p>GTNET / GTSOC 不级联，各自独占端口。含 GTAI 的链不能再有输入卡；GTFPI 混链角色未核对时不判通过。时敏 GTDI 宜在链首，但不由卡数虚构每跳延时。</p></article></div>
 <div class="cabinet-tabs"><button type="button" data-light-chain="normal">正常例：V2 模拟输入与输出链</button><button type="button" data-light-chain="v1">错误例：V1 外部卡</button><button type="button" data-light-chain="mixed">错误例：GTDI 与 GTAI</button><button type="button" data-light-chain="exclusive">错误例：GTNET 级联</button><button type="button" data-light-chain="latency">时序提醒：GTDI 在末端</button><button type="button" data-light-chain="reset">重置卡链</button></div>
 <p class="cabinet-note">GT 光链路不替代板卡供电。GTFPGA 在本页只出现于“不支持级联”的限制，并未列入明确支持清单，因此不会据此批准独立兼容。许可、固件、电气及卡侧端口仍须按对应版本核对。</p></section>
 <section class="cabinet-wiring-focus" id="light-sync-unit" aria-labelledby="light-sync-heading"></section>
 <details class="cabinet-evidence light-port-guide"><summary>其他端口怎么区分：工作站、UDP、IRC、同步与供电</summary><dl>
 <dt>WIF Ethernet ↔ 工作站 / 以太网交换机</dt><dd>独立 Gigabit Ethernet 主机接口，可直连工作站或共接局域网。不是 ETH UDP，也不替代 IRC。WIF Console USB 是终端配置接口。PDF109、121–122、128。</dd>
 <dt>ETH 铜 SFP ↔ UDP 网络对端</dt><dd>使用受支持铜 SFP 和以太网线；每机箱 UDP IP / MAC 须各自唯一。对端协议、报文及系统配置不能仅凭插口判断。PDF109–110、127。</dd>
 <dt>AUR1 / AUR2 ↔ 另行核对的 Aurora 对端</dt><dd>Aurora 功能单独购买，未配备端口禁用，不可借作普通 I/O。具体对端与协议仍待核对。PDF109–110、119。</dd>
 <dt>IRC1–3 ↔ 另一机箱 IRC / IRC Switch</dt><dd>机间仿真数据通道，和 GBH 同步分开。最多4台可用三个IRC口直接互连的类别；更多机箱需 IRC Switch，不能用普通以太网交换机替代。这里不生成逐端口接线表。PDF134–137。</dd>
 <dt>GBH ↔ 另一机箱 GBH / Global Bus Hub</dt><dd>同步链路：两台可直接相连并在双方启用 P2P；三台以上需hub且禁用P2P。仍需IRC数据链路与配置。协议、光缆和距离条件分开核对，不把“100m”推广至所有链路。PDF122–123、134–137。</dd>
 <dt>GTSYNC ↔ 另行核对的同步设备接口</dt><dd>专用光通信口，不等于外部时源电气输入，也不与IRC/GBH互换。本轮只确认Light口的身份，不套用2A的完整对端检查器。PDF109–110。</dd>
 <dt>AC入口 ← 随产品提供的交流电源线</dt><dd>100–120 / 220–240 VAC，50/60 Hz；最大250 W、最大2.5 A为手册参数，不做交流端子接线演示。PDF107–108。Light仅支持RSCAD FX；机间可与NovaCor1.0/2.0组合，不兼容PB5/GPC（PDF106、133）。</dd></dl>
 <p>光 SFP FTLF8519P3BNL 列于 I1/I2、GT3–6、AUR1/2、IRC1–3及GTSYNC（PDF110），同一收发器不代表协议可互换。ETH铜SFP明确列有FCLF8522P2BTL（仅1G）与ABCU-5731R（10/100/1000）；另列“ABCU-1000baseX”的型号不完整，不补成采购料号。</p></details>
 <details class="cabinet-evidence"><summary>本轮覆盖、来源与待证据项</summary><p>基础版 / 部分覆盖：已核对内部I/O回接、已明确通道针脚、模拟参数/采样更新、V2外部GT链、其他端口角色，以及GBH/IRC多机配置检查与配置文件更新说明。页码为PDF阅读器页码，2B修订20250529，范围106–142。本轮没有发布Light三维模型，也不声称整章手册已全部覆盖。</p><p>待核对：AO13、DI14/15、第二只DI针脚表与数字完整电气条件；Light实物机械/接口几何；具体多机逐端口映射、固件组合、光纤精确选型与端到端延时。原文PDF109第1项的“标号8”与图/第9项交叉引用不一致，本页只用明确的I1/I2名称。</p><p>不操作真实RTDS设备，不申请许可，不提供私人手册或第三方原图。安装、温度和一般尺寸不作为本轮主课或推进门槛。</p></details>
 <p><a href="#rtds-chapter-2a">返回 NovaCor 2.0 独立接线课 ↗</a> · <a href="#rtds-chapter-1a">章节导航与覆盖进度 ↗</a></p>`;
 const q=id=>root.querySelector(`#light-${id}`),setResult=(id,result)=>{q(id).dataset.status=result.status;q(id).textContent=result.message;};
 const list=(id,entries)=>{q(id).replaceChildren();for(const entry of entries){const li=root.ownerDocument.createElement('li');li.textContent=entry.message;q(id).append(li);}};
 function updateLoop(){const result=checkLightLoop({kind:q('kind').value,source:q('source').value,target:q('target').value,medium:q('medium').value});setResult('loop-result',result);const name=q('kind').value==='digital'?'I1':'I2';q('loop-path').textContent=`下方 ${name} ↔ 光纤 ↔ 上方 Internal I/O ${name}`;}
 for(const id of ['kind','source','target','medium'])q(id).addEventListener('change',updateLoop);
 root.querySelectorAll('[data-light-loop]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.lightLoop,analog=name==='analogue',reset=name==='reset';q('kind').value=analog?'analogue':'digital';q('source').value=reset?'unknown':analog?'i2':'i1';q('target').value=reset?'unknown':analog||name==='crossed'?'i2':'i1';q('medium').value=reset?'unknown':'fibre';updateLoop();}));
 function updatePins(){
  const kind=q('pin-kind').value,direction=q('direction').value;q('channel').max=kind==='analogue'?'12':'32';
  const result=lightChannelPins({kind,direction,channel:q('channel').value});setResult('pin-result',result);q('channel').setAttribute('aria-invalid',String(result.status==='invalid'));q('pin-facts').replaceChildren();
  const add=(label,value)=>{const dt=root.ownerDocument.createElement('dt'),dd=root.ownerDocument.createElement('dd');dt.textContent=label;dd.textContent=String(value);q('pin-facts').append(dt,dd);};
  if(result.status!=='invalid'){
   add('信号方向',result.directionLabel);add('DB25',kind==='analogue'?(direction==='output'?'上方 AO':'下方 AI'):`${direction==='output'?'上排 DO':'下排 DI'} · 第 ${result.connector} 只 · ${result.bank===null?'BANK 待核对':`BANK ${result.bank}`} `);
   add('信号针脚',result.signalPin===null?'待核对，不给出确定针脚':`pin ${result.signalPin}`);
   if(result.returnPin!==null&&result.returnPin!==undefined)add('该通道返回',`pin ${result.returnPin}`);
   for(const [key,label]of [['groundPins','Ground'],['powerPins','外部 +Power'],['pullupPins','V+ pull-up']])if(result[key]?.length)add(label,result[key].map(n=>`pin ${n}`).join('、'));
   add('来源',`PDF ${result.sourcePages.join('、')}`);
  }
  list('pin-warnings',result.warnings||[]);
 }
 q('channel').addEventListener('input',updatePins);for(const id of ['pin-kind','direction'])q(id).addEventListener('change',updatePins);
 function updateChain(){
  const result=checkLightChain({cards:q('chain').value,version:q('chain-version').value,port:q('chain-port').value,timeCritical:q('time-critical').checked});
  q('chain-result').dataset.status=result.status;q('chain').setAttribute('aria-invalid',String(result.status==='invalid'));
  q('chain-result').textContent=`${result.cardCount} 张卡 / 每口最多 8 张。`+({match:'本页已知规则未发现冲突；仍须核对卡侧接口、电气、固件与配置。',invalid:'存在明确冲突，不能据此连接。',unknown:'条件或证据未确认，不判断整链匹配。',warning:'有时敏输入顺序提醒，不是新增的禁配规则。'}[result.status]||'选择无效。');
  q('chain-path').textContent=result.cardCount?`Light ${q('chain-port').selectedOptions[0].textContent} → ${result.cards.join(' → ')}`:'尚未填写有序卡链。';list('chain-reasons',[...result.errors,...result.unknowns,...result.warnings]);
 }
 q('chain').addEventListener('input',updateChain);for(const id of ['chain-port','chain-version','time-critical'])q(id).addEventListener('change',updateChain);
 const chains={normal:'GTAI, GTAO, GTAO, GTDO',v1:'GTAO',mixed:'GTDI, GTAI, GTAO',exclusive:'GTNET, GTAO',latency:'GTAO, GTDO, GTDI',reset:''};
 root.querySelectorAll('[data-light-chain]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.lightChain;q('chain').value=chains[name];q('chain-port').value=name==='reset'?'unknown':'gt3';q('chain-version').value=name==='reset'?'unknown':name==='v1'?'v1':'v2';q('time-critical').checked=name==='latency';updateChain();}));
 updateLoop();updatePins();updateChain();initLightSync(root.querySelector('#light-sync-unit'));return root;
}
