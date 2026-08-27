const app=document.getElementById('app');
const trainings={
  1:{title:'Fester Stand',zone:'STARK'},2:{title:'Starker Körper',zone:'STARK'},3:{title:'Zweikampf bereit',zone:'STARK'},
  4:{title:'Erster Schritt',zone:'SCHNELL'},5:{title:'Schnelle Füsse',zone:'SCHNELL'},6:{title:'Bremsen & Los',zone:'SCHNELL'},
  7:{title:'Volle Kontrolle',zone:'RUHIG'},8:{title:'Kopf ruhig',zone:'RUHIG'},9:{title:'Runterfahren',zone:'RUHIG'}
};
function renderWorld(){
  app.innerHTML=`<main class="start-shell">
    <header class="start-top"><div class="brand"><b>10'</b> MINUTEN ON TOP</div><div class="start-note">WÄHLE DEIN TRAINING</div></header>
    <section class="world-stage" aria-label="Trainingswelt">
      <img src="welt.jpg" alt="Illustrierte Trainingswelt mit neun Trainingsorten">
      ${Object.entries(trainings).map(([k,t])=>`<button class="hotspot h${k}" aria-label="${t.title} öffnen" onclick="openTraining('${k}')"><span class="sr-only">${t.title}</span></button>`).join('')}
    </section>
    <p class="tap-hint">Tippe auf einen Trainingsort.</p>
  </main><section id="worldModal" class="world-modal" aria-hidden="true"></section>`;
}
function openTraining(k){
  const t=trainings[k],m=document.getElementById('worldModal');
  m.innerHTML=`<div class="modal-card ${t.zone}"><span class="modal-kicker">${t.zone} · TRAINING ${k}</span><h1>${t.title}</h1><p>Diese Trainingswelt bauen wir als Nächstes.</p><button onclick="closeTraining()">← ZURÜCK ZUR WELT</button></div>`;
  m.classList.add('on');m.setAttribute('aria-hidden','false');
}
function closeTraining(){const m=document.getElementById('worldModal');m.classList.remove('on');m.setAttribute('aria-hidden','true');}
renderWorld();