/* Soluciones Yaehel — interactive bot demo (demo-bot.html).
   Flow: problema → foto de ejemplo → nombre (opcional) → 3 preguntas
   → rango de ejemplo → día/hora → confirmación. Lead sheet fills live.
   All prices are placeholders: "$___ – $___ MXN [ejemplo]". */
const BUSINESS_NAME_BOT = "Soluciones Yaehel";

const chatEl = document.getElementById("bot-chat");
const qrEl = document.getElementById("quick-replies");
const nameRow = document.getElementById("lead-nombre");
const problemRow = document.getElementById("lead-problema");
const photoRow = document.getElementById("lead-foto");
const rangeRow = document.getElementById("lead-rango");
const apptRow = document.getElementById("lead-cita");
const statusRow = document.getElementById("lead-estado");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const D = (ms) => (reduceMotion ? 0 : ms);

const PROBLEMS = {
  fuga: { label: "Fuga de agua", photoLabel: "Fuga en lavabo", clientMsg: "Tengo una fuga en el lavabo del baño 🚰" },
  destape: { label: "Destape", photoLabel: "Drenaje tapado", clientMsg: "Se me tapó el drenaje del baño 🚿" },
  boiler: { label: "Boiler / calentador", photoLabel: "Boiler sin agua caliente", clientMsg: "Mi boiler ya no calienta el agua 🔥" },
  instalacion: { label: "Instalación", photoLabel: "Instalación nueva", clientMsg: "Quiero instalar un lavabo nuevo 🛠️" },
};
const PHOTOS = {
  lavabo: { label: "Fuga en lavabo", svg: "lavabo" },
  drenaje: { label: "Drenaje tapado", svg: "drenaje" },
  boiler: { label: "Boiler", svg: "boiler" },
};
const PHOTO_SVG = {
  lavabo: '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foto de ejemplo: fuga en lavabo"><rect width="320" height="180" fill="#FFF6E8"/><rect y="120" width="320" height="60" fill="#2456C8"/><ellipse cx="160" cy="128" rx="110" ry="16" fill="#FFF6E8" stroke="#0E3B38" stroke-width="3"/><rect x="150" y="52" width="20" height="46" fill="#E4572E"/><rect x="120" y="46" width="80" height="14" rx="7" fill="#E4572E"/><path d="M160 66 q-4 18 0 30 q4 12 0 22" stroke="#2456C8" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="160" cy="128" r="5" fill="#2456C8"/><text x="160" y="168" text-anchor="middle" font-family="monospace" font-size="12" fill="#FFF6E8">FUGA EN LAVABO · FOTO DE EJEMPLO</text></svg>',
  drenaje: '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foto de ejemplo: drenaje tapado"><rect width="320" height="180" fill="#FFF6E8"/><rect y="118" width="320" height="62" fill="#0E3B38"/><ellipse cx="160" cy="126" rx="112" ry="18" fill="#FFF6E8" stroke="#0E3B38" stroke-width="3"/><circle cx="160" cy="126" r="26" fill="#2456C8"/><circle cx="160" cy="126" r="12" fill="#0E3B38"/><rect x="140" y="30" width="40" height="60" rx="6" fill="#E4572E"/><text x="160" y="168" text-anchor="middle" font-family="monospace" font-size="12" fill="#FFF6E8">DRENAJE TAPADO · FOTO DE EJEMPLO</text></svg>',
  boiler: '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foto de ejemplo: boiler"><rect width="320" height="180" fill="#FFF6E8"/><rect x="95" y="30" width="130" height="110" rx="14" fill="#E4572E" stroke="#0E3B38" stroke-width="3"/><rect x="150" y="52" width="20" height="14" fill="#FFF6E8"/><circle cx="160" cy="95" r="16" fill="#FFF6E8"/><path d="M160 86 l5 9 h-10 z" fill="#E4572E"/><rect x="120" y="140" width="80" height="10" fill="#2456C8"/><text x="160" y="168" text-anchor="middle" font-family="monospace" font-size="12" fill="#FFF6E8">BOILER · FOTO DE EJEMPLO</text></svg>',
};

const state = { problem: null, photo: null, name: null, answers: [], day: null, time: null };

function timeNow() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
function scrollChat() { chatEl.scrollTop = chatEl.scrollHeight; }
function addBubble(who, text, photoKey) {
  const div = document.createElement("div");
  div.className = "bubble " + who;
  let inner = "";
  if (photoKey) inner += '<span class="photo-card">' + PHOTO_SVG[photoKey] + "</span>";
  inner += text.replace(/</g, "&lt;");
  inner += '<span class="meta">' + timeNow() + "</span>";
  div.innerHTML = inner;
  chatEl.appendChild(div);
  scrollChat();
}
function addTyping() {
  const t = document.createElement("div");
  t.className = "typing";
  t.innerHTML = "<i></i><i></i><i></i>";
  chatEl.appendChild(t);
  scrollChat();
  return t;
}
function botSay(text, delayAfter) {
  return new Promise((resolve) => {
    const t = addTyping();
    setTimeout(() => {
      t.remove();
      addBubble("bot", text);
      setTimeout(resolve, D(delayAfter === undefined ? 500 : delayAfter));
    }, D(800));
  });
}
function clientSay(text, photoKey) {
  addBubble("client", text, photoKey);
  return new Promise((r) => setTimeout(r, D(450)));
}
function setQR(buttons) {
  qrEl.innerHTML = "";
  buttons.forEach((b) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "qr";
    btn.textContent = b.label;
    btn.addEventListener("click", () => {
      qrEl.querySelectorAll("button").forEach((x) => { x.disabled = true; });
      b.onClick();
    });
    qrEl.appendChild(btn);
  });
}
function clearQR() { qrEl.innerHTML = ""; }
function setLead(el, value, pending) {
  el.textContent = value;
  el.classList.toggle("pending", !!pending);
}
function markStep(n) {
  const li = document.querySelector('[data-step="' + n + '"]');
  if (li) li.classList.add("done");
}
function dayLabel(key) {
  const d = new Date();
  if (key === "manana") { d.setDate(d.getDate() + 1); return "Mañana"; }
  d.setDate(d.getDate() + 2);
  return "Pasado mañana";
}
function dayDate(key) {
  const d = new Date();
  d.setDate(d.getDate() + (key === "manana" ? 1 : 2));
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
}

/* ---------- Flow ---------- */
async function startFlow() {
  clearQR();
  await botSay("¡Hola! Soy el asistente de " + BUSINESS_NAME_BOT + ". Cuéntame, ¿qué problema tienes? Toca un problema abajo 👇", 300);
  setQR(Object.keys(PROBLEMS).map((key) => ({
    label: PROBLEMS[key].label,
    onClick: () => chooseProblem(key),
  })));
}

async function chooseProblem(key) {
  state.problem = key;
  document.querySelectorAll("#problem-chips .chip-btn").forEach((b) => {
    b.classList.toggle("selected", b.dataset.problem === key);
    b.disabled = true;
  });
  setLead(problemRow, PROBLEMS[key].label, false);
  markStep(1);
  await clientSay(PROBLEMS[key].clientMsg);
  await botSay("Perfecto. Manda una foto del problema para cotizarte más rápido. Elige una foto de ejemplo:", 300);
  markStep(2);
  showPhotoPicker();
}

function showPhotoPicker() {
  const picker = document.getElementById("photo-picker");
  picker.innerHTML = "";
  Object.keys(PHOTOS).forEach((key) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "photo-opt";
    b.innerHTML = PHOTO_SVG[PHOTOS[key].svg] + "<span>" + PHOTOS[key].label + "</span>";
    b.addEventListener("click", () => {
      picker.querySelectorAll(".photo-opt").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
      choosePhoto(key);
    });
    picker.appendChild(b);
  });
  picker.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
}

async function choosePhoto(key) {
  state.photo = key;
  const picker = document.getElementById("photo-picker");
  picker.querySelectorAll(".photo-opt").forEach((x) => { x.disabled = true; });
  setLead(photoRow, "📷 " + PHOTOS[key].label + " (adjunta)", false);
  await clientSay("📷 Foto de ejemplo: " + PHOTOS[key].label.toLowerCase(), key);
  await askName();
}

async function askName() {
  await botSay("Gracias. ¿Cómo te llamas? (opcional — así el técnico sabe a quién buscar)", 300);
  qrEl.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;gap:8px;width:100%";
  wrap.innerHTML =
    '<input id="demo-name" type="text" placeholder="Tu nombre (opcional)" autocomplete="name" ' +
    'style="flex:1;min-width:0;background:#2A3942;border:1.5px solid #2456C8;border-radius:999px;color:#E9EDEF;padding:10px 16px;font-size:14px;font-family:inherit;outline:none">' +
    '<button type="button" class="qr" id="demo-name-send" style="flex:none">Enviar</button>' +
    '<button type="button" class="qr" id="demo-name-skip" style="flex:none">Saltar</button>';
  qrEl.appendChild(wrap);
  const input = wrap.querySelector("#demo-name");
  const send = () => {
    const v = input.value.trim();
    if (v) state.name = v;
    wrap.querySelectorAll("button").forEach((x) => { x.disabled = true; });
    input.disabled = true;
    if (v) { setLead(nameRow, v, false); clientSay(v).then(() => askQ1()); }
    else { setLead(nameRow, "[POR DEFINIR]", true); askQ1(); }
  };
  wrap.querySelector("#demo-name-send").addEventListener("click", send);
  wrap.querySelector("#demo-name-skip").addEventListener("click", () => {
    setLead(nameRow, "[POR DEFINIR]", true);
    wrap.querySelectorAll("button").forEach((x) => { x.disabled = true; });
    input.disabled = true;
    askQ1();
  });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  input.focus();
}

const QUESTIONS = [
  {
    text: "¿Dónde está el problema?",
    options: ["Cocina", "Baño", "Otro lugar"],
  },
  {
    text: "¿Desde cuándo pasa?",
    options: ["Hoy", "Desde ayer", "Hace varios días"],
  },
  {
    text: "¿Qué tan urgente es?",
    options: ["Puede esperar", "Hoy mismo", "Lo antes posible"],
  },
];
let qIndex = 0;

async function askQ1() {
  qIndex = 0;
  markStep(3);
  await askQuestion();
}
async function askQuestion() {
  const q = QUESTIONS[qIndex];
  await botSay("Pregunta " + (qIndex + 1) + " de 3: " + q.text, 300);
  setQR(q.options.map((opt) => ({
    label: opt,
    onClick: async () => {
      state.answers.push(opt);
      await clientSay(opt);
      qIndex++;
      if (qIndex < QUESTIONS.length) await askQuestion();
      else await giveRange();
    },
  })));
}

async function giveRange() {
  markStep(4);
  await botSay(
    "Rango orientativo de ejemplo: $___ – $___ MXN.\n" +
    "⚠️ Es un ejemplo: el negocio define sus precios reales. El precio final se confirma en tu casa antes de empezar.",
    600
  );
  setLead(rangeRow, "$___ – $___ MXN [ejemplo]", false);
  await botSay("¿Qué día te queda mejor para la visita?", 300);
  setQR([
    { label: "Mañana", onClick: () => chooseDay("manana") },
    { label: "Pasado mañana", onClick: () => chooseDay("pasado") },
  ]);
}
async function chooseDay(key) {
  state.day = key;
  await clientSay(dayLabel(key) + " (" + dayDate(key) + ")");
  await botSay("¿A qué hora? Elige una:", 300);
  setQR([
    { label: "10:00 AM", onClick: () => chooseTime("10:00 AM") },
    { label: "4:00 PM", onClick: () => chooseTime("4:00 PM") },
  ]);
}
async function chooseTime(t) {
  state.time = t;
  await clientSay(t);
  const cita = dayLabel(state.day) + " " + t;
  setLead(apptRow, cita, false);
  setLead(statusRow, "● LISTO PARA VISITA", false);
  await botSay("Listo ✅ " + cita + ". Te mando un recordatorio una hora antes. El técnico llega con las refacciones correctas.", 400);
  clearQR();
  const done = document.createElement("div");
  done.className = "quick-replies";
  done.innerHTML =
    '<button type="button" class="qr" id="demo-restart">↻ Probar con otro problema</button>' +
    '<a class="qr" href="contacto.html" style="text-decoration:none;display:inline-flex;align-items:center">Quiero este bot →</a>';
  qrEl.appendChild(done);
  done.querySelector("#demo-restart").addEventListener("click", restartDemo);
}

function restartDemo() {
  state.problem = null; state.photo = null; state.name = null;
  state.answers = []; state.day = null; state.time = null;
  chatEl.innerHTML = "";
  qrEl.innerHTML = "";
  document.getElementById("photo-picker").innerHTML = "";
  document.querySelectorAll("#problem-chips .chip-btn").forEach((b) => { b.classList.remove("selected"); b.disabled = false; });
  document.querySelectorAll(".demo-steps li").forEach((li) => li.classList.remove("done"));
  setLead(nameRow, "[POR DEFINIR]", true);
  setLead(problemRow, "[POR DEFINIR]", true);
  setLead(photoRow, "[POR DEFINIR]", true);
  setLead(rangeRow, "[POR DEFINIR]", true);
  setLead(apptRow, "[POR DEFINIR]", true);
  setLead(statusRow, "○ SIN EMPEZAR", true);
  startFlow();
}

/* Problem chips also start the flow */
document.querySelectorAll("#problem-chips .chip-btn").forEach((b) => {
  b.addEventListener("click", () => {
    if (state.problem) return;
    clearQR();
    chooseProblem(b.dataset.problem);
  });
});

/* Input row: free text is a demo — guide the visitor back to the flow. */
const freeInput = document.getElementById("demo-free-input");
const freeSend = document.getElementById("demo-free-send");
if (freeInput && freeSend) {
  const sendFree = () => {
    const v = freeInput.value.trim();
    if (!v) return;
    freeInput.value = "";
    clientSay(v).then(async () => {
      await botSay("En esta demo uso botones para ir más rápido 👆. Toca un problema arriba o elige una respuesta rápida.");
    });
  };
  freeSend.addEventListener("click", sendFree);
  freeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendFree(); });
}

startFlow();
