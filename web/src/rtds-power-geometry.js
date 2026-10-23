import * as THREE from 'three';

// Board meshes/materials are immutable clones of the published GTAO GLB.
// Only assembly placement changes: the already-exported Y-up asset is stood upright.
// Cables terminate at connector centers behind opaque sleeves, never at inferred pins.
export function createPowerAssembly(template,metadata){
 const group=new THREE.Group(),ownedGeometry=new Set(),ownedMaterials=new Set();
 const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.65,...extra});ownedMaterials.add(m);return m;};
 const gray=material(0xa9b1b7,{metalness:.3}),dark=material(0x293743),white=material(0xe3e5de),yellow=material(0xd0a414),black=material(0x26313a);
 function mesh(geometry,mat,parent=group){ownedGeometry.add(geometry);const m=new THREE.Mesh(geometry,mat);parent.add(m);return m;}
 function box(size,position,mat=gray,parent=group){const m=mesh(new THREE.BoxGeometry(...size),mat,parent);m.position.fromArray(position);return m;}
 const boards=[.14,-.07].map(y=>{const b=template.clone(true);b.rotation.x=Math.PI/2;b.position.set(.035,y,0);group.add(b);return b;});
 const find=(board,suffix)=>{let anchor;board.traverse(n=>{if(n.userData.sid===metadata.asset_id+'.'+suffix)anchor=n;});if(!anchor)throw Error('模型缺少真实供电接口 '+suffix);return anchor;};
 const anchors={upperInput:find(boards[0],'power2'),lowerInput:find(boards[1],'power2'),lowerLink:find(boards[1],'power1')};
 // Original neutral source enclosure; no branded manufacturer's geometry or AC hookup.
 const supply=new THREE.Group();supply.position.set(.035,-.251,.01);group.add(supply);
 box([.077,.07,.034],[0,0,0],gray,supply);box([.019,.07,.037],[-.029,0,.002],dark,supply);box([.039,.05,.002],[.008,0,.019],white,supply);
 for(let i=0;i<7;i++)box([.023,.0014,.001],[.008,.021-i*.003,.021],dark,supply);
 const terminalNodes=[];
 for(let i=0;i<4;i++){
  const terminal=mesh(new THREE.CylinderGeometry(.0022,.0022,.002,12),white,supply);terminal.rotation.x=Math.PI/2;terminal.position.set(-.029,.014-i*.009,.023);terminalNodes.push(terminal);
 }
 anchors.supplyOutput=new THREE.Object3D();anchors.supplyOutput.position.set(-.029,.005,.024);supply.add(anchors.supplyOutput);
 const boardCenters=boards.map(board=>{const n=new THREE.Object3D();n.position.set(.069,.03,0);board.add(n);return n;});
 for(const y of [.14,-.07]){box([.16,.014,.009],[.035,y,-.007]);box([.16,.003,.012],[.035,y+.009,-.007]);box([.16,.003,.012],[.035,y-.009,-.007]);}
 group.updateMatrixWorld(true);
 const world=node=>node.getWorldPosition(new THREE.Vector3());
 const smooth=value=>value*value*(3-2*value);
 function cable(start,end,kind){
  const plugs=[start,end].map(node=>{const plug=box([.012,.026,.014],world(node).toArray(),white);plug.userData.pinMapping='not-asserted';return plug;});
  if(kind==='feed')plugs[0].visible=false;
  const tubes=[yellow,black,black].map(mat=>mesh(new THREE.BufferGeometry(),mat));
  const pulse=mesh(new THREE.SphereGeometry(.0035,10,8),material(0xffe8a0,{emissive:0xffbb22,emissiveIntensity:.5}));pulse.visible=false;
  return{start,end,kind,plugs,tubes,pulse,curve:null,lastProgress:null};
 }
 const cables={feed:cable(anchors.supplyOutput,anchors.lowerInput,'feed'),jumper:cable(anchors.lowerLink,anchors.upperInput,'jumper')};
 const indicators=boards.map(b=>{const n=mesh(new THREE.TorusGeometry(.009,.0016,8,32),material(0x169075,{emissive:0x0c6d55,emissiveIntensity:.5}));const p=world(b);n.position.set(p.x+.065,p.y+.06,.029);n.visible=false;return n;});
 function updateCable(c,progress){
  if(c.lastProgress===progress)return;c.lastProgress=progress;
  const approach=1-smooth(progress),offset=approach*.035,start=world(c.start),end=world(c.end);end.z+=offset;end.x-=approach*.02;if(c.kind==='jumper'){start.z+=offset;start.x-=approach*.02;}
  c.plugs[0].position.copy(start);c.plugs[1].position.copy(end);
  const routeX=Math.min(start.x,end.x)-(c.kind==='feed'?.087:.073);
  c.curve=new THREE.CubicBezierCurve3(start,new THREE.Vector3(routeX,start.y,start.z+.018),new THREE.Vector3(routeX,end.y,end.z+.018),end);
  for(let i=0;i<3;i++){
   const d=(i-1)*.004,points=c.curve.getPoints(44).map((p,k)=>{
    // Supply strip order is documented; card ends merge into an opaque sleeve.
    // This deliberately does not map wire color onto lower-header cavities.
    p.x+=d*Math.sin(Math.PI*k/44);return p;
   });
   if(c.kind==='feed')points[0].copy(world(terminalNodes[[2,0,1][i]]));
   const curve=new THREE.CatmullRomCurve3(points),old=c.tubes[i].geometry;ownedGeometry.delete(old);old.dispose();
   c.tubes[i].geometry=new THREE.TubeGeometry(curve,48,.00145,7,false);ownedGeometry.add(c.tubes[i].geometry);
  }
 }
 function update(p){
  updateCable(cables.feed,p.feedProgress);updateCable(cables.jumper,p.jumperProgress);
  for(const indicator of indicators)indicator.visible=p.energized;
  yellow.emissive.setHex(p.energized?0x80610b:0x000000);yellow.emissiveIntensity=.22;
  for(const c of Object.values(cables)){c.pulse.visible=p.energized&&p.pulsePhase!==null;if(c.pulse.visible)c.pulse.position.copy(c.curve.getPoint(p.pulsePhase));}
 }
 update({feedProgress:0,jumperProgress:0,energized:false,pulsePhase:null});
 return{group,boards,anchors,boardCenters,supply,cables,indicators,update,dispose(){for(const g of ownedGeometry)g.dispose();for(const m of ownedMaterials)m.dispose();}};
}
