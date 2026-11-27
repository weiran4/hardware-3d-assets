import {Object3D,Vector3} from 'three';
import {instantiatePhotoDevice} from './rtds-photo-bench-assets.js';

export const ircV2Article='https://knowledge.rtds.com/hc/en-us/articles/360034814853-IRC-Switch';
export const ircV2FrontPhoto='https://knowledge.rtds.com/hc/article_attachments/8511313937815/IRC_V2_Chassis_and_Cards__28_.png';

// Public front photo: chassis slot 1 is at the bottom; its lower row
// runs 1–6 and 7–12 across two banks. These are eight cap surfaces in
// the original IRC GLB, not a plug path or a site-specific assignment.
export function ircV2CapPoint(channel){
 if(!Number.isInteger(channel)||channel<1||channel>8)return null;
 return new Vector3(channel<=6?-.098+(channel-1)*.0165:.011+(channel-7)*.0165,.0363,.0425);
}
export function buildNetworkIrc(asset,count,width){
 const {group}=instantiatePhotoDevice(asset,[],width),anchors={};
 for(let channel=1;channel<=Math.min(count,8);channel++){
  const key='IRC.p'+channel,point=new Object3D();
  point.name='irc-v2-card1-cap-'+channel;
  point.position.copy(ircV2CapPoint(channel)).sub(asset.center);
  group.add(point);anchors[key]=point;
 }
 return {group,anchors};
}
