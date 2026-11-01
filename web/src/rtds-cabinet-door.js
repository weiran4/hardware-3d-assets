// Cubicle V2 rev20260506, PDF22–23 §1.2.2. Offline sequencing, not a service simulator.
const graph=Object.freeze({closed:{open:'open'},open:{release:'released'},released:{remove:'detached'},detached:{seat:'seated'},seated:{align:'aligned'},aligned:{secure:'secured'},secured:{open:'open'}});
const actions=Object.freeze({open:'打开门（示意）',release:'按下上部锁销',remove:'将门移离（示意）',seat:'先让下部锁销入槽',align:'按住上部锁销并对位',secure:'释放上部锁销',reset:'重置教学状态'});
export function doorTransition(state,action){
 if(typeof state!=='string'||!Object.hasOwn(graph,state)||typeof action!=='string'||!Object.hasOwn(actions,action))return {state:null,status:'invalid'};
 if(action==='reset')return {state:'closed',status:'reset'};
 if(!Object.hasOwn(graph[state],action))return {state,status:'blocked'};
 return {state:graph[state][action],status:'advanced'};
}
const descriptions={
 closed:['门处于安装状态','上、下连接位置示意；未模拟真实门锁。'],
 open:['门已打开（示意）','下一项：按下上部锁销，使上部连接脱开。'],
 released:['上部连接已脱开（示意）','上部连接脱开后，才进入移离门的情景。门重、支撑与搬运过程不在此模拟。'],
 detached:['门已移离（示意）','重新装入时，先让下部锁销进入对应槽位。'],
 seated:['下部锁销已入槽（示意）','下部先就位；随后按住上部锁销，把门对到安装位置。'],
 aligned:['上部锁销按住，门已对位（示意）','下一项：释放上部锁销，完成本教学序列。'],
 secured:['教学复位序列完成','手册的上、下连接顺序已走完，不证明真实门已装牢或设备可投入运行。']
};
export function initCabinetDoor(root){
 root.innerHTML=`<h4 id="cabinet-door-heading">门的上、下锁销：拆下与装回的顺序不同</h4>
 <p class="cabinet-note">Cubicle V2 · PDF 22–23 §1.2.2（修订 20260506）。原创非比例状态图；不是实际门板模型、装配图或完整维修步骤。每次点击只改变教学状态，没有真实硬件时序。</p>
 <div class="cabinet-door-layout"><div class="cabinet-door-map" aria-hidden="true"><div class="door-frame">机柜框架</div><div class="door-sheet">门</div><span class="door-upper">上部锁销</span><span class="door-lower">下部锁销</span></div><div><output id="cabinet-door-state" aria-live="polite" aria-atomic="true"></output><p id="cabinet-door-detail" class="cabinet-note"></p><ol class="cabinet-door-order"><li>拆下：开门 → 上部脱开 → 移离。</li><li>装回：下部入槽 → 上部按住并对位 → 释放上部。</li></ol></div></div>
 <div class="cabinet-tabs">${Object.entries(actions).map(([key,label])=>`<button type="button" data-door-action="${key}">${label}</button>`).join('')}</div>
 <output id="cabinet-door-feedback" aria-live="polite" aria-atomic="true"></output>
 <p class="cabinet-note"><b>安全边界：</b>门板是一整块较重的部件，手册提示两人处理更安全（PDF 21）。仅具备相应训练/经验的人员按正式流程处理设备；这里没有模拟承重、支撑、夹伤间隙、受力、紧固检验或电气隔离。不要把画面的成功状态当作操作许可。侧板 LED 连接约束是另一个部件的内容，见上方入口比较，不把它虚构成此门锁销的一部分。</p>`;
 let state='closed';const map=root.querySelector('.cabinet-door-map'),out=root.querySelector('#cabinet-door-state'),detail=root.querySelector('#cabinet-door-detail'),feedback=root.querySelector('#cabinet-door-feedback');
 function render(){map.dataset.phase=state;out.dataset.phase=state;out.textContent=descriptions[state][0];detail.textContent=descriptions[state][1];root.querySelectorAll('[data-door-action]').forEach(b=>b.dataset.next=String(Object.hasOwn(graph[state],b.dataset.doorAction)));}
 root.querySelectorAll('[data-door-action]').forEach(button=>button.addEventListener('click',()=>{const result=doorTransition(state,button.dataset.doorAction);state=result.state;feedback.dataset.status=result.status;feedback.textContent=result.status==='blocked'?'顺序不符，状态保持不变。请先完成当前文字提示的动作；这不是模拟设备损坏。':result.status==='reset'?'已回到初始教学状态；未执行任何真实动作。':'已更新教学状态。';render();}));
 feedback.textContent='可按顺序练习，也可尝试提前移离或提前释放锁销，观察顺序检查。';render();
}
