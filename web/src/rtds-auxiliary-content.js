// Authored functional summaries. Only generic manual chapter/printed-page citations;
// no source media, private source-container identity, or inferred wiring certification.
const fpi='gtfpi-v2-2.01-capped',soc='gtsoc-v2-2a-copper16';
const ref=(chapter,revision,pages)=>({chapter,revision,pages,pageKind:'章节印刷页'});
const fp=pages=>ref('10 GTFPI V2','20240924',pages);
const sc=pages=>ref('13A GTSOC V2','20240927',pages);
const brochure={title:'RTDS · GTSOC V2 官方宣传册（第 1–2 页）',url:'https://knowledge.rtds.com/hc/en-us/article_attachments/30065880593303'};

export function auxiliaryPortContent(metadata,port){
 if(metadata.asset_id===fpi){
  if(port.group==='ribbon_header'){
   const hv=port.id.endsWith('.hv');
   return{purpose:hv?'将 GT 数据信号桥接到一块外接 HV 输出面板；板卡不是高压接点面板本体。':'将 GT 数据信号桥接到一块外接 LV 数字输入 / 输出面板。',
    rows:[['连接对象',hv?'独立的 HV 输出面板，通过排线连接。':'独立的 LV 数字 I/O 面板，通过排线连接。'],['接口数量',hv?'2 × 25 = 50 个可见针脚。':'2 × 17 = 34 个可见针脚；面板最多 16 路数字输入及 16 路数字输出，通道数不等于针脚数。'],['已核对方向',hv?'中央键槽朝板外侧；HV 首针编号未确认。':'中央键槽朝板外侧；组件面正立时，板底端标记 1 在外侧、2 在内侧。']],
    note:hv?'HV 面板额定电压不能套用到板上排针；完整电气针脚映射未建立。':'仅确认端部 1 / 2 标记；完整电气针脚映射未建立，不能推导 HV 接口编号。',source:fp([1,2,3,4,5,6])};
  }
  if(port.group==='power')return{purpose:'为 GTFPI 板卡供电，并支持机柜内电源跨接。',rows:[['连接对象','GTI/O 卡的 24 V 供电 / 跨接回路。'],['主要参数','板卡 +24 V DC；最大功耗 5 W。'],['已知功能集合','+24 V、GND、GND、NC；这不是位置顺序。']],note:'两只四接点连接器的空间引脚顺序尚未确认：资料图示视向未对齐，不能照抄其他 GTI/O 卡的针序。此处不提供电源接线判断；插拔前须断电。',source:fp([3,4])};
  if(port.group==='aux_power')return{purpose:'为独立的 HV 面板提供辅助 +5 V 供电。',rows:[['连接对象','HV 面板的辅助供电回路。'],['接口形式','绿色开放式 2 针连接器，内壁有双弧口。']],note:'两针的空间极性位置及精确配对零件未确认；不能据此接线。',source:fp([2,3,4])};
  if(port.group==='optical'){
   const upstream=port.id.endsWith('.gt1');
   return{purpose:upstream?'GT1 是板卡的上游 GT 光通信连接。':'GT2 是板卡的下游 GT 光通信连接。',rows:[['连接对象',upstream?'NovaCor，或链路中的前一块 GTI/O 卡。':'链路中的后续 GTI/O 卡；具体组合按版本章节核对。'],['链路构成','每个 GT 组件有 2 条光路，组成 1 条双工 GT 链路；两只组件分别为 GT1 / GT2。']],note:'当前外观带黑色防尘盖，盖下插接结构未建模；不能作为无盖插拔或配接依据。',source:fp([2,3,4,5,6])};
  }
 }
 if(metadata.asset_id===soc){
  if(port.group==='front_sfp')return{purpose:'本模型的 16 个前部铜 RJ45 SFP 接口用于源资料记载的 SV 通信配置。',rows:[['连接对象','IEC 61850 Sampled Values（SV）以太网通信对端。'],['实体与应用','16 个铜 SFP 插口，每口 8 个可见接点；实体数量不是通用应用通道数。'],['SV 参数','主时间步最多 16 条独立流，每口可发布和订阅一条；子步限制不同，不能直接套用。'],['配置条件','实际应用由固件、许可和所装模块共同决定。']],note:'GTSOC 平台的黑盒、MMC、Aurora Mux 等是不同应用；不表示当前铜模块适合 Aurora / 光纤连接，也不表示所有应用同时启用。',source:sc([1,2,8]),links:[brochure]};
  if(port.group==='service'){
   const role=port.id.split('.').at(-1),facts={
    monitor_ps:['MONITOR PS 用于应用 / 调试 UART 监视。','应用调试 / UART 监视终端。'],
    monitor_pl:['MONITOR PL 用于 RTDS 硬件测试监视。','RTDS 硬件测试服务终端。'],
    prog_jtag:['PROG JTAG 用于编程服务。','相应编程服务工具。']
   }[role];if(!facts)return null;
   return{purpose:facts[0],rows:[['连接对象',facts[1]],['接口形式','前部 USB-B 外形服务接口；每口 4 个可见接点。']],note:'这是服务用途，不作为运行时信号 I/O 或以太网连接；具体工具与流程按相应固件 / 服务说明核对。',source:sc([2])};
  }
  if(port.group==='rear_optical'){
   const first=port.id.endsWith('.rear1');
   return{purpose:'通过后部双工光链路连接 NovaCor；应用路由由 GTSOC 固件决定。',rows:[['连接对象','NovaCor 的相应 GT 光链路。'],['接口数量','后部 4 个双工接口；8 个白色可见面不计为电气接点。'],['当前黑盒说明','采用后部 1–4 口：官方宣传册与后部连接图一致；不把前口编号当作 ARM 核号。'],['特定角色',first?'后部 1 口另用于固件更新。':'后部 2–4 口按应用固件分配；固件更新使用另列的后部 1 口。']],note:'白色可见面是防尘盖还是套筒尚未确认，不能推定无盖内部插接几何。资料中存在“前部 1–4”的冲突段落，此处不采用该映射；当前铜前模块不自动适用于其他光纤应用。',source:sc([2,3,4]),links:[brochure]};
  }
  if(port.group==='rear_eth')return{purpose:'把 MMC 子模块监测信息传送到工作站。',rows:[['连接对象','用于完整 MMC 子模块监视的工作站。'],['监测内容','子模块数值、触发字及状态信息。'],['接口形式','后部 ETH 铜缆以太网接口，8 个可见接点。']],note:'此口不是另一种通用 NovaCor GT 光链路；用途需与 MMC 应用配置一致。',source:sc([3])};
  if(port.group==='ac_power')return{purpose:'为 GTSOC-2A 单元提供交流电源。',rows:[['连接对象','符合设备安装要求的交流供电与电源线。'],['输入范围','100–240 V AC，50/60 Hz。'],['最大功耗','32 W。'],['保险丝规格','3 A / 250 V；这是保险丝额定值，不是设备功耗。']],note:'模型仅保留带开关 / 保险丝的三片式入口外观；实际供电按铭牌与安装手册操作，不提供配线或电气安全验证。',source:sc([2,3])};
 }
 return null;
}
