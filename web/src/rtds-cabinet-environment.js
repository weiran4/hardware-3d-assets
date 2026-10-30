// Cubicle V2, revision 20260506, PDF reading page 34, section 1.9.
// This is a comparison of user-entered assumptions, never a sensor or approval.
export function environmentCheck({temperature,humidity,condensation,cleanliness}){
 const numeric=(value,min,max,physical)=>!Number.isFinite(value)||(physical&&(value<0||value>100))?'invalid':value<min||value>max?'outside':'within';
 const qualitative=(value,yes,no)=>value==='unknown'?'unknown':value===yes?'within':value===no?'outside':'invalid';
 const checks={temperature:numeric(temperature,15,30,false),humidity:numeric(humidity,30,60,true),condensation:qualitative(condensation,'none','present'),cleanliness:qualitative(cleanliness,'clean','not-clean')};
 const values=Object.values(checks);
 return {checks,status:['invalid','outside','unknown'].find(s=>values.includes(s))||'within'};
}

export function initCabinetEnvironment(root){
 root.innerHTML=`<h4 id="cabinet-env-heading">运行环境 · 数值合适，还要检查凝露与清洁</h4>
 <p class="cabinet-note" id="cabinet-env-scope">Cubicle V2 · PDF 34 §1.9（修订 20260506）。要求：环境温度 15–30 °C、相对湿度 30–60%、不凝露，且保持类似办公室的相对清洁环境。以下均为手动输入或情景假设，不是传感器读数；初始 22 °C / 45% 仅为示例。</p>
 <div class="cabinet-tabs"><button type="button" data-env-preset="normal">环境正常例：22 °C / 45%</button><button type="button" data-env-preset="lower">下边界：15 °C / 30%</button><button type="button" data-env-preset="upper">上边界：30 °C / 60%</button><button type="button" data-env-preset="condensation">错误例：数值正常但凝露</button></div>
 <div class="cabinet-env-grid">
 <div><label for="cabinet-env-temperature">环境温度（°C，手动输入）</label><input id="cabinet-env-temperature" type="number" step="any" value="22" aria-describedby="cabinet-env-temperature-result"><output id="cabinet-env-temperature-result"></output></div>
 <div><label for="cabinet-env-humidity">相对湿度（%，手动输入）</label><input id="cabinet-env-humidity" type="number" min="0" max="100" step="any" value="45" aria-describedby="cabinet-env-humidity-result"><output id="cabinet-env-humidity-result"></output></div>
 <div><label for="cabinet-env-condensation">凝露状况（用户判断）</label><select id="cabinet-env-condensation" aria-describedby="cabinet-env-condensation-result"><option value="unknown">尚未确认</option><option value="none">假设不凝露</option><option value="present">假设存在凝露</option></select><output id="cabinet-env-condensation-result"></output></div>
 <div><label for="cabinet-env-cleanliness">清洁状况（用户判断）</label><select id="cabinet-env-cleanliness" aria-describedby="cabinet-env-cleanliness-result"><option value="unknown">尚未确认</option><option value="clean">假设类似办公室的相对清洁</option><option value="not-clean">假设未达到该清洁条件</option></select><output id="cabinet-env-cleanliness-result"></output></div>
 </div><output id="cabinet-env-result" aria-live="polite" aria-atomic="true"></output>
 <p class="cabinet-note">数值在范围内不能推断“不凝露”或“清洁”。此工具不测量环境、不计算露点，也不代替现场判断；仅比较本页列出的运行环境条件，不构成设备开机许可、整柜安装合格结论或安全认证。</p>`;
 const fields=Object.fromEntries(['temperature','humidity','condensation','cleanliness'].map(key=>[key,root.querySelector(`#cabinet-env-${key}`)]));
 const descriptions={temperature:{within:'温度在 15–30 °C 范围内。',outside:'温度不在 15–30 °C 范围内。',invalid:'请输入有效温度数值。'},humidity:{within:'相对湿度在 30–60% 范围内。',outside:'相对湿度不在 30–60% 范围内。',invalid:'请输入 0–100% 的有效相对湿度。'},condensation:{within:'已假设不凝露，仍需现场确认。',outside:'存在凝露的假设不满足要求。',unknown:'尚未确认是否凝露。',invalid:'请选择有效的凝露状态。'},cleanliness:{within:'已假设满足办公室级相对清洁，仍需现场确认。',outside:'清洁条件的假设不满足要求。',unknown:'尚未确认清洁条件。',invalid:'请选择有效的清洁状态。'}};
 const summaries={within:'按当前输入与假设，四项列出条件均满足；不是实测或安全认证。',outside:'存在不满足的条件；查看各项结果，不可仅凭温湿度数值判断。',unknown:'条件尚未全部确认；温湿度在范围内也不能替代凝露与清洁判断。',invalid:'输入无效；请更正标出的项目，当前不能作完整比较。'};
 function update(){
  const result=environmentCheck({temperature:fields.temperature.value===''?NaN:Number(fields.temperature.value),humidity:fields.humidity.value===''?NaN:Number(fields.humidity.value),condensation:fields.condensation.value,cleanliness:fields.cleanliness.value});
  for(const [key,status] of Object.entries(result.checks)){
   const out=root.querySelector(`#cabinet-env-${key}-result`);out.dataset.status=status;out.textContent=descriptions[key][status];fields[key].setAttribute('aria-invalid',String(status==='invalid'));
  }
  const summary=root.querySelector('#cabinet-env-result');summary.dataset.status=result.status;summary.textContent=summaries[result.status];
 }
 for(const field of Object.values(fields)){field.addEventListener('input',update);field.addEventListener('change',update);}
 root.querySelectorAll('[data-env-preset]').forEach(button=>button.addEventListener('click',()=>{
  const preset=button.dataset.envPreset;fields.temperature.value=preset==='lower'?'15':preset==='upper'?'30':'22';fields.humidity.value=preset==='lower'?'30':preset==='upper'?'60':'45';fields.condensation.value=preset==='condensation'?'present':'none';fields.cleanliness.value='clean';update();
 }));
 update();
}
