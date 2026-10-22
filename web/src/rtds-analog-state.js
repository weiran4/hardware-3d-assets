// Ideal, browser-only teaching values. No RTDS execution, device timing, or I/O.
const sourceRms=220,sourcePeak=sourceRms*Math.SQRT2,outputPeak=5,frequencyHz=50,displayCycleMs=4000;
export const analogLesson=Object.freeze({
 sourceRms,sourcePeak,outputPeak,frequencyHz,hardwarePeak:10,
 gain:outputPeak/sourcePeak,outputRms:outputPeak/Math.SQRT2,
 displayCycleMs,slowdown:displayCycleMs/(1000/frequencyHz),contactMs:800,durationMs:8000,
 endpoint:Object.freeze({variantId:'novacor-2.0',portId:'novacor-2.0-2023.ao1',groundId:'novacor-2.0-2023.gnd1'})
});
export function analogSample(simulatedSeconds){
 const sine=Math.sin(2*Math.PI*frequencyHz*simulatedSeconds);
 return{source:sourcePeak*sine,output:outputPeak*sine};
}
export function analogDisplaySample(elapsedMs){
 const simulatedSeconds=elapsedMs/1000/analogLesson.slowdown;
 return{...analogSample(simulatedSeconds),simulatedSeconds,meterRms:analogLesson.outputRms};
}
export function createAnalogLessonState(){return{elapsedMs:0,playing:false,started:false};}
export function analogProbeProgress(state,reducedMotion=false){
 return !state.started?0:reducedMotion?1:Math.max(0,Math.min(1,state.elapsedMs/analogLesson.contactMs));
}
export function analogPresentation(state,reducedMotion=false){const contact=analogProbeProgress(state,reducedMotion)>=1;return{probesConnected:contact,meterReady:contact,scaled:true};}
export function analogLessonTransition(state,action){
 switch(action.type){
 case 'replay':return{...createAnalogLessonState(),playing:true,started:true};
 case 'play':return state.elapsedMs>=analogLesson.durationMs?analogLessonTransition(state,{type:'replay'}):{...state,playing:true,started:true};
 case 'pause':return{...state,playing:false};
 case 'tick':{
  if(!state.playing||!Number.isFinite(action.deltaMs)||action.deltaMs<0)return state;
  const elapsedMs=Math.min(state.elapsedMs+action.deltaMs,analogLesson.durationMs);
  return{...state,elapsedMs,playing:elapsedMs<analogLesson.durationMs};
 }
 default:return state;
 }
}
