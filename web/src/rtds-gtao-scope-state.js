// Ideal teaching model, not sampled RTDS data or measured DAC behaviour.
export const scopeInitial=()=>({amplitude:100,scale:100,load:1000000,wiring:'open',playing:false,time:0});
export function scopeSample(value,scale){return Math.max(-10,Math.min(10,5*value/scale));}
export function scopeResult(s){
 if(!Number.isFinite(s.scale)||s.scale<=0||!Number.isFinite(s.amplitude)||s.amplitude<0||![50,1000000].includes(s.load))return{status:'invalid'};
 const requested=5*s.amplitude/s.scale,peak=Math.min(10,requested),current=peak/s.load,polarity=s.wiring==='reversed'?-1:1;
 return{status:s.wiring==='reversed'?'unsafe':s.wiring!=='normal'?'open':current>.01?'overload':'ready',requested,peak,current,polarity,clipped:requested>10};
}
export function scopeTransition(s,a){
 if(a.type==='pause')return{...s,playing:false};
 if(a.type==='play'||a.type==='replay')return{...s,playing:scopeResult(s).status==='ready',time:a.type==='replay'?0:s.time};
 if(a.type==='tick')return s.playing&&Number.isFinite(a.delta)&&a.delta>=0?{...s,time:s.time+a.delta}:s;
 if(s.playing)return s;
 if(a.type==='wiring'&&['open','signal','normal','reversed'].includes(a.value))return{...s,wiring:a.value};
 if(['scale','amplitude','load'].includes(a.type))return{...s,[a.type]:Number(a.value)};
 return s;
}
