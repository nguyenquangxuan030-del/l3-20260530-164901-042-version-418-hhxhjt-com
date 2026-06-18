document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
});

function setupMenu() {
    const button = document.querySelector('.menu-toggle');
    if (!button) {
        return;
    }
    button.addEventListener('click', function () {
        const open = document.body.classList.toggle('menu-open');
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
}

function setupHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
        return;
    }
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
        return;
    }
    let index = 0;
    let timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    function play() {
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            window.clearInterval(timer);
            show(dotIndex);
            play();
        });
    });

    play();
}

function setupFilters() {
    const panel = document.querySelector('[data-movie-filter]');
    if (!panel) {
        return;
    }
    const searchInput = panel.querySelector('[data-filter-search]');
    const selects = Array.from(panel.querySelectorAll('[data-filter-select]'));
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && searchInput) {
        searchInput.value = query;
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
        return [
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.category,
            card.textContent
        ].join(' ').toLowerCase();
    }

    function apply() {
        const keyword = normalize(searchInput ? searchInput.value : '');
        const activeSelects = selects.map(function (select) {
            return {
                key: select.getAttribute('data-filter-select'),
                value: normalize(select.value)
            };
        });

        cards.forEach(function (card) {
            const text = cardText(card);
            const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            const matchSelects = activeSelects.every(function (item) {
                if (!item.value) {
                    return true;
                }
                return normalize(card.dataset[item.key]).indexOf(item.value) !== -1;
            });
            card.hidden = !(matchKeyword && matchSelects);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
        select.addEventListener('change', apply);
    });
    apply();
}
