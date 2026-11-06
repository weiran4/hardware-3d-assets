import {checkGtioChain} from './rtds-novacor-connections.js';
// Original offline checks. NovaCor Light chapter revision 20250529.
// References are PDF reading pages; matching never certifies real wiring.
const record=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
const member=(value,values)=>typeof value==='string'&&values.includes(value);
const issue=(code,message)=>({code,message});

export function checkLightLoop(input){
 const result={status:'invalid',sourcePages:[109,111],message:'选择无效，请重新选择内部 I/O 类别、两端端口和介质。'};
 if(!record(input)||!member(input.kind,['digital','analogue'])||!member(input.source,['unknown','i1','i2','gt3','aur1'])||!member(input.target,['unknown','i1','i2','gt3','aur1'])||!member(input.medium,['unknown','fibre','copper','signal']))return result;
 const expected=input.kind==='digital'?'i1':'i2';
 const path=`上方内部 I/O ${expected.toUpperCase()} ↔ 下方计算端 ${expected.toUpperCase()}`;
 if([input.source,input.target].some(port=>port!=='unknown'&&port!==expected)||(input.medium!=='unknown'&&input.medium!=='fibre'))return {...result,status:'mismatch',message:`类别错配：应以光纤连接${path}。不能交叉连接 I1/I2，也不能借用 GT 3 或 AUR1。`};
 if([input.source,input.target,input.medium].includes('unknown'))return {...result,status:'unknown',message:`选择尚未完整；预期为${path}，介质为光纤。`};
 return {...result,status:'match',message:`类别匹配：光纤连接${path}。仅确认接口角色，不代表实际接线、配置或信号电气条件已核对。`};
}

export function lightChannelPins(input){
 const result={status:'invalid',signalPin:null,returnPin:null,groundPins:[],powerPins:[],pullupPins:[],connector:null,bank:null,directionLabel:'',warnings:[],sourcePages:[],message:'通道选择无效。模拟通道为 1–12，数字通道为 1–32；请输入十进制整数。'};
 if(!record(input)||!member(input.kind,['analogue','digital'])||!member(input.direction,['input','output']))return result;
 const raw=input.channel;
 if(!(typeof raw==='number'||(typeof raw==='string'&&/^\d+$/.test(raw.trim()))))return result;
 const channel=Number(raw);const analogue=input.kind==='analogue';const output=input.direction==='output';
 if(!Number.isSafeInteger(channel)||channel<1||channel>(analogue?12:32))return result;
 result.directionLabel=output?'仿真器 → 外部设备':'外部设备 → 仿真器';
 result.status='match';result.connector=analogue?1:Math.floor((channel-1)/16)+1;
 if(analogue){
  result.signalPin=channel;result.returnPin=channel+13;result.sourcePages=output?[114,115]:[115,116];
  if(output)result.warnings.push(issue('ao-pin13-unresolved','AO pin 13 在表中标为“3 Return”，含义未确认；不把它当作通用 Ground 或额外 Return 使用。'));
  else result.groundPins=[13];
  result.message=`模拟${output?'输出':'输入'}通道 ${channel}：信号 pin ${result.signalPin}，配对 Return pin ${result.returnPin}。16 位、±10 Vpeak。${output?'输出每通道 10 mA；1 µs 过采样间隔，各通道同步更新。':'输入阻抗 24 kΩ；新样本每 1 µs 发送。'}这些间隔不是端到端延时。`;
 }else{
  const local=(channel-1)%16;const firstBank=local<8;
  result.bank=Math.floor((channel-1)/8)+1;result.signalPin=firstBank?local+1:local+6;result.sourcePages=output?[112,113]:[112,113,114];
  if(output){result.powerPins=firstBank?[12,13]:[24,25];result.groundPins=firstBank?[11]:[23];}
  else{result.pullupPins=firstBank?[13]:[25];result.groundPins=firstBank?[10,11]:[23,24];}
  if(!output&&[9,10].includes(channel)){
   result.status='unknown';result.signalPin=null;
   result.warnings.push(issue('di-pin14-15-unresolved','DI 表中 pin 14 / 15 标为 Output 1 / 2，不能直接改写成输入通道；对应通道的信号针脚保持待确认。'));
  }
  if(!output&&channel>16){
   result.status='unknown';result.signalPin=null;result.bank=null;result.groundPins=[];result.pullupPins=[];
   result.warnings.push(issue('di-second-connector-unverified','第二只 DI 明确承载通道17–32，但本章未单独确认其针脚复用和Bank编号；信号、Ground及V+针脚全部待核对，不能套用DO的重复映射说明。'));
  }
  result.message=`数字${output?'输出（上排）':'输入（下排）'}通道 ${channel}：第 ${result.connector} 个 DB25，${result.bank===null?'Bank 编号待核对':`Bank ${result.bank}`}。${result.signalPin===null?'信号针脚待确认。':`信号 pin ${result.signalPin}。`}数字电气电平及负载条件未在此核对，不据此直接接线。`;
 }
 return result;
}

export function checkLightChain(input){
 const invalid={status:'invalid',cards:[],cardCount:0,errors:[],unknowns:[],warnings:[],sourcePages:[119]};
 if(!record(input)||!member(input.version,['v2','v1','unknown'])||!member(input.port,['gt3','gt4','gt5','gt6','i1','i2','aur1','unknown']))return {...invalid,errors:[issue('invalid-input','请选择有效的 Light 外接卡版本和源端口。')]};
 const result=checkGtioChain(input);result.sourcePages=[119];
 // Reuse ordered rules, not NovaCor 2.0 port names or applicability claims.
 result.errors=result.errors.map(entry=>({...entry,message:entry.message.replaceAll('GT 1–20','GT 3–6')}));
 if(input.version==='v1')result.errors.push(issue('v1-not-supported','NovaCor Light 外接 GT 卡仅支持 V2，不支持 V1。'));
 if(input.version==='unknown')result.unknowns.push(issue('unknown-version','尚未确认所有外接卡均为 V2，不判断匹配。'));
 if(input.port==='unknown')result.unknowns.push(issue('unknown-port','尚未选择四个外接 GT 3–6 端口之一。'));
 else if(!['gt3','gt4','gt5','gt6'].includes(input.port))result.errors.push(issue('wrong-port','外接 GT 卡应使用四个 GT 3–6 端口；内部 I1/I2 和 Aurora 不能替代。'));
 if(result.cards.includes('GTFPGA'))result.unknowns.push(issue('gtfpga-support-unverified','PDF 119 提到 GTFPGA 不级联，但未在明确支持列表中列出；独占端口也不等于已确认支持。'));
 result.status=result.errors.length?'invalid':result.unknowns.length?'unknown':result.warnings.length?'warning':'match';
 return result;
}
