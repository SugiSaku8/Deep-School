(function(){
  // ----- Helper: reveal corresponding answer block -----
  function revealAnswer(btn){
    const container = btn.closest('.input-container');
    if(!container) return;
    // the answer element is expected to be the next sibling of .input-container's parent
    const answerEl = container.parentElement?.querySelector('[id$="_answer"]');
    if(answerEl) answerEl.style.display = 'block';
  }

  // ----- Helper: move to next question block -----
  function gotoNext(btn){
    const idMatch = btn.id.match(/next(\d+)/);
    if(!idMatch) return;
    const currentNum = Number(idMatch[1]);
    const currentBlk = btn.closest('div[id^="n"]');
    const nextBlk = document.getElementById('n'+(currentNum+1));
    if(currentBlk) currentBlk.style.display = 'none';
    if(nextBlk){
      nextBlk.style.display = 'block';
      // smooth scroll to newly visible block
      setTimeout(()=>nextBlk.scrollIntoView({behavior:'smooth',block:'start'}),20);
    }else if(window.dom && typeof window.dom.back==='function'){
      // fallback: go back if no next block (i.e. last page)
      window.dom.back();
    }
  }

  // Capture clicks globally so we can hijack before inline handlers run
  document.addEventListener('click',(e)=>{
    const answerBtn = e.target.closest('.input-container button');
    if(answerBtn){
      revealAnswer(answerBtn);
      // do not let other handlers interfere (esp. inline ones)
      e.stopImmediatePropagation();
      return;
    }

    const nextBtn = e.target.closest('button[id^="next"]');
    if(nextBtn){
      gotoNext(nextBtn);
      e.stopImmediatePropagation();
    }
  },true); // capture phase ensures we run first
})(); 