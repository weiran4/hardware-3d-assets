// Original role-level teaching checks, Chapter 5B revision20250318, PDF249–275.
// Normal-mode firmware fields never describe PRP's internal activation procedure.
export const defaultGtnetX2=Object.freeze({mode:'normal',stage:'runtime',gtA:true,gtB:true,lanA:true,lanB:true,activeA:'SV',activeB:'GOOSE',prpSingleProtocol:true,prpProtocolVerified:true,configurationComplete:true,independent:true,versionsVerified:true,resetApplied:true,medium:'copper',speed:1000,duplex:'full',direct:false,crossoverVerified:false});
const options={mode:['normal','prp'],stage:['runtime','setup'],activeA:['SV','GOOSE','SKT'],activeB:['SV','GOOSE','SKT'],medium:['copper','fx','sx'],speed:[100,1000,10],duplex:['full','half']};
const result=(status,message,links=[])=>({status,message,links});
export function checkGtnetX2(c){
 if(!c||typeof c!=='object'||Array.isArray(c))return result('invalid','条件格式无效，请重新选择教学示例。');
 for(const key of Object.keys(defaultGtnetX2)){
  if(options[key]?!options[key].includes(c[key]):typeof c[key]!=='boolean')return result('invalid','连接或配置条件包含未知值，请重新核对。');
 }
 const errors=[];
 if(!c.gtA)errors.push('GT A需独立连接本例NovaCor的GT光纤口。');
 if((c.mode==='normal'||c.stage==='setup')&&!c.gtB)errors.push(c.mode==='normal'?'普通双协议示例还需独立GT B光纤，不能菊花链。':'本初始配置检查示例需连接GT B，以访问模块B进行初始固件安装与PRP配置；不表示整个配置过程必须始终同时连接两线。');
 if(!c.lanA||!c.lanB)errors.push('本例LAN A和LAN B都需要连接，Ethernet不可用GT光纤口代替。');
 if(c.mode==='normal'&&(c.activeA!=='SV'||c.activeB!=='GOOSE'))errors.push('普通模式本例需A活动协议为SV发布、B为GOOSE订阅；已安装不等于已激活，这不是硬件固定分工。');
 if(c.duplex!=='full'||![100,1000].includes(c.speed))errors.push('Ethernet仅支持100或1000Mbps全双工，不支持10Mbps或半双工。');
 if((c.medium==='fx'&&c.speed!==100)||(c.medium==='sx'&&c.speed!==1000))errors.push('介质与速率不匹配：100Base-FX为100Mbps，1000Base-SX为1000Mbps。');
 if(c.mode==='prp'){
  if(!c.prpSingleProtocol)errors.push('x2的PRP单一协议占整卡两个模块，不能保留同卡SV加GOOSE双协议闭环。');
  if(!c.independent)errors.push('LAN A和LAN B必须连接独立的PRP网络，不能接成同一网络。');
  if(c.direct)errors.push('本PRP示例限定两套独立交换网络，不验证直接接入拓扑。');
 }
 if(errors.length)return result('invalid',errors.join(' '));
 const pending=[];
 if(c.mode==='prp'){
  if(!c.versionsVerified)pending.push('适用的整组最低版本尚未核对，不能仅凭RSCAD版本认定卡上固件兼容。');
  if(!c.prpProtocolVerified)pending.push('本PRP单SV示例的活动协议及适用固件兼容条件尚未核对。');
  if(c.stage==='runtime'&&!c.configurationComplete)pending.push('初始配置完成状态尚未确认。');
  if(c.stage==='runtime'&&!c.resetApplied)pending.push('当前冗余设置尚未确认按要求复位生效；不是要求每次运行都复位。');
 }
 if(c.direct&&c.medium==='copper'&&!c.crossoverVerified)pending.push('直连铜缆线序待核对：不支持自动MDI/MDIX，某些设备需交叉线。');
 if(pending.length)return result('unverified','待确认：'+pending.join(' '));
 if(c.stage==='setup')return result('match','本初始配置示例的所列接线条件一致；仅静态清单，不代表配置已完成，不播放运行信号。切到运行阶段仍需明确确认配置与当前设置已生效。');
 const via=c.direct?'直连':'交换机 → ';
 const links=c.mode==='prp'?['NovaCor GT → GT A → 整卡单SV协议 → LAN A → PRP网络A → 外部接收设备','同一SV数据的冗余支路：整卡单SV协议 → LAN B → 独立PRP网络B → 同一外部接收设备（与LAN A并行，不是第二次顺序发送）']:['NovaCor GT → GT A → 模块A（SV发布）',`模块A → LAN A → ${via}继电器（SV）`,`继电器 → ${via}LAN B → 模块B（GOOSE订阅）`,'模块B → GT B → NovaCor GT（GOOSE跳闸）'];
 return result('match',`本教学例所列条件一致：${c.mode==='prp'?'单SV占整卡，LAN A/B独立冗余网络；运行仅GT A必需':'普通模式两模块各一个活动协议'}。这是离线条件检查，不是实机认证，也不保证通信成功；IP、多播、光学参数和适用许可仍需核对。`,links);
}
