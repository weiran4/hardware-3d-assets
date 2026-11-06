// Native initial-fragment scrolling/focus can run after module initialization.
// Settle it once, then let the route's generation and user-input guards decide
// whether the requested presentation is still appropriate.
export function initialRouteReady(doc=document,win=window){
 return new Promise(resolve=>{
  const afterLoad=()=>win.requestAnimationFrame(()=>resolve());
  if(doc.readyState==='complete')afterLoad();
  else win.addEventListener('load',afterLoad,{once:true});
 });
}
