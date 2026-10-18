/* =========================================================
   KONFIGURASI — ubah bagian ini saja
   ========================================================= */
const CONFIG = {
  name: 'Aether Null',
  role: 'Frontend Developer & UI Designer',

  redirect: {
    label: 'WhatsApp',
    url: 'https://wa.me/6288220624639',
    delay: 10000,      // redirect setelah 10 detik
    startAfter: 1600  // tunggu animasi intro selesai
  }
};

/* =========================================================
   PROGRAM
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);

  const nameEl    = $('.name');
  const roleEl    = $('.role');
  const countEl   = $('#count');
  const fillEl    = $('#fill');
  const hintEl    = $('#hint');
  const cancelBtn = $('#cancel');
  const curtainEl = $('#curtain');
  const glowEl    = $('.cursor-glow');
  const body      = document.body;

  /* -------------------------------------------------------
     1. Pecah nama menjadi huruf-huruf beranimasi
     ------------------------------------------------------- */
  function buildName(text) {
    nameEl.innerHTML = '';
    nameEl.setAttribute('aria-label', text);

    const words = text.trim().split(/\s+/);
    let index = 0;

    words.forEach((word, wordIdx) => {
      const wordEl = document.createElement('span');
      wordEl.className = 'word';
      wordEl.setAttribute('aria-hidden', 'true');

      for (const char of word) {
        const charEl = document.createElement('span');
        charEl.className = 'char';
        charEl.textContent = char;
        charEl.style.setProperty('--i', index++);
        wordEl.appendChild(charEl);
      }

      nameEl.appendChild(wordEl);
      if (wordIdx < words.length - 1) {
        nameEl.appendChild(document.createTextNode(' '));
      }
    });
  }

  buildName(CONFIG.name);
  roleEl.textContent = CONFIG.role;

  /* -------------------------------------------------------
     2. Cahaya yang mengikuti kursor
     ------------------------------------------------------- */
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;
  let glowVisible = false;

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!glowVisible) {
      glowVisible = true;
      glowEl.style.opacity = '1';
    }
  }, { passive: true });

  (function animateGlow() {
    glowX += (mouseX - glowX) * 0.09;
    glowY += (mouseY - glowY) * 0.09;
    glowEl.style.transform =
      `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  })();

  /* -------------------------------------------------------
     3. Hitung mundur + redirect ke WhatsApp
     ------------------------------------------------------- */
  const DELAY = CONFIG.redirect.delay;
  let rafId = null;
  let startTime = null;
  let cancelled = false;
  let redirected = false;

  function tick(now) {
    if (startTime === null) startTime = now;

    const elapsed   = now - startTime;
    const remaining = Math.max(0, DELAY - elapsed);
    const progress  = Math.min(1, elapsed / DELAY);

    fillEl.style.transform = `scaleX(${progress})`;
    countEl.textContent = Math.max(1, Math.ceil(remaining / 1000));

    if (remaining <= 0) {
      fillEl.style.transform = 'scaleX(1)';
      leaveTo(CONFIG.redirect.url);
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  /* Animasi keluar → tirai → pindah halaman */
  function leaveTo(url) {
    if (redirected) return;
    redirected = true;

    cancelAnimationFrame(rafId);
    body.classList.add('leaving');

    setTimeout(() => {
      curtainEl.classList.add('active');
      setTimeout(() => {
        window.location.href = url;
      }, 900);
    }, 380);
  }

  /* Batalkan redirect otomatis */
  function cancelRedirect() {
    if (cancelled || redirected) return;
    cancelled = true;

    cancelAnimationFrame(rafId);
    fillEl.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
    fillEl.style.transform = 'scaleX(0)';

    hintEl.innerHTML = '<span>Redirect dibatalkan — silakan pilih tautan di atas</span>';
  }

  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cancelRedirect();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cancelRedirect();
  });

  /* Mulai hitung mundur setelah intro selesai */
  setTimeout(() => {
    if (cancelled) return;
    rafId = requestAnimationFrame(tick);
  }, CONFIG.redirect.startAfter);

  /* -------------------------------------------------------
     4. Klik tautan sosial → transisi mulus lalu pindah
     ------------------------------------------------------- */
  document.querySelectorAll('.social').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Email dibiarkan membuka aplikasi mail secara default
      if (href.startsWith('mailto:')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      e.preventDefault();
      cancelled = true;
      cancelAnimationFrame(rafId);
      leaveTo(href);
    });
  });

  /* -------------------------------------------------------
     5. Kembali dari halaman lain (bfcache) → reset halaman
     ------------------------------------------------------- */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) window.location.reload();
  });
})();
