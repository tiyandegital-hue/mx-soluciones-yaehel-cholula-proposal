/* Soluciones Yaehel — shared site JS.
   BUSINESS_NAME is the ONE swappable constant for the business name. */
const BUSINESS_NAME = "Soluciones Yaehel";
const PHONE_DISPLAY = "221 158 3613";
const PHONE_TEL = "+522211583613";
const WA_NUMBER = "522211583613";
const WA_TEXT = encodeURIComponent("Hola " + BUSINESS_NAME + ", tengo una fuga y quiero una cotización por WhatsApp.");
const WA_LINK = "https://wa.me/" + WA_NUMBER + "?text=" + WA_TEXT;

/* Fill any [data-biz] slots with the business name constant. */
document.querySelectorAll("[data-biz]").forEach((el) => { el.textContent = BUSINESS_NAME; });
document.querySelectorAll("[data-wa]").forEach((el) => { el.href = WA_LINK; });

/* Footer year — always the current year (2026). */
document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

/* Mobile nav toggle */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => navLinks.classList.remove("open")));
}

/* Scroll reveal */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* FAQ accordion */
document.querySelectorAll(".faq-item").forEach((item) => {
  const q = item.querySelector(".faq-q");
  if (!q) return;
  q.addEventListener("click", () => {
    const open = item.classList.toggle("open");
    q.setAttribute("aria-expanded", open ? "true" : "false");
  });
});

/* ---------- Hero chat mock (index.html) — scripted, auto-plays once ---------- */
const heroChat = document.getElementById("hero-chat");
if (heroChat) {
  const script = [
    { who: "client", text: "Se me está saliendo agua del lavabo 😅", photo: "lavabo" },
    { who: "bot", text: "¡Hola! Soy el asistente de " + BUSINESS_NAME + ". ¿La fuga es del lavabo de la cocina o del baño?" },
    { who: "client", text: "Baño" },
    { who: "bot", text: "¿Desde cuándo gotea?" },
    { who: "client", text: "Desde ayer" },
    { who: "bot", text: "Rango orientativo: $___ – $___ MXN [ejemplo].\n¿Te agendo visita mañana a las 10:00 o a las 16:00?" },
    { who: "client", text: "10:00" },
    { who: "bot", text: "Listo ✅ Mañana 10:00. Te mando un recordatorio una hora antes." },
  ];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PHOTO_SVGS = {
    lavabo: '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foto de ejemplo: fuga en lavabo"><rect width="320" height="180" fill="#FFF6E8"/><rect y="120" width="320" height="60" fill="#2456C8"/><ellipse cx="160" cy="128" rx="110" ry="16" fill="#FFF6E8" stroke="#0E3B38" stroke-width="3"/><rect x="150" y="52" width="20" height="46" fill="#E4572E"/><rect x="120" y="46" width="80" height="14" rx="7" fill="#E4572E"/><path d="M160 66 q-4 18 0 30 q4 12 0 22" stroke="#2456C8" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="160" cy="128" r="5" fill="#2456C8"/><text x="160" y="168" text-anchor="middle" font-family="monospace" font-size="12" fill="#FFF6E8">FUGA EN LAVABO · FOTO DE EJEMPLO</text></svg>',
  };
  function timeNow() {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function addBubble(msg) {
    const div = document.createElement("div");
    div.className = "bubble " + msg.who;
    let inner = "";
    if (msg.photo) {
      inner += '<span class="photo-card">' + PHOTO_SVGS[msg.photo] + "</span>";
    }
    inner += msg.text.replace(/</g, "&lt;");
    inner += '<span class="meta">' + timeNow() + "</span>";
    div.innerHTML = inner;
    heroChat.appendChild(div);
    heroChat.scrollTop = heroChat.scrollHeight;
  }
  function addTyping() {
    const t = document.createElement("div");
    t.className = "typing";
    t.innerHTML = "<i></i><i></i><i></i>";
    heroChat.appendChild(t);
    heroChat.scrollTop = heroChat.scrollHeight;
    return t;
  }
  function playHero() {
    heroChat.innerHTML = "";
    let i = 0;
    const step = () => {
      if (i >= script.length) return;
      const msg = script[i];
      if (msg.who === "bot") {
        const t = addTyping();
        setTimeout(() => { t.remove(); addBubble(msg); i++; setTimeout(step, reduceMotion ? 0 : 650); }, reduceMotion ? 0 : 750);
      } else {
        addBubble(msg);
        i++;
        setTimeout(step, reduceMotion ? 0 : 700);
      }
    };
    step();
  }
  playHero();
  const replay = document.getElementById("hero-replay");
  if (replay) replay.addEventListener("click", playHero);
}

/* ---------- Contact form (contacto.html) ---------- */
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  const okBox = document.getElementById("form-ok");
  const waSend = document.getElementById("form-wa-send");
  function setInvalid(field, bad) { field.classList.toggle("invalid", bad); return !bad; }
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = contactForm.querySelector("#f-nombre");
    const phone = contactForm.querySelector("#f-telefono");
    const service = contactForm.querySelector("#f-servicio");
    const desc = contactForm.querySelector("#f-descripcion");
    const consent = contactForm.querySelector("#f-consentimiento");
    let ok = true;
    ok = setInvalid(name.closest(".field"), name.value.trim().length < 2) && ok;
    const digits = phone.value.replace(/\D/g, "");
    ok = setInvalid(phone.closest(".field"), digits.length < 10) && ok;
    ok = setInvalid(service.closest(".field"), !service.value) && ok;
    ok = setInvalid(desc.closest(".field"), desc.value.trim().length < 5) && ok;
    ok = setInvalid(consent.closest(".field"), !consent.checked) && ok;
    if (!ok) {
      const firstBad = contactForm.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
      if (firstBad) firstBad.focus();
      return;
    }
    const msg = "Hola " + BUSINESS_NAME + ", soy " + name.value.trim() + ". Servicio: " + service.options[service.selectedIndex].text +
      ". Mi WhatsApp: " + phone.value.trim() + ". Problema: " + desc.value.trim();
    waSend.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
    okBox.classList.add("show");
    okBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  contactForm.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", () => el.closest(".field").classList.remove("invalid"));
    el.addEventListener("change", () => el.closest(".field").classList.remove("invalid"));
  });
}
