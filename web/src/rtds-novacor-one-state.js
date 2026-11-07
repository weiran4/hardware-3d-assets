// Original, offline category teaching. NovaCor 1.0 chapter revision 20230523.
// Source page numbers are PDF reading pages, not the chapter's printed pages.
const purposes=Object.freeze({
 gtio:{label:'GT I/O 卡通信',port:'gt1-20',cable:'optical',endpoint:'GT I/O 卡的光通信接口；允许的卡型与链长见下方检查器',detail:'GT 1–20 用于 I/O。每端口最多 8 张卡，卡型组合仍受限制；光数据链路不替代板卡所需的独立供电。',pages:[147,150]},
 aurora:{label:'Aurora 通信',port:'gt21-24',cable:'optical',endpoint:'Aurora 对端；本章未核对具体对端型号、协议配置或速率',detail:'GT 21–24 为 Aurora 专用。该功能单独购买，未配备时端口禁用，不能改作 GT I/O 或其他连接。',pages:[147,148]},
 interrack:{label:'机架间数据通信',port:'irc1-6',cable:'optical',endpoint:'另一台 NovaCor 的 IRC 端口，或 IRC Switch 的机箱连接端口；具体拓扑仍须核对',detail:'IRC 1–6 是机架间数据通信，不是同步口。数据链路匹配不能替代 GBH 同步链路与系统配置。',pages:[147,169,170,171,172]},
 sync:{label:'专用 GTSYNC 光通信',port:'gtsync',cable:'optical',endpoint:'专用同步设备光通信口；具体对端版本、端口与固件仍待核对',detail:'GTSYNC、IRC 和 GBH 是分别列出的端口。不能因为同用光收发器，就把它们当成可互换接口。',pages:[147,148]},
 host:{label:'工作站 / RSCAD 主机连接',port:'wif',cable:'ethernet',endpoint:'工作站 / PC 的局域网接口，可直连或经以太网交换机',detail:'使用独立 WIF Gigabit Ethernet 端口；WIF 的工作站通信路径不是实时仿真数据通路，也不是 ETH 铜 SFP UDP 口。',pages:[144,155,156]},
 udp:{label:'以太网 UDP 数据通信',port:'eth',cable:'ethernet',endpoint:'UDP 网络对端；对端设备与应用通信配置须按任务核对',detail:'ETH 使用受支持的铜 SFP，再接以太网线。本单元只确认其数据通信角色，不推断UDP配置、速率或对端兼容。',pages:[147,148]}
});
const ports=Object.freeze({unknown:'尚未选择', 'gt1-20':'GT 1–20 · I/O 光通信', 'gt21-24':'GT 21–24 · Aurora 专用', 'irc1-6':'IRC 1–6 · 机架间通信',gtsync:'GTSYNC · 专用光通信',wif:'WIF · 工作站以太网',eth:'ETH · 铜 SFP UDP',gbh:'GBH · 机架同步',analog:'前面板模拟监视输出'});
const cables=Object.freeze({unknown:'尚未选择',optical:'光纤链路（配支持的光 SFP）',ethernet:'以太网线（ETH 端还需支持的铜 SFP）',signal:'外部电气信号线',power:'板卡电源线'});
const licenses=Object.freeze({unknown:'尚未确认',absent:'假设未购买 / 未配备',present:'假设已购买并配备'});
const cardTypes=new Set(['GTAI','GTAO','GTDI','GTDO','GTFPI','GTNET','GTFPGA','GTSOCV1']);
const exclusiveTypes=new Set(['GTNET','GTFPGA']);
const has=(object,key)=>typeof key==='string'&&Object.hasOwn(object,key);

/** Check role and cable family only, never actual hardware readiness or mating. */
export function checkNovaOneConnection(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return {status:'invalid',categoryMatch:false,endpoint:'',sourcePages:[],message:'选择无效，请重新选择。'};
 const {purpose,port,cable,auroraLicense='unknown'}=input;
 if(!has(purposes,purpose)||!has(ports,port)||!has(cables,cable)||!has(licenses,auroraLicense))return {status:'invalid',categoryMatch:false,endpoint:'',sourcePages:[],message:'选择无效，请重新选择。'};
 const expected=purposes[purpose];
 const result={status:'unknown',categoryMatch:false,endpoint:expected.endpoint,sourcePages:[...expected.pages],expectedPort:expected.port,expectedCable:expected.cable,message:''};
 if((port!=='unknown'&&port!==expected.port)||(cable!=='unknown'&&cable!==expected.cable)){
  return {...result,status:'mismatch',message:`类别错配：此任务应使用 ${ports[expected.port]}，以及${cables[expected.cable]}。端口作用不同，不能因外观或收发器相同而互换。`};
 }
 if(purpose==='aurora'&&auroraLicense==='absent')return {...result,status:'blocked',categoryMatch:port===expected.port&&cable===expected.cable,message:'条件不符：未配备单独购买的 Aurora 功能时，GT 21–24 禁用；不能借作 I/O 或其他连接。'};
 if(port==='unknown'||cable==='unknown')return {...result,message:'尚未选定源端口或线缆类别，不判定匹配。'};
 result.categoryMatch=true;
 if(purpose==='aurora')return {...result,message:auroraLicense==='unknown'?'类别相符，但 Aurora 许可尚未确认；对端型号、协议配置和速率也未核对。':'类别相符且已假设配备 Aurora，但本章未确认具体对端和协议配置，仍不能判断整条连接可用。'};
 if(purpose==='sync')return {...result,message:'光口类别相符；具体 GTSYNC 对端、介质细项与配置仍待核对。这里不能替代 IRC 或 GBH，也不判断时源锁定。'};
 return {...result,status:'match',message:'类别匹配：仅核对本页列出的用途、源端口和线缆类别，不代表具体对端、配置或真实接线已获确认。'};
}

/** Ordered chain rules from PDF 150 only. Unknown cards never produce a pass. */
export function checkNovaOneChain(input){
 const result={status:'invalid',cards:[],cardCount:0,errors:[],unknowns:[],warnings:[],sourcePages:[150]};
 const issue=(code,message)=>({code,message});
 if(!input||typeof input!=='object'||Array.isArray(input)||!(typeof input.cards==='string'||Array.isArray(input.cards))||(input.timeCritical!==undefined&&typeof input.timeCritical!=='boolean')){
  result.errors.push(issue('invalid-input','请输入按顺序排列的卡型，时敏选项必须是明确的开 / 关假设。'));return result;
 }
 const raw=typeof input.cards==='string'?(input.cards.trim()===''?[]:input.cards.split(',')):Array.from(input.cards);
 if(raw.some(card=>typeof card!=='string')){result.errors.push(issue('invalid-input','每个位置都须填写有效卡型文字。'));return result;}
 result.cards=raw.map(card=>card.trim().toUpperCase());result.cardCount=result.cards.length;
 if(!result.cardCount){result.status='unknown';result.unknowns.push(issue('empty-chain','尚未填写卡链，不判断组合。'));return result;}
 if(result.cards.some(card=>card===''))result.errors.push(issue('empty-position','卡链存在空位置；请填写卡型，不要使用连续逗号或末尾逗号。'));
 if(result.cardCount>8)result.errors.push(issue('too-many-cards',`当前 ${result.cardCount} 张卡，超过每个 GT 1–20 端口最多 8 张的上限。`));
 if(result.cardCount>1&&result.cards.some(card=>exclusiveTypes.has(card)))result.errors.push(issue('exclusive-port','GTNET、GTFPGA 各自需要独占主机光端口，不支持在同端口级联其他卡。'));
 if(result.cardCount>1&&result.cards.includes('GTSOCV1'))result.unknowns.push(issue('gtsoc-chain-unverified','GTSOC V1 在支持清单内，但本页没有明确其级联规则；混链保持待核对。'));
 const gtaiCount=result.cards.filter(card=>card==='GTAI').length;
 if(gtaiCount>1||(gtaiCount&&result.cards.includes('GTDI')))result.errors.push(issue('gtai-other-input','含 GTAI 的链不能有其他输入卡，包括 GTDI 或第二张 GTAI。'));
 if(gtaiCount&&result.cards.includes('GTFPI'))result.unknowns.push(issue('gtai-gtfpi-unverified','GTFPI 在本章支持列表内，但本页不据此推断它与 GTAI 共链时的输入约束；须核对 GTFPI 专章。'));
 for(const card of new Set(result.cards.filter(card=>card&&!cardTypes.has(card))))result.unknowns.push(issue('unknown-card',`未核对卡型“${card}”；不会把未知卡型当成可兼容的输出卡。`));
 if(input.timeCritical&&result.cards.some((card,index)=>card==='GTDI'&&index>0))result.warnings.push(issue('time-critical-input-order','时序提醒：已假设 GTDI 接收时敏输入，应优先放在链首以考虑延时；这是顺序建议，不是新增的硬性禁配规则。'));
 result.status=result.errors.length?'invalid':result.unknowns.length?'unknown':result.warnings.length?'warning':'match';
 return result;
}

