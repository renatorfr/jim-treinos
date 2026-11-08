// Jim Treinos - Mobile PWA Logic & Google Sheets Sync

const STORAGE_KEY = "jim_treinos_state_v1";

const state = {
  microcycles: [],
  activeMicroId: "micro-02",
  activeWorkoutId: "A",
  activeTab: "workout",
  sessions: [],
  weightLogs: [],
  drafts: {}, // keyed by `${microId}_${workoutId}`
  calendarMonth: new Date().getMonth(),
  calendarYear: new Date().getFullYear(),
  searchQuery: "",
  groupFilter: "ALL",
  settings: {
    webhookUrl: "",
    secretKey: "",
    autoTimer: true,
    soundEnabled: true
  },
  timer: {
    intervalId: null,
    remainingSec: 0,
    label: "",
    running: false
  }
};

// Utility: Local YYYY-MM-DD
function getTodayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateBR(isoStr) {
  if (!isoStr) return "";
  const parts = String(isoStr).slice(0, 10).split("-");
  if (parts.length !== 3) return isoStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function showToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2800);
}

// Soft pastel chime via Web Audio API (no external audio files needed)
function playTimerBeep() {
  if (!state.settings.soundEnabled) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = [523.25, 659.25]; // C5 -> E5 soft chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.14 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.14);
      osc.stop(ctx.currentTime + idx * 0.14 + 0.26);
    });
    if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
  } catch (e) {
    // Ignore audio errors on restricted autoplay
  }
}

// Load & Save State
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      state.microcycles = parsed.microcycles?.length ? parsed.microcycles : window.DEFAULT_DATA.microcycles;
      state.activeMicroId = parsed.activeMicroId || window.DEFAULT_DATA.activeMicroId;
      state.activeWorkoutId = parsed.activeWorkoutId || "A";
      state.sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
      state.weightLogs = Array.isArray(parsed.weightLogs) ? parsed.weightLogs : [];
      state.drafts = parsed.drafts || {};
      state.settings = { ...state.settings, ...(parsed.settings || {}) };
    } catch (e) {
      console.error("Failed to parse saved state", e);
      state.microcycles = window.DEFAULT_DATA.microcycles;
    }
  } else {
    state.microcycles = window.DEFAULT_DATA.microcycles;
    state.activeMicroId = window.DEFAULT_DATA.activeMicroId;
  }
}

function saveState() {
  const payload = {
    microcycles: state.microcycles,
    activeMicroId: state.activeMicroId,
    activeWorkoutId: state.activeWorkoutId,
    sessions: state.sessions,
    weightLogs: state.weightLogs,
    drafts: state.drafts,
    settings: state.settings
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  updateSyncBadge();
}

function getActiveMicro() {
  return state.microcycles.find(m => m.id === state.activeMicroId) || state.microcycles[0];
}

// Get last logged weight & reps for an exercise key
function getLastLogForExercise(exerciseKey) {
  const matches = state.weightLogs.filter(l => l.exerciseKey === exerciseKey && (l.weightKg > 0 || l.reps > 0));
  if (!matches.length) return null;
  matches.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.timestamp || 0) - (a.timestamp || 0));
  return matches[0];
}

// Ensure draft exists for current workout
function getOrCreateDraft(micro, workout) {
  const draftKey = `${micro.id}_${workout.id}`;
  if (!state.drafts[draftKey]) {
    const setsMap = {};
    const cardioMap = {};
    if (workout.type === "strength" && workout.circuits) {
      workout.circuits.forEach(cir => {
        cir.exercises.forEach(ex => {
          const last = getLastLogForExercise(ex.key);
          setsMap[ex.id] = [];
          for (let s = 1; s <= cir.sets; s++) {
            setsMap[ex.id].push({
              setNumber: s,
              weightKg: last ? last.weightKg : 0,
              reps: last ? last.reps : (ex.defaultReps || 12),
              done: false
            });
          }
        });
      });
    } else if (workout.type === "cardio" && workout.stages) {
      workout.stages.forEach(st => {
        cardioMap[st.id] = { done: false };
      });
    }
    state.drafts[draftKey] = {
      startedAt: Date.now(),
      date: getTodayISO(),
      durationMin: workout.type === "cardio" ? 50 : 45,
      notes: "",
      setsMap,
      cardioMap
    };
  }
  return state.drafts[draftKey];
}

// Determine suggested next workout letter in active microcycle
function getSuggestedWorkoutId(micro) {
  const workoutKeys = Object.keys(micro.workouts);
  const microSessions = state.sessions
    .filter(s => s.microId === micro.id)
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.timestamp || 0) - (a.timestamp || 0));

  if (!microSessions.length) return workoutKeys[0] || "A";
  const lastW = microSessions[0].workoutId;
  const idx = workoutKeys.indexOf(lastW);
  if (idx === -1) return workoutKeys[0];
  return workoutKeys[(idx + 1) % workoutKeys.length];
}

// Rest Timer Functions
function startRestTimer(seconds, label) {
  clearInterval(state.timer.intervalId);
  state.timer.remainingSec = seconds;
  state.timer.label = label || "Descanso";
  state.timer.running = true;
  renderTimerBar();

  state.timer.intervalId = setInterval(() => {
    state.timer.remainingSec -= 1;
    if (state.timer.remainingSec <= 0) {
      clearInterval(state.timer.intervalId);
      state.timer.remainingSec = 0;
      state.timer.running = false;
      playTimerBeep();
      showToast(`⏱️ Tempo finalizado: ${state.timer.label}`);
    }
    renderTimerBar();
  }, 1000);
}

function stopRestTimer() {
  clearInterval(state.timer.intervalId);
  state.timer.running = false;
  state.timer.remainingSec = 0;
  renderTimerBar();
}

function addTimerSeconds(sec) {
  state.timer.remainingSec = Math.max(0, state.timer.remainingSec + sec);
  if (!state.timer.running && state.timer.remainingSec > 0) {
    startRestTimer(state.timer.remainingSec, state.timer.label || "Descanso");
  } else {
    renderTimerBar();
  }
}

function formatTimerMMSS(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderTimerBar() {
  const bar = document.getElementById("timer-bar");
  const countEl = document.getElementById("timer-countdown");
  const labelEl = document.getElementById("timer-label");
  if (!bar) return;

  if (state.timer.running || state.timer.remainingSec > 0) {
    bar.classList.add("active");
    countEl.textContent = formatTimerMMSS(state.timer.remainingSec);
    labelEl.textContent = state.timer.label;
  } else {
    bar.classList.remove("active");
  }
}

// Render Header & Sync Status
function updateSyncBadge() {
  const badge = document.getElementById("sync-badge");
  const text = document.getElementById("sync-status-text");
  if (!badge || !text) return;

  badge.classList.remove("synced", "pending", "error");
  const unsyncedCount = state.sessions.filter(s => !s.synced).length;

  if (!state.settings.webhookUrl) {
    text.textContent = "Local (Sem Planilha)";
  } else if (unsyncedCount > 0) {
    badge.classList.add("pending");
    text.textContent = `Pendente (${unsyncedCount})`;
  } else {
    badge.classList.add("synced");
    text.textContent = "Planilha OK";
  }
}

function renderMicroSelect() {
  const sel = document.getElementById("micro-select");
  if (!sel) return;
  sel.innerHTML = state.microcycles
    .map(m => `<option value="${m.id}" ${m.id === state.activeMicroId ? "selected" : ""}>${m.name}</option>`)
    .join("");
}

// Render Workout Tab
function renderWorkoutView() {
  const container = document.getElementById("view-workout");
  if (!container) return;

  const micro = getActiveMicro();
  const workoutKeys = Object.keys(micro.workouts);
  if (!workoutKeys.includes(state.activeWorkoutId)) {
    state.activeWorkoutId = workoutKeys[0] || "A";
  }
  const workout = micro.workouts[state.activeWorkoutId];
  const draft = getOrCreateDraft(micro, workout);
  const suggestedId = getSuggestedWorkoutId(micro);

  // Count sessions per workout in this microcycle
  const counts = {};
  workoutKeys.forEach(k => {
    counts[k] = state.sessions.filter(s => s.microId === micro.id && s.workoutId === k).length;
  });
  const totalMicroSessions = state.sessions.filter(s => s.microId === micro.id).length;

  let html = `
    <div class="micro-summary-card">
      <div class="micro-summary-top">
        <div>
          <strong>${micro.name}</strong> • Início ${formatDateBR(micro.startDate)}
          <div class="micro-meta">Meta: ${micro.daysDescription} • Total feito: <strong>${totalMicroSessions} sessões</strong></div>
        </div>
        <button class="info-toggle-btn" onclick="toggleTrainerNotes()">Observações</button>
      </div>
      <div id="trainer-notes-box" class="trainer-notes-box">
        <p><strong>Cadência:</strong> ${micro.cadence}</p>
        <p><strong>Restrições / Obs:</strong> ${micro.notes}</p>
        <p><strong>Treinador:</strong> ${window.DEFAULT_DATA.student.trainer} (CREF ${window.DEFAULT_DATA.student.trainerCref})</p>
      </div>
    </div>

    <div class="workout-selector">
      ${workoutKeys.map(k => {
        const isNext = k === suggestedId;
        return `
          <div class="workout-pill ${k === state.activeWorkoutId ? "active" : ""}" data-workout="${k}" onclick="selectWorkout('${k}')">
            ${isNext ? `<span class="workout-pill-next">Próximo</span>` : ""}
            <span class="workout-pill-letter">Treino ${k}</span>
            <span class="workout-pill-count">${counts[k]} ${counts[k] === 1 ? "sessão" : "sessões"}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;

  if (workout.warmup) {
    html += `
      <div class="phase-banner">
        <span class="phase-tag">0 • Aquec</span>
        <div>${workout.warmup}</div>
      </div>
    `;
  }

  if (workout.type === "strength" && workout.circuits) {
    workout.circuits.forEach(cir => {
      const allDone = cir.exercises.every(ex => (draft.setsMap[ex.id] || []).every(s => s.done));
      html += `
        <div class="circuit-card ${allDone ? "completed" : ""}">
          <div class="circuit-header">
            <div class="circuit-badge">
              <span>${cir.id}</span>
              ${allDone ? `<span style="color: var(--pastel-sage); font-size: 12px;">✓ Completo</span>` : ""}
            </div>
            <div class="circuit-specs">
              <span class="spec-pill">${cir.sets}x ${cir.repsTarget}</span>
              <span class="spec-pill" onclick="startRestTimer(${cir.restBetweenSec}, '${cir.id} • Transição')" style="cursor:pointer;">⏱ ${cir.restBetweenSec}s / ${cir.restAfterSec}s</span>
            </div>
          </div>
          ${cir.exercises.map((ex, exIdx) => {
            const lastLog = getLastLogForExercise(ex.key);
            const sets = draft.setsMap[ex.id] || [];
            const unitLabel = ex.unitLabel || "reps";
            return `
              <div class="exercise-block">
                <div class="exercise-header">
                  <div class="exercise-title-wrap">
                    <span class="group-tag" data-group="${ex.group}">${ex.group}</span>
                    <div class="exercise-name">${ex.name}</div>
                  </div>
                  ${ex.tracksWeight ? `
                    <div class="last-weight-pill" onclick="applyLastWeightToAll('${ex.id}', '${ex.key}')" title="Aplicar última carga">
                      ${lastLog ? `Último: <strong>${lastLog.weightKg}kg</strong> × ${lastLog.reps}` : `Sem carga ant.`}
                    </div>
                  ` : `
                    <div class="last-weight-pill">Peso corp. / Isom.</div>
                  `}
                </div>
                <div class="sets-list">
                  ${sets.map((s, sIdx) => `
                    <div class="set-row ${ex.tracksWeight ? "" : "no-weight"} ${s.done ? "done" : ""}">
                      <div class="set-num">${s.setNumber}ª</div>
                      ${ex.tracksWeight ? `
                        <div class="stepper-field">
                          <button class="stepper-btn" type="button" onclick="adjustSetValue('${ex.id}', ${sIdx}, 'weightKg', -1)">−</button>
                          <div class="stepper-input-wrap">
                            <input class="stepper-input" type="number" inputmode="decimal" step="0.5" value="${s.weightKg}"
                              onfocus="selectInputText(this)" onclick="selectInputText(this)"
                              onchange="updateSetInput('${ex.id}', ${sIdx}, 'weightKg', this.value)" />
                            <span class="stepper-unit">kg</span>
                          </div>
                          <button class="stepper-btn" type="button" onclick="adjustSetValue('${ex.id}', ${sIdx}, 'weightKg', 1)">+</button>
                        </div>
                      ` : ""}
                      <div class="stepper-field">
                        <button class="stepper-btn" type="button" onclick="adjustSetValue('${ex.id}', ${sIdx}, 'reps', -1)">−</button>
                        <div class="stepper-input-wrap">
                          <input class="stepper-input" type="number" inputmode="numeric" step="1" value="${s.reps}"
                            onfocus="selectInputText(this)" onclick="selectInputText(this)"
                            onchange="updateSetInput('${ex.id}', ${sIdx}, 'reps', this.value)" />
                          <span class="stepper-unit">${unitLabel}</span>
                        </div>
                        <button class="stepper-btn" type="button" onclick="adjustSetValue('${ex.id}', ${sIdx}, 'reps', 1)">+</button>
                      </div>
                      <button class="set-check-btn" type="button"
                        onclick="toggleSetDone('${cir.id}', '${ex.id}', ${exIdx}, ${cir.exercises.length}, ${sIdx}, ${cir.restBetweenSec}, ${cir.restAfterSec})">
                        ✓
                      </button>
                    </div>
                  `).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    });
  } else if (workout.type === "cardio" && workout.stages) {
    workout.stages.forEach(st => {
      const stState = draft.cardioMap[st.id] || { done: false };
      html += `
        <div class="cardio-stage-card ${stState.done ? "done" : ""}">
          <div class="cardio-stage-header">
            <span class="cardio-stage-title">Etapa ${st.step} • ${st.title}</span>
            <button class="set-check-btn" style="${stState.done ? "background:var(--pastel-sage);color:#131518;border-color:var(--pastel-sage);" : ""}"
              onclick="toggleCardioStage('${st.id}')">✓</button>
          </div>
          <div class="cardio-stage-desc">${st.description}</div>
          <div class="cardio-stage-actions">
            ${st.mode === "interval" ? `
              <button class="btn btn-sky" onclick="startRestTimer(${st.workSec}, '${st.title} • Forte (${st.workSec}s)')">▶ Forte (${st.workSec}s)</button>
              <button class="btn" onclick="startRestTimer(${st.restSec}, '${st.title} • Leve (${st.restSec}s)')">▶ Recuperação (${st.restSec}s)</button>
            ` : `
              <button class="btn btn-sky" onclick="startRestTimer(${st.durationSec}, '${st.title}')">▶ Iniciar Timer (${Math.round(st.durationSec / 60)} min)</button>
            `}
          </div>
        </div>
      `;
    });
  }

  if (workout.cooldown) {
    html += `
      <div class="phase-banner">
        <span class="phase-tag">Alongamento</span>
        <div>${workout.cooldown}</div>
      </div>
    `;
  }

  html += `
    <div class="finish-workout-card">
      <h3>Finalizar e Salvar ${workout.title}</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Data da Sessão</label>
          <input type="date" class="form-input" value="${draft.date}" onchange="updateDraftMeta('date', this.value)" />
        </div>
        <div class="form-group">
          <label>Duração (min)</label>
          <input type="number" class="form-input" value="${draft.durationMin}" onchange="updateDraftMeta('durationMin', this.value)" />
        </div>
      </div>
      <div class="form-group" style="margin-bottom: 12px;">
        <label>Observações da Sessão (opcional)</label>
        <input type="text" class="form-input" placeholder="Ex: Aumentei carga no Leg Press, ótimo treino"
          value="${draft.notes || ""}" onchange="updateDraftMeta('notes', this.value)" />
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-primary btn-block" onclick="finishWorkoutSession()">
          ✓ Concluir e Salvar ${workout.title}
        </button>
        <button class="btn" onclick="resetCurrentDraft()" title="Limpar marcações atuais">
          Limpar
        </button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

window.toggleTrainerNotes = function() {
  const el = document.getElementById("trainer-notes-box");
  if (el) el.classList.toggle("open");
};

window.selectWorkout = function(workoutId) {
  state.activeWorkoutId = workoutId;
  saveState();
  renderWorkoutView();
};

window.selectInputText = function(el) {
  if (!el) return;
  try {
    el.select();
  } catch (e) {}
  setTimeout(() => {
    try {
      el.select();
    } catch (e) {}
  }, 20);
};

window.adjustSetValue = function(exId, sIdx, field, delta) {
  const micro = getActiveMicro();
  const workout = micro.workouts[state.activeWorkoutId];
  const draft = getOrCreateDraft(micro, workout);
  const setObj = draft.setsMap[exId]?.[sIdx];
  if (!setObj) return;

  const current = parseFloat(setObj[field]) || 0;
  setObj[field] = Math.max(0, Number((current + delta).toFixed(1)));

  // Propagate weightKg or reps change to subsequent uncompleted sets of the same exercise
  if (field === "weightKg" || field === "reps") {
    for (let i = sIdx + 1; i < draft.setsMap[exId].length; i++) {
      if (!draft.setsMap[exId][i].done) {
        draft.setsMap[exId][i][field] = setObj[field];
      }
    }
  }

  saveState();
  renderWorkoutView();
};

window.updateSetInput = function(exId, sIdx, field, val) {
  const micro = getActiveMicro();
  const workout = micro.workouts[state.activeWorkoutId];
  const draft = getOrCreateDraft(micro, workout);
  const setObj = draft.setsMap[exId]?.[sIdx];
  if (!setObj) return;

  setObj[field] = Math.max(0, parseFloat(val) || 0);
  if (field === "weightKg" || field === "reps") {
    for (let i = sIdx + 1; i < draft.setsMap[exId].length; i++) {
      if (!draft.setsMap[exId][i].done) {
        draft.setsMap[exId][i][field] = setObj[field];
      }
    }
  }
  saveState();
  renderWorkoutView();
};

window.applyLastWeightToAll = function(exId, exKey) {
  const last = getLastLogForExercise(exKey);
  if (!last) return;
  const micro = getActiveMicro();
  const workout = micro.workouts[state.activeWorkoutId];
  const draft = getOrCreateDraft(micro, workout);
  (draft.setsMap[exId] || []).forEach(s => {
    s.weightKg = last.weightKg;
    s.reps = last.reps;
  });
  saveState();
  renderWorkoutView();
  showToast(`Carga ${last.weightKg}kg aplicada`);
};

window.toggleSetDone = function(cirId, exId, exIdx, totalExInCir, sIdx, restBetweenSec, restAfterSec) {
  const micro = getActiveMicro();
  const workout = micro.workouts[state.activeWorkoutId];
  const draft = getOrCreateDraft(micro, workout);
  const setObj = draft.setsMap[exId]?.[sIdx];
  if (!setObj) return;

  setObj.done = !setObj.done;
  saveState();
  renderWorkoutView();

  if (setObj.done && state.settings.autoTimer) {
    if (exIdx < totalExInCir - 1) {
      startRestTimer(restBetweenSec, `${cirId} • Transição (${restBetweenSec}s)`);
    } else {
      startRestTimer(restAfterSec, `${cirId} • Descanso (${restAfterSec}s)`);
    }
  }
};

window.toggleCardioStage = function(stageId) {
  const micro = getActiveMicro();
  const workout = micro.workouts[state.activeWorkoutId];
  const draft = getOrCreateDraft(micro, workout);
  if (!draft.cardioMap[stageId]) draft.cardioMap[stageId] = { done: false };
  draft.cardioMap[stageId].done = !draft.cardioMap[stageId].done;
  saveState();
  renderWorkoutView();
};

window.updateDraftMeta = function(field, value) {
  const micro = getActiveMicro();
  const workout = micro.workouts[state.activeWorkoutId];
  const draft = getOrCreateDraft(micro, workout);
  draft[field] = value;
  saveState();
};

window.resetCurrentDraft = function() {
  const micro = getActiveMicro();
  const workout = micro.workouts[state.activeWorkoutId];
  const draftKey = `${micro.id}_${workout.id}`;
  delete state.drafts[draftKey];
  saveState();
  renderWorkoutView();
  showToast("Marcações do treino atual reiniciadas");
};

// Complete & Log Workout Session
window.finishWorkoutSession = async function() {
  const micro = getActiveMicro();
  const workout = micro.workouts[state.activeWorkoutId];
  const draft = getOrCreateDraft(micro, workout);

  const sessionId = "sess_" + Date.now();
  const sessionDate = draft.date || getTodayISO();
  const newLogs = [];

  if (workout.type === "strength" && workout.circuits) {
    workout.circuits.forEach(cir => {
      cir.exercises.forEach(ex => {
        const sets = draft.setsMap[ex.id] || [];
        // Log sets that are marked done, OR if none marked done, log all sets that have weight/reps
        const anyDone = sets.some(s => s.done);
        sets.forEach(s => {
          if (s.done || (!anyDone && (s.weightKg > 0 || s.reps > 0))) {
            newLogs.push({
              id: `${sessionId}_${ex.id}_${s.setNumber}`,
              sessionId,
              date: sessionDate,
              timestamp: Date.now(),
              microId: micro.id,
              microName: micro.name,
              workoutId: workout.id,
              circuitId: cir.id,
              exerciseKey: ex.key,
              exerciseName: ex.name,
              group: ex.group,
              setNumber: s.setNumber,
              weightKg: Number(s.weightKg) || 0,
              reps: Number(s.reps) || 0
            });
          }
        });
      });
    });
  }

  const sessionObj = {
    id: sessionId,
    date: sessionDate,
    timestamp: Date.now(),
    microId: micro.id,
    microName: micro.name,
    workoutId: workout.id,
    workoutTitle: workout.title,
    durationMin: Number(draft.durationMin) || 45,
    notes: draft.notes || "",
    setsLogged: newLogs.length,
    synced: false
  };

  state.sessions.unshift(sessionObj);
  state.weightLogs.push(...newLogs);

  // Reset current draft for next time
  delete state.drafts[`${micro.id}_${workout.id}`];

  // Advance active workout to next suggested
  state.activeWorkoutId = getSuggestedWorkoutId(micro);
  saveState();
  stopRestTimer();
  renderAll();
  showToast(`✓ ${workout.title} salvo com sucesso!`);

  // If Google Sheets webhook is configured, sync in background
  if (state.settings.webhookUrl) {
    await syncWithGoogleSheet(true);
  }
};

// Render Calendar & Sessions History View
function renderCalendarView() {
  const container = document.getElementById("view-calendar");
  if (!container) return;

  const micro = getActiveMicro();
  const microSessions = state.sessions.filter(s => s.microId === micro.id);
  const workoutKeys = Object.keys(micro.workouts);

  // Weekly count (last 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const weekISO = weekAgo.toISOString().slice(0, 10);
  const sessionsThisWeek = state.sessions.filter(s => s.date >= weekISO).length;

  // Calendar grid computation
  const year = state.calendarYear;
  const month = state.calendarMonth;
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first index (0 = Seg, 6 = Dom) like Marco's PDF calendar
  const startOffset = (firstDay.getDay() + 6) % 7;

  const monthName = firstDay.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const todayISO = getTodayISO();

  // Map date -> list of workoutIds
  const dateMap = {};
  state.sessions.forEach(s => {
    if (!dateMap[s.date]) dateMap[s.date] = [];
    dateMap[s.date].push(s.workoutId);
  });

  let calCells = "";
  for (let i = 0; i < startOffset; i++) {
    calCells += `<div class="cal-day empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const trainedList = dateMap[iso] || [];
    const isToday = iso === todayISO;
    calCells += `
      <div class="cal-day ${trainedList.length ? "trained" : ""} ${isToday ? "today" : ""}">
        <span>${d}</span>
        <div class="cal-workout-dots">
          ${trainedList.map(w => `<span class="cal-w-badge" data-w="${w}">${w}</span>`).join("")}
        </div>
      </div>
    `;
  }

  let html = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${microSessions.length}</div>
        <div class="stat-label">Sessões (${micro.name})</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--pastel-sky);">${sessionsThisWeek}/${micro.weeklyGoal || 4}</div>
        <div class="stat-label">Últimos 7 dias</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--pastel-lavender);">${state.sessions.length}</div>
        <div class="stat-label">Total Geral</div>
      </div>
    </div>

    <div class="micro-summary-card" style="display:flex; justify-content:space-around; text-align:center;">
      ${workoutKeys.map(k => {
        const cnt = microSessions.filter(s => s.workoutId === k).length;
        return `
          <div>
            <div style="font-size:12px; color:var(--text-secondary);">Treino ${k}</div>
            <div style="font-size:17px; font-weight:700; color:var(--text-primary);">${cnt}x</div>
          </div>
        `;
      }).join("")}
    </div>

    <div class="calendar-card">
      <div class="calendar-header">
        <button class="btn" style="padding:5px 10px;" onclick="changeCalendarMonth(-1)">◀</button>
        <div class="calendar-month-title">${monthName}</div>
        <button class="btn" style="padding:5px 10px;" onclick="changeCalendarMonth(1)">▶</button>
      </div>
      <div class="calendar-grid">
        <div class="cal-weekday">Seg</div>
        <div class="cal-weekday">Ter</div>
        <div class="cal-weekday">Qua</div>
        <div class="cal-weekday">Qui</div>
        <div class="cal-weekday">Sex</div>
        <div class="cal-weekday">Sáb</div>
        <div class="cal-weekday">Dom</div>
        ${calCells}
      </div>
    </div>

    <div class="section-title">
      <span>Histórico de Sessões (${state.sessions.length})</span>
    </div>

    ${state.sessions.length === 0 ? `
      <div class="micro-summary-card" style="text-align:center; color:var(--text-secondary); padding:24px;">
        Nenhuma sessão registrada ainda. Conclua seu primeiro treino na aba <strong>Treinar</strong>!
      </div>
    ` : state.sessions.slice(0, 40).map(s => `
      <div class="session-item">
        <div class="session-left">
          <div class="session-w-badge" data-w="${s.workoutId}">${s.workoutId}</div>
          <div>
            <div style="font-weight:600; font-size:14px;">
              ${s.workoutTitle || ("Treino " + s.workoutId)} • <span style="color:var(--text-secondary); font-weight:400;">${s.microName || s.microId}</span>
            </div>
            <div style="font-size:12px; color:var(--text-secondary);">
              📅 ${formatDateBR(s.date)} • ⏱ ${s.durationMin || 45} min • ${s.setsLogged || 0} séries
              ${s.notes ? `<br/>💬 <em>${s.notes}</em>` : ""}
            </div>
          </div>
        </div>
        <button class="btn btn-danger" style="padding:6px 10px; font-size:12px;" onclick="deleteSession('${s.id}')">Excluir</button>
      </div>
    `).join("")}
  `;

  container.innerHTML = html;
}

window.changeCalendarMonth = function(delta) {
  let m = state.calendarMonth + delta;
  let y = state.calendarYear;
  if (m < 0) { m = 11; y -= 1; }
  if (m > 11) { m = 0; y += 1; }
  state.calendarMonth = m;
  state.calendarYear = y;
  renderCalendarView();
};

window.deleteSession = function(sessionId) {
  if (!confirm("Deseja remover esta sessão do histórico?")) return;
  state.sessions = state.sessions.filter(s => s.id !== sessionId);
  state.weightLogs = state.weightLogs.filter(l => l.sessionId !== sessionId);
  saveState();
  renderAll();
  showToast("Sessão removida");
};

// Render Progression / Weights History View
function renderProgressionView() {
  const container = document.getElementById("view-progress");
  if (!container) return;

  // Collect all unique exercises across microcycles
  const exerciseCatalog = new Map();
  state.microcycles.forEach(m => {
    Object.values(m.workouts).forEach(w => {
      if (w.circuits) {
        w.circuits.forEach(c => {
          c.exercises.forEach(ex => {
            if (!exerciseCatalog.has(ex.key)) {
              exerciseCatalog.set(ex.key, {
                key: ex.key,
                name: ex.name,
                group: ex.group,
                tracksWeight: ex.tracksWeight
              });
            }
          });
        });
      }
    });
  });

  const groups = ["ALL", "Pernas", "Costas", "Peito", "Ombros", "Braços", "Abdom", "Coord"];
  const exercises = Array.from(exerciseCatalog.values()).filter(ex => {
    if (state.groupFilter !== "ALL" && ex.group !== state.groupFilter) return false;
    if (state.searchQuery && !ex.name.toLowerCase().includes(state.searchQuery.toLowerCase())) return false;
    return true;
  });

  let html = `
    <div class="micro-summary-card">
      <div class="form-group" style="margin-bottom:10px;">
        <input type="text" class="form-input" placeholder="🔍 Buscar exercício (ex: Leg Press, Supino, Stiff...)"
          value="${state.searchQuery}" oninput="updateProgressSearch(this.value)" />
      </div>
      <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;">
        ${groups.map(g => `
          <button class="timer-chip" style="${state.groupFilter === g ? "background:var(--pastel-sage-bg);border-color:var(--pastel-sage-border);color:var(--pastel-sage);" : ""}"
            onclick="setGroupFilter('${g}')">
            ${g === "ALL" ? "Todos" : g}
          </button>
        `).join("")}
      </div>
    </div>
  `;

  exercises.forEach(ex => {
    const logs = state.weightLogs
      .filter(l => l.exerciseKey === ex.key)
      .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.setNumber - b.setNumber));

    // Group by date (best set of each date)
    const byDateMap = new Map();
    let maxWeight = 0;
    logs.forEach(l => {
      if (l.weightKg > maxWeight) maxWeight = l.weightKg;
      const prev = byDateMap.get(l.date);
      if (!prev || l.weightKg > prev.weightKg || (l.weightKg === prev.weightKg && l.reps > prev.reps)) {
        byDateMap.set(l.date, l);
      }
    });
    const timeline = Array.from(byDateMap.values()).reverse();

    html += `
      <div class="exercise-history-card">
        <div class="eh-top">
          <div>
            <span class="group-tag" data-group="${ex.group}">${ex.group}</span>
            <div class="exercise-name">${ex.name}</div>
          </div>
          ${maxWeight > 0 ? `<span class="eh-pr-badge">Recorde: ${maxWeight} kg</span>` : `<span class="last-weight-pill">Sem registros</span>`}
        </div>
        ${timeline.length > 0 ? `
          <div class="eh-timeline">
            ${timeline.map(item => `
              <div class="eh-chip">
                <span class="eh-chip-date">${formatDateBR(item.date)}</span>
                <span class="eh-chip-val">${item.weightKg > 0 ? `${item.weightKg}kg × ` : ""}${item.reps} reps</span>
              </div>
            `).join("")}
          </div>
        ` : `
          <div style="font-size:12px; color:var(--text-muted);">Ainda sem histórico salvo para este exercício.</div>
        `}
      </div>
    `;
  });

  container.innerHTML = html;
}

window.updateProgressSearch = function(val) {
  state.searchQuery = val;
  renderProgressionView();
};

window.setGroupFilter = function(group) {
  state.groupFilter = group;
  renderProgressionView();
};

// Render Settings & Google Sheet Sync View
function renderSettingsView() {
  const container = document.getElementById("view-settings");
  if (!container) return;

  const unsynced = state.sessions.filter(s => !s.synced).length;

  container.innerHTML = `
    <div class="finish-workout-card" style="margin-top:0; margin-bottom:14px;">
      <h3>🔗 Conexão com Google Planilhas (Drive)</h3>
      <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:12px;">
        Cole abaixo a URL do Web App gerada no menu <strong>Extensões &gt; Apps Script</strong> da sua planilha no Google Drive.
      </p>
      <div class="form-group" style="margin-bottom:10px;">
        <label>URL do Webhook (Google Apps Script Web App)</label>
        <input type="url" id="input-webhook-url" class="form-input"
          placeholder="https://script.google.com/macros/s/.../exec"
          value="${state.settings.webhookUrl || ""}" />
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Chave Secreta (opcional, se configurada no script)</label>
        <input type="password" id="input-secret-key" class="form-input"
          placeholder="Deixe em branco ou digite sua senha"
          value="${state.settings.secretKey || ""}" />
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="saveWebhookSettings()">Salvar Conexão</button>
        <button class="btn btn-sky" onclick="syncWithGoogleSheet(false)">🔄 Sincronizar Agora (${unsynced} pendentes)</button>
        <button class="btn btn-secondary" onclick="pushPlansToSheet()">📤 Enviar Fichas (Micro 01 e 02) p/ Planilha</button>
      </div>
    </div>

    <div class="finish-workout-card" style="margin-bottom:14px;">
      <h3>⚙️ Preferências do App na Academia</h3>
      <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
        <label style="display:flex; align-items:center; gap:10px; font-size:13.5px; cursor:pointer;">
          <input type="checkbox" ${state.settings.autoTimer ? "checked" : ""} onchange="toggleSetting('autoTimer', this.checked)" />
          Iniciar timer de descanso (10s / 60s) automaticamente ao marcar série
        </label>
        <label style="display:flex; align-items:center; gap:10px; font-size:13.5px; cursor:pointer;">
          <input type="checkbox" ${state.settings.soundEnabled ? "checked" : ""} onchange="toggleSetting('soundEnabled', this.checked)" />
          Aviso sonoro suave e vibração ao terminar descanso
        </label>
      </div>
    </div>

    <div class="finish-workout-card">
      <h3>📦 Backup Local (JSON)</h3>
      <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:12px;">
        Exporte seus dados ou importe um arquivo JSON (ou uma nova ficha Micro 03).
      </p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn" onclick="exportBackupJSON()">⬇️ Baixar Backup (.json)</button>
        <label class="btn" style="cursor:pointer;">
          ⬆️ Importar Backup / Ficha (.json)
          <input type="file" accept=".json" style="display:none;" onchange="importBackupJSON(event)" />
        </label>
      </div>
    </div>
  `;
}

window.saveWebhookSettings = function() {
  const url = document.getElementById("input-webhook-url")?.value.trim() || "";
  const key = document.getElementById("input-secret-key")?.value.trim() || "";
  state.settings.webhookUrl = url;
  state.settings.secretKey = key;
  saveState();
  showToast("Configurações da Planilha salvas!");
};

window.toggleSetting = function(key, val) {
  state.settings[key] = val;
  saveState();
};

// Google Sheets Webhook Sync
window.syncWithGoogleSheet = async function(silent = false) {
  if (!state.settings.webhookUrl) {
    if (!silent) showToast("Configure a URL do Google Apps Script primeiro.");
    return;
  }

  if (!silent) showToast("Sincronizando com Google Drive...");

  try {
    const unsyncedSessions = state.sessions.filter(s => !s.synced);
    const unsyncedSessionIds = new Set(unsyncedSessions.map(s => s.id));
    const unsyncedLogs = state.weightLogs.filter(l => unsyncedSessionIds.has(l.sessionId));

    // 1. Push any unsynced sessions & logs via POST (text/plain avoids CORS preflight on Apps Script)
    if (unsyncedSessions.length > 0) {
      const postRes = await fetch(state.settings.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "sync_logs",
          secretKey: state.settings.secretKey,
          sessions: unsyncedSessions,
          weightLogs: unsyncedLogs
        })
      });
      const postData = await postRes.json();
      if (postData.status === "ok") {
        state.sessions.forEach(s => {
          if (unsyncedSessionIds.has(s.id)) s.synced = true;
        });
        saveState();
      } else {
        throw new Error(postData.message || "Erro ao salvar na planilha");
      }
    }

    // 2. Pull remote sessions & logs from Sheet so multiple devices stay in sync
    const url = new URL(state.settings.webhookUrl);
    if (state.settings.secretKey) url.searchParams.set("secretKey", state.settings.secretKey);
    const getRes = await fetch(url.toString(), { method: "GET" });
    const getData = await getRes.json();

    if (getData.status === "ok") {
      // Merge remote sessions not in local state
      const localSessionIds = new Set(state.sessions.map(s => s.id));
      (getData.sessions || []).forEach(rs => {
        if (rs.id && !localSessionIds.has(rs.id)) {
          state.sessions.push({ ...rs, synced: true });
        }
      });
      state.sessions.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.timestamp || 0) - (a.timestamp || 0));

      const localLogIds = new Set(state.weightLogs.map(l => l.id));
      (getData.weightLogs || []).forEach(rl => {
        if (rl.id && !localLogIds.has(rl.id)) {
          state.weightLogs.push(rl);
        }
      });

      saveState();
      renderAll();
      if (!silent) showToast("✓ Sincronizado com a Planilha Google!");
    }
  } catch (err) {
    console.error("Sync error:", err);
    if (!silent) showToast("Aviso: Dados salvos no celular (sincronizará quando online).");
  }
};

window.pushPlansToSheet = async function() {
  if (!state.settings.webhookUrl) {
    showToast("Configure a URL do Google Apps Script primeiro.");
    return;
  }
  showToast("Enviando fichas Micro 01 e Micro 02 para a planilha...");
  try {
    const res = await fetch(state.settings.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "sync_plans",
        secretKey: state.settings.secretKey,
        microcycles: state.microcycles
      })
    });
    const data = await res.json();
    if (data.status === "ok") {
      showToast("✓ Aba 'Planos' populada na Planilha Google!");
    } else {
      showToast("Erro: " + (data.message || "Falha ao enviar planos"));
    }
  } catch (e) {
    console.error(e);
    showToast("Erro de conexão ao enviar fichas.");
  }
};

window.exportBackupJSON = function() {
  const blob = new Blob([JSON.stringify({
    exportedAt: new Date().toISOString(),
    microcycles: state.microcycles,
    sessions: state.sessions,
    weightLogs: state.weightLogs
  }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `jim-treinos-backup-${getTodayISO()}.json`;
  a.click();
};

window.importBackupJSON = function(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.microcycles)) state.microcycles = data.microcycles;
      if (Array.isArray(data.sessions)) state.sessions = data.sessions;
      if (Array.isArray(data.weightLogs)) state.weightLogs = data.weightLogs;
      saveState();
      renderAll();
      showToast("✓ Backup importado com sucesso!");
    } catch (err) {
      showToast("Arquivo JSON inválido.");
    }
  };
  reader.readAsText(file);
};

// Navigation & Main Render
window.switchTab = function(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll(".view-container").forEach(el => el.classList.remove("active"));
  document.getElementById(`view-${tabName}`)?.classList.add("active");

  document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  renderAll();
};

window.changeMicrocycle = function(microId) {
  state.activeMicroId = microId;
  const micro = getActiveMicro();
  state.activeWorkoutId = getSuggestedWorkoutId(micro);
  saveState();
  renderAll();
};

function renderAll() {
  renderMicroSelect();
  updateSyncBadge();
  if (state.activeTab === "workout") renderWorkoutView();
  if (state.activeTab === "calendar") renderCalendarView();
  if (state.activeTab === "progress") renderProgressionView();
  if (state.activeTab === "settings") renderSettingsView();
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  const micro = getActiveMicro();
  state.activeWorkoutId = getSuggestedWorkoutId(micro);
  renderAll();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
});
