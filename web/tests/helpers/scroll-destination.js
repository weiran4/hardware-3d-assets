// Standalone so Playwright can serialize it into the page without closures.
export function scrollDestinationError(element){
 const doc=element.ownerDocument,scroller=doc.scrollingElement;
 const margin=parseFloat(doc.defaultView.getComputedStyle(element).scrollMarginTop)||0;
 const absoluteTop=element.getBoundingClientRect().top+scroller.scrollTop;
 const maxScroll=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
 const target=Math.min(maxScroll,Math.max(0,absoluteTop-margin));
 return Math.abs(scroller.scrollTop-target);
}
