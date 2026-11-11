// Original teaching constraints, HDWR 5A revision20260504, PDF230–233,240–241,246.
export const defaultGtnetV3=Object.freeze({gtA:true,gtB:true,firmwareA:'SV',firmwareB:'GOOSE',mode:'normal',secondary:false,independent:true,firmwarePrp:true,medium:'copper',speed:1000,duplex:'full',direct:false,crossover:false});
export function checkGtnetV3(c){
 const errors=[];
 if(typeof c.direct!=='boolean')errors.push('连接方式未确认，不能判断直连线序。');
 if(c.gtA!==true||c.gtB!==true)errors.push('本双模块闭环要求GT A和GT B各自连接NovaCor GT光纤口。');
 if(c.firmwareA!=='SV'||c.firmwareB!=='GOOSE')errors.push('本例固定A发布SV、B订阅GOOSE；两模块必须各自启用对应固件，已安装不等于已激活。');
 if(!['normal','prp'].includes(c.mode))errors.push('网络模式未确认。');
 if(c.duplex!=='full'||![100,1000].includes(c.speed))errors.push('需全双工100或1000Mbps，不能使用10BASE-T或半双工。');
 if(!['copper','fx','sx'].includes(c.medium)||(c.medium==='fx'&&c.speed!==100)||(c.medium==='sx'&&c.speed!==1000))errors.push('SFP与对端需匹配：100/1000Base-T铜、100Base-FX或1000Base-SX；不可只按插口形状判断。');
 if(c.mode==='prp'){
  if(c.direct===true)errors.push('本PRP示例限定独立交换网络，不验证直接接入拓扑。');
  if(c.secondary!==true)errors.push('PRP需AA/BA连接LAN A，AB/BB连接LAN B，不能只接主端口。');
  if(c.independent!==true)errors.push('PRP的LAN A与LAN B必须保持独立，不能接成同一网络。');
  if(c.firmwarePrp!==true)errors.push('PRP支持需核对GTNETv3固件；手册确认RSCAD2.8及以上随附的v3固件。');
 }
 if(errors.length)return {status:'invalid',message:errors.join(' '),links:[]};
 if(c.direct===true&&c.medium==='copper'&&c.crossover!==true)return {status:'unverified',message:'直接铜缆连接的线序仍待核对：v3不支持MDI/MDIX自动交叉，对某些设备可能需要交叉线。',links:[]};
 const links=['NovaCor GT → GTNETv3 GT A（SV数据）',c.mode==='prp'?'A · AA经LAN A / AB经LAN B → 继电器（同一SV的冗余路径，非先后两次发送）':`A · AA → ${c.direct?'直连':'交换机 → '}继电器（SV）`,c.mode==='prp'?'继电器 → LAN A到B · BA / LAN B到B · BB（同一GOOSE的冗余路径）':`继电器 → ${c.direct?'直连':'交换机 → '}B · BA（GOOSE）`,'GTNETv3 GT B → NovaCor GT（GOOSE跳闸）'];
 return {status:'match',message:`本例已检查条件一致：${c.mode==='prp'?'PRP双网络，A/B两模块仍各运行一种协议':'非冗余只使用AA和BA'}。不是实机兼容认证；IP、协议配置、SFP光学参数与线序仍需现场核对。`,links};
}
