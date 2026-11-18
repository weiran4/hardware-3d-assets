// Bounded two-Light teaching configurations, not a live network validator.
export const defaultLightNetwork=Object.freeze({topology:'direct',sync:false,data:false,p2p:true,port:'irc',medium:'optical'});
export function evaluateLightNetwork(input={}){
 const s={...defaultLightNetwork,...input},valid=['direct','hub','switch'].includes(s.topology),links=[],issues=[];
 const syncReady=valid&&s.sync&&s.medium==='optical',dataReady=valid&&s.data&&s.medium==='optical'&&s.port==='irc',configurationReady=valid&&s.p2p===(s.topology==='direct');
 if(valid&&s.sync){if(s.topology==='direct')links.push({a:'A.gb',b:'B.gb',network:'sync'});else links.push({a:'A.gb',b:'H.a',network:'sync'},{a:'H.b',b:'B.gb',network:'sync'});}
 if(valid&&s.data){if(s.topology==='switch')links.push({a:'A.'+s.port,b:'S.a',network:'data'},{a:'S.b',b:'B.'+s.port,network:'data'});else links.push({a:'A.'+s.port,b:'B.'+s.port,network:'data'});}
 if(!valid)issues.push('仅支持所列双Light教学配置。');if(!s.sync)issues.push('缺少Global Bus同步路径。');if(!s.data)issues.push('缺少IRC数据路径；同步线不承载此路径。');if(s.port!=='irc')issues.push('WIF用于管理，不能代替IRC数据接口。');if(s.medium!=='optical')issues.push('本例需各接口对应的受支持光纤连接，不能用普通铜网线替换。');if(!configurationReady)issues.push(s.topology==='direct'?'直接同步需两台WIF配置P2P启用。':'经GBH同步需两台WIF配置P2P禁用。');
 return {ready:syncReady&&dataReady&&configurationReady,syncReady,dataReady,configurationReady,links,issues};
}
