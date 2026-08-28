const names={
  1:'Fester Stand',
  2:'Starker Körper',
  3:'Zweikampf bereit',
  4:'Beweglich bleiben',
  5:'Schnell wie eine Welle',
  6:'Stark wie ein Fels',
  7:'Reaktionskünstler',
  8:'Balance Profi',
  9:'Runterfahren'
};

const toast=document.getElementById('toast');
let toastTimer;

document.querySelectorAll('.hot').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const n=btn.dataset.training;
    toast.textContent=`${n} · ${names[n]} — diese Welt bauen wir als Nächstes.`;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove('on'),1800);
  });
});
