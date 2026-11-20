import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
// Original photo-observed exterior only. No maker artwork/bitmap or physical connection metadata.
export function create81150AExterior({width=.16}={}){
 const root=new THREE.Group();root.name='81150A-option002-visual-exterior';root.userData={referenceEnvelopeMm:[439,108,456],electricalCompatibility:'not-modeled',physicalHookups:false};
 const S=width/439;const palette={shell:0xb9bcb8,bumper:0x7b8589,face:0xd3d5c8,dark:0x3b484a,screen:0x102b2b,key:0xa6aca0,ink:0x283839,gold:0xbaa15c,silver:0xb7bec0,red:0xa97778};const materials={};
 for(const[k,c]of Object.entries(palette))materials[k]=new THREE.MeshStandardMaterial({color:c,roughness:k==='gold'?.32:.63,metalness:k==='gold'?.7:k==='silver'?.55:0});
 function box(name,x,y,z,w,h,d,mat='face',round=0,parent=root){const geo=round?new RoundedBoxGeometry(w*S,h*S,d*S,2,round*S):new THREE.BoxGeometry(w*S,h*S,d*S);const o=new THREE.Mesh(geo,materials[mat]);o.name=name;o.position.set(x*S,y*S,z*S);parent.add(o);return o;}
 function cylinder(name,x,y,z,r,d,mat='silver',parent=root){const o=new THREE.Mesh(new THREE.CylinderGeometry(r*S,r*S,d*S,24),materials[mat]);o.name=name;o.rotation.x=Math.PI/2;o.position.set(x*S,y*S,z*S);parent.add(o);return o;}
 function ring(name,x,y,z,r,t,mat='gold',parent=root){const o=new THREE.Mesh(new THREE.TorusGeometry(r*S,t*S,6,24),materials[mat]);o.name=name;o.position.set(x*S,y*S,z*S);parent.add(o);return o;}
 function label(text,x,y,z,w,h,color='#283839',bg=null){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=Math.max(96,Math.round(w*7));c.height=Math.max(32,Math.round(h*7));const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);}ctx.fillStyle=color;ctx.font=`${Math.round(c.height*.67)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,c.width/2,c.height/2,c.width*.98);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(w*S,h*S),new THREE.MeshBasicMaterial({map:t,transparent:true}));o.position.set(x*S,y*S,z*S);o.name='original-type-'+text;root.add(o);}
 box('folded-case',0,0,-230,422,98,444,'shell',3);
 for(const z of [-449,-4]){box('bumper-top',0,48,z,439,12,14,'bumper',4);box('bumper-bottom',0,-48,z,439,12,14,'bumper',4);for(const x of [-213,213])box('bumper-side',x,0,z,13,104,14,'bumper',4);}
 box('front-face',0,0,-2,417,89,5,'face',2);
 box('left-dark-instrument-panel',-145,0,1,139,87,3,'dark',1);
 box('display-bezel',-144,9,3,88,65,3,'bumper',1);box('screen-unlit',-144,9,5,83,58,1,'screen');
 label('Agilent Technologies',-161,43,5,69,5);label('81150A',-111,43,5,26,5);label('120 MHz PULSE FUNCTION ARBITRARY',-138,38,5,111,3.7);
 // USB aperture and power switch on left, display soft keys bottom/right.
 box('front-usb-metal',-204,11,4,5,15,2,'silver');box('front-usb-throat',-204,11,5.2,3,11,1,'dark');box('power-switch',-204,-28,4,13,9,3,'key',1);label('⏻',-204,-28,6,8,6);
 for(let i=0;i<5;i++)box('display-softkey',-180+i*16,-37,4,11,6,3,'key',1);
 for(const[i,t]of ['Ch 1','Coupling','Ch 2','Graph'].entries()){box('display-side-key',-75,29-i*13,4,18,10,3,'key',1);label(t,-75,29-i*13,6,16,5);}label('Cancel',-75,-38,4,19,5);label('LXI',-68,-45,4,12,4,'#e3e5db');
 const num=new THREE.Group();num.name='numeric-keypad';root.add(num);for(let r=0;r<4;r++)for(let c=0;c<3;c++){const x=-47+c*17,y=34-r*13;box('numeric-key',x,y,4,14,10,3,'key',1,num);label(['7','8','9','4','5','6','1','2','3','0','.','+/−'][r*3+c],x,y,6,8,6);}
 const cursor=new THREE.Group();cursor.name='cursor-pad';root.add(cursor);cylinder('cursor-base',16,19,4,16,2,'dark',cursor);for(const[x,y,w,h]of [[16,27,7,17],[16,11,7,17],[8,19,17,7],[24,19,17,7]])box('cursor-arm',x,y,6,w,h,3,'key',2,cursor);
 cylinder('knob-rim',55,19,5,16,3,'dark');cylinder('main-knob',55,19,8,14,8,'bumper');cylinder('knob-inset',55,19,12.3,6,1,'key');
 for(const x of [43,66])box('under-knob-key',x,-5,4,17,7,3,'key',2);
 const right=new THREE.Group();right.name='right-keypad';root.add(right);const keys=[['More','Cont','Pulse','Trigger','Store'],['Wave','Width','Burst','Sweep','Utility'],['Sine','Duty','Arb','Reset','Help']];for(let r=0;r<3;r++)for(let c=0;c<5;c++){const x=85+c*24,y=33-r*14;box('function-key',x,y,4,17,10,3,'key',1,right);label(keys[r][c],x,y,6,15,4.4);}
 // Nine observed gold BNC shells. All visual, unselected, no teaching anchor attached.
 for(let i=0;i<9;i++){const x=-10+i*26;const p=new THREE.Group();p.name=`visual-bnc-${i+1}`;p.userData={visualBnc:true,selectable:false,role:'exterior-only'};root.add(p);cylinder('bnc-hex-base',x,-33,4,5.9,3,'gold',p);cylinder('bnc-dark-recess',x,-33,6,4.4,2,'dark',p);ring('bnc-shell-rim',x,-33,9,4.7,.9,'gold',p);ring('bnc-inner-insulator',x,-33,8,2.9,.6,'face',p);for(const sign of [-1,1])box('bnc-lock-pin',x+sign*5,-33,8,1.8,2.2,2.5,'gold',0,p);box('bnc-label-strip',x,-19,3,19,7,.5,i>=5?'red':'bumper');}
 // Rear exterior layout is photo supported; no assigned jack pinout/compatibility.
 const rearStart=root.children.length;
 box('rear-metal-panel',0,0,-452,417,88,3,'silver');
 const holes=new THREE.InstancedMesh(new THREE.CircleGeometry(1.7*S,7),materials.dark,700);holes.name='rear-perforations';let n=0;const m=new THREE.Matrix4();for(let row=0;row<5;row++)for(let col=0;col<66;col++){m.makeRotationY(Math.PI);m.setPosition((-195+col*4.8+(row%2)*2.4)*S,(20+row*4.8)*S,-454*S);holes.setMatrixAt(n++,m);}for(let row=0;row<5;row++)for(let col=0;col<77;col++){const x=-195+col*4.9,y=-30+row*4.9;if(x>155||x<-110||x>-55&&x<55){m.makeRotationY(Math.PI);m.setPosition(x*S,y*S,-454*S);holes.setMatrixAt(n++,m);}}holes.count=n;root.add(holes);
 for(const[x,w]of [[-184,14],[-161,10],[-140,15]])box('rear-small-connector',x,-19,-455,w,11,3,'dark');
 for(const x of [-110,-87,-64,-42]){cylinder('rear-capped-circular-feature',x,-22,-457,6,8,'dark');ring('rear-feature-rim',x,-22,-460,6,.7,'silver');}
 box('rear-multipin-outline',83,-20,-455,53,17,3,'dark');box('rear-multipin-interior',83,-20,-457,46,11,2,'bumper');for(const x of [54,112])cylinder('rear-fastener',x,-20,-457,2,3,'silver');
 box('rear-ac-surround',183,-20,-457,39,25,5,'dark',4);box('rear-ac-throat',183,-20,-460,28,16,2,'dark');for(const[x,y]of [[176,-22],[190,-22],[183,-15]])box('rear-ac-blade',x,y,-461,1.7,5,2,'silver');
 const rear=new THREE.Group();rear.name='rear-photo-oriented';for(const o of root.children.slice(rearStart))rear.add(o);rear.scale.x=-1;root.add(rear);
 // Feet are visible underneath in the actual photos.
 for(const z of [-40,-390])for(const x of [-170,170])box('rubber-foot',x,-52,z,24,4,30,'dark',1);
 return root;
}
