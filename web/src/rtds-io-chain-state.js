export const chainTypes=['gtdo-v2','gtao-v2','gtdi-v2','gtai-v2'];
export const chainLabel=id=>({'gtdo-v2':'GTDO V2','gtao-v2':'GTAO V2','gtdi-v2':'GTDI V2','gtai-v2':'GTAI V2'}[id]||id);
export function createChainState(){return {cards:['gtdo-v2','gtao-v2','gtdo-v2'],links:['none','none','none'],port:1,chassis:1,configured:false};}
export function evaluateChain(s){
 const errors=[],warnings=[],cards=s.cards||[],links=s.links||[];
 if(cards.length<1||cards.length>8)errors.push('每个GT口最多8张I/O卡；第9张不能纳入此链。');
 if(!Number.isInteger(s.port)||s.port<1||s.port>20)errors.push('NovaCor 2.0 的GT1–20用于I/O；GT21–24属于Aurora，不能按此链连接。');
 if(cards.some(k=>!chainTypes.includes(k)))errors.push('本实验仅支持已核对的四类GTIO V2；GTNET、GTSOC、GTFPGA应用不得普通菊链。');
 if(cards.includes('gtai-v2')&&cards.filter(k=>['gtai-v2','gtdi-v2'].includes(k)).length>1)errors.push('有GTAI时，此链不得再含其他输入卡，包括GTDI或第二张GTAI。');
 if(links.length!==cards.length||cards.some((_,i)=>links[i]!=='top'))errors.push('连接应进入每张卡的上方GT1；下方GT2仅用于接续下一卡。');
 if(cards.some((card,index)=>card==='gtdi-v2'&&index>0))warnings.push('若GTDI接收时间关键输入，应优先放在链首。此处不估算延时。');
 let reachable=0;while(reachable<cards.length&&links[reachable]==='top')reachable++;
 const counts={},numbers=[];if(errors.length===0&&s.configured)for(const card of cards)numbers.push(counts[card]=(counts[card]||0)+1);
 return {valid:!errors.length,errors,warnings,reachable,numbers};
}
export function transitionChain(s,a){
 const n={...s,cards:[...s.cards],links:[...s.links]};
 const index=Number.isInteger(a.index)&&a.index>=0&&a.index<n.cards.length;
 if(a.type==='configure'){n.configured=evaluateChain(n).valid;return n;}
 if(a.type==='reset')return createChainState();
 if(a.type==='example'){
  n.cards=a.kind==='input'?['gtai-v2','gtdi-v2','gtao-v2']:a.kind==='limit'?Array(9).fill('gtdo-v2'):['gtdo-v2','gtao-v2','gtdo-v2'];
  n.links=n.cards.map(()=>'top');if(a.kind==='bottom')n.links[1]='bottom';n.configured=false;n.port=1;return n;
 }
 if(a.type==='link'&&index&&['none','top','bottom'].includes(a.value))n.links[a.index]=a.value;
 else if(a.type==='add'&&chainTypes.includes(a.kind)&&n.cards.length<9){n.cards.push(a.kind);n.links.push('none');}
 else if(a.type==='remove'&&index&&n.cards.length>1){n.cards.splice(a.index,1);n.links=n.cards.map(()=>'none');}
 else if(a.type==='move'&&index&&[-1,1].includes(a.delta)&&a.index+a.delta>=0&&a.index+a.delta<n.cards.length){[n.cards[a.index],n.cards[a.index+a.delta]]=[n.cards[a.index+a.delta],n.cards[a.index]];n.links=n.cards.map(()=>'none');}
 else if(a.type==='port'&&Number.isInteger(a.value)&&a.value>=1&&a.value<=24)n.port=a.value;
 else if(a.type==='chassis'&&Number.isInteger(a.value)&&a.value>=1&&a.value<=99)n.chassis=a.value;
 else return s;
 n.configured=false;return n;
}
