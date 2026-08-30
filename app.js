const app = document.getElementById("app");
const ASSET_REV = "20260830-all-nine-v1";

const DEFAULT_FINISH = {
  title: "ZUM SCHLUSS",
  steps: [
    "Stell dich locker hin.",
    "Atme dreimal ruhig durch die Nase ein.",
    "Atme langsam durch den Mund aus."
  ],
  statement: "Ruhig werden. Du hast sauber trainiert."
};

let trainings = [];
let training = null;
let activeRun = null;
let programRun = null;
let audioContext = null;
let wakeLock = null;

init();

async function init() {
  try {
    const response = await fetch(`./training.json?v=${ASSET_REV}`, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Training konnte nicht geladen werden: ${response.status}`);
    trainings = await response.json();
    if (!Array.isArray(trainings) || trainings.length !== 9) {
      throw new Error("Die Trainingsübersicht ist unvollständig.");
    }
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
    if (document.hidden) return;
    if (programRun && !programRun.paused && !programRun.completed) updateProgramFromClock();
    if (activeRun?.mode === "timer" && !activeRun.paused) updateTimerFromClock();
  });
}

function handleClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, exerciseId, trainingId } = button.dataset;

  if (action === "open-training") navigateToTraining(Number(trainingId));
  if (action === "scroll-trainings") {
    document.getElementById("training-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (action === "home") navigateHome();
  if (action === "start-program") startProgram();
  if (action === "program-pause") toggleProgramPause();
  if (action === "program-restart") restartProgram();
  if (action === "program-close") closeProgram();
  if (action === "start") startExercise(exerciseId);
  if (action === "pause") togglePause();
  if (action === "restart") startExercise(exerciseId);
  if (action === "close") closeExercise();
  if (action === "complete") completeExercise(exerciseId);
  if (action === "retry") init();
}

function navigateToTraining(station) {
  stopAllRuns();
  history.pushState({ station }, "", `#training-${station}`);
  renderRoute();
}

function navigateHome() {
  stopAllRuns();
  history.pushState({ view: "home" }, "", "#start");
  renderRoute();
}

function renderRoute() {
  stopAllRuns();
  if (!trainings.length) return;

  const legacyStation = location.hash === "#fels" ? 6 : null;
  const routeMatch = location.hash.match(/^#training-([1-9])$/);
  const station = legacyStation || Number(routeMatch?.[1]);

  if (station) {
    training = trainings.find(item => item.station === station);
    if (!training) return renderHome();
    if (training.status === "ready") renderProgramTraining();
    else renderLegacyTraining();
  } else {
    training = null;
    renderHome();
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderHome() {
  const current = trainings.find(item => item.station === 1);
  document.title = "10 Minuten on Top";

  app.innerHTML = `
    <div class="home-shell">
      ${topbarMarkup(false)}

      <main>
        <section class="home-hero" aria-labelledby="home-title">
          <div class="home-hero-copy">
            <p class="home-kicker">TRAINING FÜR DEIN ZIMMER</p>
            <h1 id="home-title">Dein Training.<br>Dein Zimmer.<br><span>Zehn Minuten.</span></h1>
            <p class="home-lead">Kraft, Beweglichkeit, Schnelligkeit und Fokus. Ohne Geräte. Mit klarer Anleitung.</p>

            <div class="home-facts" aria-label="Trainingsmerkmale">
              <span>10 MINUTEN</span>
              <span>9 TRAININGS</span>
              <span>OHNE MATERIAL</span>
            </div>

            <button class="hero-start" type="button" data-action="scroll-trainings">
              TRAINING WÄHLEN <span aria-hidden="true">↓</span>
            </button>
            <p class="home-sequence">Neun Einheiten. Immer Ganzkörper. Immer exakt zehn Minuten.</p>
          </div>

          <figure class="home-hero-visual">
            <img
              src="./t01-linienschritte.jpg?v=${ASSET_REV}"
              alt="Ein Junge trainiert schnelle Linienschritte in seinem Zimmer."
              width="1536"
              height="1024"
              fetchpriority="high"
            >
            <figcaption>
              <span>01</span>
              <strong>${current.title}</strong>
              <small>${current.statement}</small>
            </figcaption>
          </figure>
        </section>

        <section class="home-current" aria-labelledby="current-title">
          <div class="section-heading">
            <div>
              <p class="home-kicker">IN JEDER EINHEIT</p>
              <h2 id="current-title">Der ganze Körper arbeitet</h2>
            </div>
            <p>Die Schwerpunkte wechseln, aber Kraft, Beweglichkeit, Tempo, Balance und ein ruhiger Abschluss bleiben Teil des Systems.</p>
          </div>

          <div class="current-strip" aria-label="Trainingsbestandteile">
            ${[
              ["KRAFT", "Beine, Rumpf und Oberkörper"],
              ["BEWEGLICHKEIT", "Gelenke und grosse Bewegungen"],
              ["SCHNELLIGKEIT", "Kurze, leise Aktionen"],
              ["BALANCE", "Stabilität und Körperkontrolle"],
              ["RUHE", "Atmung und Konzentration"]
            ].map((item, index) => `
              <div class="current-item">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <strong>${item[0]}</strong>
                <small>${item[1]}</small>
              </div>
            `).join("")}
          </div>
        </section>

        <section class="training-library" id="training-list" aria-labelledby="library-title">
          <div class="section-heading">
            <div>
              <p class="home-kicker">ALLE EINHEITEN</p>
              <h2 id="library-title">Wähle dein Training</h2>
            </div>
            <p>Neun unterschiedliche Ganzkörpertrainings. Jede Einheit enthält fünf Bewegungen, zwei Runden und eine ruhige Schlussminute.</p>
          </div>

          <div class="archive-grid">
            ${trainings.map(renderArchiveCard).join("")}
          </div>
        </section>
      </main>

      <footer class="home-footer">
        <strong>10 MINUTEN ON TOP</strong>
        <span>Sauber bewegen. Regelmässig trainieren.</span>
      </footer>
    </div>
  `;
}

function renderArchiveCard(item, index) {
  return `
    <button class="archive-card" type="button" data-action="open-training" data-training-id="${item.station}">
      <span class="archive-card-image">
        <img src="./${item.exercises[3]?.image || item.exercises[0].image}?v=${ASSET_REV}" alt="" width="1536" height="1024" loading="${index < 3 ? "eager" : "lazy"}" decoding="async">
        <small>10 MIN</small>
      </span>
      <span class="archive-card-body">
        <span class="archive-number">${String(item.station).padStart(2, "0")}</span>
        <span class="archive-copy">
          <strong>${item.title}</strong>
          <span>${item.statement}</span>
        </span>
        <span class="archive-arrow" aria-hidden="true">→</span>
      </span>
    </button>
  `;
}

function topbarMarkup(showBack = true) {
  return `
    <header class="topbar">
      <div class="brand" aria-label="10 Minuten on Top">
        <span class="brand-badge" aria-hidden="true">10′</span>
        <span>MINUTEN ON TOP</span>
      </div>
      ${showBack ? `
        <button class="back-button" type="button" data-action="home">
          <span aria-hidden="true">←</span> ZUR ÜBERSICHT
        </button>
      ` : `<span class="topbar-note">9 TRAININGS BEREIT</span>`}
    </header>
  `;
}

function renderProgramTraining() {
  document.title = `${training.title} · 10 Minuten on Top`;
  app.innerHTML = `
    <div class="training-shell new-training-shell" style="--mission-accent:${training.accent}">
      ${topbarMarkup(true)}

      <main>
        <section class="new-training-hero" aria-labelledby="training-title">
          <div class="new-training-copy">
            <p class="eyebrow">TRAINING ${String(training.station).padStart(2, "0")} · ZEHN MINUTEN</p>
            <h1 id="training-title">${training.title}</h1>
            <p class="statement">${training.statement}</p>
            <p class="intro-text">${training.intro}</p>

            <div class="training-stats" aria-label="Dauer und Ausstattung">
              <span><strong>10</strong> MINUTEN</span>
              <span><strong>5</strong> BEWEGUNGEN</span>
              <span><strong>0</strong> GERÄTE</span>
            </div>

            <button class="program-start" type="button" data-action="start-program">
              <span>10 MINUTEN STARTEN</span>
              <span aria-hidden="true">→</span>
            </button>
            <p class="start-hint">Der Timer führt dich automatisch durch Training und Wechsel.</p>
          </div>

          <figure class="new-training-visual">
            <img
              src="./${training.exercises[0].image}?v=${ASSET_REV}"
              alt="${training.exercises[0].alt}"
              width="${training.exercises[0].imageWidth}"
              height="${training.exercises[0].imageHeight}"
              fetchpriority="high"
            >
          </figure>
        </section>

        <section class="training-safety" aria-label="Sicherheit">
          <strong>VOR DEM START</strong>
          <span>Räume etwa zwei Quadratmeter frei.</span>
          <span>Lande bei schnellen Schritten leise.</span>
          <span>Bei Schmerzen sofort stoppen.</span>
        </section>

        <section class="program-overview" aria-labelledby="overview-title">
          <div class="section-heading">
            <div>
              <p class="home-kicker">DEIN ABLAUF</p>
              <h2 id="overview-title">Fünf klare Bewegungen</h2>
            </div>
            <p>Jede Bewegung dauert 45 Sekunden. Dazwischen hast du 15 Sekunden für den Wechsel. In Runde zwei kommt eine kleine Steigerung dazu.</p>
          </div>

          <div class="program-card-grid">
            ${training.exercises.map(renderProgramCard).join("")}
          </div>

          ${renderFinishPreview(training.finish)}

          <div class="bottom-start">
            <div>
              <strong>Bereit für die ganzen zehn Minuten?</strong>
              <span>Start drücken. Der Rest läuft automatisch.</span>
            </div>
            <button class="program-start" type="button" data-action="start-program">
              <span>TRAINING STARTEN</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  `;
}

function renderProgramCard(exercise, index) {
  return `
    <article class="program-card">
      <div class="program-card-image">
        <img
          src="./${exercise.image}?v=${ASSET_REV}"
          alt="${exercise.alt}"
          width="${exercise.imageWidth}"
          height="${exercise.imageHeight}"
          loading="${index < 2 ? "eager" : "lazy"}"
          decoding="async"
        >
        <span>${String(index + 1).padStart(2, "0")}</span>
      </div>
      <div class="program-card-copy">
        <div class="program-card-meta">
          <span>${exercise.category}</span>
          <strong>45 SEK</strong>
        </div>
        <h3>${exercise.title}</h3>
        <ul>
          ${exercise.steps.map(step => `<li>${step}</li>`).join("")}
        </ul>
        ${exercise.options ? `
          <div class="level-options" aria-label="Drei Varianten">
            ${exercise.options.map(option => `<span>${option}</span>`).join("")}
          </div>
        ` : ""}
        ${exercise.round2Cue ? `<p class="round-two"><strong>RUNDE 2</strong> ${exercise.round2Cue}</p>` : ""}
      </div>
    </article>
  `;
}

function renderFinishPreview(finish) {
  return `
    <article class="finish-preview">
      <div class="finish-preview-image">
        <img
          src="./${finish.image}?v=${ASSET_REV}"
          alt="${finish.alt}"
          width="${finish.imageWidth}"
          height="${finish.imageHeight}"
          loading="lazy"
          decoding="async"
        >
      </div>
      <div class="finish-preview-copy">
        <p class="home-kicker">MINUTE 10 · RUHE UND FOKUS</p>
        <h2>${finish.title}</h2>
        <ul>
          ${finish.steps.map(step => `<li>${step}</li>`).join("")}
        </ul>
        <p>${finish.statement}</p>
      </div>
    </article>
  `;
}

function buildProgramSegments() {
  const segments = [];
  const firstRound = training.exercises;
  const secondRound = training.exercises.slice(0, 4);

  firstRound.forEach((exercise, index) => {
    segments.push(makeWorkSegment(exercise, 1, index + 1, firstRound.length));
    const next = index < firstRound.length - 1 ? firstRound[index + 1] : secondRound[0];
    segments.push(makeTransitionSegment(next, index === firstRound.length - 1 ? 2 : 1));
  });

  secondRound.forEach((exercise, index) => {
    segments.push(makeWorkSegment(exercise, 2, index + 1, secondRound.length));
    if (index < secondRound.length - 1) {
      segments.push(makeTransitionSegment(secondRound[index + 1], 2));
    } else {
      segments.push({
        kind: "transition",
        duration: 15,
        label: "WECHSEL · 15 SEKUNDEN",
        title: "Ruhig hinstellen",
        cue: "Die letzte Minute gehört deiner Atmung.",
        image: training.finish.image,
        alt: training.finish.alt
      });
    }
  });

  segments.push({
    kind: "finish",
    duration: 60,
    label: "MINUTE 10 · RUHE UND FOKUS",
    title: training.finish.title,
    cue: training.finish.steps.join(" "),
    image: training.finish.image,
    alt: training.finish.alt
  });

  return segments;
}

function makeWorkSegment(exercise, round, position, roundLength) {
  return {
    kind: "work",
    duration: 45,
    label: `RUNDE ${round} · BEWEGUNG ${position} VON ${roundLength}`,
    title: exercise.title,
    cue: round === 2 && exercise.round2Cue ? exercise.round2Cue : exercise.cue,
    image: exercise.image,
    alt: exercise.alt
  };
}

function makeTransitionSegment(nextExercise, round) {
  return {
    kind: "transition",
    duration: 15,
    label: `WECHSEL · RUNDE ${round}`,
    title: "Als Nächstes",
    cue: nextExercise.title,
    image: nextExercise.image,
    alt: nextExercise.alt
  };
}

async function startProgram() {
  stopAllRuns();
  await prepareAudio();

  const segments = buildProgramSegments();
  programRun = {
    segments,
    index: 0,
    totalMs: segments.reduce((sum, segment) => sum + segment.duration * 1000, 0),
    remainingMs: segments[0].duration * 1000,
    endAt: Date.now() + segments[0].duration * 1000,
    paused: false,
    completed: false,
    interval: null
  };

  renderProgramOverlay();
  programRun.interval = window.setInterval(updateProgramFromClock, 150);
  requestWakeLock();
  playTone([700, 900]);
}

function renderProgramOverlay() {
  document.body.classList.add("program-is-open");
  app.insertAdjacentHTML("beforeend", `
    <section class="program-overlay" role="dialog" aria-modal="true" aria-labelledby="program-title">
      <header class="program-topbar">
        <div class="brand program-brand">
          <span class="brand-badge" aria-hidden="true">10′</span>
          <span>${training.title}</span>
        </div>
        <button class="program-close" type="button" data-action="program-close" aria-label="Training schliessen">SCHLIESSEN <span aria-hidden="true">×</span></button>
      </header>
      <div class="program-frame" data-program-frame></div>
    </section>
  `);
  renderProgramStage();
}

function renderProgramStage() {
  if (!programRun || programRun.completed) return;
  const segment = programRun.segments[programRun.index];
  const frame = document.querySelector("[data-program-frame]");
  if (!frame) return;

  frame.innerHTML = `
    <figure class="program-live-image">
      <img src="./${segment.image}?v=${ASSET_REV}" alt="${segment.alt}" width="1536" height="1024">
      <figcaption>${segment.kind === "transition" ? "WECHSEL" : segment.kind === "finish" ? "RUHIG WERDEN" : "JETZT TRAINIEREN"}</figcaption>
    </figure>

    <section class="program-live-panel ${segment.kind === "transition" ? "is-transition" : ""}">
      <div>
        <p class="program-label">${segment.label}</p>
        <h1 id="program-title">${segment.title}</h1>
        <p class="program-cue">${segment.cue}</p>
      </div>

      <div class="program-clocks">
        <div><small>DIESE PHASE</small><strong data-program-clock>${formatTimeMs(programRun.remainingMs)}</strong></div>
        <div><small>NOCH GESAMT</small><strong data-program-total>${formatTimeMs(totalProgramRemainingMs())}</strong></div>
      </div>

      <div class="program-progress" role="progressbar" aria-label="Fortschritt des Trainings" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-program-progress>
        <div data-program-fill></div>
      </div>

      <div class="program-actions">
        <button class="program-main-action" type="button" data-action="program-pause">PAUSE</button>
        <button class="program-secondary-action" type="button" data-action="program-restart">VON VORNE</button>
      </div>
    </section>
  `;
  updateProgramDisplay();
}

function updateProgramFromClock() {
  if (!programRun || programRun.paused || programRun.completed) return;

  const now = Date.now();
  programRun.remainingMs = Math.max(0, programRun.endAt - now);

  while (programRun && !programRun.completed && now >= programRun.endAt) {
    const overrunMs = now - programRun.endAt;
    if (!moveToNextSegment(overrunMs)) return;
  }

  if (programRun && !programRun.completed) {
    programRun.remainingMs = Math.max(0, programRun.endAt - Date.now());
    updateProgramDisplay();
  }
}

function moveToNextSegment(overrunMs = 0) {
  if (!programRun) return false;
  programRun.index += 1;

  if (programRun.index >= programRun.segments.length) {
    finishProgram();
    return false;
  }

  const segment = programRun.segments[programRun.index];
  const durationMs = segment.duration * 1000;
  programRun.remainingMs = Math.max(0, durationMs - overrunMs);
  programRun.endAt = Date.now() + durationMs - overrunMs;
  renderProgramStage();

  if (overrunMs < 1200) {
    playTone(segment.kind === "work" ? [720] : segment.kind === "finish" ? [620, 820] : [520]);
  }
  return true;
}

function updateProgramDisplay() {
  if (!programRun || programRun.completed) return;
  const clock = document.querySelector("[data-program-clock]");
  const total = document.querySelector("[data-program-total]");
  const fill = document.querySelector("[data-program-fill]");
  const progress = document.querySelector("[data-program-progress]");
  const remaining = totalProgramRemainingMs();
  const completedRatio = Math.min(1, Math.max(0, 1 - remaining / programRun.totalMs));

  if (clock) clock.textContent = formatTimeMs(programRun.remainingMs);
  if (total) total.textContent = formatTimeMs(remaining);
  if (fill) fill.style.transform = `scaleX(${completedRatio})`;
  if (progress) progress.setAttribute("aria-valuenow", String(Math.round(completedRatio * 100)));
}

function totalProgramRemainingMs() {
  if (!programRun) return 0;
  return programRun.remainingMs + programRun.segments.slice(programRun.index + 1).reduce((sum, segment) => sum + segment.duration * 1000, 0);
}

function toggleProgramPause() {
  if (!programRun || programRun.completed) return;
  const button = document.querySelector("[data-action='program-pause']");
  const panel = document.querySelector(".program-live-panel");

  if (programRun.paused) {
    programRun.paused = false;
    programRun.endAt = Date.now() + programRun.remainingMs;
    if (button) button.textContent = "PAUSE";
    panel?.classList.remove("is-paused");
    requestWakeLock();
  } else {
    programRun.remainingMs = Math.max(0, programRun.endAt - Date.now());
    programRun.paused = true;
    if (button) button.textContent = "WEITER";
    panel?.classList.add("is-paused");
    updateProgramDisplay();
    releaseWakeLock();
  }
}

function restartProgram() {
  if (!programRun) return;
  const segments = programRun.segments;
  programRun.index = 0;
  programRun.remainingMs = segments[0].duration * 1000;
  programRun.endAt = Date.now() + programRun.remainingMs;
  programRun.paused = false;
  programRun.completed = false;
  if (!programRun.interval) {
    programRun.interval = window.setInterval(updateProgramFromClock, 150);
  }
  renderProgramStage();
  requestWakeLock();
  playTone([700, 900]);
}

function finishProgram() {
  if (!programRun) return;
  if (programRun.interval) clearInterval(programRun.interval);
  programRun.interval = null;
  programRun.completed = true;
  releaseWakeLock();
  playTone([700, 860, 1040]);

  const frame = document.querySelector("[data-program-frame]");
  if (!frame) return;
  frame.innerHTML = `
    <figure class="program-live-image program-complete-image">
      <img src="./${training.finish.image}?v=${ASSET_REV}" alt="${training.finish.alt}" width="1536" height="1024">
      <figcaption>10 MINUTEN GESCHAFFT</figcaption>
    </figure>
    <section class="program-live-panel program-complete-panel">
      <div>
        <p class="program-label">TRAINING BEENDET</p>
        <h1 id="program-title">Sauber abgeschlossen.</h1>
        <p class="program-cue">Atme noch einmal ruhig durch. Dann bist du fertig.</p>
      </div>
      <div class="complete-mark" aria-hidden="true">✓</div>
      <div class="program-actions">
        <button class="program-main-action" type="button" data-action="program-close">ZURÜCK ZUM TRAINING</button>
        <button class="program-secondary-action" type="button" data-action="program-restart">NOCHMALS</button>
      </div>
    </section>
  `;
}

function closeProgram() {
  stopProgram();
}

function stopProgram() {
  if (programRun?.interval) clearInterval(programRun.interval);
  programRun = null;
  document.querySelector(".program-overlay")?.remove();
  document.body.classList.remove("program-is-open");
  releaseWakeLock();
}

function renderLegacyTraining() {
  const finish = training.finish || DEFAULT_FINISH;
  document.title = `${training.shortTitle} · 10 Minuten on Top`;
  app.innerHTML = `
    <div class="training-shell" style="--mission-accent:${training.accent}">
      ${topbarMarkup(true)}

      <section class="training-intro" aria-labelledby="training-title">
        <div>
          <p class="eyebrow">TRAINING ${String(training.station).padStart(2, "0")}</p>
          <h1 id="training-title">${training.title}</h1>
          <p class="statement">${training.statement}</p>
          <p class="intro-text">${training.intro}</p>
        </div>
        <aside class="safety-note review-note">
          <strong>SICHER TRAINIEREN</strong>
          <span>Räume genügend Platz frei und stoppe die Einheit bei Schmerzen.</span>
        </aside>
      </section>

      <section class="exercise-grid" aria-label="Vier Übungen">
        ${training.exercises.map(renderLegacyExerciseCard).join("")}
      </section>

      <section class="finish-card" aria-labelledby="finish-title">
        <div class="finish-number" aria-hidden="true">✓</div>
        <div>
          <p class="eyebrow">RUHIG WERDEN</p>
          <h2 id="finish-title">${finish.title}</h2>
          <ol>${finish.steps.map(step => `<li>${step}</li>`).join("")}</ol>
          <p class="finish-statement">${finish.statement}</p>
          <button class="finish-button" type="button" data-action="home">ZURÜCK ZUR ÜBERSICHT</button>
        </div>
      </section>
    </div>
  `;
}

function renderLegacyExerciseCard(exercise, index) {
  const measure = exercise.mode === "timer" ? `${exercise.duration} SEKUNDEN` : `${exercise.repetitions} WIEDERHOLUNGEN`;
  return `
    <article class="exercise-card" id="card-${exercise.id}">
      <header class="card-heading">
        <span class="exercise-number">${index + 1}</span>
        <div><p class="card-kicker">ÜBUNG ${index + 1}</p><h2>${exercise.title}</h2></div>
      </header>
      <div class="exercise-visual">
        <img src="./${exercise.image}?v=${ASSET_REV}" alt="${exercise.alt}" width="${exercise.imageWidth}" height="${exercise.imageHeight}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
      </div>
      <div class="card-content">
        <ul class="exercise-steps">${exercise.steps.map(step => `<li>${step}</li>`).join("")}</ul>
        ${exercise.focus ? `<p class="focus-cue">${exercise.focus}</p>` : ""}
        <div class="exercise-controls">
          <span class="measure">${measure}</span>
          <button class="start-button" type="button" data-action="start" data-exercise-id="${exercise.id}">START</button>
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
        <div><strong>LANGSAME WIEDERHOLUNGEN</strong><p>Zähle nur Bewegungen, die sich sauber anfühlen.</p></div>
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
    signalEvery: exercise.signalEvery || null,
    lastSignalElapsed: 0,
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
      <span class="timer-cue" data-cue>${exercise.signalEvery ? "BEIM TON REAGIEREN" : exercise.cue ? "HALTE DEINE POSITION" : "RUHIG WEITER"}</span>
    </div>
    <div class="timer-track" aria-hidden="true"><div class="timer-fill" data-fill style="transform:scaleX(1)"></div></div>
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
    const elapsed = activeRun.total - remaining;
    if (activeRun.signalEvery && elapsed > 0 && elapsed % activeRun.signalEvery === 0 && activeRun.lastSignalElapsed !== elapsed) {
      activeRun.lastSignalElapsed = elapsed;
      playTone([720]);
    }
  }

  if (activeRun.cueAtRemaining && !activeRun.cuePlayed && remaining <= activeRun.cueAtRemaining && remaining > 0) {
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
    <div class="manual-finish" role="status"><strong>FERTIG</strong><span>Atme einmal ruhig durch.</span></div>
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

function stopAllRuns() {
  stopRun();
  stopProgram();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function formatTimeMs(milliseconds) {
  return formatTime(Math.max(0, Math.ceil(milliseconds / 1000)));
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
    console.info("Bildschirm Wachhalter ist auf diesem Gerät nicht verfügbar.");
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
      console.warn("Offline Modus konnte nicht aktiviert werden.", error);
    });
  });
}
