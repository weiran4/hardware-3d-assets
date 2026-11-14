// Course p33. Scope: GTSYNCv2 input/reception and NovaCor 2.0, no PTP master emulation.
// Hardware Manual PDF 471–475, 477–479, 481, 483–484, 486. This is not timing instrumentation.
export const defaultGtsyncBench=Object.freeze({
 source:'pps',input:'bnc',medium:'coax',host:'dedicated',hostMedium:'gt-fiber',
 sntp:true,ptpNetwork:'direct',configured:true,available:true,holdover:true,history:false,stopped:false
});

const ports=Object.freeze({
 pps:Object.freeze({bnc:'coax','st-time':'st-timing-fiber'}),
 irig:Object.freeze({bnc:'coax','st-time':'st-timing-fiber'}),
 ptp:Object.freeze({rj45:'ethernet','st-ethernet':'st-ethernet-fiber'}),
 internal:Object.freeze({none:'none'})
});

export function evaluateGtsyncBench(state=defaultGtsyncBench,event){
 const nextState={...defaultGtsyncBench,...state};
 if(event==='loss')nextState.available=false;
 if(event==='restore'){nextState.available=true;nextState.history=false;nextState.stopped=false;}
 const {source,input,medium,host,hostMedium,configured,sntp,ptpNetwork,available,holdover}=nextState;
 const internal=source==='internal',validSource=Object.hasOwn(ports,source);
 const validInput=validSource&&Object.hasOwn(ports[source],input);
 const validReference=validInput&&ports[source][input]===medium;
 const validHost=host==='dedicated'&&hostMedium==='gt-fiber';
 const issues=[];
 const add=(code,message)=>issues.push({code,message});
 if(!validInput)add('reference-port',internal?'使用内部振荡器时，此实验不接外部时源输入。':'此端口不是所选时源模式的输入；不能把同步输出当输入。');
 else if(!validReference)add('reference-medium','所选介质和输入端口不匹配：BNC 同轴、定时 ST 光纤、以太网 ST 光纤、RJ45 铜缆各按模式配接。两类 ST 不可互换。');
 if(host!=='dedicated')add('host-port','GTSYNCv2 的 GT 口接 NovaCor 2.0 的专用 GTSYNC 口，不接普通 GT I/O。');
 else if(!validHost)add('host-medium','主机段使用 GT 光链路，不是以太网铜缆。');
 let status,reason=null;
 if(issues.length){status='miswired';nextState.history=false;}
 else {
  if(!configured)add('configuration','先核对 GTSYNC 硬件已声明、时源模式和案例同步元件已配置。');
  if(source==='pps'&&!sntp)add('sntp','外部 1 PPS 只提供秒边界。没有有效 SNTP，不能确认正确的时刻；本练习不判为完整锁定。');
  if(source==='ptp'&&!['direct','compatible-switch'].includes(ptpNetwork))add('ptp-switch','若经交换机，需支持 PTP 透明或边界时钟；本练习不把普通交换机视作有效路径。');
  if(issues.length){status='unconfigured';nextState.history=false;}
  else if(internal){status='internal';nextState.history=false;}
  else if(!available){
   status=nextState.history&&holdover?'holdover':'lost';
   if(status==='lost'){
    nextState.stopped=nextState.stopped||nextState.history;nextState.history=false;
    reason=nextState.stopped?'overflow':'no-reference';
   }
  } else {
   if(event==='acquire')nextState.history=true;
   status=nextState.history?'locked':'ready';
  }
 }
 const simulatorRunning=status==='locked'||status==='holdover'||status==='internal';
 return {issues,status,reason,simulatorRunning,nextState,referenceLink:validReference&&!internal,hostLink:validHost};
}

function finiteNumber(value){
 if(typeof value!=='number'&&(typeof value!=='string'||!value.trim()))return null;
 const number=Number(value);
 return Number.isFinite(number)?number:null;
}

export function calculateGtsyncSkew(length){
 const metres=finiteNumber(length);
 if(metres===null||metres<0)return null;
 const ns=750+5*metres;
 return Number.isFinite(ns)?{ns,inRange:ns<=999}:null;
}

export function describeSyncCorrection(value){
 const ns=finiteNumber(value);
 if(ns===null)return null;
 return {ns,inRange:Math.abs(ns)<=5000,direction:ns>0?'later':ns<0?'earlier':'unchanged'};
}
