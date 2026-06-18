(function () {
  const body = document.body;

  function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initSiteSearch() {
    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const input = form.querySelector('input[name="q"]');
        const target = form.getAttribute('data-search-target') || './all.html';
        const query = input ? input.value.trim() : '';
        const url = query ? target + '?q=' + encodeURIComponent(query) : target;
        window.location.href = url;
      });
    });
  }

  function initCarousel() {
    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
      const dots = Array.from(carousel.querySelectorAll('[data-slide-to]'));
      const previous = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      let index = 0;
      let timer = null;

      if (!slides.length) {
        return;
      }

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-slide-to')) || 0);
          start();
        });
      });

      if (previous) {
        previous.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      const input = panel.querySelector('[data-filter-input]');
      const category = panel.querySelector('[data-filter-category]');
      const count = panel.querySelector('[data-filter-count]');
      const list = panel.parentElement.querySelector('[data-card-list]');
      const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get('q') || '';

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function applyFilter() {
        const query = normalize(input ? input.value : '');
        const selectedCategory = category ? category.value : 'all';
        let visible = 0;

        cards.forEach(function (card) {
          const text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region')
          ].join(' ').toLowerCase();
          const cardCategory = card.getAttribute('data-category');
          const queryMatches = !query || text.indexOf(query) !== -1;
          const categoryMatches = !selectedCategory || selectedCategory === 'all' || selectedCategory === cardCategory;
          const show = queryMatches && categoryMatches;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      if (category && category.tagName === 'SELECT') {
        category.addEventListener('change', applyFilter);
      }

      applyFilter();
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        if (window.Hls) {
          resolve();
        }
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function attachHls(video, sourceUrl, message) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      await video.play();
      return;
    }

    if (!window.Hls) {
      if (message) {
        message.textContent = '正在加载 HLS 播放内核...';
      }
      await loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest');
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      hls.on(window.Hls.Events.ERROR, function (_event, data) {
        if (message) {
          message.textContent = '播放源加载异常，可刷新页面或稍后再试。';
        }
        if (data && data.fatal) {
          hls.destroy();
        }
      });
      video._hlsInstance = hls;
      return;
    }

    video.src = sourceUrl;
    await video.play();
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      const video = player.querySelector('video[data-hls-src]');
      const button = player.querySelector('[data-player-button]');
      const message = player.querySelector('[data-player-message]');
      let started = false;

      if (!video || !button) {
        return;
      }

      async function startPlayback() {
        if (started) {
          video.play();
          return;
        }

        started = true;
        button.classList.add('is-hidden');

        if (message) {
          message.textContent = '正在载入高清播放源...';
        }

        try {
          await attachHls(video, video.getAttribute('data-hls-src'), message);
          if (message) {
            message.textContent = '播放源已连接。';
          }
        } catch (error) {
          started = false;
          button.classList.remove('is-hidden');
          if (message) {
            message.textContent = '浏览器阻止自动播放时，请再次点击播放按钮。';
          }
        }
      }

      button.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (!started) {
          startPlayback();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSiteSearch();
    initCarousel();
    initFilters();
    initPlayers();
  });
})();
