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
    
    // Trava ou destrava o scroll do body
    document.body.style.overflow = isOpen ? 'hidden' : ''; 
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      // Restaura o scroll ao clicar num link
      document.body.style.overflow = ''; 
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
const nearBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50;

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
