const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const poemSection = document.getElementById('poemSection');
const overlay = document.getElementById('overlay');
const fxCanvas = document.getElementById('fxCanvas');
const balloonsLayer = document.getElementById('balloons');
const waLink = document.getElementById('whatsAppLink');
const copyMsgBtn = document.getElementById('copyMsgBtn');
const toQuestionBtn = document.getElementById('toQuestionBtn');
const heartsLayer = document.getElementById('hearts');

const PAGE = document.body?.dataset?.page || '';

const ALEX_WHATSAPP_NUMBER = "+254716550186";

const LOVE_MESSAGE = "am gonna be ur valentine darling \uD83D\uDC96\n\nFrom Risper to Alex";

function buildWhatsAppHref() {
  // wa.me requires digits only. If number isn't set, keep link disabled.
  const digits = ALEX_WHATSAPP_NUMBER.replace(/\D/g, "");
  if (!digits) return "#";

  const text = encodeURIComponent(LOVE_MESSAGE);
  return `https://wa.me/${digits}?text=${text}`;
}

function setWhatsAppLinkState() {
  const href = buildWhatsAppHref();
  if (!waLink) return;

  waLink.href = href;
  const disabled = href === "#";
  waLink.setAttribute('aria-disabled', disabled ? 'true' : 'false');
  waLink.style.opacity = disabled ? '0.6' : '1';
  waLink.style.pointerEvents = disabled ? 'none' : 'auto';
  waLink.title = disabled ? 'Set Alex\u2019s WhatsApp number in script.js first' : 'Open WhatsApp with a prefilled message';
}

setWhatsAppLinkState();

if (toQuestionBtn) {
  toQuestionBtn.addEventListener('click', () => {
    const proposal = document.getElementById('proposal');
    if (proposal) proposal.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ---- Animated floating hearts background ----
function rand(min, max) {
  return min + Math.random() * (max - min);
}

function spawnFloatingHeart() {
  if (!heartsLayer) return;
  const h = document.createElement('div');
  h.className = 'floatHeart';
  h.style.setProperty('--x', `${rand(2, 98)}vw`);
  h.style.setProperty('--dx', `${rand(-40, 40)}px`);
  h.style.setProperty('--r', `${rand(-25, 25)}deg`);
  h.style.setProperty('--s', `${rand(14, 26)}px`);
  h.style.setProperty('--d', `${rand(6.5, 11.5)}s`);
  heartsLayer.appendChild(h);
  setTimeout(() => h.remove(), 12000);
}

if (heartsLayer) {
  // modest rate to keep perf good on phones
  setInterval(() => {
    // spawn fewer hearts on reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    spawnFloatingHeart();
  }, 520);
}

// ---- Scroll reveal animations ----
function initScrollReveal() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = Array.from(
    document.querySelectorAll('.landing__copy, .landing__card, .section__head, .card, .proposal__wrap, .poem__wrap')
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.classList.add(i % 2 === 0 ? 'reveal--left' : 'reveal--right');
    el.style.setProperty('--reveal-delay', `${Math.min(i * 70, 420)}ms`);
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('reveal--in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
  );

  targets.forEach((el) => io.observe(el));
}

initScrollReveal();

// ---- No button runs away ----
let noMoves = 0;

function placeNoButtonRandomly() {
  const padding = 16;
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = window.innerWidth - btnRect.width - padding;
  const maxY = window.innerHeight - btnRect.height - padding;

  const x = Math.max(padding, Math.random() * maxX);
  const y = Math.max(padding + 70, Math.random() * maxY); // avoid topbar

  noBtn.style.position = 'fixed';
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.zIndex = '12';
}

function dodgeNoButton() {
  noMoves += 1;
  placeNoButtonRandomly();

  if (noMoves === 3) {
    noBtn.textContent = "Wait\u0015 what?";
  } else if (noMoves === 6) {
    noBtn.textContent = "You\u2019re too cute";
  } else if (noMoves === 9) {
    noBtn.textContent = "Okay\u0015 just say Yes";
  }
}

if (noBtn) {
  ['pointerenter', 'mouseenter', 'touchstart'].forEach((evt) => {
    noBtn.addEventListener(evt, (e) => {
      e.preventDefault();
      dodgeNoButton();
    }, { passive: false });
  });
}

// ---- FX Canvas (confetti + fireworks) ----
const ctx = fxCanvas ? fxCanvas.getContext('2d') : null;
let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

function resizeCanvas() {
  DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  if (!fxCanvas || !ctx) return;
  fxCanvas.width = Math.floor(window.innerWidth * DPR);
  fxCanvas.height = Math.floor(window.innerHeight * DPR);
  fxCanvas.style.width = `${window.innerWidth}px`;
  fxCanvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const particles = [];
const fireworks = [];

function pushConfettiBurst(cx, cy, count = 140) {
  const colors = ['#ff3ea5', '#ff6fb6', '#ffb3d9', '#ffffff', '#ffd1e8'];

  for (let i = 0; i < count; i++) {
    const ang = rand(0, Math.PI * 2);
    const speed = rand(2.8, 8.2);
    particles.push({
      type: 'confetti',
      x: cx,
      y: cy,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - rand(1.5, 4.5),
      g: rand(0.12, 0.18),
      r: rand(2, 5),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.2, 0.2),
      life: rand(70, 110),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
    });
  }
}

function spawnFirework() {
  const x = rand(80, window.innerWidth - 80);
  const y = rand(80, window.innerHeight * 0.45);

  fireworks.push({
    x,
    y,
    t: 0,
    life: rand(28, 44),
  });
}

function explodeFirework(fw) {
  const colors = ['#ffffff', '#ff3ea5', '#ffb3d9', '#ffd1e8'];
  const count = 90;

  for (let i = 0; i < count; i++) {
    const ang = rand(0, Math.PI * 2);
    const speed = rand(2.2, 6.6);
    particles.push({
      type: 'spark',
      x: fw.x,
      y: fw.y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      g: rand(0.04, 0.09),
      r: rand(1.2, 2.6),
      life: rand(38, 70),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
    });
  }
}

let rafId = null;

function tick() {
  if (!ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const fw = fireworks[i];
    fw.t += 1;

    const p = fw.t / fw.life;
    ctx.save();
    ctx.globalAlpha = 1 - p;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(fw.x, fw.y, 2.2 + p * 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (fw.t >= fw.life) {
      explodeFirework(fw);
      fireworks.splice(i, 1);
    }
  }

  // particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;

    if (p.type === 'confetti') {
      p.rot += p.vr;
      p.alpha = Math.max(0, Math.min(1, p.life / 120));

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r * 2.2, p.r * 1.6);
      ctx.restore();
    } else {
      p.alpha = Math.max(0, Math.min(1, p.life / 70));
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (p.life <= 0 || p.y > window.innerHeight + 60) {
      particles.splice(i, 1);
    }
  }

  if (particles.length > 0 || fireworks.length > 0) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function startFx() {
  if (!rafId) rafId = requestAnimationFrame(tick);
}

// ---- Balloons ----
function launchBalloons(n = 12) {
  if (!balloonsLayer) return;

  balloonsLayer.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const b = document.createElement('div');
    b.className = 'balloon';
    b.style.left = `${rand(6, 94)}vw`;
    b.style.setProperty('--dur', `${rand(4.8, 7.8)}s`);
    b.style.setProperty('--drift', `${rand(-40, 40)}px`);
    balloonsLayer.appendChild(b);
  }

  setTimeout(() => {
    balloonsLayer.innerHTML = '';
  }, 8200);
}

function showOverlay(ms = 1600) {
  if (!overlay) return;
  overlay.hidden = false;
  setTimeout(() => {
    if (overlay) overlay.hidden = true;
  }, ms);
}

function revealPoem() {
  if (!poemSection) return;
  poemSection.hidden = false;
  poemSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function copyLoveMessage() {
  try {
    await navigator.clipboard.writeText(LOVE_MESSAGE);
    copyMsgBtn.textContent = 'Copied';
    setTimeout(() => (copyMsgBtn.textContent = 'Copy message'), 1200);
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = LOVE_MESSAGE;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    copyMsgBtn.textContent = 'Copied';
    setTimeout(() => (copyMsgBtn.textContent = 'Copy message'), 1200);
  }
}

if (copyMsgBtn) copyMsgBtn.addEventListener('click', copyLoveMessage);

function celebrate() {
  showOverlay(1700);

  pushConfettiBurst(window.innerWidth * 0.5, window.innerHeight * 0.35, 170);
  pushConfettiBurst(window.innerWidth * 0.25, window.innerHeight * 0.45, 120);
  pushConfettiBurst(window.innerWidth * 0.75, window.innerHeight * 0.45, 120);

  launchBalloons(14);

  const waveCount = 7;
  for (let i = 0; i < waveCount; i++) {
    setTimeout(() => {
      spawnFirework();
      spawnFirework();
      startFx();
    }, i * 220);
  }

  startFx();
}

// ---- Yes flow ----
if (yesBtn) {
  yesBtn.addEventListener('click', () => {
    // mark that the yes page should auto-celebrate
    try {
      sessionStorage.setItem('valentine_yes', '1');
    } catch {
      // ignore
    }

    celebrate();
    setTimeout(() => {
      window.location.href = 'yes.html';
    }, 900);
  });
}

// If we land on yes.html (or refresh), do a celebration once.
if (PAGE === 'yes') {
  let should = true;
  try {
    should = sessionStorage.getItem('valentine_yes') === '1';
    sessionStorage.removeItem('valentine_yes');
  } catch {
    // ignore
  }

  if (should) {
    setTimeout(() => {
      celebrate();
    }, 250);
  }
}
