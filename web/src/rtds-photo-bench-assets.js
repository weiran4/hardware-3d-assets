import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export const photoAnchorMap={light:{'A.gb':'gbh','B.gb':'gbh','A.irc':'irc1','B.irc':'irc1','A.wif':'wif','B.wif':'wif','L.eth':'eth','L.wif':'wif','L.topI1':'internal_i1','L.topI2':'internal_i2','L.bottomI1':'i1','L.bottomI2':'i2','L.do':'do1','L.di':'di1','L.ao':'ao','L.ai':'ai'},gbh:{'H.a':'a','H.b':'b'},irc:{'S.a':'a','S.b':'b'}};
export function preparePhotoAsset(kind,root,positions){
 root.updateMatrixWorld(true);let meshes=0;root.traverse(o=>{if(o.isMesh&&o.geometry?.attributes.position?.count)meshes++;});if(!meshes)throw Error('Missing geometry');
 const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());if(!size.toArray().every(Number.isFinite)||size.x<=0||size.y<=0||size.z<=0)throw Error('Invalid bounds');
 const anchors={};for(const id of new Set(Object.values(photoAnchorMap[kind]))){let point;if(kind==='light'){let node;root.traverse(candidate=>{if(candidate.userData.kind==='anchor'&&candidate.userData.sid==='novacor-light-photo-refinement.'+id)node=candidate;});if(node)point=node.getWorldPosition(new THREE.Vector3());}else if(Array.isArray(positions?.[id])&&positions[id].length===3)point=new THREE.Vector3(...positions[id]);if(point){if(!point.toArray().every(Number.isFinite)||!bounds.clone().expandByScalar(.025).containsPoint(point))throw Error('Invalid anchor '+id);anchors[id]=point;}}
 return {kind,root,bounds,size,center,anchors};
}
export function instantiatePhotoDevice(asset,keys,width){
 const group=new THREE.Group(),pivot=new THREE.Group(),model=asset.root.clone(true),anchors={};group.add(pivot);pivot.add(model);model.position.sub(asset.center);pivot.rotation.y=asset.kind==='light'?Math.PI:0;group.scale.setScalar(width/asset.size.x);
 for(const key of keys){const id=photoAnchorMap[asset.kind][key],p=asset.anchors[id];if(!p)throw Error('Missing anchor '+key);const node=new THREE.Object3D();node.name='teaching.'+key;node.position.copy(p).sub(asset.center);pivot.add(node);anchors[key]=node;}
 return {group,anchors};
}
export function createLeaseCache(load,dispose){let entry=null;return {reset(){entry=null;},acquire(){if(!entry){const next={refs:0,value:null,ready:null};next.ready=Promise.resolve().then(load).then(value=>{next.value=value;if(next.refs===0)dispose(value);return value;});entry=next;}const current=entry;current.refs++;let released=false;return {ready:current.ready,release(){if(released)return;released=true;if(--current.refs===0){if(current.value)dispose(current.value);if(entry===current)entry=null;}}};}};}
function disposeAssets(result){const resources=new Set();for(const asset of Object.values(result.assets)){asset.root.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const material of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){resources.add(material);for(const value of Object.values(material))if(value?.isTexture)resources.add(value);}});}for(const resource of resources)resource.dispose();}
export async function decodePhotoGlb(response){
 if(!response.ok)throw Error('Model HTTP '+response.status);let buffer=await response.arrayBuffer();const isGlb=value=>value.byteLength>=4&&new DataView(value).getUint32(0,true)===0x46546c67;
 // A host may have already decoded Content-Encoding: gzip. Never decompress twice.
 if(isGlb(buffer))return buffer;const bytes=new Uint8Array(buffer);if(bytes[0]!==0x1f||bytes[1]!==0x8b||typeof DecompressionStream==='undefined')throw Error('Unsupported model payload');
 buffer=await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();if(!isGlb(buffer))throw Error('Invalid decompressed GLB');return buffer;
}
let metadataPromise=null;
function loadMetadata(){if(!metadataPromise)metadataPromise=fetch(new URL('models/photo-bench/anchors.json',document.baseURI)).then(response=>{if(!response.ok)throw Error('metadata unavailable');return response.json();}).catch(error=>{metadataPromise=null;throw error;});return metadataPromise;}
const caches=Object.fromEntries(['light','gbh','irc'].map(kind=>[kind,createLeaseCache(async()=>{
 let root;try{const loader=new GLTFLoader();const metadata=kind==='light'?{}:await loadMetadata();if(kind==='gbh'){const url=new URL('models/photo-bench/gbh.glb.gz',document.baseURI);const buffer=await decodePhotoGlb(await fetch(url));root=(await loader.parseAsync(buffer,new URL('.',url).href)).scene;}else root=(await loader.loadAsync(new URL('models/photo-bench/'+kind+'.glb',document.baseURI).href)).scene;return {asset:preparePhotoAsset(kind,root,metadata[kind])};}catch{if(root)disposeAssets({assets:{failed:{root}}});return {error:'模型或已核对端点不可用'};}
},result=>{if(result.asset)disposeAssets({assets:{[kind]:result.asset}});})]));
export const acquirePhotoBenchAsset=(kind,retry=false)=>{if(retry){caches[kind].reset();if(kind!=='light')metadataPromise=null;}return caches[kind].acquire();};
