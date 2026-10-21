// A presentation state machine only: no physical/electrical or RTDS timing model.
export const signalFlowEndpoints=[
 {variantId:'gtdi-v2',assetId:'gtdi-v2-2.01',portId:'gtdi-v2-2.01.gt1',pdfPages:[404,405,411,422]},
 {variantId:'novacor-2.0',assetId:'novacor-2.0-2023',portId:'novacor-2.0-2023.gt1',pdfPages:[72,74]}
];
export function createSignalFlowState(){return{input:0,sampled:null,received:null,phase:'idle',playing:false,transfers:0};}
function advance(state){
 if(state.phase==='idle'||state.phase==='received')return{...state,sampled:state.input,phase:'field'};
 if(state.phase==='field')return{...state,phase:'optical'};
 return{...state,received:state.sampled,phase:'received',transfers:state.transfers+1};
}
export function signalFlowTransition(state,action){
 switch(action.type){
 case 'input':return action.value===0||action.value===1?{...state,input:action.value}:state;
 case 'play':return{...state,playing:true};
 case 'pause':return{...state,playing:false};
 case 'step':return{...advance(state),playing:false};
 case 'tick':return state.playing?advance(state):state;
 case 'reset':return createSignalFlowState();
 default:return state;
 }
}
