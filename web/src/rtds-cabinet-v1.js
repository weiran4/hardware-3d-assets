// Original offline connection-category teaching; private source media are not shipped.
const paths=Object.freeze({
 feed:{name:'首卡 24 V 供电',from:'机柜 DIN 导轨的 24 V DC 供电连接',to:'首张 I/O 卡的电源接口',kind:'power',cable:'配套电源线；不是光纤',detail:'先识别本卡型号的电源接口，再核对实物标识与该卡章节。此处不指定通用上下位置或针脚顺序。'},
 jumper:{name:'后续卡电源跳线',from:'前卡的供电连接',to:'后卡的电源接口',kind:'power',cable:'随 I/O 卡提供的配套电源跳线',detail:'供电线束逐卡连接，不是 GT 数据级联；不可据此推断所有型号插座的物理位置或针序。'},
 optical:{name:'主机与板卡 GT 通信',from:'NovaCor 的 I/O 光通信端口',to:'对应 I/O 卡的 GT 光通信接口',kind:'gt',cable:'SFP LC / LC–LC 多模双工光连接',detail:'这是数据链路，不给板卡提供 24 V 电源。端口号、级联卡型与数量还须核对主机和板卡版本；供电完成不等于通信或仿真已就绪。'}
});
const targets={unknown:'尚未选择',power:'板卡电源接口',gt:'板卡 GT 光通信接口',signal:'外部信号端子'};
const powerStates={unknown:'尚未确认',off:'假设已断电',on:'假设仍带电'};
export function checkV1Connection(link,target,power){
 if(!Object.hasOwn(paths,link)||!Object.hasOwn(targets,target)||!Object.hasOwn(powerStates,power))return {status:'invalid'};
 if(target==='unknown')return {status:'unknown'};
 if(target!==paths[link].kind)return {status:'mismatch'};
 if(paths[link].kind==='power'&&power==='on')return {status:'blocked'};
 if(paths[link].kind==='power'&&power==='unknown')return {status:'unknown'};
 return {status:'match'};
}
export function initCabinetV1(){
 const root=document.getElementById('rtds-chapter-1b');
 root.innerHTML=`<header class="cabinet-heading"><div><p class="eyebrow">1B · CUBICLE V1 · 20250417</p><h3 id="cabinet-v1-heading" tabindex="-1">供电线与 GT 光纤，是两条不同的连接。</h3><p>接线基础版 · PDF 53–55 §1.7 · 不操作真实设备</p></div></header>
 <p class="cabinet-note">先判断连接的作用，再找对应接口。机柜供电接到板卡电源口；光纤接到 GT 光口。不能把板卡供电、GT 数据链路和外部信号端子当成同一种连接。</p>
 <div class="cabinet-wiring-grid"><article><h4>选择连接任务</h4><label>连接任务<select id="v1-link">${Object.entries(paths).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select></label><label>你选择的终点<select id="v1-target">${Object.entries(targets).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>插拔电源线前的状态<select id="v1-power">${Object.entries(powerStates).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label></article><article><h4>已核对的连接角色</h4><p id="v1-path" class="wiring-path"></p><p id="v1-cable"></p><p id="v1-detail"></p></article><article><h4>检查类别，不批准实际接线</h4><output id="v1-result" aria-live="polite" aria-atomic="true"></output><p>“类别匹配”只核对本页选择，不证明针脚、极性、额定值、兼容性或实物状态已确认。</p></article></div>
 <div class="cabinet-tabs"><button type="button" data-v1-example="normal">正常例：断电后接首卡电源</button><button type="button" data-v1-example="wrong">错误例：光纤接电源口</button><button type="button" data-v1-example="live">错误例：仍带电插拔电源线</button><button type="button" data-v1-example="reset">重置选择</button></div>
 <p><a href="#rtds-power-lesson">查看既有 GTAO V2 双卡真实模型接法 ↗</a> · <a href="#rtds-interface:novacor-2.0:gtio">查看 NovaCor 2.0 的 GT I/O 接口 ↗</a></p>
 <p class="cabinet-note">双卡动画采用 PDF 55 图1.18的特定布局和 GTAO V2 模型；不是所有板卡统一接法，尤其不能照搬为 GTDI 的上下供电口位置。下部接头空间针序未核对，不在此补画。GND 返回线不等于 PE 保护地；不假定 DC 负极与 PE 相连。真实电源插拔前须断电，本页状态只是离线假设。</p>
 <details class="cabinet-evidence"><summary>版本、规格和待核对项</summary><ul><li>1B 修订20250417，PDF53–54列24 V DC / 100 W I/O电源。PDF44–45、47–48图示标24 V / 4.3 A，PDF46照片标4.2 A，彼此及100 W正文口径不能直接合并。这里不计算额定电流、余量、共享容量或电源数量。</li><li>PDF43：2024年10月起的V1采用单断路器，移除烟雾探测器和机械接触器，I/O及LED控制移至后部。PDF54称更早机柜I/O开关在前部；不能说所有V1都在前，也不能把V2控制图套过来。</li><li>PDF54：NovaCor有20个I/O光端口，SFP LC、LC–LC多模双工。原文“62.5/125 nm wavelength”疑似排印问题，不当作已核实波长或纤芯规格，不擅自修正。图1.17标题误写“Smoke Detector Details”，控制用途以正文及图中标识核对。</li><li>本章没有给出这条供电/通信路径的端到端延时；不从网页动画或其他卡的采样周期推算。具体信号端子和时序在对应硬件版本章节展开。</li></ul></details>
 <details class="cabinet-evidence"><summary>本单元覆盖与推进边界</summary><p>已覆盖首卡供电、后卡跳线、GT光通信的角色区分，正确/错口/带电/未确认情景及已存在真实模型关联。交流接线、保护回路维修、具体各卡针脚与完整级联配置不在这个基础单元中；不冒称整章完整。尺寸、温湿度、门板安装和一般线长不作为接线教学推进门槛。来源：1B PDF37–64，重点53–55；板卡断电约束见对应GTAO/GTDI章节。</p></details>`;
 const link=root.querySelector('#v1-link'),target=root.querySelector('#v1-target'),power=root.querySelector('#v1-power'),out=root.querySelector('#v1-result');
 function update(){const record=paths[link.value],result=checkV1Connection(link.value,target.value,power.value);out.dataset.status=result.status;root.querySelector('#v1-path').textContent=record?record.from+(record.kind==='gt'?' ↔ ':' → ')+record.to:'选择无效';root.querySelector('#v1-cable').textContent=record?.cable||'';root.querySelector('#v1-detail').textContent=record?.detail||'';power.disabled=record?.kind==='gt';out.textContent={invalid:'选择无效，请重新选择。',unknown:'尚未确认连接终点或断电条件，不判断匹配。',mismatch:'接口类别错配：供电、光通信和外部信号端子不能互换。',blocked:'条件不符：仍带电时不得插拔板卡电源线。',match:'类别匹配；仍须核对本卡版本、实物接口和实际断电状态。'}[result.status];}
 for(const control of [link,target,power])control.addEventListener('change',update);
 root.querySelectorAll('[data-v1-example]').forEach(button=>button.addEventListener('click',()=>{link.value=button.dataset.v1Example==='wrong'?'optical':'feed';target.value=button.dataset.v1Example==='reset'?'unknown':'power';power.value=button.dataset.v1Example==='reset'?'unknown':button.dataset.v1Example==='live'?'on':'off';update();}));update();
}
