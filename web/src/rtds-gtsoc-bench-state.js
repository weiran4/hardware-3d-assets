// Course36; manual PDF529–531, RTDS GTSOC V2 July2026, Imperix PN122.
export const defaultGtsoc=Object.freeze({app:'mmc',firmware:'mmc',group:'front',medium:'optical',compatible:true,returnPath:true,connected:false});
export function evaluateGtsoc(s=defaultGtsoc){
 const x={...defaultGtsoc,...s},issues=[];
 if(x.app!=='mmc')return {status:'reference',ready:false,issues:[]};
 if(x.firmware!=='mmc')issues.push('功能由活动固件定义：SV固件不能直接运行此MMC控制闭环。');
 if(x.group!=='front')issues.push('外部MMC控制使用前部应用接口组；后部主机/黑盒接口组不是此例的控制接口。未指定编号插孔。');
 if(x.medium!=='optical')issues.push('铜SFP/Ethernet外观不证明Aurora兼容；此例需要双方匹配的光学链路。');
 if(!x.compatible)issues.push('必须核对双方光学条件、Aurora配置与MMC专用驱动/帧映射；通用Aurora不等于MMC接口兼容。');
 if(!x.returnPath)issues.push('只有控制命令并未形成闭环，还需来自模型的测量反馈与对应映射。');
 return {status:issues.length?'blocked':x.connected?'ready':'disconnected',ready:!issues.length&&!!x.connected,issues};
}
