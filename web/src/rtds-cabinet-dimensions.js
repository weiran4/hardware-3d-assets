// Cubicle V2: PDF 17–18 outline annotations; PDF 36 frame reference only.
// Integer micrometres preserve the stated inch annotations on conversion.
const sources={nominal:[584200,825500,1905000],frame:[590042,827532,1909826]};
export function dimensionComparison({source,rotated,width,depth,height}){
 if(!Object.hasOwn(sources,source)||typeof rotated!=='boolean'||![width,depth,height].every(n=>Number.isFinite(n)&&n>0&&n<=100000))return {status:'invalid'};
 const [w,d,h]=sources[source],dimensions={width:(rotated?d:w)/1000,depth:(rotated?w:d)/1000,height:h/1000};
 const differences=Object.fromEntries(Object.entries({width,depth,height}).map(([key,value])=>[key,value-dimensions[key]]));
 return {status:Object.values(differences).some(n=>n<0)?'smaller':Object.values(differences).some(n=>n===0)?'equal':'greater',dimensions,differences};
}
export function configuredMass(configuration){
 return configuration==='one'?{kg:185,lb:408}:configuration==='two'?{kg:198,lb:436}:null;
}
export function initCabinetDimensions(root){
 root.innerHTML=`<h4 id="cabinet-dimensions-heading">外形参考 · 标注尺寸不等于安装净空</h4>
 <p class="cabinet-note">Cubicle V2 · PDF 17–18 标注宽 23 × 深 32.5 × 高 75 in；PDF 36 框架参考图标注 23.23 × 32.58 × 75.19 in。<b>两组数值分别保留，不猜测差异原因。</b>附录高度尺寸线不包含上方突出的吊环；两组数据均不能当作完整搬运外包络。以下只比较标注数值，不判断“放得下”。</p>
 <div class="cabinet-tabs"><button type="button" data-dimension-preset="normal">数值例：700 × 1000 × 2100 mm</button><button type="button" data-dimension-preset="small">错误例：宽度仅 580 mm</button><button type="button" data-dimension-preset="equal">边界例：等于正文标注</button></div>
 <div class="cabinet-dimensions-layout"><div>
 <label for="cabinet-dimensions-source">标注来源（不是完整外包络）</label><select id="cabinet-dimensions-source"><option value="nominal">正文示意 · PDF 17–18</option><option value="frame">框架参考 · PDF 36（不含吊环突出高度）</option></select>
 <label class="cabinet-dimensions-turn"><input id="cabinet-dimensions-rotated" type="checkbox"> 交换宽 / 深数值（非搬运演示）</label>
 <div class="cabinet-dimensions-inputs">${[['width','宽'],['depth','深'],['height','高']].map(([key,label],i)=>`<label>${label}方向比较值（mm）<input id="cabinet-dimensions-${key}" type="number" min="0" max="100000" step="any" value="${[700,1000,2100][i]}" aria-describedby="cabinet-dimensions-result"></label>`).join('')}</div>
 <output id="cabinet-dimensions-result" aria-live="polite" aria-atomic="true"></output>
 </div><figure class="cabinet-dimensions-figure"><svg viewBox="0 0 300 240" role="img" aria-labelledby="cabinet-dimensions-map-title"><title id="cabinet-dimensions-map-title">标注宽深与输入值的原创比例示意，不是安装图</title><rect data-dimension-envelope fill="none" stroke="#9b6c43" stroke-width="2" stroke-dasharray="6 4"/><rect data-dimension-body fill="#bcd9dd" fill-opacity=".6" stroke="#34717b" stroke-width="2"/></svg><figcaption>俯视数值示意：蓝色＝所选标注宽深；虚线＝输入比较值。仅矩形比例，不含实际门板、突出件、线缆或维护区域；高方向另见文字。</figcaption></figure></div>
 <p id="cabinet-dimensions-values" class="cabinet-note"></p>
 <p class="cabinet-note"><b>即使三个输入均较大，也不是安装合格结论。</b>数值差不等于可用净空，未计门开合、吊环、线缆弯曲、散热/检修距离、包装、路径转弯和公差。没有经核对的完整外包络、搬运方法、锚固及承载条件，本工具不提供吊装、倾斜、拆件过门或带电操作步骤。换算采用 1 in = 25.4 mm；更多换算小数不代表原标注精度提高。</p>
 <div class="cabinet-dimensions-mass"><label for="cabinet-dimensions-mass">配置重量参考 · PDF 24 §1.3</label><select id="cabinet-dimensions-mass"><option value="one">机柜 + 1 个机箱</option><option value="two">机柜 + 2 个机箱</option></select><output id="cabinet-dimensions-mass-result"></output><p class="cabinet-note">均为手册约数，保留原始 kg / lb 对值，不相减推算空柜、不外推其他配置，也不用于地板载荷或搬运设备选型。相关工作仅限具备培训和经验的专业人员；这里不是操作指南。</p></div>`;
 const source=root.querySelector('#cabinet-dimensions-source'),rotated=root.querySelector('#cabinet-dimensions-rotated'),fields=Object.fromEntries(['width','depth','height'].map(k=>[k,root.querySelector(`#cabinet-dimensions-${k}`)]));
 const out=root.querySelector('#cabinet-dimensions-result'),values=root.querySelector('#cabinet-dimensions-values'),svg=root.querySelector('svg');
 const fmt=n=>n!==0&&Math.abs(n)<0.000001?n.toExponential(2):Number(n.toFixed(6)).toString();
 function update(){
  const input=Object.fromEntries(Object.entries(fields).map(([k,f])=>[k,f.value===''?NaN:Number(f.value)])),r=dimensionComparison({...input,source:source.value,rotated:rotated.checked});
  for(const [key,field] of Object.entries(fields))field.setAttribute('aria-invalid',String(!Number.isFinite(input[key])||input[key]<=0||input[key]>100000));
  out.dataset.status=r.status;svg.toggleAttribute('hidden',r.status==='invalid');
  if(r.status==='invalid'){out.textContent='请输入大于 0 且不超过 100000 mm 的有效比较值；当前不显示尺寸比较。';values.textContent='输入无效；没有可用的比较结论。';return;}
  const labels={width:'宽',depth:'深',height:'高'};
  out.textContent=Object.entries(r.differences).map(([k,n])=>`${labels[k]}方向数值差 ${n>0?'+':''}${fmt(n)} mm`).join(' · ')+'。'+({greater:'三个输入均大于所选标注数值；仍不能判断设备可放入。',smaller:'至少一个输入小于所选标注数值；不构成任何通过/安装许可。',equal:'至少一项恰好等于标注数值；零差值不是可用净空。'}[r.status]);
  values.textContent=`当前来源：${source.value==='nominal'?'PDF 17–18 正文标注':'PDF 36 框架参考（高度不含吊环突出部分）'}；${rotated.checked?'宽深已交换，':''}宽 ${fmt(r.dimensions.width)} × 深 ${fmt(r.dimensions.depth)} × 高 ${fmt(r.dimensions.height)} mm。`;
  const scale=Math.min(260/Math.max(input.width,r.dimensions.width),200/Math.max(input.depth,r.dimensions.depth));
  for(const [selector,w,d] of [['[data-dimension-envelope]',input.width,input.depth],['[data-dimension-body]',r.dimensions.width,r.dimensions.depth]]){
   const rect=root.querySelector(selector);for(const [k,v] of Object.entries({x:20,y:20,width:w*scale,height:d*scale}))rect.setAttribute(k,String(v));
  }
 }
 for(const control of [source,rotated,...Object.values(fields)]){control.addEventListener('input',update);control.addEventListener('change',update);}
 root.querySelectorAll('[data-dimension-preset]').forEach(button=>button.addEventListener('click',()=>{
  source.value='nominal';rotated.checked=false;const p=button.dataset.dimensionPreset,d=p==='equal'?[584.2,825.5,1905]:p==='small'?[580,1000,2100]:[700,1000,2100];Object.values(fields).forEach((f,i)=>f.value=String(d[i]));update();
 }));
 const mass=root.querySelector('#cabinet-dimensions-mass');function massUpdate(){const m=configuredMass(mass.value);root.querySelector('#cabinet-dimensions-mass-result').textContent=m?`约 ${m.kg} kg / ${m.lb} lb（${mass.value==='one'?'1':'2'} 个机箱配置）`:'该配置没有经核对的重量参考。';}mass.addEventListener('change',massUpdate);update();massUpdate();
}
