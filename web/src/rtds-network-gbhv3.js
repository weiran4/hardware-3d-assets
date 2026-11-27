import {Object3D,Vector3} from 'three';
import {instantiatePhotoDevice} from './rtds-photo-bench-assets.js';

export const gbhV3Article='https://knowledge.rtds.com/hc/en-us/articles/360034815313-Global-Bus-Hub';
export const gbhV3FrontPhoto='https://knowledge.rtds.com/hc/article_attachments/360059193734/GBH-front.jpg';

// The original GLB and manufacturer front image agree: the bottom row is
// numbered 1–12. These eight positions are cap surfaces, not mating points.
export function gbhCapPoint(channel){
 if(!Number.isInteger(channel)||channel<1||channel>8)return null;
 return new Vector3(-.17986364910999936+(channel-1)*.02987107510368031,-.0014434974521398553,.13430000841617584);
}
export function buildNetworkGbh(asset,count,width){
 const {group}=instantiatePhotoDevice(asset,[],width),anchors={};
 for(let n=1;n<=Math.min(count,8);n++){
  const key='GBH.p'+n,point=new Object3D();
  point.name='gbh-v3-cap-'+n;point.position.copy(gbhCapPoint(n)).sub(asset.center);
  group.add(point);anchors[key]=point;
 }
 return {group,anchors};
}
