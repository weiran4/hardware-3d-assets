import * as THREE from 'three';

export const DOBLE_F6350E_PHOTO_URL = 'https://www.doble.com/wp-content/uploads/f6350e@2x.png';

// Photo-backed exterior only. Real front features are inert meshes, not lesson
// pick targets. The unsupported rear face is intentionally unmarked.
export function buildDobleF6350eExterior({materials, textures} = {}) {
  const unit = new THREE.Group();
  unit.name = 'doble-f6350e-photo-exterior';
  const group = (name, parent = unit) => {
    const node = new THREE.Group(); node.name = name; parent.add(node); return node;
  };
  const mat = (color, metalness = .03, roughness = .65) => {
    const m = new THREE.MeshStandardMaterial({color, metalness, roughness}); materials?.add(m); return m;
  };
  const rubber = mat(0x362f29), bumperLip = mat(0x494039), shell = mat(0xb3b4aa, .24);
  const panel = mat(0xe0dbce, .11), keyline = mat(0x315e85), rib = mat(0x77838a, .15);
  const dark = mat(0x251f1b), cavity = mat(0x111113), steel = mat(0xaaa392, .45, .4);
  const brass = mat(0xa47035, .48, .44), dust = mat(0x706757), cream = mat(0xe9e2cf);
  const red = mat(0xd72527, .05, .4), black = mat(0x292624, .05, .42), white = mat(0xf2eee3, .06, .42);
  const glass = mat(0x075c61, .18, .38), deepGlass = mat(0x07383c, .14, .46);
  function add(geometry, material, parent, x = 0, y = 0, z = 0) {
    const n = new THREE.Mesh(geometry, material); n.position.set(x,y,z); parent.add(n); return n;
  }
  function rounded(w,h,r,Type = THREE.Shape) {
    const l=-w/2,b=-h/2,R=w/2,t=h/2, s=new Type();
    s.moveTo(l+r,b); s.lineTo(R-r,b); s.quadraticCurveTo(R,b,R,b+r);
    s.lineTo(R,t-r); s.quadraticCurveTo(R,t,R-r,t); s.lineTo(l+r,t);
    s.quadraticCurveTo(l,t,l,t-r); s.lineTo(l,b+r); s.quadraticCurveTo(l,b,l+r,b); s.closePath();
    return s;
  }
  function slab(w,h,r,d,m,x,y,z,parent=unit,{bevel=0,hole=null}={}) {
    const s = rounded(w,h,r);
    if (hole) s.holes.push(rounded(...hole,THREE.Path));
    return add(new THREE.ExtrudeGeometry(s,{depth:d,curveSegments:5,bevelEnabled:!!bevel,
      bevelSize:bevel,bevelThickness:bevel,bevelSegments:2}),m,parent,x,y,z);
  }
  const box = (w,h,d,m,x,y,z,parent=unit) => add(new THREE.BoxGeometry(w,h,d),m,parent,x,y,z);
  const cyl = (r,d,m,x,y,z,parent=unit,segments=20) => {
    const n = add(new THREE.CylinderGeometry(r,r,d,segments),m,parent,x,y,z);
    n.rotation.x = Math.PI/2; return n;
  };
  const ring = (r,t,m,x,y,z,parent) => add(new THREE.TorusGeometry(r,t,8,28),m,parent,x,y,z);
  slab(.353,.212,.008,.417,shell,0,.110,-.2285);
  slab(.361,.217,.013,.031,rubber,0,.112,.188,unit,{bevel:.004});
  slab(.354,.210,.010,.002,bumperLip,0,.112,.219);
  slab(.348,.205,.008,.001,keyline,0,.112,.2212);
  slab(.345,.202,.006,.001,panel,0,.112,.2224);

  const ribs = group('case-ribs');
  for (const z of [.145,-.012,-.168]) {
    slab(.298,.011,.004,.025,rib,0,.228,z,ribs,{bevel:.0015});
  }
  const handles = group('side-handles');
  for (const side of [-1,1]) {
    const h = group('recessed-side-handle',handles);
    h.position.set(.185*side,.117,.043);
    h.rotation.y = Math.PI*.5*side;
    slab(.129,.073,.007,.003,rib,0,0,0,h);
    slab(.109,.057,.006,.001,rubber,0,0,.0031,h);
    slab(.096,.013,.006,.002,dark,0,-.009,.0042,h,{bevel:.001});
    for (const x of [-.049,.049]) cyl(.0034,.002,steel,x,0,.004,h,12);
  }

  // Rectified coordinates measured against the front panel of the public photo.
  const x = p => (p-814)*.000326;
  const y = p => .112+(823-p)*.000324;
  const face = .2235;
  const photoRect = (cx,cy,w,h,r,d,m,dz,parent=unit,opts) =>
    slab(w*.000326,h*.000324,r*.000325,d,m,x(cx),y(cy),face+dz,parent,opts);
  const screws = group('front-panel-fasteners');
  for (const [cx,cy] of [[290,527],[549,529],[808,529],[1071,529],[1336,529],[294,823],[1333,823],
    [294,1117],[549,1119],[808,1119],[1071,1119],[1330,1119],[1074,709],[1300,709],[1072,994],[1300,994]]) {
    cyl(.0030,.0011,steel,x(cx),y(cy),face+.0006,screws);
    cyl(.0017,.0008,dust,x(cx),y(cy),face+.0012,screws,9);
    box(.0020,.00065,.0004,dark,x(cx),y(cy),face+.00165,screws).rotation.z = .44;
  }

  const vfd = group('blank-vfd-window');
  photoRect(817,632,450,72,2,.0015,deepGlass,.0004,vfd);
  photoRect(817,632,435,59,1,.0006,glass,.002,vfd);
  // Muted subdivisions suggest the VFD mask, not a captured active unit readout.
  for (const cy of [618,640]) {
    for (let i=0; i<38; i++) box(.0026,.0044,.00015,deepGlass,x(617+i*10.8),y(cy),face+.0027,vfd);
  }

  function jack(cx,cy,material,parent) {
    const p = group('binding-post-exterior',parent);
    p.position.set(x(cx),y(cy),face+.0012);
    ring(.00535,.00138,material,0,0,.00235,p);
    ring(.0049,.00080,material,0,0,.00410,p);
    cyl(.0041,.0014,cavity,0,0,.0014,p);
    ring(.00258,.00061,brass,0,0,.00275,p);
  }
  const battery = group('battery-simulator-pair');
  jack(519,706,red,battery); jack(519,762,white,battery);
  const output = group('source-output-banks');
  for (const [cy,m] of [[708,red],[764,black],[820,red]]) {
    const row = group('source-output-row',output);
    for (const cx of [725,778,831,908,962,1017]) jack(cx,cy,m,row);
  }

  const mains = group('front-power-switch');
  photoRect(389,909,103,110,2,.0016,dark,0,mains);
  photoRect(389,909,71,85,4,.0018,cavity,.0018,mains);
  const rocker = photoRect(389,910,43,71,2,.003,mat(0x343d38),.0038,mains,{bevel:.0006});
  rocker.rotation.x = -.17;
  photoRect(389,883,38,11,1,.001,mat(0x177379),.006,mains);
  const iec = group('iec-inlet');
  photoRect(389,1050,91,67,14,.0028,dark,0,iec);
  photoRect(389,1050,67,45,9,.0017,cavity,.003,iec);
  for (const [cx,cy] of [[374,1046],[404,1046],[389,1060]]) {
    box(.0008,.0027,.0008,steel,x(cx),y(cy),face+.005,iec);
  }

  const comm = group('communications-jacks');
  for (const cx of [1127,1191,1254]) {
    const p = group('front-communications-jack',comm);
    photoRect(cx,706,52,53,1,.0021,dust,0,p);
    photoRect(cx,706,48,50,1,.001,steel,.0022,p);
    photoRect(cx,712,41,32,1,.0009,dark,.0033,p);
    photoRect(cx,724,26,11,1,.0007,cavity,.0043,p);
    for (let i=0;i<8;i++) box(.0006,.0018,.00025,brass,x(cx+(i-3.5)*3.4),y(705),face+.0043,p);
  }
  const usb = group('usb-type-b');
  photoRect(1248,829,38,34,1,.0021,steel,0,usb);
  photoRect(1248,829,30,27,3,.0009,cavity,.0025,usb);
  photoRect(1248,827,14,8,1,.0007,dust,.0035,usb);
  const serial = group('low-level-d-sub');
  const dsubShape = (wx,wy,r,d,m,z) =>
    slab(wx,wy,r,d,m,x(1235),y(1008),face+z,serial);
  dsubShape(.010,.026,.0038,.0025,steel,.001);
  dsubShape(.0078,.022,.0025,.0008,cavity,.0037);
  for (const [col,count] of [[-1,8],[1,7]]) {
    for (let i=0;i<count;i++) cyl(.00065,.0003,brass,x(1235)+col*.00165,y(1008)+(i-(count-1)/2)*.0023,face+.0046,serial,8);
  }
  for (const cy of [966,1050]) cyl(.0017,.0014,steel,x(1235),y(cy),face+.0015,serial,12);
  addFrontPrint(unit,materials,textures,face);
  return unit;
}

function addFrontPrint(unit, materials, textures, face) {
  const canvas = globalThis.document?.createElement('canvas');
  if (!canvas) return;
  canvas.width = 1140; canvas.height = 683;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const left=244, top=481, blue='#315e85', charcoal='#383026';
  ctx.translate(-left,-top);
  const ink = (s, x, y, size, {color=charcoal,weight=650,align='center',font='sans-serif'}={}) => {
    ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color;
    ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s,x,y);
  };
  const frame = (x,y,w,h,r,color,width) => {
    ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.lineWidth=width; ctx.strokeStyle=color; ctx.stroke();
  };
  const stroke = (color, width, points) => {
    ctx.beginPath(); ctx.moveTo(...points[0]); points.slice(1).forEach(p=>ctx.lineTo(...p));
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
  };
  ctx.fillStyle=blue; ctx.beginPath(); ctx.ellipse(367,586,66,32,0,0,Math.PI*2); ctx.fill();
  ink('doble',367,593,54,{weight:750,color:'#e9e2d4'});
  frame(458,555,596,297,9,charcoal,2.4);
  frame(462,559,588,289,7,charcoal,1.1);
  ctx.fillStyle='#e0dbce'; ctx.fillRect(678,547,149,20);
  ink('SOURCE OUTPUTS',752,557,15);
  frame(477,674,109,130,10,charcoal,2.2);
  ctx.fillStyle='#e0dbce'; ctx.fillRect(494,796,79,19);
  ink('BATTERY',535,800,13); ink('SIMULATOR',535,812,13);
  ink('+',490,704,22); ink('−',490,762,18);
  ink('SOURCES',661,701,12); ink('SOURCES',661,823,12);
  const caution = (cx,cy,bolt) => {
    stroke(charcoal,2.5,[[cx,cy-38],[cx+34,cy+22],[cx-34,cy+22],[cx,cy-38]]);
    if (bolt) stroke(charcoal,4,[[cx+5,cy-25],[cx-9,cy],[cx+6,cy-4],[cx-2,cy+13]]);
    else ink('!',cx,cy,42);
  };
  caution(385,750,false); caution(661,754,true);
  frame(1059,552,249,553,37,blue,5);
  ink('F6350e',1183,588,40,{color:blue,weight:760});
  ink('POWER SYSTEM',1183,612,14,{color:blue}); ink('SIMULATOR',1183,626,14,{color:blue});
  for (const x of [1127,1191,1254]) {
    stroke(charcoal,1.5,[[x,648],[x,656],[x-12,656],[x-12,661]]);
    stroke(charcoal,1.5,[[x,656],[x+12,656],[x+12,661]]);
    for (const [a,b] of [[x,645],[x-12,665],[x+12,665]]) frame(a-4,b-4,8,8,0,charcoal,1.2);
  }
  ink('USB',1248,794,12);
  ink('LOW LEVEL',1235,909,13); ink('SOURCES',1235,923,13);
  stroke(charcoal,1.5,[[1235,934],[1235,950]]);
  ink('INPUT / OUTPUT &',1180,1077,14); ink('COMMUNICATION',1180,1093,14);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; textures?.add(texture);
  const material = new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  materials?.add(material);
  const print = new THREE.Mesh(new THREE.PlaneGeometry(1140*.000326,683*.000324),material);
  print.name = 'original-front-panel-typography';
  print.position.set(0,.112+.000162,face+.0003);
  unit.add(print);
}
