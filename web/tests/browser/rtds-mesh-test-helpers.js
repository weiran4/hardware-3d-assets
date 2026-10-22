import {expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {gltfDirection,inspectionFrame} from '../../src/rtds-state.js';

// Independent reconstruction from the public immutable GLB. No production scene,
// camera, renderer, private canvas property, or test-only browser API is accessed.
export async function meshProjection(c,width,height,{view='group',requireVisible=true,includeExcluded=false}={}){
 const bytes=readFileSync(`public/assets/rtds/${c.asset}.glb`),metadata=JSON.parse(readFileSync(`public/assets/rtds/${c.asset}.json`));
 const {scene:model}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');model.updateMatrixWorld(true);
 const nodes=new Map(),meshes=[],ports=new Map(metadata.ports.map(p=>[p.id,p]));model.traverse(n=>{if(n.userData.sid)nodes.set(n.userData.sid,n);if(n.isMesh)meshes.push(n);});
 const owner=node=>{while(node&&node!==model){const p=ports.get(node.userData.sid);if(p)return p.interactive===false&&!includeExcluded?null:p.id;node=node.parent;}return null;};
 const target=`${c.asset}.${c.port}`,whole=new THREE.Box3().setFromObject(model),focus=new THREE.Box3(),normal=new THREE.Vector3();
 if(view==='group'){for(const p of metadata.ports.filter(p=>p.group===c.group&&p.interactive!==false)){focus.expandByObject(nodes.get(p.id));normal.add(new THREE.Vector3().fromArray(gltfDirection(p.normal)));}}
 else{focus.copy(whole);normal.fromArray({front:[0,.08,1],rear:[0,.08,-1],top:[0,1,0],overview:[1,.8,1.25]}[view]);}
 const size=focus.getSize(new THREE.Vector3()).toArray().map(v=>view==='group'?Math.max(v,.035):v),center=focus.getCenter(new THREE.Vector3()),extent=Math.max(...whole.getSize(new THREE.Vector3()).toArray());
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,.001,20);camera.up.set(0,Math.abs(normal.y)>.98?0:1,Math.abs(normal.y)>.98?-1:0);camera.position.copy(center).addScaledVector(normal.normalize(),Math.max(extent*2,1));camera.lookAt(center);Object.assign(camera,inspectionFrame(size,width,height));camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 const candidates=[],points=[];for(const mesh of meshes.filter(n=>owner(n)===target)){
  const position=mesh.geometry.attributes.position,index=mesh.geometry.index,count=index?.count??position.count;
  for(let i=0;i<count;i+=3){const triangle=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(position,index?index.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld).project(camera));if(triangle.some(v=>Math.abs(v.z)>1))continue;
   const [a,b,d]=triangle.map(v=>({x:(v.x*.5+.5)*width,y:(-.5*v.y+.5)*height}));points.push(a,b,d);const area=Math.abs((b.x-a.x)*(d.y-a.y)-(b.y-a.y)*(d.x-a.x));candidates.push({x:(a.x+b.x+d.x)/3,y:(a.y+b.y+d.y)/3,area});
  }
 }
 const ray=new THREE.Raycaster(),first=(x,y)=>{ray.setFromCamera(new THREE.Vector2(x/width*2-1,-y/height*2+1),camera);return ray.intersectObjects(meshes,false).find(h=>h.object.visible);},hit=(x,y)=>owner(first(x,y)?.object);
 const inCanvas=p=>p.x>3&&p.y>3&&p.x<width-3&&p.y<height-3;
 const point=candidates.sort((a,b)=>b.area-a.area).find(p=>inCanvas(p)&&[[0,0],[1.5,0],[-1.5,0],[0,1.5],[0,-1.5]].every(([dx,dy])=>hit(p.x+dx,p.y+dy)===target));
 const occluded=candidates.find(p=>inCanvas(p)&&first(p.x,p.y)&&hit(p.x,p.y)!==target&&[[0,0],[2,0],[-2,0],[0,2],[0,-2]].every(([dx,dy])=>first(p.x+dx,p.y+dy)&&hit(p.x+dx,p.y+dy)===null));
 const left=Math.min(...points.map(p=>p.x))-3,top=Math.min(...points.map(p=>p.y))-3,right=Math.max(...points.map(p=>p.x))+3,bottom=Math.max(...points.map(p=>p.y))+3;
 const bounds={x:left,y:top,width:right-left,height:bottom-top};
 const materials=new Set();for(const mesh of meshes){mesh.geometry.dispose();for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])materials.add(m);}for(const material of materials)material.dispose();
 if(requireVisible)expect(point,`${target} must have a foremost, visible real-triangle hit area`).toBeTruthy();
 return {point,occluded,bounds,port:ports.get(target)};
}
