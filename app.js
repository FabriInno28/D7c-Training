
let D={},current=null,mode='single',state=null,tick=null,paused=false,audio=null;
const app=document.getElementById('app');
const $=q=>document.querySelector(q);

fetch('./trainings.json').then(r=>r.json()).then(d=>{D=d;world()}).catch(()=>app.innerHTML='<div class="wrap"><section class="hero"><h1>Trainingswelt konnte nicht geladen werden.</h1><p>Bitte Seite neu laden.</p></section></div>');

function exDuration(e){return e.seconds||e.segments.reduce((a,s)=>a+s[1],0)}
function totalSec(s){let work=s.ex.reduce((a,e)=>a+exDuration(e),0);return s.rounds*(work+(s.ex.length-1)*s.exercise_pause)+(s.rounds-1)*s.round_pause+s.breath}
function minLabel(s){let sec=totalSec(s);let m=Math.floor(sec/60),ss=sec%60;return ss?`${m}:${String(ss).padStart(2,'0')}`:`${m} Min.`}
function timeCard(e){if(e.seconds)return `${e.seconds} SEK.`;return e.segments.filter(x=>x[0]!=='WECHSEL').map(x=>x[1]).join(' + ')+' SEK.'}

function shell(body,back=''){app.innerHTML=`<div class="wrap"><header class="top"><div class="brand"><b>10'</b> MINUTEN ON TOP</div>${back?`<button class="back" onclick="${back}">← ZURÜCK</button>`:'<div class="micro">FÜR DICH · FÜR DEIN SPIEL</div>'}</header>${body}</div><section id="timer" class="timer"></section>`}

function world(){
 clearInterval(tick);current=null;state=null;
 let body=`<section class="hero"><small>DEINE TRAININGSWELT</small><h1>WÄHLE, WAS DU HEUTE BRAUCHST.</h1><p>Neun vorbereitete Trainings. Stark. Schnell. Ruhig. Rund zehn Minuten für dich.</p></section>
 <section class="world"><img src="./trainingswelt.jpg" alt="Trainingswelt mit neun vorbereiteten Trainings">${Object.keys(D).map(k=>`<button class="hot h${k}" aria-label="${D[k].title}" onclick="openSet('${k}')"></button>`).join('')}</section>
 <div class="legend"><span>STARK · Kraft und Stabilität</span><span>SCHNELL · Schnelligkeit und Reaktion</span><span>RUHIG · Kontrolle und Fokus</span></div>`;
 shell(body)
}

function openSet(k){
 clearInterval(tick);current=k;state=null;let s=D[k];
 let body=`<section class="sethead ${s.zone}"><small>${s.zone} · TRAINING ${k}</small><h1>${s.title}</h1><p>${s.claim}</p><div class="meta"><span>4 Übungen</span><span>${s.rounds} Runden</span><span>${s.exercise_pause} Sek. Übungspause</span><span>${s.round_pause} Sek. Rundenpause</span><span>ca. ${minLabel(s)}</span></div><button class="startall" onclick="startFull()">GANZES TRAINING STARTEN</button></section>
 <section class="grid">${s.ex.map((e,i)=>`<button class="card" onclick="startSingle(${i})"><span class="step">${i+1}</span><h2>${e.name}</h2><div class="duration">${timeCard(e)}</div><div class="cues"><b>1.</b> ${e.cue}<br><b>2.</b> ${e.focus}</div><div class="click">TIMER STARTEN →</div></button>`).join('')}</section>
 <section class="anchor"><div><strong>ANKER</strong><p>Nach der letzten Runde ${s.breath} Sekunden ruhig atmen.</p></div><div>Durch die Nase ein. Länger aus.</div></section>`;
 shell(body,'world()')
}

function phasesForExercise(e,prefix=''){
 let p=[];
 if(e.segments)e.segments.forEach(seg=>p.push({name:`${prefix}${e.name} · ${seg[0]}`,seconds:seg[1],type:seg[0]==='WECHSEL'?'switch':'work',cue:e.cue,focus:e.focus}));
 else p.push({name:`${prefix}${e.name}`,seconds:e.seconds,type:'work',cue:e.cue,focus:e.focus});
 return p
}

function fullPhases(s){
 let p=[];
 for(let r=1;r<=s.rounds;r++){
   s.ex.forEach((e,i)=>{
     p.push(...phasesForExercise(e,`Runde ${r} · `));
     if(i<s.ex.length-1)p.push({name:'Nächste Übung',seconds:s.exercise_pause,type:'pause',cue:'Kurz lockern.',focus:'Gleich geht es weiter.'})
   });
   if(r<s.rounds)p.push({name:`Rundenpause · gleich Runde ${r+1}`,seconds:s.round_pause,type:'pause',cue:'Kurz lockern.',focus:'Bereit für die nächste Runde.'})
 }
 p.push({name:'Anker · ruhig atmen',seconds:s.breath,type:'breath',cue:'Durch die Nase ein.',focus:'Länger wieder aus.'});
 return p
}

function startFull(){mode='full';state={phases:fullPhases(D[current]),idx:0};startPhase()}
function startSingle(i){mode='single';state={exerciseIndex:i,phases:phasesForExercise(D[current].ex[i]),idx:0};startPhase()}

function startPhase(){
 clearInterval(tick);
 if(!state||state.idx>=state.phases.length){finish();return}
 let p=state.phases[state.idx];state.left=p.seconds;state.total=p.seconds;paused=false;
 renderTimer();$('#timer').classList.add('on');tone(p.type==='switch'?610:760,.08);
 tick=setInterval(()=>{if(paused)return;state.left--;renderTimer();if([3,2,1].includes(state.left))tone(540,.04);if(state.left<=0){clearInterval(tick);tone(900,.12);state.idx++;setTimeout(startPhase,220)}},1000)
}

function renderTimer(){
 let p=state.phases[state.idx],box=$('#timer'),progress=state.total?state.left/state.total:0;
 box.innerHTML=`<article class="panel"><div class="eyebrow">${D[current].zone} · ${D[current].title}</div><h2>${p.name}</h2><div class="instruction"><b>${p.cue}</b><br>${p.focus}</div><div class="clock">${String(Math.max(0,state.left)).padStart(2,'0')}</div><div class="bar"><i style="transform:scaleX(${progress})"></i></div><div class="controls"><button onclick="prevExercise()">← VORHERIGE</button><button class="main" onclick="toggle()">${paused?'WEITER':'PAUSE'}</button><button onclick="nextExercise()">NÄCHSTE →</button></div><button class="close" onclick="closeTimer()">ZUR ÜBERSICHT</button></article>`
}

function toggle(){paused=!paused;renderTimer();if(!paused)tone(700,.05)}

function findCurrentExercise(){
 if(mode==='single')return state.exerciseIndex??0;
 let name=state?.phases?.[state.idx]?.name||'';
 let i=D[current].ex.findIndex(e=>name.includes(e.name));
 return i<0?0:i
}
function prevExercise(){let i=Math.max(0,findCurrentExercise()-1);startSingle(i)}
function nextExercise(){let i=Math.min(D[current].ex.length-1,findCurrentExercise()+1);startSingle(i)}

function closeTimer(){clearInterval(tick);$('#timer').classList.remove('on')}
function finish(){clearInterval(tick);closeTimer();openSet(current)}

function tone(f=720,d=.08){
 try{
  audio=audio||new(window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume();
  let o=audio.createOscillator(),g=audio.createGain();
  o.frequency.value=f;g.gain.value=.035;o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)
 }catch(e){}
}

if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
