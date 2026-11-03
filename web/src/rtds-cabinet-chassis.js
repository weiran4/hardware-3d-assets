// Cubicle V2, revision 20260506, PDF 32 §1.6. A scope-reading exercise,
// not a complete AC load model: baseline inclusions remain unestablished.
export function chassisPowerReference({novacor,gtnet,population,countCardsAgain}){
 if(!Number.isInteger(novacor)||novacor<0||novacor>2||!Number.isInteger(gtnet)||gtnet<0||gtnet>1||!['one','two','three','unknown'].includes(population)||typeof countCardsAgain!=='boolean')return {status:'invalid'};
 const baselineWatts=120,novacorWatts=290*novacor;
 if(gtnet&&population!=='three')return {status:'unknown',baselineWatts,novacorWatts,gtnetWatts:null,referenceWatts:null,duplicateWatts:0};
 const gtnetWatts=90*gtnet,duplicateWatts=countCardsAgain?gtnet*3*18:0;
 return {status:duplicateWatts?'double-count':'reference',baselineWatts,novacorWatts,gtnetWatts,referenceWatts:baselineWatts+novacorWatts+gtnetWatts,duplicateWatts};
}

export function initCabinetChassis(root){
 root.innerHTML=`<h4 id="cabinet-chassis-heading">机箱功耗：先看包含范围，再相加。</h4>
 <p class="cabinet-note">Cubicle V2 · PDF 32 §1.6 · 手册修订 20260506。下面是<b>参考值与包含范围的练习</b>，不是整柜交流输入设计工具。</p>
 <div class="cabinet-chassis-ledger">
  <div><b>不含 NovaCor 的机柜</b><strong>≈ 120 W</strong><span>手册标为最大值；基线所含附件未逐项说明。</span></div>
  <div><b>每台 NovaCor 2.0 机箱</b><strong>≈ 290 W</strong><span>手册标为最大值；不外推到其他 NovaCor 版本。</span></div>
  <div><b>GTNET 机箱 + 3 张 GTNETx2</b><strong>≈ 90 W</strong><span>该值已包含三张卡；原文没有标为最大值。</span></div>
 </div>
 <div class="cabinet-tabs"><button type="button" data-chassis-preset="reference">参考例：2 台 NovaCor + 1 台满配 GTNET</button><button type="button" data-chassis-preset="double-count">错误例：把 GTNET 卡再加一次</button><button type="button" data-chassis-preset="unknown">缺证据例：GTNET 只有 2 张卡</button></div>
 <div class="cabinet-chassis-controls">
  <label>NovaCor 2.0 机箱数量<input id="cabinet-novacor-count" type="number" min="0" max="2" step="1" value="2" aria-describedby="cabinet-chassis-result"></label>
  <label>GTNET 机箱数量<input id="cabinet-gtnet-count" type="number" min="0" max="1" step="1" value="1" aria-describedby="cabinet-chassis-result"></label>
  <label>每台 GTNET 的 GTNETx2 数量<select id="cabinet-gtnet-population"><option value="unknown">未确认</option><option value="one">1 张（缺机箱参考值）</option><option value="two">2 张（缺机箱参考值）</option><option value="three" selected>3 张（90 W 对应配置）</option></select></label>
 </div>
 <label class="cabinet-chassis-trap"><input type="checkbox" id="cabinet-count-cards-again"> 试着把已包含的 GTNETx2 按每卡 18 W 再加一次</label>
 <output id="cabinet-chassis-result" aria-live="polite"></output>
 <p class="cabinet-chassis-assumption"><b>假设与限制：</b>算式仅假定上述机柜基线、NovaCor 2.0 与 GTNET 项彼此不重叠。手册没有完整界定 120 W 基线，也没有证明这个可加假设。<b>这个参考和不等于整柜最大输入功率</b>，更不是测量结果或供电许可。数量范围仅用于练习，不证明可安装的机箱数量。</p>
 <details><summary>为什么不把所有 W 都直接加在一起？</summary><p class="cabinet-note">90 W 是装有 3 张 GTNETx2 的机箱参考值，不能再加 3 × 18 W；也不能用 90 − 54 W 推断空机箱功耗，或据此估计其他卡数。上方导轨计算属于 24 V 侧，100 W 是本页采用的正文教学阈值，图示额定标注仍有冲突，不是已核实的实物容量，不是实际消耗。由于基线包含范围与转换损耗未确定，本练习不把导轨负荷或 2 × 100 W 自动加到参考和。其他附件、功率因数、启动电流及配电条件仍须另外核实；这里不计算交流电流、断路器、电缆或 UPS 选型。</p></details>`;
 const nc=root.querySelector('#cabinet-novacor-count'),gt=root.querySelector('#cabinet-gtnet-count'),population=root.querySelector('#cabinet-gtnet-population'),again=root.querySelector('#cabinet-count-cards-again'),result=root.querySelector('#cabinet-chassis-result');
 function update(){
  const novacor=nc.value===''?NaN:Number(nc.value),gtnet=gt.value===''?NaN:Number(gt.value);
  nc.setAttribute('aria-invalid',String(!Number.isInteger(novacor)||novacor<0||novacor>2));gt.setAttribute('aria-invalid',String(!Number.isInteger(gtnet)||gtnet<0||gtnet>1));
  population.disabled=gtnet===0;again.disabled=gtnet===0;
  const r=chassisPowerReference({novacor,gtnet,population:population.value,countCardsAgain:again.checked});result.dataset.status=r.status;
  if(r.status==='invalid'){result.textContent='数量无效：NovaCor 2.0 请输入 0–2 的整数，GTNET 请输入 0–1 的整数。当前不显示参考和。';return;}
  if(r.status==='unknown'){result.textContent='缺少这套 GTNET 配置的机箱参考值，不显示参考和。不能按卡数比例缩放 90 W，也不能把单卡 18 W 当作整个机箱。';return;}
  const expression=`120 + ${r.novacorWatts} + ${r.gtnetWatts} = ${r.referenceWatts} W`;
  result.textContent=r.status==='double-count'?`重复计数：额外的 ${r.duplicateWatts} W 已含在 GTNET 的 90 W 中，不再相加。按不重叠假设的参考和仍为 ${expression}；不是整柜额定值。`:`按不重叠假设的参考和：${expression}。约值组合，不是整柜额定值或最大需求。`;
 }
 for(const input of [nc,gt])input.addEventListener('input',update);for(const input of [population,again])input.addEventListener('change',update);
 root.querySelectorAll('[data-chassis-preset]').forEach(button=>button.addEventListener('click',()=>{nc.value='2';gt.value='1';population.value=button.dataset.chassisPreset==='unknown'?'two':'three';again.checked=button.dataset.chassisPreset==='double-count';update();}));update();
}
