
let data=[], state={training:null,exercise:0,round:1,left:0,running:false,timer:null};
const app=document.getElementById('app');

fetch('trainings.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(x=>{data=x;world()}).catch(()=>{app.innerHTML='<div style="padding:40px;font-family:sans-serif">Die Trainingsdaten konnten nicht geladen werden.</div>'});

function topbar(back){
 return `<header class="topbar"><div class="brand"><b>10′</b> MINUTEN ON TOP</div>${back?`<button class="back" onclick="${back}">← ZURÜCK</button>`:`<div class="quiet">Wähle dein Training</div>`}</header>`;
}
function world(){
 clearTimer(); state.training=null;
 app.innerHTML=`<div class="app">${topbar('')}<div class="world-wrap"><section class="world">
 <img src="welt.jpg" alt="10 Minuten on Top Trainingswelt">
 ${data.map(t=>`<button class="hot h${t.id}" onclick="openTraining(${t.id})" aria-label="${t.title} öffnen"></button>`).join('')}
 </section></div></div>`;
}
function openTraining(id){
 clearTimer(); state.training=data.find(x=>x.id===id); state.exercise=0; state.round=1;
 const t=state.training;
 app.innerHTML=`<div class="app">${topbar('world()')}<section class="training" style="--accent:${t.accent}">
 <div class="scene"><div class="scene-copy"><div class="kicker">Training ${t.id}</div><h1>${t.title}</h1><p>${t.claim}</p>
 <div class="meta"><span class="pill">4 Übungen</span><span class="pill">${t.rounds} Runden</span><span class="pill">${t.pause} Sek. Pause</span></div></div></div>
 <div class="route">${t.exercises.map((e,i)=>`<button class="card" onclick="openExercise(${i})"><span class="num">${i+1}</span><h2>${e.title}</h2><div class="time">${e.duration} SEK.</div><ol class="steps">${e.steps.map(s=>`<li>${s}</li>`).join('')}</ol><span class="tap">Übung öffnen →</span></button>`).join('')}</div>
 <div class="anchor"><b>ANKER</b> · Nach der letzten Runde 30–60 Sekunden ruhig atmen.</div>
 </section></div>`;
}
function openExercise(i){
 clearTimer(); state.exercise=i; state.left=state.training.exercises[i].duration; state.running=false;
 renderExercise();
}
function renderExercise(){
 const t=state.training,e=t.exercises[state.exercise], pct=Math.max(0,state.left/e.duration);
 app.innerHTML=`<div class="app">${topbar('openTraining('+t.id+')')}<section class="exercise" style="--accent:${t.accent}">
 <div class="exercise-shell"><div class="motion" aria-hidden="true"><div class="figure"><div class="head"></div><div class="torso"></div><div class="arm a"></div><div class="arm b"></div><div class="shorts"></div><div class="leg a"><i class="sock"></i><i class="shoe"></i></div><div class="leg b"><i class="sock"></i><i class="shoe"></i></div></div></div>
 <div class="panel"><div class="eyebrow">${t.title} · Runde ${state.round} von ${t.rounds} · Übung ${state.exercise+1} von 4</div><h1>${e.title}</h1>
 <div class="how">${e.steps.map((s,i)=>`<div>${i+1}. ${s}</div>`).join('')}</div>
 <div class="timer"><div class="clock">${fmt(state.left)}</div><div class="progress"><i style="transform:scaleX(${pct})"></i></div>
 <div class="actions"><button class="secondary" onclick="resetTimer()">↺</button><button class="primary" onclick="toggleTimer()">${state.running?'PAUSE':'START'}</button><button class="secondary" onclick="nextExercise()">WEITER →</button></div></div></div></div></section></div>`;
}
function fmt(s){return '00:'+String(Math.max(0,s)).padStart(2,'0')}
function toggleTimer(){
 if(state.running){clearInterval(state.timer);state.running=false;renderExercise();return}
 state.running=true; renderExercise();
 state.timer=setInterval(()=>{
   state.left--;
   if(state.left<=0){state.left=0;clearTimer();beep();renderExercise();setTimeout(nextExercise,700)}
   else updateClock();
 },1000);
}
function updateClock(){
 const c=document.querySelector('.clock'),p=document.querySelector('.progress i');
 if(c)c.textContent=fmt(state.left);
 if(p)p.style.transform=`scaleX(${state.left/state.training.exercises[state.exercise].duration})`;
}
function resetTimer(){clearTimer();state.left=state.training.exercises[state.exercise].duration;renderExercise()}
function clearTimer(){if(state.timer)clearInterval(state.timer);state.timer=null;state.running=false}
function beep(){
 try{const A=window.AudioContext||window.webkitAudioContext,a=new A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=660;g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(.12,a.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.18);o.start();o.stop(a.currentTime+.2)}catch(e){}
}
function nextExercise(){
 clearTimer();
 if(state.exercise<3){state.exercise++;state.left=state.training.exercises[state.exercise].duration;renderExercise();return}
 if(state.round<state.training.rounds){state.round++;state.exercise=0;state.left=state.training.exercises[0].duration;roundDone();return}
 finish();
}
function roundDone(){
 const t=state.training;
 app.innerHTML=`<div class="app">${topbar('openTraining('+t.id+')')}<section class="done"><div class="donebox"><div class="kicker">${t.title}</div><h1>Runde geschafft.</h1><p>${state.round-1} von ${t.rounds} Runden sind erledigt. ${t.pause} Sekunden locker werden. Dann geht es weiter.</p><button class="primary" onclick="renderExercise()">NÄCHSTE RUNDE →</button></div></section></div>`;
}
function finish(){
 const t=state.training;
 app.innerHTML=`<div class="app">${topbar('world()')}<section class="done"><div class="donebox"><div class="kicker">${t.title}</div><h1>Fertig.</h1><p>Atme jetzt 30–60 Sekunden ruhig. Durch die Nase ein. Langsam wieder aus. Heute hast du deinem Körper zehn gute Minuten gegeben.</p><button class="primary" onclick="world()">ZURÜCK ZUR WELT</button></div></section></div>`;
}
