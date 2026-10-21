import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function createInspectionControls(camera,element,onChange){const controls=new OrbitControls(camera,element);controls.enableDamping=false;controls.enablePan=true;controls.minZoom=.5;controls.maxZoom=8;if(onChange)controls.addEventListener('change',onChange);return controls;}
export function applyInspectionPose(camera,controls,center,direction,distance,element,onChange){
 const up=Math.abs(direction.y)>.98?new THREE.Vector3(0,0,-1):new THREE.Vector3(0,1,0);
 const changed=!camera.up.equals(up);if(changed&&controls?.domElement)controls.dispose();
 camera.up.copy(up);camera.position.copy(center).addScaledVector(direction.normalize(),distance);camera.zoom=1;camera.lookAt(center);
 // OrbitControls caches the up-frame in its constructor. Refresh it when a bookmark changes that frame.
 if(changed||!controls)controls=createInspectionControls(camera,element,onChange);
 controls.target.copy(center);controls.update();return controls;
}
