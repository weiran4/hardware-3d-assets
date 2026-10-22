import {Vector3} from 'three';
import {isPortFacingCamera} from './rtds-state.js';
// Screen-space teaching contacts use actual glTF world anchors, not native-axis
// metadata positions or a substitute diagram. No mechanical insertion is modeled.
export const lessonCameraLimits=Object.freeze({minAzimuthAngle:-.35,maxAzimuthAngle:.35,minPolarAngle:Math.PI/2-.16,maxPolarAngle:Math.PI/2+.16,minZoom:.7,maxZoom:1.8,enablePan:false});
export const lessonDetailMinimum=Object.freeze([.18,.1,.035]);
export function projectModelAnchors(ids,nodes,ports,camera,width,height){
 const result={};
 for(const id of ids){
  const node=nodes.get(id),port=ports.get(id);if(!node||!port)continue;
  const world=node.getWorldPosition(new Vector3()),point=world.clone().project(camera),facing=isPortFacingCamera(port.normal||[0,-1,0],camera.position.toArray(),world.toArray());
  result[id]={world:world.toArray(),x:(point.x*.5+.5)*width,y:(-.5*point.y+.5)*height,visible:width>0&&height>0&&Number.isFinite(point.x+point.y+point.z)&&point.z>=-1&&point.z<=1&&Math.abs(point.x)<=1&&Math.abs(point.y)<=1&&facing};
 }
 return result;
}

export function frontInspectionFrame(size,width,height){
 const aspect=Math.max(.1,width/Math.max(1,height)),span=Math.max(size[0],size[1]*aspect)*1.22;
 return{left:-span/2,right:span/2,top:span/aspect/2,bottom:-span/aspect/2};
}
