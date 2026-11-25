import {createLightBenchScene} from './rtds-light-bench-scene.js';
import {defaultLightUdp,evaluateLightUdp,stepLightUdp} from './rtds-light-udp-state.js';
export function mountLightUdp(root){
 const host=document.createElement('section');host.className='lightudp-bench';root.append(host);
 host.innerHTML=`<h3>第39页 · Light ETH → UDP接收电脑</h3><p>专用ETH铜SFP接口经RJ45网线直连电脑，或经过以太网交换机。WIF是独立的工作站管理接口。下面只生成浏览器内的虚构数据事件，绝不发送真实网络报文。</p><div class="lightbench-controls"><label>路径<select data-lightudp="topology"><option value="direct">直接连接</option><option value="switch">经普通交换机</option></select></label><label>Light接口<select data-lightudp="port"><option value="eth">ETH · 专用UDP</option><option value="wif">WIF · 工作站管理（错误示例）</option></select></label><label>连接介质<select data-lightudp="medium"><option value="copper">受支持铜SFP + RJ45网线</option><option value="fiber">误用光纤</option></select></label><label>示例目标UDP端口<input data-lightudp="destinationPort" type="number" min="1" max="65535" step="1"></label><label>接收程序监听端口<input data-lightudp="receiverPort" type="number" min="1" max="65535" step="1"></label><label><input data-lightudp="listener" type="checkbox">接收程序已监听</label><label><input data-lightudp="identitiesDistinct" type="checkbox">UDP接口独立IP/MAC已配置且无冲突（前提）</label></div><div class="lightbench-actions"><button data-lightudp-connect>接上网线</button><button data-lightudp-play>播放示意</button><button data-lightudp-step>生成一个示例数据事件</button><button data-lightudp-reset>清零示例</button><button data-lightudp-retry hidden>重试3D</button></div><output class="lightudp-status" aria-live="polite"></output><div class="lightudp-stage lightbench-stage" role="group" aria-label="NovaCor Light专用ETH、WIF对照、交换机和UDP接收电脑三维功能示意"><p class="lightudp-loading">选择课程后加载3D…</p></div><p class="lightudp-counter" aria-live="polite"></p><svg class="lightudp-plot" viewBox="0 0 240 60" role="img" aria-label="浏览器内虚构的归一化样本曲线，非测量或网络记录"><line x1="0" y1="30" x2="240" y2="30" stroke="#aabcc7"/><polyline fill="none" stroke="#16617b" stroke-width="2"/></svg><p>曲线是无单位虚构样本，横轴为事件顺序，不是时间；计数不是吞吐率。动画速度不表示链路速率、延时或实时保证。</p><ul class="lightudp-issues"></ul><details><summary>版本、来源与通信前提</summary><p>来源：课件第39页；Light手册PDF109–110、127。ETH通过受支持铜以太网SFP配接RJ45网线；WIF为另一接口。各适用UDP接口的IP和MAC需要独立配置、保持唯一，不照抄WIF或其他机箱。勾选框只表示教学前提，没有实际修改任何地址或系统设置。</p><p>真实通信还需核对收发网络可达性、接收程序、应用数据格式、模型配置及网络访问规则。本例把这些额外条件视为已满足，不能据此确认实机可用；UDP应用不保证交付或顺序。普通交换机仅示意链路转接，不添加模型间耦合或对时能力。</p><p>当前仅单向记录路径的基础接线练习。课件所列共同仿真（co-simulation）需要相应双向应用与模型配置，本页没有验证或模拟闭环。功能锚点不是实物端口坐标。第39页仍是部分覆盖；完整通道、配置、真实采样与端到端测试待补。</p></details>`;
 let state={...defaultLightUdp},scene=null,active=false,disposed=false,busy=false,playing=false,phase=0,last=0,frame=0,generation=0,visual=null,count=0,values=[],deviceView='all';
 const stage=host.querySelector('.lightudp-stage'),loading=host.querySelector('.lightudp-loading'),play=host.querySelector('[data-lightudp-play]'),retry=host.querySelector('[data-lightudp-retry]'),media=matchMedia('(prefers-reduced-motion: reduce)');
 const closeupNames={moxa:'Moxa EDS-205A 实物外观三维近看 · 未接线','dell-front':'Dell OptiPlex 7080 Micro 正面 · 未接线','dell-rear':'Dell OptiPlex 7080 Micro 背板 · 未接线'};
 const isInspecting=()=>Object.hasOwn(closeupNames,deviceView);
 const overviewName=stage.getAttribute('aria-label'),stepButton=host.querySelector('[data-lightudp-step]');
 function updateViewControls(ready){
  stage.setAttribute('aria-label',closeupNames[deviceView]??overviewName);
  play.disabled=!scene||!ready||media.matches||isInspecting();
  stepButton.disabled=!ready||isInspecting();
 }
 function setDeviceView(e){deviceView=e?.detail?.id??'all';if(isInspecting())pause();updateViewControls(evaluateLightUdp(state).ready);}
 stage.addEventListener('lightbench-device-view',setDeviceView);
 function pause(){playing=false;cancelAnimationFrame(frame);frame=0;last=0;host.dataset.playing='false';play.textContent='播放示意';play.setAttribute('aria-pressed','false');}
 function paint(){const r=evaluateLightUdp(state);host.dataset.status=r.status;host.dataset.physical=String(r.physical);host.dataset.count=String(count);
 for(const el of host.querySelectorAll('[data-lightudp]')){const k=el.dataset.lightudp;if(el.type==='checkbox')el.checked=!!state[k];else el.value=state[k];}
 host.querySelector('[data-lightudp-connect]').textContent=state.connected?'拔下网线':'接上网线';
 host.querySelector('.lightudp-status').textContent=r.ready?'连线条件通过 / 接收条件通过（仅离线示意）':r.physical?'连线条件通过 / 应用接收条件未通过':state.connected?'接口或介质不匹配 / 没有有效接收路径':'未连线 / 没有接收路径';
 host.querySelector('.lightudp-counter').textContent=`本地示例接收事件：${count}；不是真实网络数据。`;
 host.querySelector('.lightudp-plot polyline').setAttribute('points',values.map((v,i)=>`${5+i*10},${30-v*23}`).join(' '));
 host.querySelector('.lightudp-issues').replaceChildren(...r.issues.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
 const links=[];if(state.connected){const network=state.medium==='copper'?'ethernet':'fiber';if(state.topology==='switch')links.push({a:'L.'+state.port,b:'SW.a',network},{a:'SW.b',b:'PC.eth',network});else links.push({a:'L.'+state.port,b:'PC.eth',network});}
 visual={mode:'udp',topology:state.topology,reading:r.ready?'RX READY':'NO RECEIVE',links,enabled:{ethernet:r.ready,fiber:false}};scene?.setActive(active&&!document.hidden);scene?.update(visual,phase);
 updateViewControls(r.ready);return r;
 }
 function step(){if(isInspecting()||!evaluateLightUdp(state).ready)return;values=stepLightUdp(state,values,count);count++;paint();}
 function tick(t){if(!playing||!active||document.hidden||isInspecting()){pause();return;}const next=phase+(last?(t-last)/1800:0);last=t;phase=next%1;if(next>=1)step();else scene?.update(visual,phase);frame=requestAnimationFrame(tick);}
 function start(){if(isInspecting()||!active||!scene||media.matches||!evaluateLightUdp(state).ready)return;playing=true;host.dataset.playing='true';play.textContent='暂停示意';play.setAttribute('aria-pressed','true');frame=requestAnimationFrame(tick);}
 function reset(){phase=0;count=0;values=[];paint();}
 host.querySelectorAll('[data-lightudp]').forEach(el=>el.onchange=()=>{pause();const k=el.dataset.lightudp;state[k]=el.type==='checkbox'?el.checked:['destinationPort','receiverPort'].includes(k)?Number(el.value):el.value;reset();});
 host.querySelector('[data-lightudp-connect]').onclick=()=>{pause();state.connected=!state.connected;reset();};play.onclick=()=>playing?pause():start();stepButton.onclick=()=>{if(isInspecting())return;pause();phase=(phase+.25)%1;step();};host.querySelector('[data-lightudp-reset]').onclick=()=>{pause();reset();};
 function failed(){pause();scene?.dispose();scene=null;setDeviceView();stage.dataset.loaded='false';loading.hidden=false;loading.textContent='3D不可用，接线与接收条件检查仍可使用。';retry.hidden=false;paint();}
 async function load(){if(disposed||busy)return;busy=true;const token=++generation;retry.hidden=true;try{const next=await createLightBenchScene(stage,()=>{loading.hidden=true;});if(disposed||token!==generation){next.dispose();return;}scene=next;paint();if(active)scene.paintStatic();}catch{if(!disposed)failed();}finally{busy=false;}}
 retry.onclick=load;stage.addEventListener('lightbench-scene-error',failed);const visibility=()=>{if(document.hidden)pause();paint();};document.addEventListener('visibilitychange',visibility);const reduce=()=>{pause();paint();};media.addEventListener('change',reduce);const io=new IntersectionObserver(es=>{if(!es[0].isIntersecting)pause();});io.observe(stage);
 pause();paint();return {setActive(v){const changed=active!==!!v;active=!!v;if(!active)pause();if(changed){paint();if(active&&scene)scene.paintStatic();}if(active&&!scene&&!busy)load();},dispose(){disposed=true;++generation;pause();scene?.dispose();io.disconnect();media.removeEventListener('change',reduce);document.removeEventListener('visibilitychange',visibility);stage.removeEventListener('lightbench-scene-error',failed);stage.removeEventListener('lightbench-device-view',setDeviceView);host.remove();}};
}
