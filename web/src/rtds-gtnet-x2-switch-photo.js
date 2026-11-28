// A copper-only appearance example. Never imply qualification for PRP, SV
// or GOOSE traffic, or map these physical RJ45s to optical or direct paths.
export function useX2Gs316(state){
 return state?.mode==='normal'&&!state.direct&&state.medium==='copper'&&
  (state.speed===100||state.speed===1000)&&state.duplex==='full';
}
export const x2PhotoJacks=Object.freeze({S_A:Object.freeze([1,2,3]),S_B:Object.freeze([1,2])});
