// Cubicle V2, revision 20260506. Identity facts, not service or replacement instructions.
export const componentRecords=Object.freeze({
 front2:{name:'前部 2U 空白面板',mechanism:'screws',source:'PDF 33–34 §1.8',detail:'每块使用四颗前部螺钉，并带 LED 连接。前部空白面板不是侧板，也不是整扇门。'},
 front4:{name:'前部 4U 空白面板',mechanism:'screws',source:'PDF 33–34 §1.8',detail:'与 2U 一样，每块使用四颗前部螺钉，并带 LED 连接；不把 U 数换算成未经核实的外形或孔距。'},
 side:{name:'机柜侧板',mechanism:'quarter',source:'PDF 21–22 §1.2.1',detail:'四颗 90° 转动螺钉。完全移离侧板前须先断开该侧 LED 连接；左侧连接靠后、右侧连接靠前。不是整扇门的锁销流程。'},
 door:{name:'整扇门',mechanism:'latches',source:'PDF 22–23 §1.2.2',detail:'上、下锁销与槽位的关系见本章门状态教学。门是一整块较重部件；手册提示两人处理更安全。不要把侧板或前板的 LED 步骤擅自移用于门。'}
});
const mechanisms={unknown:'尚未选择',screws:'四颗前部螺钉',quarter:'四颗 90° 转动螺钉',latches:'上、下锁销'};
export const powerComponents=Object.freeze([
 {name:'断路器',maker:'Weidmuller',model:'9926252015'},
 {name:'I/O 电源',maker:'Delta',model:'DRS-24V100W1NR'},
 {name:'以太网交换机',maker:'TPLink',model:'TL-SG1024'},
 {name:'LED 调光电位器',maker:'TT Electronics',model:'P231-QC20BR100K'},
 {name:'LED 灯带',maker:'LED World',model:'FA60M28-10M-24V-B'},
 {name:'LED 电源',maker:'Mean Well',model:'HLG-100H-24B'},
 {name:'EMI 滤波器',maker:'TDK Lambda',model:'RSEN-2020D'}
]);
export function checkComponent(part,answer){
 if(typeof part!=='string'||!Object.hasOwn(componentRecords,part)||typeof answer!=='string'||!Object.hasOwn(mechanisms,answer))return {status:'invalid'};
 return {status:answer==='unknown'?'unknown':answer===componentRecords[part].mechanism?'match':'mismatch',expected:componentRecords[part].mechanism};
}
export function initCabinetComponents(root){
 root.innerHTML=`<h4 id="cabinet-components-heading">部件辨识：前板、侧板与门，不是同一种连接</h4>
 <p class="cabinet-note">Cubicle V2 · 修订 20260506 · 仅辨识事实，不是拆装操作许可。接地和电源组件在下方只读索引中；无真实针脚、受力或机械模型。</p>
 <div class="cabinet-component-layout"><div><label>要辨识的部件<select id="cabinet-component-part">${Object.entries(componentRecords).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select></label><label>这类部件使用哪一种连接？<select id="cabinet-component-answer">${Object.entries(mechanisms).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><div class="cabinet-tabs"><button type="button" data-component-example="normal">正常例：4U 前板与前部螺钉</button><button type="button" data-component-example="wrong">错误例：把门当成侧板</button><button type="button" data-component-example="reset">重置辨识</button></div></div><div class="cabinet-component-card"><h5 id="cabinet-component-name"></h5><p id="cabinet-component-facts"></p><p id="cabinet-component-source"></p><output id="cabinet-component-result" aria-live="polite" aria-atomic="true"></output></div></div>
 <details class="cabinet-component-reference"><summary>只读索引：接地位置与电源组件 · PDF 27–28</summary><div class="cabinet-component-ground"><h5>只定位，不指导接地施工</h5><p>主接地端子是黄绿端子块，位于电源入口组件最上方、断路器正上方。附加接地点位于机柜顶部四角：前端两处、后端两处，并有盖件。这里不提供接线顺序、导体规格、扭矩、接地连续性检验或设施接地设计。</p></div><p>下列为 PDF 28 的手册身份参考，不证明当前实物配置、替代件兼容性或额定参数；型号不可直接当采购/维修清单。</p><div class="cabinet-component-models">${powerComponents.map(c=>`<div><b>${c.name}</b><span>${c.maker}</span><code>${c.model}</code></div>`).join('')}</div></details>
 <p class="cabinet-note"><b>版本与使用边界：</b>仅具备相应训练/经验的人员按正式流程处理设备（PDF 16）。NovaCor 可独立使用或置于机柜；PDF 24 的 NovaCor 2.0 独立机箱约重为 13.6 kg / 30 lb，不能据此推算空柜重量。旧柜使用 Sola I/O 电源且 I/O 开关位于前部，不能套用到这里的 V2 后部控制（PDF 29）。所有例子只核对名称与连接类别，成功不意味着已安全拆装或可投入运行。</p>`;
 const part=root.querySelector('#cabinet-component-part'),answer=root.querySelector('#cabinet-component-answer'),result=root.querySelector('#cabinet-component-result');
 function update(){const record=componentRecords[part.value],check=checkComponent(part.value,answer.value);result.dataset.status=check.status;if(!record){result.textContent='部件选择无效；不推断连接方式。';return;}root.querySelector('#cabinet-component-name').textContent=record.name;root.querySelector('#cabinet-component-facts').textContent=record.detail;root.querySelector('#cabinet-component-source').textContent=record.source;result.textContent=check.status==='unknown'?'请先选连接类别；未选择不表示匹配。':check.status==='match'?'辨识匹配：'+mechanisms[check.expected]+'。只验证类别，不验证实际安装。':check.status==='mismatch'?'类别错配：此部件应辨识为“'+mechanisms[check.expected]+'”；不要借用另一部件的流程。':'选择无效；请重新选择。';}
 part.addEventListener('change',()=>{answer.value='unknown';update();});answer.addEventListener('change',update);
 root.querySelectorAll('[data-component-example]').forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.componentExample;part.value=type==='normal'?'front4':type==='wrong'?'door':'front2';answer.value=type==='normal'?'screws':type==='wrong'?'quarter':'unknown';update();}));update();
}
