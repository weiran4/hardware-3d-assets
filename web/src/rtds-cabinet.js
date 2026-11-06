import './rtds-cabinet.css';
import {initCabinetComponents} from './rtds-cabinet-components.js';
import {initCabinetDimensions} from './rtds-cabinet-dimensions.js';
import {initCabinetDoor} from './rtds-cabinet-door.js';
import {initCabinetChassis} from './rtds-cabinet-chassis.js';
import {initCabinetAccess} from './rtds-cabinet-access.js';
import {initCabinetEnvironment} from './rtds-cabinet-environment.js';
import {cards,railBudget,railSpaceBudget,railLengthsMm,lightState,chapters} from './rtds-cabinet-state.js';
export function initCabinet(){
 const root=document.getElementById('rtds-chapter-1a');
 root.innerHTML=`<header class="cabinet-heading"><div><p class="eyebrow">MANUAL STUDY / 1A · CUBICLE V2</p><h3 id="cabinet-heading" tabindex="-1">先看两端接口，再看规格与接法。</h3><p>接线教学入口 · 按硬件版本查看</p></div><a href="#rtds-power-lesson">已有真实模型：GTIO 供电演示 ↗</a></header>
 <section id="cabinet-wiring-focus" class="cabinet-wiring-focus" aria-label="接线学习入口">
 <p class="cabinet-note">先分清三条连接：<b>24 V 供电线、GT 光数据链路、外部信号端子</b>；再看谁接谁、接口与线缆、方向、规格和延时条件。点击下方课程会选择对应硬件，再显示它的接线教学；不会把不同版本的接口混为一谈。</p>
 <div class="cabinet-wiring-grid">
 <article><h4>01 · 两张 GTAO V2 怎样供电</h4><p class="wiring-path">24 V DC 电源 → 两张 GTAO V2</p><p>跟随真实模型看电源线与卡间跳线。线束逐卡连接，负载电气并联，两卡各获得 24 V；不是串联分压。</p><p><b>版本：</b>现有示例使用 GTAO V2 模型及 Cubicle V1 图示，不是 V2 机柜接线图，也不能照搬成 GTDI 的电源口接法。断电后连接，再演示供电。</p><a href="#rtds-power-lesson">查看 GTAO V2 双卡供电接法 ↗</a></article>
 <article><h4>02 · NovaCor 模拟输出怎样测量</h4><p class="wiring-path">输出 1 → 万用表 V · 模拟地 1 → COM</p><p>输出信号由 NovaCor 2.0 送至监视仪表。前面板 12 路、12-bit D/A、±10 V 峰值、最大 20 mA；示例使用 ±5 V 峰值，不是市电接线。</p><p><b>错误接法边界：</b>前面板输出用于监视，不作为外部保护/控制的精密接口；这类接口应使用对应 GTAO。来源：PDF 70、72–73。</p><a href="#rtds-analog-lesson">查看 NovaCor 2.0 输出与测量 ↗</a></article>
 <article><h4>03 · 主机与 I/O 卡怎样通信</h4><p class="wiring-path">NovaCor GT 1–20 ↔ 首卡 GT1</p><p>允许级联的组合：前卡 GT2 ↔ 后卡 GT1；双工 LC 光连接。RSCAD 元件的 GT 端口设置须与实际主机端口一致。级联卡型、数量和版本必须按对应章节核对，不代表任意混接。</p><p><b>常见错配：</b>GT 21–24 是 Aurora 专用口，不是 GTI/O；GTSYNC 使用专用同步口，不能当普通 GTI/O 卡级联。来源：PDF 71–74、285、410–411。</p><a href="#rtds-interface:novacor-2.0:gtio">选 NovaCor 2.0，点击对应真实接口 ↗</a></article>
 </div>
 <div class="cabinet-timing-note"><h4>规格与延时，要分清测量对象</h4><p>GTAI V2：12 路差分 ±10 V、16-bit ADC、24 kΩ，采样数据每 1.0 µs 送往 NovaCor（PDF 336、339、347）。GTAO V2：16 路 ±10 V、16-bit DAC、每路 10 mA，1 µs 过采样并同步更新；第 13–16 路仅 NovaCor 可用（PDF 276、289–292）。<b>采样/更新间隔不等于端到端延时</b>；整条链路延时不能仅用这两个周期推算，不以网页动画速度代替硬件时序。</p><p><b>有条件的延时例：</b>GTDO V2 从板卡收到数据到输出完成的传播时间最多 1 µs，条件为 V+ = 30 V、Rload = 100 Ω、Cload = 30 pF（PDF 371）。这是这一段及给定负载的规格，不是整个闭环延时，也不外推所有负载。</p><p><a href="#rtds-interface:gtdo-v2:digital_output">查看 GTDO V2 输出接口 ↗</a> · <a href="#rtds-interface:gtai-v2:analogue_input">查看 GTAI V2 输入端子与规格 ↗</a> · <a href="#rtds-interface:gtao-v2:analog_output">查看 GTAO V2 输出端子与规格 ↗</a></p></div>
 <p class="cabinet-note">Cubicle V2 供电资料有 24 V / 3.8 A 与每轨 100 W 的冲突（PDF 25–28），实际额定值仍待核对，不能用教学预算批准接线或负载。其他接线限制随所选硬件显示；未知针脚不补画。</p>
 </section>
 <p><a href="#rtds-chapter-1b">继续 1B：供电线与 GT 光纤如何区分 ↗</a> · <a href="#rtds-chapter-2a">2A NovaCor 2.0 接线 ↗</a> · <a href="#rtds-chapter-2b">2B NovaCor Light 内部 I/O ↗</a></p>
 <details class="chapter-nav"><summary>章节导航与覆盖进度 · 29 个推进单元</summary><p>按手册顺序推进接线、接口、规格和已核实延时；安装、温度和一般长度不是主课或推进门槛。已有模型与专题不等于整章完成。固件附录拆为 5 单元，非原书 5 章。</p><ol>${chapters.map(c=>`<li><b>${c.id} ${c.title}</b><span>PDF ${c.pages}</span><span>${c.status}</span></li>`).join('')}</ol></details>
 <details id="cabinet-auxiliary" class="cabinet-evidence"><summary>机柜辅助资料（非接线主课，按需展开）</summary><p>保留以前的预算、尺寸、温湿度和拆装参考，不作为接线课程的学习顺序或章节推进条件。</p>
 <section id="cabinet-components" class="cabinet-components" aria-labelledby="cabinet-components-heading"></section>
 <div class="cabinet-tabs"><button type="button" data-preset="normal">正常例：左右各 30 W</button><button type="button" data-preset="over">错误例：左侧 105 W / 右侧空载</button><button type="button" data-preset="boundary">功率边界例：100 W</button><button type="button" data-preset="space">空间反例：左右各 7 张 GTDO V2</button><button type="button" data-preset="mixed">混合版本例：左右各 31 W / 94.5 cm</button><button type="button" data-preset="legacy-space">旧卡空间反例：各 5 张 GTDO V1.21</button></div>
 <p class="cabinet-note">PDF 28 正文为每条 DIN 导轨列出独立的 <b>24 V DC / 100 W</b>；以下以 100 W 作正文教学阈值，不确认实物额定容量。右侧余量不能借给左侧；不是共享的 200 W 池。以下左右方向均为<b>从机柜后方看</b>：左轨可用 144 cm，右轨可用 134 cm（Cubicle V2，2025 年 5 月及以后）。</p>
 <p id="cabinet-supply-conflict" class="cabinet-note"><b>待核对的电源标注冲突：</b>PDF 25 电路图与 PDF 26 电源照片标注 <b>24 V / 3.8 A</b>（相乘为 91.2 W），与 PDF 28 正文每轨 100 W 不一致。本工具保留正文 100 W 教学阈值，不选择哪处正确；P / 24 V 为算术换算，100 W 对应约 4.17 A，<b>不是已核实的电源额定电流</b>。预算范围内也不能确认实物电源可供给；不据此选型、接线或接近额定负载。</p>
 <div class="cabinet-rails">${['left','right'].map((side,i)=>`<fieldset><legend>${i?'右':'左'}侧导轨 · 正文阈值 100 W</legend><div class="cabinet-card-head"><span>板卡 / 每卡功率与长度</span><span>数量</span></div>${Object.entries(cards).map(([key,c])=>`<label>${c.name} <small>${c.watts} W · ${c.lengthMm/10} cm</small><input type="number" min="0" max="1000" step="1" value="0" data-rail="${side}" data-card="${key}" aria-describedby="cabinet-${side} cabinet-${side}-space" aria-label="${i?'右':'左'}侧 ${c.name} 数量"></label>`).join('')}<meter min="0" max="100" value="0" aria-label="${i?'右':'左'}侧功率占用"></meter><output id="cabinet-${side}" aria-live="polite"></output><div class="cabinet-space"><p class="cabinet-space-caption">长度占用 · 后视${i?'右':'左'}轨 ${(railLengthsMm[side]/10).toFixed(0)} cm</p><div class="cabinet-space-map" data-space-map="${side}" aria-hidden="true"></div><output id="cabinet-${side}-space" aria-live="polite"></output></div></fieldset>`).join('')}</div>
 <p class="cabinet-note">功率为手册列出的功耗值相加，电流按 P / 24 V 换算，非实测。长度按各卡的名义长度累加，以整数毫米计算：四款 V2 卡均为 19.7 cm，GTDI V1 为 26.6 cm，GTDO V1 为 28.5 cm。旧卡功耗仅采用表中指定的 GTDI V1.11（6 W）与 GTDO V1.21（12 W），不外推其他修订。混合版本例只比较预算，不证明不同版本之间的接口、供电跳线或系统兼容性。占用条是原创比例示意，不是安装图或真实机械模型；超长部分不在条内绘出，完整超出量见文字。仅检查电源与名义长度，不含安装间隙、公差、连接器/线缆额定值、温升、启动电流或系统配置。两项均在范围内也不代表整套安装合格。</p>
 <div class="cabinet-light"><div><h4>照明状态 · 两个开关的关系</h4><label><input id="cabinet-rear" type="checkbox"> 后部 LED 开关</label><label><input id="cabinet-local" type="checkbox"> 内部灯条本地开关</label></div><output id="cabinet-light-state" aria-live="polite"></output></div>
 <section id="cabinet-dimensions" class="cabinet-dimensions" aria-labelledby="cabinet-dimensions-heading"></section>
 <section id="cabinet-chassis" class="cabinet-chassis" aria-labelledby="cabinet-chassis-heading"></section>
 <section id="cabinet-environment" class="cabinet-environment" aria-labelledby="cabinet-env-heading"></section>
 <section id="cabinet-access" class="cabinet-access" aria-labelledby="cabinet-access-heading"></section>
 <section id="cabinet-door" class="cabinet-door" aria-labelledby="cabinet-door-heading"></section>
 <details class="cabinet-evidence"><summary>适用版本、依据与未覆盖项</summary><p>适用于 Cubicle V2，手册修订 20260506，PDF 16–36。供电与组件：PDF 25–30；每轨独立 24 V / 100 W：PDF 28；板卡功耗与长度：PDF 32；导轨可用长度与后视方向：PDF 30–31（2025 年 5 月及以后的 V2）；照明开关依赖：PDF 23；运行环境条件：PDF 34 §1.9。只作离线参数与状态教学，不连接真实设备，不演示交流接线或带电操作。</p><p>V2 使用一个断路器，不再使用旧版烟雾探测器与机械接触器；I/O 与 LED 控制位于后部。已有 GTIO 三维专题依据 Cubicle V1 图示，保留其版本标签，不作为 V2 机械接线证据。</p><ul><li>已覆盖：四款 V2 I/O 卡及 GTDI V1.11 / GTDO V1.21 的双导轨功率与长度预算、原创比例占用图、正常/超限/功率边界/空间反例、照明逻辑、运行环境四条件检查、顶部/底部/侧面入口位置对照及侧板/LED 约束情景、机箱功耗范围与条件参考和/重复计数检查、门锁销拆装顺序的非比例状态教学、正文/附录分离的尺寸数值比较与配置约重参考、版本区别与章节队列。</li><li>已整合：前部 2U/4U 空白面板、侧板与门的连接类别辨识；接地位置与七种组件型号只读索引。下方覆盖注册表区分已交付事实与不可据此推断的施工条件。</li><li>仍缺证据：完整含突出件外包络、尺寸差异原因、搬运/锚固/承载/维护间隙；120 W 基线构成与可加性；GTFPI/GTSYNC 功耗表代际、GTAI V1 功耗；光纤单位及电源线长度/插头型号矛盾。这些不参与选型、接线或完整安装判断。</li></ul><p>所有状态即时响应输入，不表示硬件时序或保护动作。超限提示是预算检查，不模拟断路器跳闸。公开内容仅为原创交互和事实摘要，不提供私人手册或原图。</p></details>
 <details id="cabinet-coverage" class="cabinet-evidence"><summary>1A 逐节覆盖与待证据注册表</summary>
 <p>已进行整章版本、来源和交互回归验收核对，仍标基础版 / 完善中，不等于整章完整覆盖。本轮发现并登记供电标注冲突；实际发布与回归结果见精确提交的验证记录。未解决电气疑点不作为选型或接线依据。机柜安装、温度和一般长度不再作为章节推进门槛；后续聚焦版本明确的接线、接口、规格与延时条件。</p>
 <ul><li>§1.1 · PDF 16：独立/入柜用途与人员条件已摘要；不授予操作资质。</li><li>§1.2 / 附录 · PDF 17–23、35–36：尺寸来源分列、侧板/门类别、门状态和照明依赖已覆盖；真实机械模型和完整维修/搬运条件未建立。</li><li>§1.3 · PDF 24：两种配置约重及独立机箱约重已列；不推算空柜、楼板负荷或吊装选型。</li><li>§1.4 · PDF 24–28：V2 与旧柜差异、接地位置、组件身份已摘要；交流电路图不复刻，不提供真实电源接线。</li><li>§1.5 · PDF 28–32：独立双轨电源、版本化长度和六种卡预算已交互；未定代际/缺失功耗的卡不强行纳入。20 个 I/O 端口及 LC 双工光连接归入 NovaCor 版本接口说明，不计入本页完整覆盖；PDF 29 光纤单位疑点不参与选型。</li><li>§1.6 · PDF 32：手册列出功耗与重复计数检查已覆盖；120 W 附件包含范围未定，参考和不是整柜 AC 需求。</li><li>§1.7–1.8 · PDF 33–34：入口位置、侧板 LED 约束和前板辨识已覆盖；不提供填充率、弯曲半径或完整维修步骤。</li><li>§1.9 · PDF 34：温湿度、非冷凝与清洁条件已检查；不是传感器或环境验收。</li><li>§1.10 · PDF 34：仅记录手册声明机柜遵循所列电气安全标准；网页、原创示意与现场安装均未因此获认证。</li></ul>
 <h4>已登记但不作为实物额定 / 接线依据的疑点</h4><ul><li>PDF 25–26 与 28：24 V / 3.8 A 图示和 100 W 正文不一致。保留正文阈值仅作教学算术，不能确认真实供电能力；详见预算旁警示。</li><li>PDF 28：电源线“16 feet / 4 m”不等值；插头描述中的料号与链接参数不一致。不选择其一作为正确值。</li><li>PDF 29：光纤单位“62.5/125 nm wavelength”疑似排印问题，不擅自更正，也不据此匹配光纤。</li><li>PDF 32：GTFPI / GTSYNC 未注明代际；GTAI V1 缺功耗；不得用别的版本补齐。120 W 空 NovaCor 配置基线是否包含附件与 I/O 负荷未明确。</li><li>PDF 17–18 与 36：两组尺寸分别保留；完整突出件、维护净距、固定和承载条件未获得证据。</li></ul></details></details>`;
 initCabinetComponents(root.querySelector('#cabinet-components'));
 initCabinetDimensions(root.querySelector('#cabinet-dimensions'));
 initCabinetDoor(root.querySelector('#cabinet-door'));
 initCabinetChassis(root.querySelector('#cabinet-chassis'));
 initCabinetEnvironment(root.querySelector('#cabinet-environment'));
 initCabinetAccess(root.querySelector('#cabinet-access'));
 const inputs=[...root.querySelectorAll('[data-rail]')];
 function update(){for(const side of ['left','right']){const entries=inputs.filter(x=>x.dataset.rail===side).map(x=>[x.dataset.card,x.value===''?NaN:Number(x.value)]),result=railBudget(Object.fromEntries(entries)),out=document.getElementById('cabinet-'+side),meter=out.previousElementSibling;inputs.filter(x=>x.dataset.rail===side).forEach(x=>x.setAttribute('aria-invalid',String(!Number.isSafeInteger(Number(x.value))||x.value===''||Number(x.value)<0||Number(x.value)>1000)));out.dataset.status=result.status;out.textContent=result.status==='invalid'?'请输入 0–1000 的整数数量；当前预算无效。':`${result.watts} / 100 W · ${result.amps.toFixed(2)} A · ${result.remaining<0?'超出 '+(-result.remaining):'余量 '+result.remaining} W${result.status==='over'?' — 超过正文教学阈值':' — 仅正文功率预算范围内，实物额定待核对'}`;meter.value=result.watts||0;meter.hidden=result.status==='invalid';
 const space=railSpaceBudget(Object.fromEntries(entries),side),spaceOut=document.getElementById(`cabinet-${side}-space`),map=root.querySelector(`[data-space-map="${side}"]`);
 spaceOut.dataset.status=space.status;map.dataset.status=space.status;map.replaceChildren();
 if(space.status==='invalid'){spaceOut.textContent='数量无效，无法检查长度。';continue;}
 spaceOut.textContent=`${(space.usedMm/10).toFixed(1)} / ${space.capacityMm/10} cm · ${space.remainingMm<0?'超出 '+(-space.remainingMm/10).toFixed(1):'余量 '+(space.remainingMm/10).toFixed(1)} cm${space.status==='over'?' — 超过本轨名义长度':' — 仅名义长度范围内'}`;
 // Only render the visible portion. Even 6,000 valid cards must not create
 // thousands of DOM nodes or cause the document to overflow horizontally.
 let visibleMm=0;
 for(const [key,count] of entries){for(let n=0;n<count&&visibleMm<space.capacityMm;n++){
  const block=document.createElement('span');block.className='cabinet-space-block';block.dataset.card=key;
  block.style.width=`${cards[key].lengthMm/space.capacityMm*100}%`;block.textContent=String(n+1);map.append(block);visibleMm+=cards[key].lengthMm;
 }}
 }}
 function preset(name){inputs.forEach(x=>x.value='0');if(name==='normal')inputs.filter(x=>x.dataset.card==='gtaov2').forEach(x=>x.value='2');if(name==='over')inputs.find(x=>x.dataset.rail==='left'&&x.dataset.card==='gtaov2').value='7';if(name==='space')inputs.filter(x=>x.dataset.card==='gtdov2').forEach(x=>x.value='7');if(name==='mixed')inputs.filter(x=>['gtdiv111','gtdov121','gtdiv2','gtdov2'].includes(x.dataset.card)).forEach(x=>x.value='1');if(name==='legacy-space')inputs.filter(x=>x.dataset.card==='gtdov121').forEach(x=>x.value='5');if(name==='boundary')inputs.find(x=>x.dataset.rail==='left'&&x.dataset.card==='gtdov2').value='20';update();}
 root.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.preset)));inputs.forEach(x=>x.addEventListener('input',update));
 const rear=document.getElementById('cabinet-rear'),local=document.getElementById('cabinet-local'),lights=document.getElementById('cabinet-light-state');function lighting(){const s=lightState(rear.checked,local.checked);lights.textContent=`蓝色 LED：${s.blue?'ON':'OFF'} · 内部灯条：${s.internal?'ON':'OFF'}${!s.blue&&local.checked?'（后部 LED 开关关闭，本地开关不能单独点亮）':''}`;lights.dataset.on=String(s.internal);}rear.addEventListener('change',lighting);local.addEventListener('change',lighting);preset('normal');lighting();
}
