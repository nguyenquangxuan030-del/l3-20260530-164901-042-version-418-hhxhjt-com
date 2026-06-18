import { H as Hls } from './hls-dru42stk.js';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function initMobileMenu() {
  const toggle = qs('.menu-toggle');
  const menu = qs('.mobile-menu');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', () => {
    const open = menu.hasAttribute('hidden');
    menu.toggleAttribute('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
  });
}

function initHeroSlider() {
  const root = qs('[data-hero-slider]');

  if (!root) {
    return;
  }

  const slides = qsa('.hero-slide', root);
  const dots = qsa('.hero-dot', root);
  let active = 0;
  let timer = null;

  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
  }

  function start() {
    stop();
    timer = window.setInterval(() => show(active + 1), 4500);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  if (slides.length > 1) {
    start();
  }
}

function initSearchForms() {
  qsa('form[data-search-base]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = qs('input[name="q"]', form);
      const query = input ? input.value.trim() : '';
      const base = form.getAttribute('data-search-base') || 'index.html';
      const target = query ? `${base}?q=${encodeURIComponent(query)}#all-movies` : `${base}#all-movies`;
      window.location.href = target;
    });
  });
}

function initFilters() {
  const grid = qs('[data-filter-grid]');
  const panel = qs('[data-filter-panel]');

  if (!grid || !panel) {
    return;
  }

  const cards = qsa('.movie-card', grid);
  const keywordInput = qs('[data-filter="keyword"]', panel);
  const typeSelect = qs('[data-filter="type"]', panel);
  const yearSelect = qs('[data-filter="year"]', panel);
  const categorySelect = qs('[data-filter="category"]', panel);
  const count = qs('[data-filter-count]', panel);
  const empty = qs('[data-empty-state]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (keywordInput && initialQuery) {
    keywordInput.value = initialQuery;
  }

  function matches(card) {
    const keyword = normalize(keywordInput ? keywordInput.value : '');
    const type = normalize(typeSelect ? typeSelect.value : '');
    const year = normalize(yearSelect ? yearSelect.value : '');
    const category = normalize(categorySelect ? categorySelect.value : '');
    const haystack = normalize([
      card.dataset.title,
      card.dataset.year,
      card.dataset.type,
      card.dataset.region,
      card.dataset.genre,
      card.textContent
    ].join(' '));

    if (keyword && !haystack.includes(keyword)) {
      return false;
    }

    if (type && normalize(card.dataset.type) !== type) {
      return false;
    }

    if (year && normalize(card.dataset.year) !== year) {
      return false;
    }

    if (category && normalize(card.dataset.category) !== category) {
      return false;
    }

    return true;
  }

  function apply() {
    let visible = 0;

    cards.forEach((card) => {
      const ok = matches(card);
      card.hidden = !ok;
      if (ok) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `显示 ${visible} / ${cards.length} 部`;
    }

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  qsa('input, select', panel).forEach((control) => {
    control.addEventListener('input', apply);
    control.addEventListener('change', apply);
  });

  apply();
}

function initPlayers() {
  qsa('[data-player-shell]').forEach((shell) => {
    const video = qs('video[data-hls]', shell);
    const button = qs('[data-player-start]', shell);

    if (!video) {
      return;
    }

    const source = video.getAttribute('data-hls');
    let initialized = false;

    function initialize() {
      if (initialized || !source) {
        return;
      }

      initialized = true;

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            shell.classList.add('has-player-error');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      initialize();
      shell.classList.add('is-playing');
      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          shell.classList.remove('is-playing');
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('play', () => shell.classList.add('is-playing'));
    video.addEventListener('pause', () => {
      if (video.currentTime === 0) {
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('mouseenter', initialize, { once: true });
  });
}

function initImageFallbacks() {
  qsa('img').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.opacity = '0';
      const parent = img.closest('.poster-link');
      if (parent && !parent.querySelector('.poster-fallback')) {
        const fallback = document.createElement('span');
        fallback.className = 'poster-fallback';
        fallback.textContent = img.alt || '影片封面';
        fallback.style.position = 'absolute';
        fallback.style.inset = '0';
        fallback.style.display = 'grid';
        fallback.style.placeItems = 'center';
        fallback.style.padding = '16px';
        fallback.style.color = '#991b1b';
        fallback.style.textAlign = 'center';
        fallback.style.fontWeight = '800';
        parent.appendChild(fallback);
      }
    }, { once: true });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeroSlider();
  initSearchForms();
  initFilters();
  initPlayers();
  initImageFallbacks();
});
