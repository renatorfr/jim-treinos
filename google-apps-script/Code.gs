/**
 * @OnlyCurrentDoc
 *
 * JIM TREINOS - Google Apps Script Webhook Backend (Permissão Restrita a Este Arquivo)
 *
 * A diretiva @OnlyCurrentDoc acima garante que o Google peça permissão APENAS
 * para esta planilha específica (escopo `spreadsheets.currentonly`), e NÃO para
 * todos os seus arquivos do Google Drive (compatível com contas com Proteção Avançada).
 */

// Se desejar exigir uma senha simples entre o App e a Planilha, preencha abaixo (ou deixe "" para não exigir):
const SECRET_KEY = "";

function setupPlanilha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet(ss, "Sessoes", [
    "ID_Sessao",
    "Data",
    "Microciclo",
    "Treino",
    "Titulo_Treino",
    "Duracao_Min",
    "Series_Registradas",
    "Observacoes",
    "Timestamp"
  ]);
  ensureSheet(ss, "Historico_Cargas", [
    "ID_Registro",
    "ID_Sessao",
    "Data",
    "Microciclo",
    "Treino",
    "Circuito",
    "Grupo_Muscular",
    "Exercicio",
    "Serie",
    "Carga",
    "Repeticoes",
    "Timestamp",
    "Unidade"
  ]);
  ensureSheet(ss, "Planos", [
    "Microciclo",
    "Inicio",
    "Frequencia",
    "Treino",
    "Circuito_Etapa",
    "Grupo_Muscular",
    "Exercicio",
    "Series",
    "Repeticoes_Alvo",
    "Pausa"
  ]);
}

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#23272e");
    headerRange.setFontColor("#a3c9a8");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  try {
    const reqKey = (e && e.parameter && e.parameter.secretKey) ? e.parameter.secretKey : "";
    if (SECRET_KEY && reqKey !== SECRET_KEY) {
      return jsonResponse({ status: "error", message: "Chave secreta inválida." });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tz = ss.getSpreadsheetTimeZone() || "America/Sao_Paulo";
    setupPlanilha();

    const sessSheet = ss.getSheetByName("Sessoes");
    const logSheet = ss.getSheetByName("Historico_Cargas");

    const sessions = [];
    const sessRows = sessSheet.getDataRange().getValues();
    for (let i = 1; i < sessRows.length; i++) {
      const r = sessRows[i];
      if (!r[0]) continue;
      sessions.push({
        id: String(r[0]),
        date: formatIsoDate(r[1], tz),
        microName: String(r[2] || ""),
        microId: String(r[2] || "").toLowerCase().replace(/\s+/g, "-"),
        workoutId: String(r[3] || "A"),
        workoutTitle: String(r[4] || ("Treino " + r[3])),
        durationMin: Number(r[5]) || 45,
        setsLogged: Number(r[6]) || 0,
        notes: String(r[7] || ""),
        timestamp: Number(r[8]) || 0,
        synced: true
      });
    }

    const weightLogs = [];
    const logRows = logSheet.getDataRange().getValues();
    for (let i = 1; i < logRows.length; i++) {
      const r = logRows[i];
      if (!r[0]) continue;
      weightLogs.push({
        id: String(r[0]),
        sessionId: String(r[1]),
        date: formatIsoDate(r[2], tz),
        microName: String(r[3] || ""),
        workoutId: String(r[4] || ""),
        circuitId: String(r[5] || ""),
        group: String(r[6] || ""),
        exerciseKey: String(r[7] || ""),
        exerciseName: String(r[7] || ""),
        setNumber: Number(r[8]) || 1,
        weightKg: Number(r[9]) || 0,
        reps: Number(r[10]) || 0,
        timestamp: Number(r[11]) || 0,
        unit: String(r[12] || "")
      });
    }

    return jsonResponse({
      status: "ok",
      sessions: sessions,
      weightLogs: weightLogs
    });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (SECRET_KEY && body.secretKey !== SECRET_KEY) {
      return jsonResponse({ status: "error", message: "Chave secreta inválida." });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupPlanilha();

    if (body.action === "sync_logs") {
      const sessSheet = ss.getSheetByName("Sessoes");
      const logSheet = ss.getSheetByName("Historico_Cargas");

      const existingSessIds = getExistingIds(sessSheet);
      const existingLogIds = getExistingIds(logSheet);

      const newSessions = body.sessions || [];
      newSessions.forEach(s => {
        if (!existingSessIds.has(String(s.id))) {
          sessSheet.appendRow([
            s.id,
            s.date,
            s.microName || s.microId,
            s.workoutId,
            s.workoutTitle || ("Treino " + s.workoutId),
            s.durationMin || 45,
            s.setsLogged || 0,
            s.notes || "",
            s.timestamp || Date.now()
          ]);
          existingSessIds.add(String(s.id));
        }
      });

      const newLogs = body.weightLogs || [];
      newLogs.forEach(l => {
        if (!existingLogIds.has(String(l.id))) {
          logSheet.appendRow([
            l.id,
            l.sessionId,
            l.date,
            l.microName || l.microId,
            l.workoutId,
            l.circuitId,
            l.group,
            l.exerciseKey || l.exerciseName,
            l.setNumber,
            l.weightKg,
            l.reps,
            l.timestamp || Date.now(),
            l.unit || "lb"
          ]);
          existingLogIds.add(String(l.id));
        }
      });

      return jsonResponse({
        status: "ok",
        addedSessions: newSessions.length,
        addedLogs: newLogs.length
      });
    }

    if (body.action === "sync_plans") {
      const planSheet = ss.getSheetByName("Planos");
      if (planSheet.getLastRow() > 1) {
        planSheet.getRange(2, 1, planSheet.getLastRow() - 1, planSheet.getLastColumn()).clearContent();
      }
      const microcycles = body.microcycles || [];
      const rows = [];

      microcycles.forEach(m => {
        Object.values(m.workouts || {}).forEach(w => {
          if (w.type === "strength" && w.circuits) {
            w.circuits.forEach(c => {
              c.exercises.forEach(ex => {
                rows.push([
                  m.name,
                  m.startDate,
                  m.daysDescription,
                  w.id,
                  c.id,
                  ex.group,
                  ex.name,
                  c.sets,
                  c.repsTarget,
                  c.restBetweenSec + "s / " + c.restAfterSec + "s"
                ]);
              });
            });
          } else if (w.type === "cardio" && w.stages) {
            w.stages.forEach(st => {
              rows.push([
                m.name,
                m.startDate,
                m.daysDescription,
                w.id,
                "Etapa " + st.step,
                "Cardio",
                st.description,
                1,
                Math.round((st.durationSec || 0) / 60) + " min",
                "-"
              ]);
            });
          }
        });
      });

      if (rows.length > 0) {
        planSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
      }
      return jsonResponse({ status: "ok", rowsWritten: rows.length });
    }

    return jsonResponse({ status: "error", message: "Ação desconhecida." });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

function getExistingIds(sheet) {
  const set = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return set;
  const vals = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (vals[i][0]) set.add(String(vals[i][0]));
  }
  return set;
}

function formatIsoDate(val, tz) {
  if (!val) return "";
  if (Object.prototype.toString.call(val) === "[object Date]") {
    return Utilities.formatDate(val, tz || "America/Sao_Paulo", "yyyy-MM-dd");
  }
  return String(val).slice(0, 10);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
