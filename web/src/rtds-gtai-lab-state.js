export const gtaiTerminals={gp:'发生器 +',gm:'发生器 −',gg:'发生器 GND',ip:'CH1 +',im:'CH1 −',ig:'CH1 GND'};
export function createGtaiState(){return {wires:[],amplitude:5,scale:5,power:false};}
const normal=[['gp','ip'],['gm','im'],['gg','ig']],reverse=[['gp','im'],['gm','ip'],['gg','ig']];
export function evaluateGtai(s,phase=0){
 const has=(a,b)=>s.wires.some(w=>w[0]===a&&w[1]===b),ground=has('gg','ig');
 const forward=has('gp','ip')&&has('gm','im'),reversed=has('gp','im')&&has('gm','ip');
 let status='ready',message='三线连接正确：读取 + 与 − 之差。';
 if(s.wires.some(([a,b])=>(a==='gg')!==(b==='ig'))){status='wrong';message='信号端与参考地不能混接。先关闭发生器，再改线。';}
 else if(!ground){status='reference';message='缺少发生器到 GTAI 的参考地，读数不作为可靠值。';}
 else if(!forward&&!reversed){status='incomplete';message='请把发生器的 +、− 接到 CH1 的两个信号端。';}
 else if(!Number.isFinite(s.amplitude)||s.amplitude<0||s.amplitude>10){status='range';message='峰值超出 ±10 V 输入范围，教学联锁禁止送入。';}
 else if(!Number.isFinite(s.scale)||s.scale<0.001||s.scale>1000){status='scale';message='SC 教学范围为 0.001–1000 V/单位。SC=0 无法做除法，禁止启动。';}
 else if(reversed)message='极性接反：读数反号。地线仍保持正确。';
 const voltage=status==='ready'&&s.power?s.amplitude*Math.sin(2*Math.PI*(Number.isFinite(phase)?phase:0))*(reversed?-1:1):null;
 return {status,message,voltage,engineering:voltage===null?null:voltage/s.scale,reversed,valid:status==='ready',ground};
}
export function transitionGtai(s,a){
 if(a.type==='reset')return createGtaiState();
 if(a.type==='power')return {...s,power:s.power?false:evaluateGtai(s).valid};
 if(a.type==='example')return {wires:(a.kind==='reversed'?reverse:a.kind==='ground'?normal.slice(0,2):normal).map(w=>[...w]),amplitude:a.kind==='range'?12:5,scale:a.kind==='scale-zero'?0:a.kind==='scale-double'?2:5,power:false};
 if(a.type==='scale'&&!s.power&&Number.isFinite(a.value)&&(a.value===0||a.value>=0.001)&&a.value<=1000)return {...s,scale:a.value};
 if(a.type==='amplitude'&&!s.power&&Number.isFinite(a.value)&&a.value>=0&&a.value<=20)return {...s,amplitude:a.value};
 if(a.type==='wire'&&!s.power&&['gp','gm','gg'].includes(a.from)&&['ip','im','ig'].includes(a.to)){
  const exists=s.wires.some(([x,y])=>x===a.from&&y===a.to);
  return {...s,wires:exists?s.wires.filter(([x,y])=>!(x===a.from&&y===a.to)):[...s.wires.filter(([x,y])=>x!==a.from&&y!==a.to),[a.from,a.to]]};
 }
 return s;
}
