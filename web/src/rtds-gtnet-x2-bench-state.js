export const x2Pairs={
 gtA:{a:'N.GT1',b:'X.GT_A',medium:'gt'},
 gtB:{a:'N.GT2',b:'X.GT_B',medium:'gt'},
 lanA:{a:'X.LAN_A',b:'S_A.p1',medium:'ethernet'},
 lanB:{a:'X.LAN_B',b:'S_B.p1',medium:'ethernet'}
};
export function wireX2(state,a,b,medium){
 const entry=Object.entries(x2Pairs).find(([,p])=>p.medium===medium&&((p.a===a&&p.b===b)||(p.a===b&&p.b===a)));
 return entry?{...state,[entry[0]]:!state[entry[0]]}:{...state};
}
