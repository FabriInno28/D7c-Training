
let DATA=null,currentKey=null,state=null,timer=null,running=false,audio=null,mode='full';
const $=q=>document.querySelector(q);
fetch('./training-data.json').then(r=>r.json()).then(d=>{DATA=d;renderHome()});
function tone(f=720,d=.08,v=.04){try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.stop(audio.currentTime+d)}catch(e){}}
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));scrollTo(0,0)}
function exerciseDuration(e){return e.seconds||e.segments.reduce((a,x)=>a+x[1],0)}
function total(s){let w=s.exercises.reduce((a,e)=>a+exerciseDuration(e),0);return s.rounds*(w+(s.exercises.length-1)*s.exercise_pause)+(s.rounds-1)*s.round_pause+s.breath}
function timeLabel(sec){let m=Math.floor(sec/60),ss=sec%60;return ss?`${m}:${String(ss).padStart(2,'0')}`:`${m} Min.`}
function cardTime(e){if(e.seconds)return `${e.seconds} SEK.`;return e.segments.filter(x=>x[0]!=='WECHSEL').map(x=>x[1]).join(' + ')+' SEK.'}
function renderHome(){
 $('#home').innerHTML=`<header class="top"><div class="brand">D7C <b>TRAINING</b></div><div class="micro">ZU HAUSE · KEIN MATERIAL · KEIN LÄRM</div></header><section class="hero"><div class="micro">DEIN TRAINING HEUTE</div><h1>STARK.<br>SCHNELL.<br>KONZENTRIERT.</h1><p>Wähle dein Training. Vier Übungen: Kraft, Schnellkraft, Balance, Aufmerksamkeit. Timer läuft mit.</p></section><section class="world">${Object.entries(DATA).map(([k,s])=>`<button class="world-card" data-k="${k}"><div class="world-image">${ICONS[s.exercises[0].icon]}</div><div class="world-body"><span class="tag">${s.label}</span><h2>${s.claim}</h2><p>${s.sub}</p><div class="world-meta"><span>${s.rounds} RUNDEN</span><span>CA. ${timeLabel(total(s))}</span></div></div></button>`).join('')}</section>`;
 document.querySelectorAll('.world-card').forEach(b=>b.onclick=()=>openTraining(b.dataset.k));show('home')
}
function openTraining(k){
 clearInterval(timer);running=false;state=null;currentKey=k;const s=DATA[k];
 $('#training').innerHTML=`<header class="top"><button class="back" id="back">← AUSWAHL</button><div class="micro">${s.label}</div></header><div class="training-head"><div><span class="tag">${s.label}</span><h1>${s.claim}</h1><p>${s.sub}</p><div class="pills"><span class="pill">${s.rounds} Runden</span><span class="pill">${s.exercise_pause} Sek. Pause</span><span class="pill">${s.round_pause} Sek. Rundenpause</span><span class="pill">ca. ${timeLabel(total(s))}</span></div></div><button class="start-all" id="startAll">GANZES TRAINING STARTEN</button></div><section class="exercise-grid">${s.exercises.map((e,i)=>`<button class="exercise-card" data-i="${i}"><div class="pic">${ICONS[e.icon]}</div><div class="copy"><div class="row"><span class="num">${i+1}</span><span class="cat">${e.category}</span><span class="time">${cardTime(e)}</span></div><h3>${e.name}</h3><div class="cues"><span><b>1.</b> ${e.cue}</span><span><b>2.</b> ${e.focus}</span></div></div></button>`).join('')}</section><section class="finish"><div><strong>ABSCHLUSS</strong><h3>Ruhig atmen · ${s.breath} Sek.</h3><p>Durch die Nase ein. Länger aus. Puls runter. Kopf ruhig.</p></div><div>◎</div></section><section class="timer" id="timerBox"><div class="timer-top"><div><div class="micro">AKTUELL</div><div class="phase">Bereit.</div></div><div class="clock">00:00</div></div><div class="timer-controls"><button id="prev">← VORHERIGE ÜBUNG</button><button class="main" id="pause">PAUSE</button><button id="next">NÄCHSTE ÜBUNG →</button></div></section>`;
 $('#back').onclick=renderHome;$('#startAll').onclick=()=>startFull(k);$('#pause').onclick=toggle;$('#prev').onclick=()=>jumpExercise(-1);$('#next').onclick=()=>jumpExercise(1);document.querySelectorAll('.exercise-card').forEach(b=>b.onclick=()=>startSingle(+b.dataset.i));show('training')
}
function phasesForExercise(e,r=''){const p=[];if(e.segments)e.segments.forEach(seg=>p.push({name:`${r}${e.name} · ${seg[0]}`,seconds:seg[1],type:seg[0]==='WECHSEL'?'switch':'work'}));else p.push({name:`${r}${e.name}`,seconds:e.seconds,type:'work'});return p}
function buildFull(s){const p=[];for(let r=1;r<=s.rounds;r++){s.exercises.forEach((e,i)=>{p.push(...phasesForExercise(e,`Runde ${r} · `));if(i<s.exercises.length-1)p.push({name:'Nächste Übung',seconds:s.exercise_pause,type:'pause'})});if(r<s.rounds)p.push({name:`Rundenpause · gleich Runde ${r+1}`,seconds:s.round_pause,type:'round'})}p.push({name:'Ruhig atmen',seconds:s.breath,type:'breath'});return p}
function startFull(k){mode='full';state={phases:buildFull(DATA[k]),idx:0};startPhase()}
function startSingle(i){mode='single';state={exerciseIndex:i,phases:phasesForExercise(DATA[currentKey].exercises[i]),idx:0};mark(i);startPhase()}
function mark(i){document.querySelectorAll('.exercise-card').forEach((b,j)=>b.classList.toggle('current',j===i))}
function startPhase(){clearInterval(timer);if(!state||state.idx>=state.phases.length){finish();return}const p=state.phases[state.idx];state.remaining=p.seconds;running=true;$('#timerBox').classList.add('on');renderTimer();tone(p.type==='switch'?620:780,.09);timer=setInterval(()=>{if(!running)return;state.remaining--;renderTimer();if([3,2,1].includes(state.remaining))tone(560,.04,.022);if(state.remaining<=0){clearInterval(timer);tone(930,.13);state.idx++;setTimeout(startPhase,220)}},1000)}
function renderTimer(){const p=state.phases[state.idx];$('.phase').textContent=p.name;$('.clock').textContent=String(Math.floor(state.remaining/60)).padStart(2,'0')+':'+String(state.remaining%60).padStart(2,'0');$('#pause').textContent=running?'PAUSE':'WEITER'}
function toggle(){if(!state)return;running=!running;renderTimer();if(running)tone(720,.06)}
function jumpExercise(dir){
 const s=DATA[currentKey];
 let i=state?.exerciseIndex;
 if(mode==='full'||i===undefined){
   const name=state?.phases?.[state.idx]?.name||'';
   i=s.exercises.findIndex(e=>name.includes(e.name));
   if(i<0)i=dir>0?-1:0;
 }
 i=Math.max(0,Math.min(s.exercises.length-1,i+dir));
 startSingle(i)
}
function finish(){running=false;$('#timerBox').classList.add('on');$('.phase').textContent='Ende · Übung wählen oder zurück zur Auswahl.';$('.clock').textContent='✓';$('#pause').textContent='ENDE';tone(980,.1)}
