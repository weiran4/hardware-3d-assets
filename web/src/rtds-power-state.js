// Original teaching timeline; not a power-system simulation or device control.
export const powerLesson=Object.freeze({voltage:24,contactMs:1600,energizeMs:1900,durationMs:6000,variantId:'gtao-v2',assetId:'gtao-v2-2.20'});
export function createPowerLessonState(){return{elapsedMs:0,playing:false,started:false};}
export function powerLessonTransition(state,action){
 switch(action.type){
 case 'replay':return{elapsedMs:0,playing:true,started:true};
 case 'play':return state.elapsedMs>=powerLesson.durationMs?powerLessonTransition(state,{type:'replay'}):{...state,playing:true,started:true};
 case 'pause':return{...state,playing:false};
 case 'tick':{if(!state.playing||!Number.isFinite(action.deltaMs)||action.deltaMs<0)return state;const elapsedMs=Math.min(powerLesson.durationMs,state.elapsedMs+action.deltaMs);return{...state,elapsedMs,playing:elapsedMs<powerLesson.durationMs};}
 default:return state;
 }
}
export function powerPresentation(state,reducedMotion=false){
 const progress=!state.started?0:reducedMotion?1:Math.min(1,Math.max(0,state.elapsedMs/powerLesson.contactMs));
 const connected=progress===1,energized=connected&&state.elapsedMs>=powerLesson.energizeMs;
 return{feedProgress:progress,jumperProgress:progress,connected,energized,sourceVoltage:energized?24:0,cardVoltage:energized?[24,24]:[0,0],pulsePhase:energized&&!reducedMotion&&state.playing?((state.elapsedMs-powerLesson.energizeMs)%1800)/1800:null};
}
