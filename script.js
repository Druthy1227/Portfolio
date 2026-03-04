/* ==============================================
   PORTFÓLIO — script.js
   Compartilhado por: index.html · projetos.html · now.html
   ============================================== */

/* -----------------------------------------------
   HAMBURGER MENU (mobile)
   ----------------------------------------------- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu de navegação');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* -----------------------------------------------
   SCROLL REVEAL
   ----------------------------------------------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

revealEls.forEach(el => revealObserver.observe(el));

/* -----------------------------------------------
   NAV ACTIVE LINK NO SCROLL  (index.html)
   ----------------------------------------------- */
/* Apenas seções que possuem link correspondente no nav */
const sections = Array.from(document.querySelectorAll('section[id]')).filter(
  sec => document.querySelector(`.nav-links a[href="#${sec.id}"]`)
);

if (sections.length > 0) {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveLink() {
    const threshold = 160; // altura aproximada do header fixo + folga
    let current = null;

    /* Se chegou ao fim da página, força a última seção como ativa */
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;

    if (nearBottom) {
      current = sections[sections.length - 1];
    } else {
      sections.forEach(sec => {
        if (sec.getBoundingClientRect().top <= threshold) {
          current = sec;
        }
      });
    }

    navLinks.forEach(link => {
      const isActive = current && link.getAttribute('href') === `#${current.id}`;
      link.classList.toggle('active', !!isActive);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  /* Roda uma vez ao carregar para o caso de a página abrir com âncora */
  updateActiveLink();
}

/* -----------------------------------------------
   FORMULÁRIO — ENVIO REAL VIA FORMSPREE  (index.html)
   Cadastre-se em https://formspree.io, crie um form e
   substitua YOUR_FORM_ID pelo ID gerado (ex: xkgwpqzr).
   ----------------------------------------------- */
const form    = document.getElementById('contactForm');
const sendBtn = document.getElementById('sendBtn');
const btnText = document.getElementById('btnText');

/* -- Helpers de validação de campo -- */
function setFieldError(input, msg) {
  input.classList.add('form-input--error');
  let errEl = input.parentElement.querySelector('.form-error-msg');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'form-error-msg';
    errEl.setAttribute('aria-live', 'polite');
    input.parentElement.appendChild(errEl);
  }
  errEl.textContent = msg;
}

function clearFieldError(input) {
  input.classList.remove('form-input--error');
  const errEl = input.parentElement.querySelector('.form-error-msg');
  if (errEl) errEl.textContent = '';
}

if (form && sendBtn && btnText) {
  const nameInput    = form.querySelector('#contactName');
  const emailInput   = form.querySelector('#contactEmail');
  const messageInput = form.querySelector('#contactMessage');
  const emailRegex   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* Limpa o erro em tempo real assim que o usuário corrigir o campo */
  [nameInput, emailInput, messageInput].forEach(input => {
    if (input) input.addEventListener('input', () => clearFieldError(input));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* --- Valida todos os campos, acumula erros e foca o primeiro --- */
    let firstInvalid = null;

    if (nameInput) {
      clearFieldError(nameInput);
      if (!nameInput.value.trim()) {
        setFieldError(nameInput, '// campo obrigatório');
        firstInvalid = firstInvalid ?? nameInput;
      }
    }

    if (emailInput) {
      clearFieldError(emailInput);
      const val = emailInput.value.trim();
      if (!val) {
        setFieldError(emailInput, '// campo obrigatório');
        firstInvalid = firstInvalid ?? emailInput;
      } else if (!emailRegex.test(val)) {
        setFieldError(emailInput, '// formato inválido — ex: nome@dominio.com');
        firstInvalid = firstInvalid ?? emailInput;
      }
    }

    if (messageInput) {
      clearFieldError(messageInput);
      if (!messageInput.value.trim()) {
        setFieldError(messageInput, '// campo obrigatório');
        firstInvalid = firstInvalid ?? messageInput;
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    btnText.textContent = 'ENVIANDO...';
    sendBtn.disabled = true;

    try {
      const response = await fetch('https://formspree.io/f/mykdrazg', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        btnText.textContent = '✓ ENVIADO!';
        form.reset();
        setTimeout(() => {
          btnText.textContent = 'ENVIAR_MSG.sh';
          sendBtn.disabled = false;
        }, 2500);
      } else {
        const json = await response.json().catch(() => ({}));
        const msg  = json?.errors?.[0]?.message || 'Erro ao enviar.';
        btnText.textContent = `✗ ${msg}`;
        sendBtn.disabled = false;
      }
    } catch {
      btnText.textContent = '✗ Sem conexão. Tente novamente.';
      sendBtn.disabled = false;
    }
  });
}

/* -----------------------------------------------
   CARROSSEL DE CERTIFICADOS  (index.html)
   ----------------------------------------------- */
(function initCertsCarousel() {
  const track     = document.getElementById('certsCarousel');
  const prevBtn   = document.getElementById('certPrev');
  const nextBtn   = document.getElementById('certNext');
  const dotsEl    = document.getElementById('carouselDots');

  if (!track || !prevBtn || !nextBtn || !dotsEl) return;

  const realItems = Array.from(track.querySelectorAll('.carousel-cert-item'));
  if (realItems.length === 0) return;

  const total = realItems.length;
  let current   = 0;
  let animating = false;

  /* ── Clonar bordas ── */
  const cloneLast  = realItems[total - 1].cloneNode(true);
  const cloneFirst = realItems[0].cloneNode(true);
  [cloneLast, cloneFirst].forEach(c => {
    c.setAttribute('aria-hidden', 'true');
    c.classList.remove('is-active');
  });
  track.prepend(cloneLast);   // DOM 0:       clone do último (peek à esquerda do 1º)
  track.append(cloneFirst);   // DOM total+1: clone do primeiro (peek à direita do último)

  /* allItems: [clone-último, real-0 … real-N-1, clone-primeiro] */
  const allItems = Array.from(track.querySelectorAll('.carousel-cert-item'));

  /* ── Dots ── */
  realItems.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Ir para certificado ${i + 1}`);
    dot.addEventListener('click', () => !animating && goTo(i));
    dotsEl.appendChild(dot);
  });
  const dots = Array.from(dotsEl.querySelectorAll('.carousel-dot'));

  /* ── Helpers de posição ── */
  function centeredLeft(domIndex) {
    const item = allItems[domIndex];
    return item.offsetLeft - (track.clientWidth - item.clientWidth) / 2;
  }

  function jumpInstant(domIndex) {
    track.scrollLeft = centeredLeft(domIndex);
  }

  function scrollSmooth(domIndex) {
    track.scrollTo({ left: centeredLeft(domIndex), behavior: 'smooth' });
  }

  function updateUI(realIndex) {
    current = realIndex;
    realItems.forEach((item, i) => item.classList.toggle('is-active', i === realIndex));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === realIndex));
  }

  function goTo(realIndex) {
    scrollSmooth(realIndex + 1);  // +1 por causa do clone no início
    updateUI(realIndex);
  }

  /* ── Aguarda o scroll terminar (scrollend com fallback) ── */
  function afterScroll(callback) {
    if ('onscrollend' in window) {
      track.addEventListener('scrollend', callback, { once: true });
    } else {
      setTimeout(callback, 500);
    }
  }

  /* ── Navegação direcional ── */
  function navigate(dir) {   // dir: +1 = → , -1 = ←
    if (animating) return;
    animating = true;

    if (dir === 1 && current === total - 1) {
      scrollSmooth(total + 1);
      updateUI(0);
      afterScroll(() => { jumpInstant(1); animating = false; });

    } else if (dir === -1 && current === 0) {
      scrollSmooth(0);
      updateUI(total - 1);
      afterScroll(() => { jumpInstant(total); animating = false; });

    } else {
      scrollSmooth(current + 1 + dir);
      updateUI(current + dir);
      afterScroll(() => { animating = false; });
    }
  }

  /* ── Scroll manual (touch / drag) ── */
  let scrollTimer;
  track.addEventListener('scroll', () => {
    if (animating) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const cx = track.scrollLeft + track.clientWidth / 2;
      let closest = 1, minDist = Infinity;
      allItems.forEach((item, i) => {
        const d = Math.abs(item.offsetLeft + item.clientWidth / 2 - cx);
        if (d < minDist) { minDist = d; closest = i; }
      });
      if (closest === 0)              { jumpInstant(total); updateUI(total - 1); }
      else if (closest === total + 1) { jumpInstant(1);     updateUI(0); }
      else                            { updateUI(closest - 1); }
    }, 80);
  }, { passive: true });

  /* ── Clique em item lateral ── */
  allItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (animating) return;
      if      (i === 0)           navigate(-1);
      else if (i === total + 1)   navigate(+1);
      else if (i - 1 !== current) goTo(i - 1);
    });
  });

  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(+1));

  /* ── Init ── */
  jumpInstant(1);
  updateUI(0);
})();
