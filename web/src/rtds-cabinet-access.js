// Cubicle V2, revision 20260506. PDF 21–22 and 33; offline assumptions only.
export const bottomOpeningMm=Object.freeze({width:304.8,height:76.2});
export function cableAccessCheck(input){
 if(!input||!['top','bottom','side'].includes(input.route)||!['installed','removed','unknown'].includes(input.panel)||!['connected','disconnected','unknown'].includes(input.led))return {status:'invalid'};
 if(input.route!=='side')return {status:'identified'};
 if(input.panel==='removed'&&input.led==='connected')return {status:'conflict'};
 if(input.panel==='installed')return {status:'blocked'};
 if(input.panel==='unknown'||input.led==='unknown')return {status:'unknown'};
 return {status:'illustrated'};
}
export function initCabinetAccess(root){
 root.innerHTML=`<h4 id="cabinet-access-heading">线缆从哪里进入？先区分开孔与侧板</h4>
 <p class="cabinet-note">Cubicle V2 · PDF 21–22 §1.2.1、PDF 33 §1.7（修订 20260506）。这里只比较入口位置和侧板约束；图为原创非比例示意，不是实际机柜模型、走线施工图或操作步骤。</p>
 <div class="cabinet-access-map" aria-label="三类入口位置示意，非比例">
 <div data-access-zone="top"><b>顶部 · 四角开孔</b><div class="access-top" aria-hidden="true"><i></i><i></i><i></i><i></i><span>俯视位置示意</span></div><small>四个顶部入口；本工具不提供孔径或线缆数量结论。</small></div>
 <div data-access-zone="bottom"><b>底部 · 矩形入口</b><div class="access-bottom" aria-hidden="true">12″ × 3″</div><small>手册图示尺寸：304.8 × 76.2 mm。不是可用线缆填充面积。</small></div>
 <div data-access-zone="side"><b>侧面 · 并柜之间</b><div class="access-side" aria-hidden="true"><span>机柜 A</span><i>侧板</i><span>相邻柜</span></div><small>侧板与其 LED 连接需分别考虑，不能当作常开孔。</small></div>
 </div>
 <div class="cabinet-tabs"><button type="button" data-access-preset="top">入口例：顶部</button><button type="button" data-access-preset="normal">侧面例：已移开且已断开</button><button type="button" data-access-preset="blocked">受阻例：侧板仍在</button><button type="button" data-access-preset="conflict">错误例：移开但 LED 仍连接</button></div>
 <div class="cabinet-access-controls">
 <label>比较入口<select id="cabinet-access-route"><option value="top">顶部四角</option><option value="bottom">底部入口</option><option value="side">侧面并柜</option></select></label>
 <label>侧板状态（情景假设）<select id="cabinet-access-panel"><option value="unknown">尚未确认</option><option value="installed">侧板仍安装</option><option value="removed">假设侧板已完全移开</option></select></label>
 <label>对应 LED 连接（情景假设）<select id="cabinet-access-led"><option value="unknown">尚未确认</option><option value="connected">假设仍连接</option><option value="disconnected">假设已断开</option></select></label>
 </div>
 <output id="cabinet-access-result" aria-live="polite" aria-atomic="true"></output>
 <p class="cabinet-note" id="cabinet-access-detail"></p>
 <p class="cabinet-note"><b>约束，不是操作许可：</b>手册要求在完全移开侧板前断开其 LED 连接，否则可能损坏连接器。左侧连接可从后门附近接近；右侧连接位于靠前部一侧（PDF 21–22，沿用手册方位文字，不据此推断针脚）。门板较重，手册建议两人处理；设备仅由具备相应训练/经验的人员按正式流程处理。本页不说明如何断电、拆装或带电接线，不以开关状态推断电气隔离。</p>
 <p class="cabinet-note">三个位置的选择不确定线缆实际路径、弯曲半径、填充率、隔离距离、承重或接地。正常情景仅表示列出的侧板/LED 假设不冲突，不能证明整柜安装安全；相邻柜的另一块侧板也需要独立核对。</p>`;
 const route=root.querySelector('#cabinet-access-route'),panel=root.querySelector('#cabinet-access-panel'),led=root.querySelector('#cabinet-access-led'),out=root.querySelector('#cabinet-access-result'),detail=root.querySelector('#cabinet-access-detail');
 const messages={identified:'已识别手册中的入口位置；是否适合这根线缆仍未判定。',blocked:'侧板仍在：不能把侧面当作开放通道。',conflict:'假设冲突：侧板已完全移开，但 LED 仍连接；存在拉扯连接器的风险。',unknown:'侧面条件未确认：不能据此认定通道已开放。',illustrated:'侧板已移开且 LED 已断开的情景已示意；仅这两项假设不冲突，不是安装许可。',invalid:'请选择有效的入口、侧板和 LED 状态。'};
 function update(){
  const side=route.value==='side';panel.disabled=!side;led.disabled=!side;
  const result=cableAccessCheck({route:route.value,panel:panel.value,led:led.value});out.dataset.status=result.status;out.textContent=messages[result.status];
  root.querySelectorAll('[data-access-zone]').forEach(zone=>zone.dataset.selected=String(zone.dataset.accessZone===route.value));
  detail.textContent=route.value==='top'?'顶部：四角各有一个入口（PDF 33）。侧板假设不参与此位置比较。':route.value==='bottom'?'底部：图示开口 12 × 3 英寸；按 1 英寸 = 25.4 mm 换算为 304.8 × 76.2 mm（PDF 33）。不进行线缆能否穿过的判定。':'侧面：相邻机柜的跨柜布线可利用移开的侧板位置（PDF 21–22）。这里只检查选定一侧的两个假设，不模拟拆装动作。';
 }
 for(const control of [route,panel,led])control.addEventListener('change',update);
 root.querySelectorAll('[data-access-preset]').forEach(button=>button.addEventListener('click',()=>{
  const preset=button.dataset.accessPreset;route.value=preset==='top'?'top':'side';panel.value=preset==='top'?'unknown':preset==='blocked'?'installed':'removed';led.value=preset==='top'?'unknown':preset==='normal'?'disconnected':'connected';update();
 }));update();
}
