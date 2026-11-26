import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {publishedModels} from './rtds-models.js';
import {createSel2407Exterior,SEL_2407_PHOTO_URL,SEL_2407_TOP_URL} from './rtds-gtsync-sel2407.js';

import {createSel2488Exterior,SEL_2488_FRONT_URL,SEL_2488_REAR_URL,SEL_2488_DIMENSIONS_URL} from './rtds-gtsync-sel2488.js';

// Only NovaCor uses real model anchors; SEL exteriors never supply endpoints.
const colors={gt:0x9a6330,'gt-fiber':0x9a6330,'st-timing-fiber':0xc18b34,'st-ethernet-fiber':0x2478ac,coax:0x60717f,ethernet:0x2478ac};
async function createSyncScene(container,project){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xffffff,1);renderer.domElement.setAttribute('aria-hidden','true');
 let template;try{template=(await new GLTFLoader().loadAsync(new URL(publishedModels['novacor-2.0'].glb,document.baseURI).href)).scene;}catch(e){renderer.dispose();throw e;}
 const scene=new THREE.Scene(),group=new THREE.Group(),wireGroup=new THREE.Group(),exterior=new THREE.Group(),camera=new THREE.PerspectiveCamera(36,1,.01,30);scene.add(group,wireGroup,exterior);scene.add(new THREE.HemisphereLight(0xffffff,0x7a9293,2.7));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-1,2,4);scene.add(light);
 const owned=new Set();let compact=container.clientWidth<600,sel=null,selCaption=null,sel2488=null,front=false,ptpView=null,hands=[],anchors={},cables=[],state=null,phase=null,layout=0,signature='',active=true,disposed=false,frame=0,frames=0;
 container.append(renderer.domElement);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=.3;controls.maxDistance=12;controls.addEventListener('change',invalidate);
 function own(x){owned.add(x);return x;}
 function box(parent,size,pos,color){const m=new THREE.Mesh(own(new THREE.BoxGeometry(...size)),own(new THREE.MeshStandardMaterial({color,roughness:.62})));m.position.fromArray(pos);parent.add(m);return m;}
 function label(text,pos,width=.24,parent=group){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,768,96);c.fillStyle='#193a4c';c.font='bold 56px sans-serif';c.textAlign='center';c.fillText(text,384,61);const texture=own(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:texture,depthTest:false})));sprite.scale.set(width,width/8,1);sprite.position.fromArray(pos);sprite.renderOrder=20;parent.add(sprite);return sprite;}
 function port(parent,key,pos,color){anchors[key]=box(parent,[.012,.009,.008],pos,color);}
 function clearWires(){for(const c of cables){c.mesh.geometry.dispose();c.mesh.material.dispose();c.dot.geometry.dispose();c.dot.material.dispose();}cables=[];wireGroup.clear();signature='';}
 function clearLayout(){clearWires();group.clear();exterior.clear();sel=null;selCaption=null;sel2488=null;for(const r of owned)r.dispose();owned.clear();anchors={};}
 function find(root,suffix){let result;root.traverse(n=>{if(n.userData.sid?.endsWith('.'+suffix))result=n;});if(!result)throw Error('Confirmed NovaCor anchor unavailable: '+suffix);return result;}
 function apparatus(name,position,count,color){const device=new THREE.Group();device.position.fromArray(position);group.add(device);box(device,[.23,.07,.07],[0,0,0],0xd2dade);box(device,[.222,.055,.004],[0,0,.038],0x243a47);const first=name==='LAN'?0:1;for(let i=0;i<count;i++)port(device,`${name}.p${i+first}`,[-.094+i*.188/Math.max(1,count-1),-.006,.043],color);label(name+' · SCHEMATIC',[0,.056,.04],.24,device);}

 function rebuild(){
 clearLayout();layout=1;
 const model=template.clone(true);model.scale.setScalar(.6);model.rotation.y=Math.PI;model.position.set(compact?0:.48,compact?-.28:.12,0);group.add(model);
 anchors['N.GTSYNC']=find(model,'gtsync');anchors['N.GT1']=find(model,'gt1');label('NovaCor 2.0',[compact?0:.48,compact?-.12:.27,.06],.3);
 apparatus('CLOCK',[compact?0:-.48,compact?.48:.15,0],1,0x2478ac);label('External clock / GM',[compact?0:-.48,compact?.58:.25,.05],.33);
 const sync=new THREE.Group();sync.position.set(0,.1,0);group.add(sync);box(sync,[.29,.17,.09],[0,0,0],0xc4d0d6);box(sync,[.28,.16,.006],[0,0,.05],0x284b5a);
 for(const [key,pos,col] of [['bnc',[-.10,.035,.058],0x60717f],['st-time',[-.04,.035,.058],0xab7136],['st-ethernet',[.04,-.035,.058],0x2478ac],['rj45',[.035,.035,.058],0x2478ac],['sync-out',[-.07,-.035,.058],0xa3599e],['GT',[.10,-.035,.058],0xab7136]])port(sync,'G.'+key,pos,col);
 label('GTSYNCv2 · SCHEMATIC',[0,.25,.06],.34);
 hands=[];for(const [i,x] of [[0,compact?-.2:-.48],[1,compact?.2:0]]){const pivot=new THREE.Group();pivot.position.set(x,-.12,.06);group.add(pivot);const ring=new THREE.Mesh(own(new THREE.TorusGeometry(.025,.002,6,28)),own(new THREE.MeshBasicMaterial({color:0x627e8f})));pivot.add(ring);const hand=new THREE.Group();pivot.add(hand);box(hand,[.003,.022,.003],[0,.011,.003],i?0x2478ac:0x9a6330);hands.push(hand);label(i?'SIM':'REF',[x,-.17,.065],.12);}
 label('BNC / ST-TIME / RJ45',[0,.18,.07],.27);label('OUT / ST-ETH / GT',[0,-.015,.07],.27);
 setPresentation();group.updateMatrixWorld(true);container.dataset.anchorCount=String(Object.keys(anchors).length);fit();
 }
 function setPresentation(){
  const irig=state?.showSel2407===true,ptp=state?.showSel2488===true;
  if(!ptp)ptpView=null;
  if(ptpView&&!sel2488){sel2488=createSel2488Exterior(own);sel2488.scale.setScalar(.00165);exterior.add(sel2488);}
  if(sel2488)sel2488.visible=!!ptpView;
  if(irig&&!sel){sel=createSel2407Exterior(own);exterior.add(sel);selCaption=label('SEL-2407 · NO WIRES',[0,0,0],.47,exterior);}
  if(!irig)front=false;
  if(sel){
   sel.visible=irig;
   sel.scale.setScalar(compact?.128:.133);
   sel.position.set(compact?0:.03,compact?-.668:-.39,0);
   selCaption.position.copy(sel.position).add(new THREE.Vector3(0,-.045,.025));selCaption.visible=irig&&!front;
  }
  group.visible=wireGroup.visible=!front&&!ptpView;
  exterior.visible=irig||!!ptpView;
  container.dataset.modelCount=ptpView?'1':irig?'4':'3';
  container.dataset.sel2488=ptp?(ptpView||'overview'):'hidden';
  container.dataset.sel2407=irig?(front?'front':'overview'):'hidden';
  container.setAttribute('aria-label',ptpView?`SEL-2488 独立外观模型，${ptpView==='rear'?'背板':'正面'}视角，不接线`:front?'SEL-2407 独立外观模型，正面视角，不接线':irig?'GTSYNCv2 接线示意与独立未接线的 SEL-2407 外观模型':'GTSYNCv2 外部时源与专用主机链路三维示意');
 }
 function world(key){return anchors[key]?.getWorldPosition(new THREE.Vector3());}
 function buildWires(){const sig=JSON.stringify(state.links);if(sig===signature)return;clearWires();signature=sig;group.updateMatrixWorld(true);
  state.links.forEach((link,i)=>{const a=world(link.a),b=world(link.b);if(!a||!b)return;const color=colors[link.network]||0xc64b40;const lift=.18+(i%7)*.012;const curve=new THREE.CatmullRomCurve3([a,a.clone().add(new THREE.Vector3(0,0,.045)),new THREE.Vector3((a.x+b.x)/2,(a.y+b.y)/2,lift),b.clone().add(new THREE.Vector3(0,0,.045)),b]);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.0018,5,false),new THREE.MeshStandardMaterial({color,roughness:.6}));wireGroup.add(mesh);const dot=new THREE.Mesh(new THREE.SphereGeometry(.005,10,7),new THREE.MeshBasicMaterial({color:0xffc22b}));wireGroup.add(dot);cables.push({mesh,dot,curve,network:link.network,index:i,signal:link.signal,reverse:link.reverse,returnPath:link.returnPath});});container.dataset.wires=String(cables.length);container.dataset.links=JSON.stringify(state.links);
 }
 function render(force=false){frame=0;if(disposed||(!active&&!force)||document.hidden||!state||!container.clientWidth||!container.clientHeight)return;buildWires();for(const c of cables){const on=!!state.enabled[c.network];c.mesh.material.opacity=on?1:.24;c.mesh.material.transparent=!on;c.dot.visible=on&&Number.isFinite(phase);if(c.dot.visible){const f=((phase%1)+1)%1;c.dot.position.copy(c.curve.getPoint((c.reverse||(c.returnPath&&Math.floor(phase)===2))?1-f:f));}}
  if(hands.length){const f=Number.isFinite(phase)?phase:0;const aligned=state.status==='locked';hands[0].rotation.z=aligned?-f*Math.PI*2:0;hands[0].visible=state.referenceAvailable;hands[1].rotation.z=!state.simulatorRunning?0:aligned?-f*Math.PI*2:-(f+.22)*Math.PI*2;container.dataset.simPhase=hands[1].rotation.z.toFixed(4);}
  renderer.render(scene,camera);const points={};for(const key of Object.keys(anchors)){const v=world(key).project(camera);points[key]={x:(v.x*.5+.5)*container.clientWidth,y:(.5-v.y*.5)*container.clientHeight,visible:Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z>-1&&v.z<1};}project(points);container.dataset.loaded='true';container.dataset.frames=String(++frames);container.dataset.triangles=String(renderer.info.render.triangles);
 }
 function invalidate(){if(!disposed&&active&&!document.hidden&&!frame)frame=requestAnimationFrame(()=>render());}
 function fit(){
  camera.fov=front||ptpView?25:36;camera.updateProjectionMatrix();
  const span=(width,height)=>Math.max(height,width/Math.max(.3,camera.aspect))/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
  if(ptpView){
   const side=ptpView==='rear'?-1:1;
   const distance=span(.9,.15);
   controls.target.set(0,0,.190*side);
   camera.position.set(0,distance*.065,(.190+distance)*side);
  }else if(front&&sel){
   const distance=span(.86,.246);
   controls.target.copy(sel.position).add(new THREE.Vector3(0,.073,-.040));
   camera.position.copy(controls.target).add(new THREE.Vector3(.005,distance*.237,distance));
  }else{
   const irig=state?.showSel2407;
   const width=compact?.65:1.5,height=irig?(compact?1.34:.79):(compact?1.05:.65);
   const centerY=irig?-.035:(compact?.15:.10);
   controls.target.set(-.02,centerY,.035);
   camera.position.set(-.02,centerY+.12,span(width,height)*(irig?1.07:1.2));
  }
  controls.update();invalidate();
 }
 function resize(){if(disposed)return;const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;const nextCompact=w<600;if(nextCompact!==compact){compact=nextCompact;if(layout)rebuild();}renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();fit();}
 const ro=new ResizeObserver(resize);ro.observe(container);resize();const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};document.addEventListener('visibilitychange',visibility);
 const lost=e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;container.dataset.loaded='false';container.dispatchEvent(new CustomEvent('sync-scene-error'));};renderer.domElement.addEventListener('webglcontextlost',lost);
 // A single static readiness frame is independent of stale intersection delivery.
 // It does not start animation, and is requested only for the selected lesson.
 return {paintStatic(){cancelAnimationFrame(frame);frame=0;render(true);},update(s,p=null){const changed=state?.showSel2407!==s.showSel2407||state?.showSel2488!==s.showSel2488;state=s;phase=p;if(!layout)rebuild();else if(changed){setPresentation();fit();}invalidate();},showSel2407Front(value){front=!!value&&state?.showSel2407;setPresentation();fit();},showSel2488(view){ptpView=state?.showSel2488?view:null;setPresentation();fit();},setActive(v){active=!!v;controls.enabled=active;if(!active){cancelAnimationFrame(frame);frame=0;}else invalidate();},fit,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);controls.dispose();clearLayout();const resources=new Set();template.traverse(n=>{if(n.geometry)resources.add(n.geometry);for(const m of n.material?Array.isArray(n.material)?n.material:[n.material]:[]){resources.add(m);for(const v of Object.values(m))if(v?.isTexture)resources.add(v);}});for(const r of resources)r.dispose();renderer.dispose();renderer.domElement.remove();container.dataset.loaded='false';}};
}

import {defaultGtsyncBench,evaluateGtsyncBench,calculateGtsyncSkew,describeSyncCorrection} from './rtds-gtsync-bench-state.js';
export function mountGtsyncBench(root){
 const host=document.createElement('section');host.className='gtsync-bench';root.append(host);
 const choices={source:{pps:'外部 1 PPS',irig:'未调制 IRIG-B B00x',ptp:'PTP v2 外部 Grandmaster',internal:'内部振荡器'},input:{bnc:'BNC 输入','st-time':'ST 时序输入（1 PPS / IRIG-B）','st-ethernet':'ST Ethernet 输入（PTP）',rj45:'RJ45 Ethernet', 'sync-out':'SYNC 输出（错误输入示例）',none:'断开'},medium:{coax:'同轴电缆','st-timing-fiber':'ST 时序光纤','st-ethernet-fiber':'ST Ethernet 光纤',ethernet:'Ethernet',none:'断开'},host:{dedicated:'NovaCor 专用 GTSYNC',gtio:'NovaCor GT1（错误端口）',none:'断开'},hostMedium:{'gt-fiber':'GT 专用光纤',ethernet:'Ethernet（错误介质）',none:'断开'},ptpNetwork:{direct:'直连 Grandmaster','compatible-switch':'已核对兼容的 PTP 交换网络','ordinary-switch':'未核对的普通交换网络'}};
 const names={source:'时间参考',input:'GTSYNCv2 输入端口',medium:'参考输入介质',host:'NovaCor 端口',hostMedium:'主机链路介质',ptpNetwork:'PTP 网络条件'};
 host.innerHTML=`<h3 id="gtsync-bench-heading" tabindex="-1">课件33 · GTSYNCv2 外部时源接线台</h3><p>NovaCor 使用实物模型；接线图中的时源与 GTSYNCv2 是示意，端口位置与比例不能当作实物接线图。外部参考 → GTSYNCv2，GT → NovaCor 专用 GTSYNC 是两条不同链路。</p><div class="sync-controls">${Object.entries(choices).map(([k,v])=>`<label>${names[k]}<select data-sync="${k}">${Object.entries(v).map(([id,t])=>`<option value="${id}">${t}</option>`).join('')}</select></label>`).join('')}</div><div class="sync-actions"><label><input type="checkbox" data-sync="configured">已完成对应模式配置（离线预设）</label><label><input type="checkbox" data-sync="sntp">1 PPS 有有效 SNTP 时刻</label><label><input type="checkbox" data-sync="holdover">启用 Holdover</label></div><div class="sync-actions"><button data-sync-event="acquire">模拟确认锁定</button><button data-sync-event="loss">断开外部参考</button><button data-sync-event="restore">恢复外部参考</button><button data-sync-play>播放</button><button data-sync-replay>重放</button><button data-sync-step>静态步进</button><button data-sync-retry hidden>重试3D</button></div><output class="sync-status" aria-live="polite"></output><div class="sync-stage" role="img" aria-label="GTSYNCv2 外部时源与专用主机链路三维示意"><p class="sync-loading">正在加载3D…</p></div><div class="sync-irig-exterior" hidden><p><strong>SEL-2407 外观参考。</strong> 独立模型不接入仿真线路。显示为静态示意，机身深度为近似，未复刻背面接口。不表示与 GTSYNCv2 的兼容性、接法或同步性能。</p><a href="${SEL_2407_PHOTO_URL}" target="_blank" rel="noopener noreferrer">SEL-2407 厂家实物照片</a> · <a href="${SEL_2407_TOP_URL}" target="_blank" rel="noopener noreferrer">厂家斜视照片</a> <button type="button" data-sync-sel2407-focus aria-pressed="false">看 SEL-2407 正面</button> <button type="button" data-sync-sel2407-reset hidden>返回接线全景</button></div><div class="sync-ptp-exterior" hidden><p><strong>SEL-2488 机架式时钟外观参考。</strong> 正面和背板按同型号公开实物照重建，背板为照片所示双电源、F1–F6 版本。模型不接线，不表示该型号与 GTSYNCv2 的兼容性或接法。</p><a href="${SEL_2488_FRONT_URL}" target="_blank" rel="noopener noreferrer">厂家正面实物照</a> · <a href="${SEL_2488_REAR_URL}" target="_blank" rel="noopener noreferrer">厂家背板实物照</a> · <a href="${SEL_2488_DIMENSIONS_URL}#page=6" target="_blank" rel="noopener noreferrer">厂家尺寸资料</a><div><button type="button" data-sync-sel2488-front aria-pressed="false">看 SEL-2488 正面</button> <button type="button" data-sync-sel2488-rear aria-pressed="false">看 SEL-2488 背板</button> <button type="button" data-sync-sel2488-reset hidden>返回接线全景</button></div></div><p class="sync-link-summary"></p><p class="sync-phase"></p><ul class="sync-issues"></ul><details><summary>GT 主机链路补偿算术</summary><label>光缆长度 m <input data-sync-length type="number" min="0" step="1" value="0"></label><output class="sync-skew"></output><label>同步修正 ns <input data-sync-correction type="number" min="-5000" max="5000" value="0"></label><output class="sync-correction"></output><p>手册 PDF 483：750 ns + 5 ns/m × 长度；软件允许范围需核对，不是测得传播延时，不影响本实验锁定状态。</p></details><details><summary>来源与适用范围</summary><p>课件33；手册 PDF 470–488，专用主机连接471、时源与输入473–479。1 PPS 还需要有效 SNTP 时刻；IRIG-B 为未调制 B00x 并需核对 UTC 字段。ST 时序输入与 ST Ethernet 是不同的物理端口与光学链路，不能因同为 ST 连接器而互换。PTP 使用 Layer 2，并需核对相同 profile、domain 和 peer-delay 条件。BNC 时序口绝不能接 PLC 24 V 输出。PTP 本实验只演示从外部 Grandmaster 接收，不模拟主时钟决策。未展示供电与 SNTP 辅助网络，不表示它们不需要。</p><p>亮点与相位变化仅为状态示意，没有锁定耗时、传播延时或 Holdover 精度保证；不替代厂家配置和电气/光学兼容核对。不依据存在疑点的时间质量表推断精度。</p></details>`;
 const stage=host.querySelector('.sync-stage'),loading=host.querySelector('.sync-loading'),play=host.querySelector('[data-sync-play]'),retry=host.querySelector('[data-sync-retry]');
 const specimen=host.querySelector('.sync-irig-exterior'),focus=host.querySelector('[data-sync-sel2407-focus]'),reset=host.querySelector('[data-sync-sel2407-reset]');
 const ptpPanel=host.querySelector('.sync-ptp-exterior'),ptpFront=host.querySelector('[data-sync-sel2488-front]'),ptpRear=host.querySelector('[data-sync-sel2488-rear]'),ptpReset=host.querySelector('[data-sync-sel2488-reset]');
 let state={...defaultGtsyncBench},scene=null,inspecting=false,ptpInspection=null,disposed=false,active=false,loadingScene=false,generation=0,playing=false,phase=0,frame=0,last=0,visual=null;
 const replay=host.querySelector('[data-sync-replay]'),step=host.querySelector('[data-sync-step]');
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const words={miswired:'接线或兼容条件不满足',unconfigured:'已连接，尚未配置',ready:'参考链路就绪，尚未确认锁定',locked:'已锁定外部参考（模拟确认）',holdover:'参考丢失：Holdover 自由运行，不再外部锁定',lost:'外部参考丢失：不能继续声称锁定',internal:'内部参考自由运行，不是 UTC 锁定'};
 function setPlayback(value){playing=value;host.dataset.playing=String(value);play.textContent=value?'暂停':'播放';play.setAttribute('aria-pressed',String(value));}
 function pause(){cancelAnimationFrame(frame);frame=0;last=0;setPlayback(false);}
 function start(){if(!scene||inspecting||ptpInspection||media.matches||!active||document.hidden)return;setPlayback(true);frame=requestAnimationFrame(tick);}
 function update(event){const r=evaluateGtsyncBench(state,event);state={...r.nextState};for(const el of host.querySelectorAll('[data-sync]')){const k=el.dataset.sync;if(el.type==='checkbox')el.checked=!!state[k];else el.value=state[k];}host.dataset.status=r.status;host.querySelector('.sync-status').textContent=r.reason==='overflow'?'外部参考丢失且未启用 Holdover：time-step overflow，模拟停止（教学状态）':words[r.status]||r.status;host.querySelector('.sync-issues').replaceChildren(...r.issues.map(x=>{const li=document.createElement('li');li.textContent=x.message;return li;}));
 const showSel2407=state.source==='irig',showSel2488=state.source==='ptp';
 ptpPanel.hidden=!showSel2488;ptpFront.disabled=ptpRear.disabled=!scene;if(!showSel2488)reflectPtp(null);specimen.hidden=!showSel2407;stage.classList.toggle('sync-stage-irig',showSel2407);if(!showSel2407)reflectInspection(false);focus.disabled=!scene;
 const links=[];if(state.source!=='internal'&&state.input!=='none'&&state.medium!=='none')links.push({a:'CLOCK.p1',b:'G.'+state.input,network:state.medium,signal:0});if(state.host!=='none'&&state.hostMedium!=='none')links.push({a:'G.GT',b:state.host==='dedicated'?'N.GTSYNC':'N.GT1',network:state.hostMedium,signal:1});
 host.querySelector('.sync-link-summary').textContent=`${choices.source[state.source]} → ${choices.input[state.input]}（${choices.medium[state.medium]}）；GTSYNCv2 GT → ${choices.host[state.host]}（${choices.hostMedium[state.hostMedium]}）。灰色：同轴；金色：ST 时序；蓝色：Ethernet；棕色：GT。`;const enabled={};for(const l of links)enabled[l.network]=r.simulatorRunning;if(!state.available)enabled[state.medium]=false;
 scene?.setActive(active&&!document.hidden);visual={showSel2407,showSel2488,links,enabled,status:r.status,simulatorRunning:r.simulatorRunning,referenceAvailable:state.available&&state.source!=='internal'};scene?.update(visual,phase);host.querySelector('.sync-phase').textContent=r.status==='locked'?'REF 与 SIM 对齐：示意已锁定，不表示锁定时间或精度。':['holdover','internal'].includes(r.status)?'SIM 自由运行：相对外部参考可能漂移；运动幅度仅为定性示意。':'REF / SIM 状态示意：未锁定，不能声称同步。';reflectPlaybackControls();host.dataset.playing=String(playing);return r;}
 function tick(t){if(!playing||!active||document.hidden){pause();return;}phase=(phase+(last?(t-last)/4000:0))%1;last=t;scene?.update(visual,phase);frame=requestAnimationFrame(tick);}
 host.querySelectorAll('[data-sync]').forEach(el=>el.addEventListener('change',()=>{pause();state[el.dataset.sync]=el.type==='checkbox'?el.checked:el.value;state.history=false;state.stopped=false;phase=0;update();}));
 host.querySelectorAll('[data-sync-event]').forEach(el=>el.onclick=()=>{pause();update(el.dataset.syncEvent);});play.onclick=()=>{if(playing)pause();else start();};replay.onclick=()=>{if(inspecting||ptpInspection)return;pause();phase=0;update();start();};step.onclick=()=>{if(inspecting||ptpInspection)return;pause();phase=(phase+.125)%1;update();};
 function failed(){pause();scene?.dispose();scene=null;reflectInspection(false);reflectPtp(null);stage.removeAttribute('data-sel2488');stage.removeAttribute('data-sel2407');stage.setAttribute('aria-label','三维示意不可用');stage.dataset.loaded='false';loading.hidden=false;loading.textContent='3D不可用，接线与状态检查仍可使用。';retry.hidden=false;update();}
 async function load(){if(disposed||loadingScene)return;loadingScene=true;const token=++generation;retry.hidden=true;loading.hidden=false;try{const next=await createSyncScene(stage,()=>{loading.hidden=true;});if(disposed||token!==generation){next.dispose();return;}scene=next;update();if(active&&!document.hidden)scene.paintStatic();}catch{if(!disposed)failed();}finally{loadingScene=false;}}
 function reflectPlaybackControls(){play.disabled=!scene||media.matches||inspecting||!!ptpInspection;replay.disabled=step.disabled=inspecting||!!ptpInspection;}
 function reflectPtp(view){ptpInspection=view;ptpFront.setAttribute('aria-pressed',String(view==='front'));ptpRear.setAttribute('aria-pressed',String(view==='rear'));ptpReset.hidden=!view;reflectPlaybackControls();}
 function reflectInspection(front){inspecting=front;focus.setAttribute('aria-pressed',String(front));reset.hidden=!front;reflectPlaybackControls();}
 function specimenView(front){if(!scene||state.source!=='irig')return;pause();reflectInspection(front);scene.showSel2407Front(front);stage.scrollIntoView({block:'center'});}
 focus.onclick=()=>{specimenView(true);if(!reset.hidden)reset.focus({preventScroll:true});};reset.onclick=()=>{specimenView(false);focus.focus({preventScroll:true});};
 function ptpView(view){if(!scene||state.source!=='ptp')return;pause();reflectPtp(view);scene.showSel2488(view);stage.scrollIntoView({block:'center'});}
 ptpFront.onclick=()=>{ptpView('front');if(!ptpReset.hidden)ptpReset.focus({preventScroll:true});};
 ptpRear.onclick=()=>{ptpView('rear');if(!ptpReset.hidden)ptpReset.focus({preventScroll:true});};
 ptpReset.onclick=()=>{const previous=ptpInspection;ptpView(null);(previous==='rear'?ptpRear:ptpFront).focus({preventScroll:true});};
 retry.onclick=load;const loss=()=>failed();stage.addEventListener('sync-scene-error',loss);
 const visibility=()=>{if(document.hidden)pause();update();};document.addEventListener('visibilitychange',visibility);const reduce=()=>{pause();update();};media.addEventListener('change',reduce);
 const io=new IntersectionObserver(es=>{if(!es[0].isIntersecting)pause();});io.observe(stage);
 const skew=()=>{const r=calculateGtsyncSkew(host.querySelector('[data-sync-length]').value);host.querySelector('.sync-skew').textContent=r?` 计算 ${r.ns} ns${r.inRange?'':' · 超出 0–999 ns 输入范围，不应截断使用'}`:'请输入非负有限长度';};const correction=()=>{const r=describeSyncCorrection(host.querySelector('[data-sync-correction]').value);host.querySelector('.sync-correction').textContent=r?` ${r.ns} ns：${r.inRange?({later:'配置为相对更晚',earlier:'配置为相对更早',unchanged:'不作修正'}[r.direction]):'超出 ±5000 ns，不应用'}；与 GT 长度补偿分开，不显示为实测相位。`:'请输入有限数值';};host.querySelector('[data-sync-correction]').oninput=correction;host.querySelector('[data-sync-length]').oninput=skew;skew();correction();pause();update();return {element:host,setActive(v){const changed=active!==!!v;active=!!v;if(!active)pause();if(changed){update();if(active&&scene)scene.paintStatic();}if(active&&!scene&&!loadingScene)load();},dispose(){disposed=true;++generation;pause();scene?.dispose();io.disconnect();document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',reduce);stage.removeEventListener('sync-scene-error',loss);host.remove();}};
}
