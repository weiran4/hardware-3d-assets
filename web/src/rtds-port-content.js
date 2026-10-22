import {auxiliaryPortContent} from './rtds-auxiliary-content.js';
// Functional descriptions are source facts, separate from unvalidated model geometry.
// PDF page numbers refer to the user-provided compilation; no manual/media is shipped.
const source=(chapter,revision,pages)=>({chapter,revision,pages});
const nc=pages=>source('NovaCor 2.0','20250916',pages);
const gtdi=pages=>source('GTDI V2','20241219',pages);
const opticalCable=['接口 / 线缆','双工 LC 光纤连接；手册支持 Finisar FTLF8519P3BNL SFP，850 nm 多模。'];
const ncContent={
 analogue:{purpose:'将仿真中的模拟量送到前面板，用于信号监视。',rows:[['连接对象','外部模拟量监视设备'],['主要参数','12 路、12 bit D/A；输出范围 ±10 V 峰值，最大 20 mA。']],note:'这些前面板输出用于监视，手册不建议直接连接外部控制或保护设备；精密硬件接口采用 GTAO。',source:nc([70,72,73])},
 ground:{purpose:'为前面板模拟输出提供接地参考连接。',rows:[['连接对象','前面板模拟量监视回路的参考地'],['主要参数','前面板共 3 个模拟输出接地端口。']],source:nc([70])},
 gtio:{purpose:'通过光纤在 NovaCor 仿真系统与 GTI/O 卡之间交换输入 / 输出数据。',rows:[['连接对象','GTI/O 输入 / 输出卡'],opticalCable,['端口范围','GT 1–20；不是 Aurora 专用的 GT 21–24。']],note:'具体卡型与级联限制应按相应版本章节核对；这里不把所有 GTI/O 卡组合视为通用兼容。',source:nc([71,72,74])},
 aurora:{purpose:'用于 Aurora 协议通信的专用光纤接口。',rows:[['连接对象','Aurora 通信对端'],opticalCable,['端口范围','GT 21–24，共 4 口。']],note:'Aurora 需单独购买授权；未授权时这 4 口禁用，不能改作 GTI/O 或其他连接。',source:nc([71,72,74])},
 irc:{purpose:'在多个 RTDS 机架之间传输仿真数据。',rows:[['连接对象','其他 NovaCor 机箱的 IRC 端口，或 IRC Switch'],opticalCable,['主要参数','IRC 1–6，共 6 个机架间通信端口。']],source:nc([71,72,97,98,99])},
 gtsync:{purpose:'把外部同步参考经 GTSYNC 卡送入仿真系统。',rows:[['连接对象','GTSYNC 卡的 GT Port 1，或 GTSYNCv2 单元的 GT 端口'],opticalCable,['主要参数','1 个专用 GTSYNC 光通信端口。']],note:'此口接 GTSYNC 的 GT 接口，不直接连接外部时钟的 BNC / ST；GTSYNC 不与其他 GTI/O 卡级联。',source:nc([71,72]),extraSources:[source('11B GTSYNC','20240924',[489,491]),source('11A GTSYNCv2','20260603',[470,471])]},
 udp:{purpose:'通过以太网交换 UDP 数据；与工作站管理连接分开。',rows:[['连接对象','UDP 以太网通信对端'],['接口形式','铜缆 SFP 以太网口；机箱丝印为 ETH。']],source:nc([71,72])},
 wif:{purpose:'将 NovaCor 连接至运行 RSCAD 的工作站网络。',rows:[['连接对象','RSCAD 工作站 / 工作站以太网网络'],['主要参数','1 个千兆以太网接口；不是 GT 光纤端口。']],source:nc([71,72,79,80])},
 gbh:{purpose:'Global Bus 光连接用于多机系统的时间同步。',rows:[['连接对象','两机可通过 GBH 端口直接互连；3 台及以上经 Global Bus Hub。'],['接口 / 线缆','专用双支 Global Bus 光缆，非 LC / SFP；1 mm POF（黑色）或 200 μm HCS（蓝色）。'],['直连长度上限','协议 A + POF：20 m；协议 B + POF：50 m；协议 B + HCS：100 m。'],['经 GBHv3 上限','协议 A + POF：30 m；协议 B + POF / HCS：50 m / 100 m。']],note:'协议 B 要求支持的设备与固件（NovaCor RTFPGA 0356 或更新）；经 GBH 的长线方案需 GBHv3，若同时使用 IRC Switch 且超过 30 m，需 IRC Switch V2。GBHv1/v2 的手册表仅列协议 A + POF 30 m。',source:nc([80,81,82]),extraSources:[source('4A Global Bus Hub V3','20250910',[197,198,200,201]),source('14 Auxiliary Hardware Information','20231016',[543,544])]},
 front_led_power:{purpose:'为前面板 LED 提供电源连接，并配合 LED 电源来源选择。',rows:[['连接对象','前面板 LED 供电回路'],['说明','这是 LED 供电入口，不是主交流电源或通信接口。']],source:nc([71])},
 ac_power:{purpose:'为 NovaCor 机箱提供主交流电源。',rows:[['连接对象','设备随附的交流电源线'],['主要参数','100–240 V AC；整机最大功耗 290 W（100 VAC 时 2.9 A）。']],note:'手册指定使用随设备提供的电源线；真实供电按设备铭牌和安装手册操作。',source:nc([67,71])}
};
export function portContent(metadata,port){
 if(!port||port.interactive===false)return null;
 const auxiliary=auxiliaryPortContent(metadata,port);if(auxiliary)return auxiliary;
 if(metadata.asset_id==='novacor-2.0-2023'){const content=ncContent[port.group];if(!content)return null;const links=['gtio','aurora','irc','gtsync'].includes(port.group)?[{title:'Coherent · FTLF8519P3BNL 收发器规格',url:'https://www.coherent.com/networking/transceivers/datacom/FTLF8519P3BNL'}]:port.group==='gbh'?[{title:'RTDS · Global Bus Hub',url:'https://knowledge.rtds.com/hc/en-us/articles/360034815313-Global-Bus-Hub'}]:[];return{...content,links};}
 if(metadata.asset_id==='gtdi-v2-2.01'){
  if(port.group==='digital_input')return{purpose:'将外部设备的数字状态或控制脉冲输入 RTDS 仿真。',rows:[['连接对象','外部数字信号源；干接点使用方式需按手册配置。'],['通道配置','整卡 64 个输入通道，分为 8 个相互隔离的 BANK；16 个五位插头共 80 个端子位置。'],['逻辑电平','手册逻辑高为 3–50 V，逻辑低为 0–1.5 V；V2 输入电流限制为 3.5–7 mA。'],['本插头标识',port.contact_labels.join(' · ')],['端子插头','Phoenix Contact 1803604']],note:'V+(WET) 用于干接点湿润电源。外部信号源主动驱动输入时，不得向该组 V+(WET) 加电（手册警告）。',source:gtdi([404,406,407,414])};
  if(port.group==='optical'){const upstream=port.id.endsWith('.gt1');return{purpose:upstream?'Port 1 是 GTDI 的上游光通信接口。':'Port 2 用于连接后续 GTI/O 卡的光通信链路。',rows:[['连接对象',upstream?'NovaCor 主机，或链路中的前一张 GTI/O 卡。':'链路中的后续 GTI/O 卡。'],['接口形式','双工 LC 光纤接口'],['数据用途','把外部数字输入传入 RTDS；光传输角色与单向应用数据不同。']],note:'具体级联组合受主机与卡型版本限制，不表示任意混接都被支持。',source:gtdi([404,405,410,411,422])};}
  if(port.group==='power'){const upper=port.id.endsWith('.power1');return{purpose:upper?'POWER 1 是板卡的主电源连接。':'POWER 2 供机柜内电源串接使用。',rows:[['连接对象',upper?'机柜内 GTI/O 卡电源。':'机柜中后续卡的电源连接。'],...(upper?[['主要参数','标称 +24 VDC；输入范围 +21 至 +26 VDC；整卡约 8 W。'],['已核对引脚','+24V · GND · GND · NC（板卡正立时，自上而下）']]:[['引脚信息','4 个位置；引脚顺序未核对，不能照抄 POWER 1。']])],note:'插拔板卡电源线前必须断电。',source:gtdi([404,408])};}
 }
 const card={
  'gtdo-v2-2.00':{chapter:'GTDO V2',pages:[362,364,365,370],power:'标称 +24 VDC 为板卡逻辑供电，最大 5 W；与输出 BANK 的外部电源不同。'},
  'gtai-v2-2.31':{chapter:'GTAI V2',pages:[336,339,341,347],power:'板卡由 +24 VDC 电源供电。'},
  'gtao-v2-2.20':{chapter:'GTAO V2',pages:[276,281,282,289,290],power:'板卡 +24 VDC 电源，最大 15 W。'}
 }[metadata.asset_id];
 if(card){const ref=source(card.chapter,'20240924',card.pages);
  if(port.group==='digital_output')return{purpose:'将 RTDS 仿真中的数字状态输出给外部设备。',rows:[['连接对象','外部数字输入设备 / 控制回路'],['通道配置','64 个数字输出通道，8 个 BANK；16 个五位插头共 80 个端子位置。'],['输出形式','开射极输出；每个 8 通道 BANK 使用独立的外部 +5 至 +30 VDC 输出电源。'],['本插头标识',port.contact_labels.join(' · ')],['电源区分','BANK 的 V+ / V− 为输出回路供电，与板卡逻辑的 +24 V 电源分开。']],source:ref};
  if(port.group==='analogue_input')return{purpose:'把外部差分模拟信号采集为 RTDS 仿真输入。',rows:[['连接对象','外部模拟信号源'],['主要参数','12 路差分输入；±10 V 输入范围，16-bit ADC，输入阻抗 24 kΩ。'],['本通道端子',port.contact_labels.join(' · ')],['地连接','12 路 GND 端子内部共地。'],['手册采样参数','各通道同步采样，采样数据每 1.0 μs 送往 NovaCor；这是硬件规格，不是网页运行时序。']],source:ref};
  if(port.group==='analog_output')return{purpose:'将 RTDS 仿真数据转换为外部设备可接收的模拟输出。',rows:[['连接对象','外部模拟输入设备'],['主要参数','16 路模拟输出；±10 V 范围，16-bit DAC，每路 10 mA 驱动能力。'],['本通道端子',port.contact_labels.join(' · ')],['版本条件',`第 ${port.channel} 路；第 13–16 路仅 NovaCor 可用。`],['手册更新参数','输出以 1 μs 过采样并同步更新；这是硬件规格，不是网页运行时序。']],source:ref};
  if(port.group==='optical'){const upstream=port.id.endsWith('.gt1');return{purpose:upstream?'GT1 是板卡的上游光通信接口。':'GT2 为后续 GTI/O 卡提供下游光通信连接。',rows:[['连接对象',upstream?'仿真主机，或链路中的前一张 GTI/O 卡。':'链路中的后续 GTI/O 卡。'],['接口形式','双工 LC 光纤接口']],note:'这是接口角色说明；实际链路组合、光纤和收发器须按对应主机与卡型版本核对。',source:ref};}
  if(port.group==='power'){const upper=port.id.endsWith('.power1');return{purpose:upper?'POWER 1 是板卡的上部主电源连接。':'下部 POWER 2 属于板卡供电连接区域。',rows:[['连接对象','GTI/O 卡电源连接'],['板卡供电',card.power],...(upper?[['已核对引脚',port.contact_labels.join(' · ')+'（板卡正立时，自上而下）']]:[['引脚信息','4 个位置；引脚顺序未核对，不能照抄 POWER 1。']])],note:'插拔板卡电源线前必须断电。',source:ref};}
 }
 return null;
}
