// Lightweight DOM helper injected by Pickramu compiler
(function(global){
  if(global.dom) return;
  global.dom = {
    back(){ if(global.history && global.history.back) global.history.back(); },
    Tag(id){
      const el=document.getElementById(id);
      return { style:{ display(v,imp){ if(!el) return; el.style.display=v; if(imp==='auto'){ el.style.setProperty('display',v,'important');}}}};
    }
  };
})(window);