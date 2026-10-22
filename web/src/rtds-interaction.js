import {Color} from 'three';

// Inspection tint only: not a powered LED, voltage indication, or simulated signal.
// Each highlighted mesh owns its clones; the authored palette is never mutated.
const tint=new Color('#ffc477');
export function createPortInteraction(model,portById){
 const meshes=[],owned=new Map(),originals=new Map();let selected=new Set(),hovered=null;
 function anchor(node){while(node&&node!==model){const port=portById.get(node.userData.sid);if(port)return port.interactive===false?null:port.id;node=node.parent;}return null;}
 model.traverse(mesh=>{if(!mesh.isMesh)return;meshes.push(mesh);const id=anchor(mesh);if(id){if(!owned.has(id))owned.set(id,[]);owned.get(id).push(mesh);}});
 function restore(mesh){const entry=originals.get(mesh);if(!entry)return;mesh.material=entry.original;for(const material of entry.clones)material.dispose();originals.delete(mesh);}
 function apply(){for(const mesh of meshes){const id=anchor(mesh),strength=selected.has(id)?.46:id&&id===hovered?.17:0;if(!strength){restore(mesh);continue;}
   if(!originals.has(mesh)){const original=mesh.material,source=Array.isArray(original)?original:[original],clones=source.map(m=>m.clone());originals.set(mesh,{original,source,clones});mesh.material=Array.isArray(original)?clones:clones[0];}
   const {source,clones}=originals.get(mesh);for(let i=0;i<clones.length;i++){const material=clones[i],original=source[i];if(material.emissive){material.emissive.copy(original.emissive).multiplyScalar(original.emissiveIntensity??1).add(tint.clone().multiplyScalar(strength));material.emissiveIntensity=1;}}
  }}
 function visible(mesh){for(let node=mesh;node;node=node.parent)if(!node.visible)return false;return true;}
 return{
  meshes,anchor,
  selectedIds:()=>[...selected],
  select(ids){selected=new Set(ids.filter(id=>owned.has(id)));apply();},
  hover(id){const next=owned.has(id)?id:null;if(next===hovered)return false;hovered=next;apply();return true;},
  pick(hits){const hit=hits.find(hit=>{if(!visible(hit.object))return false;const material=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex||0]:hit.object.material;return material?.visible!==false&&!(material?.transparent&&material.opacity===0);});return hit?anchor(hit.object):null;},
  dispose(){selected.clear();hovered=null;for(const mesh of [...originals.keys()])restore(mesh);}
 };
}

// Track maximum displacement, not only the release point: orbit-and-return is not a tap.
export function createTapGesture(){
 let down=null;const pointers=new Set();
 return{
  down(event){pointers.add(event.pointerId);if(pointers.size!==1||event.button!==0||event.isPrimary===false){down=null;return;}down={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};},
  move(event){if(down?.id===event.pointerId&&Math.hypot(event.clientX-down.x,event.clientY-down.y)>5)down.moved=true;},
  up(event){const tap=!!down&&down.id===event.pointerId&&!down.moved&&Math.hypot(event.clientX-down.x,event.clientY-down.y)<=5;pointers.delete(event.pointerId);down=null;return tap;},
  cancel(){pointers.clear();down=null;},
  active:()=>pointers.size>0
 };
}
