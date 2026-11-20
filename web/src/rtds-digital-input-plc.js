import * as THREE from 'three';

export const siemensReference=Object.freeze({
 model:'SIMATIC S7-1200 CPU 1212C DC/DC/DC',sku:'6ES7212-1AE40-0XB0',dimensionsMm:[90,100,75],
 photo:'https://www.plcdepartment.com/products/6es7212-1ae40-0xb0',
 document:'https://cache.industry.siemens.com/dl/files/752/109955752/att_1268341/v1/SIMATIC_S7-1200_CPU_6ES7212-1AE40-0XB0_DI_FA_EPD00042.01.pdf#page=1'
});

// Original profile/door geometry. The photographed machine's closed outer
// shape is distinct from the simulated output nodes placed beside it.
export function placeSiemensPlc(plc,{box,mesh,material,mark}){
 plc.userData={...siemensReference,origin:'original-photo-grounded',mechanicalAccuracy:'front and observed oblique exterior only'};
 const body=material(0x43515e),door=material(0x526071),rim=material(0x697887),deep=material(0x242e39);
 const darkWindow=material(0x25332c),turquoise=material(0x108c8e);
 const outline=[[-.0365,-.049],[.027,-.049],[.0373,-.039],[.0373,.035],[.024,.049],[.021,.049],[.019,.041],[-.003,.041],[-.005,.049],[-.0365,.049]];
 const shape=new THREE.Shape(outline.map(([z,y])=>new THREE.Vector2(-z,y)));
 const geo=new THREE.ExtrudeGeometry(shape,{depth:.088,bevelEnabled:true,bevelThickness:.001,bevelSize:.001,bevelSegments:2});
 geo.rotateY(Math.PI/2);geo.translate(-.044,0,0);
 mesh(geo,body,plc).name='plc-beveled-shell';
 function cover(name,x,w,y,h){
  const shp=new THREE.Shape([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(v=>new THREE.Vector2(...v)));
  const obj=mesh(new THREE.ExtrudeGeometry(shp,{depth:.0009,bevelEnabled:true,bevelThickness:.00065,bevelSize:.0007,bevelSegments:2}),door,plc);
  obj.position.set(x,y,.0373);obj.name=name;
  return obj;
 }
 cover('plc-top-door',0,.086,.026,.025);
 cover('plc-access-door',-.007,.036,-.003,.027);
 cover('plc-right-io-cover',.027,.030,-.003,.027);
 cover('plc-left-status-cover',-.035,.016,-.003,.027);
 cover('plc-bottom-door',0,.086,-.0295,.0225);
 for(const y of [.012,-.018])for(const [x,w] of [[-.035,.014],[-.007,.034],[.027,.028]])box([w,.0012,.001],[x,y,.0394],rim,plc);
 for(const x of [-.043,.043])for(const y of [.015,-.021])box([.0008,.006,.0012],[x,y,.0385],deep,plc);
 box([.018,.0051,.001],[-.031,.031,.0393],turquoise,plc).name='siemens-turquoise-badge';
 mark('SIEMENS',[-.031,.031,.0401],[.017,.0046],plc,'center','#ffffff');
 for(const [label,x,y,w] of [['SIMATIC',.030,.029,.024],['S7-1200',.030,.024,.024],['CPU 1212C',.040,-.006,.026],['DC/DC/DC',.040,-.011,.025],['DI a',.017,.002,.010],['DQ a',.017,-.013,.010]]){
  mark(label,[x,y,.0397],[w,.0031],plc,'right','#d4dfe0');
 }
 const statusBank=(name,x,y,count)=>{
  const bank=new THREE.Group();bank.name=name;plc.add(bank);
  for(let i=0;i<count;i++) box([.00225,.0017,.0008],[x+i*.00335,y,.0396],darkWindow,bank);
 };
 statusBank('plc-cpu-status',-.040,.0082,3);
 statusBank('plc-input-status',.015,.0082,8);
 statusBank('plc-output-status',.015,-.0155,6);
 statusBank('plc-unassigned-window-pair',.0351,-.0155,2);
 // Characteristic top tunnel with flanking capsule vents. Terminals are
 // represented as a physical row only: no numbered pins or attachment anchors.
 box([.081,.0007,.020],[0,.0421,.008],deep,plc).name='plc-recessed-top-bay';
 for(const x of [-.042,.042])box([.004,.008,.024],[x,.045,.008],body,plc);
 box([.077,.001,.0025],[0,.0429,.017],rim,plc);
 for(let i=0;i<15;i++) {
  const x=-.0385+i*.0055;
  box([.0032,.0035,.0032],[x,.044,.002],rim,plc);
  box([.0036,.0011,.005],[x,.0429,.010],body,plc);
  box([.0038,.0007,.004],[x,.050,-.017],deep,plc);
  box([.0038,.0007,.003],[x,.050,-.023],deep,plc);
 }
 for(const x of [-.045,.045])for(const y of [.021,.027,.033])box([.0005,.002,.016],[x,y,-.007],deep,plc);
}
