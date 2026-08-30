const app = document.getElementById("app");
const ASSET_REV = "20260830-2";

let training = null;
let activeRun = null;
let audioContext = null;
let wakeLock = null;

init();

async function init() {
  try {
    const response = await fetch(`./training.json?v=${ASSET_REV}`, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Training konnte nicht geladen werden: ${response.status}`);
    training = await response.json();
    bindGlobalEvents();
    renderRoute();
    registerServiceWorker();
  } catch (error) {
    renderError();
    console.error(error);
  }
}

function bindGlobalEvents() {
  app.addEventListener("click", handleClick);
  window.addEventListener("popstate", renderRoute);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && activeRun?.mode === "timer" && !activeRun.paused) {
      updateTimerFromClock();
    }
  });
}

function handleClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, exerciseId } = button.dataset;

  if (action === "open-training") navigateTo("training");
  if (action === "world") navigateTo("world");
  if (action === "start") startExercise(exerciseId);
  if (action === "pause") togglePause();
  if (action === "restart") startExercise(exerciseId);
  if (action === "close") closeExercise();
  if (action === "complete") completeExercise(exerciseId);
  if (action === "retry") init();
}

function navigateTo(view) {
  stopRun();
  const hash = view === "training" ? "#fels" : "#welt";
  history.pushState({ view }, "", hash);
  renderRoute();
}

function renderRoute() {
  stopRun();
  if (!training) return;

  if (location.hash === "#fels") {
    renderTraining();
  } else {
    renderWorld();
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderWorld() {
  document.title = "10 Minuten on Top";
  app.innerHTML = `
    <section class="world-screen" aria-labelledby="world-title">
      <div class="world-copy">
        <p class="world-kicker">DEIN TRAINING FÜR HEUTE</p>
        <h1 id="world-title">Finde den Fels.</h1>
        <p>Station 6 wartet auf dich.</p>
      </div>
      <div class="world-stage">
        <img
          src="./world.jpg?v=${ASSET_REV}"
          alt="Die Trainingswelt mit neun Stationen. Station 6 heisst Stark wie ein Fels."
          width="1400"
          height="933"
          fetchpriority="high"
        >
        <button
          class="world-hotspot"
          type="button"
          data-action="open-training"
          aria-label="Station 6, Stark wie ein Fels, öffnen"
        ></button>
      </div>
      <div class="world-action">
        <span>STATION 06</span>
        <button class="world-start-button" type="button" data-action="open-training">
          STARK WIE EIN FELS STARTEN
        </button>
      </div>
    </section>
  `;
}

function renderTraining() {
  document.title = `${training.shortTitle} · 10 Minuten on Top`;
  app.innerHTML = `
    <div class="training-shell">
      <header class="topbar">
        <div class="brand" aria-label="10 Minuten on Top">
          <span class="brand-badge" aria-hidden="true">10′</span>
          <span>MINUTEN ON TOP</span>
        </div>
        <button class="back-button" type="button" data-action="world">
          <span aria-hidden="true">←</span> ZUR WELT
        </button>
      </header>

      <section class="training-intro" aria-labelledby="training-title">
        <div>
          <p class="eyebrow">TRAINING ${training.station}</p>
          <h1 id="training-title">${training.title}</h1>
          <p class="statement">${training.statement}</p>
          <p class="intro-text">${training.intro}</p>
        </div>
        <aside class="safety-note">
          <strong>WICHTIG</strong>
          <span>Du brauchst etwas freien Platz. Bei Schmerzen stoppst du.</span>
        </aside>
      </section>

      <section class="exercise-grid" aria-label="Vier Übungen">
        ${training.exercises.map(renderExerciseCard).join("")}
      </section>

      <section class="finish-card" aria-labelledby="finish-title">
        <div class="finish-number" aria-hidden="true">✓</div>
        <div>
          <p class="eyebrow">RUHIG WERDEN</p>
          <h2 id="finish-title">${training.finish.title}</h2>
          <ol>
            ${training.finish.steps.map(step => `<li>${step}</li>`).join("")}
          </ol>
          <p class="finish-statement">${training.finish.statement}</p>
          <button class="finish-button" type="button" data-action="world">ZURÜCK ZUR WELT</button>
        </div>
      </section>
    </div>
  `;
}

function renderExerciseCard(exercise, index) {
  const measure = exercise.mode === "timer"
    ? `${exercise.duration} SEKUNDEN`
    : `${exercise.repetitions} WIEDERHOLUNGEN`;

  return `
    <article class="exercise-card" id="card-${exercise.id}">
      <header class="card-heading">
        <span class="exercise-number">${index + 1}</span>
        <div>
          <p class="card-kicker">ÜBUNG ${index + 1}</p>
          <h2>${exercise.title}</h2>
        </div>
      </header>

      <div class="exercise-visual">
        <img
          src="./${exercise.image}?v=${ASSET_REV}"
          alt="${exercise.alt}"
          width="${exercise.imageWidth}"
          height="${exercise.imageHeight}"
          loading="${index === 0 ? "eager" : "lazy"}"
          decoding="async"
        >
      </div>

      <div class="card-content">
        <ul class="exercise-steps">
          ${exercise.steps.map(step => `<li>${step}</li>`).join("")}
        </ul>
        <p class="focus-cue">${exercise.focus}</p>

        <div class="exercise-controls">
          <span class="measure">${measure}</span>
          <button
            class="start-button"
            type="button"
            data-action="start"
            data-exercise-id="${exercise.id}"
          >
            START
          </button>
        </div>

        <div class="run-panel" data-panel="${exercise.id}" hidden></div>
      </div>
    </article>
  `;
}

async function startExercise(exerciseId) {
  const exercise = training.exercises.find(item => item.id === exerciseId);
  if (!exercise) return;

  stopRun();
  closeAllPanels();

  const card = document.getElementById(`card-${exerciseId}`);
  const panel = card.querySelector("[data-panel]");
  card.classList.add("is-active");
  panel.hidden = false;

  if (exercise.mode === "repetition") {
    activeRun = { id: exercise.id, mode: "repetition" };
    panel.innerHTML = `
      <div class="repetition-run" role="status">
        <span class="repetition-count">${exercise.repetitions}</span>
        <div>
          <strong>LANGSAME WIEDERHOLUNGEN</strong>
          <p>Zähle nur Bewegungen, die sich sauber anfühlen.</p>
        </div>
      </div>
      <div class="run-actions">
        <button class="complete-button" type="button" data-action="complete" data-exercise-id="${exercise.id}">FERTIG</button>
        <button class="quiet-button" type="button" data-action="close">SCHLIESSEN</button>
      </div>
    `;
    panel.querySelector(".complete-button").focus();
    return;
  }

  await prepareAudio();
  requestWakeLock();

  activeRun = {
    id: exercise.id,
    mode: "timer",
    total: exercise.duration,
    remaining: exercise.duration,
    endAt: Date.now() + exercise.duration * 1000,
    paused: false,
    cueAtRemaining: exercise.cueAtRemaining || null,
    cue: exercise.cue || "",
    cuePlayed: false,
    interval: null
  };

  panel.innerHTML = timerPanelMarkup(exercise, exercise.duration);
  activeRun.interval = window.setInterval(updateTimerFromClock, 200);
  panel.querySelector("[data-action='pause']").focus();
}

function timerPanelMarkup(exercise, remaining) {
  return `
    <div class="timer-readout" role="timer" aria-live="off">
      <span class="clock" data-clock>${formatTime(remaining)}</span>
      <span class="timer-cue" data-cue>${exercise.cue ? "HALTE DEINE POSITION" : "RUHIG WEITER"}</span>
    </div>
    <div class="timer-track" aria-hidden="true">
      <div class="timer-fill" data-fill style="transform:scaleX(1)"></div>
    </div>
    <p class="run-status" data-status aria-live="assertive"></p>
    <div class="run-actions">
      <button class="quiet-button" type="button" data-action="pause">PAUSE</button>
      <button class="yellow-button" type="button" data-action="restart" data-exercise-id="${exercise.id}">NOCHMALS</button>
      <button class="dark-button" type="button" data-action="close">SCHLIESSEN</button>
    </div>
  `;
}

function updateTimerFromClock() {
  if (!activeRun || activeRun.mode !== "timer" || activeRun.paused) return;

  const remaining = Math.max(0, Math.ceil((activeRun.endAt - Date.now()) / 1000));
  if (remaining !== activeRun.remaining) {
    activeRun.remaining = remaining;
    updateTimerDisplay();
  }

  if (
    activeRun.cueAtRemaining &&
    !activeRun.cuePlayed &&
    remaining <= activeRun.cueAtRemaining &&
    remaining > 0
  ) {
    activeRun.cuePlayed = true;
    showMidwayCue();
  }

  if (remaining <= 0) finishTimer();
}

function updateTimerDisplay() {
  const card = document.getElementById(`card-${activeRun.id}`);
  if (!card) return;

  const clock = card.querySelector("[data-clock]");
  const fill = card.querySelector("[data-fill]");
  clock.textContent = formatTime(activeRun.remaining);
  fill.style.transform = `scaleX(${activeRun.remaining / activeRun.total})`;
}

function showMidwayCue() {
  const card = document.getElementById(`card-${activeRun.id}`);
  const cue = card?.querySelector("[data-cue]");
  const status = card?.querySelector("[data-status]");
  if (cue) cue.textContent = activeRun.cue;
  if (status) status.textContent = activeRun.cue;
  playTone([620, 820]);
}

function togglePause() {
  if (!activeRun || activeRun.mode !== "timer") return;

  const card = document.getElementById(`card-${activeRun.id}`);
  const button = card?.querySelector("[data-action='pause']");
  const status = card?.querySelector("[data-status]");

  if (activeRun.paused) {
    activeRun.paused = false;
    activeRun.endAt = Date.now() + activeRun.remaining * 1000;
    if (button) button.textContent = "PAUSE";
    if (status) status.textContent = "Weiter gehts.";
    requestWakeLock();
  } else {
    updateTimerFromClock();
    activeRun.paused = true;
    if (button) button.textContent = "WEITER";
    if (status) status.textContent = "Pause.";
    releaseWakeLock();
  }
}

function finishTimer() {
  if (!activeRun) return;

  const exerciseId = activeRun.id;
  const card = document.getElementById(`card-${exerciseId}`);
  const cue = card?.querySelector("[data-cue]");
  const status = card?.querySelector("[data-status]");
  const pauseButton = card?.querySelector("[data-action='pause']");

  if (activeRun.interval) clearInterval(activeRun.interval);
  activeRun.interval = null;
  if (cue) cue.textContent = "GESCHAFFT";
  if (status) status.textContent = "Fertig. Atme einmal ruhig durch.";
  if (pauseButton) pauseButton.disabled = true;
  card?.classList.add("is-finished");

  playTone([700, 860, 1040]);
  releaseWakeLock();
}

function completeExercise(exerciseId) {
  const card = document.getElementById(`card-${exerciseId}`);
  const panel = card?.querySelector("[data-panel]");
  if (!card || !panel) return;

  card.classList.add("is-finished");
  panel.innerHTML = `
    <div class="manual-finish" role="status">
      <strong>FERTIG</strong>
      <span>Atme einmal ruhig durch.</span>
    </div>
    <div class="run-actions">
      <button class="yellow-button" type="button" data-action="restart" data-exercise-id="${exerciseId}">NOCHMALS</button>
      <button class="dark-button" type="button" data-action="close">SCHLIESSEN</button>
    </div>
  `;
  activeRun = null;
}

function closeExercise() {
  stopRun();
  closeAllPanels();
}

function closeAllPanels() {
  document.querySelectorAll(".exercise-card").forEach(card => card.classList.remove("is-active"));
  document.querySelectorAll("[data-panel]").forEach(panel => {
    panel.hidden = true;
    panel.innerHTML = "";
  });
}

function stopRun() {
  if (activeRun?.interval) clearInterval(activeRun.interval);
  activeRun = null;
  releaseWakeLock();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

async function prepareAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === "suspended") await audioContext.resume();
  } catch (error) {
    console.warn("Audio konnte nicht vorbereitet werden.", error);
  }
}

function playTone(frequencies) {
  if (!audioContext) return;

  frequencies.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startsAt = audioContext.currentTime + index * 0.13;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startsAt);
    gain.gain.exponentialRampToValueAtTime(0.07, startsAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + 0.1);
    oscillator.start(startsAt);
    oscillator.stop(startsAt + 0.11);
  });
}

async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => {
        wakeLock = null;
      });
    }
  } catch (error) {
    console.info("Bildschirm-Wachhalter ist auf diesem Gerät nicht verfügbar.");
  }
}

function releaseWakeLock() {
  if (!wakeLock) return;
  wakeLock.release().catch(() => {});
  wakeLock = null;
}

function renderError() {
  app.innerHTML = `
    <section class="error-screen">
      <p class="eyebrow">DAS HAT NICHT GEKLAPPT</p>
      <h1>Das Training konnte nicht geladen werden.</h1>
      <p>Prüfe deine Verbindung und versuche es nochmals.</p>
      <button type="button" class="start-button" data-action="retry">NOCHMALS VERSUCHEN</button>
    </section>
  `;
  app.addEventListener("click", handleClick, { once: true });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => {
      console.warn("Offline-Modus konnte nicht aktiviert werden.", error);
    });
  });
}
