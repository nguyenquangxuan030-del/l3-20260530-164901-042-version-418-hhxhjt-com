(function () {
    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupSiteSearch() {
        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (value) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(value);
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var toolbar = document.querySelector("[data-filter-toolbar]");
        var list = document.querySelector("[data-filter-list]");
        if (!toolbar || !list) {
            return;
        }
        var keyword = toolbar.querySelector("[data-filter-keyword]");
        var region = toolbar.querySelector("[data-filter-region]");
        var type = toolbar.querySelector("[data-filter-type]");
        var year = toolbar.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        function apply() {
            var q = keyword ? keyword.value.trim().toLowerCase() : "";
            var r = region ? region.value : "";
            var t = type ? type.value : "";
            var y = year ? year.value : "";
            cards.forEach(function (card) {
                var text = [
                    card.dataset.title || "",
                    card.dataset.region || "",
                    card.dataset.type || "",
                    card.dataset.year || "",
                    card.dataset.genre || ""
                ].join(" ").toLowerCase();
                var ok = true;
                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (r && card.dataset.region !== r) {
                    ok = false;
                }
                if (t && card.dataset.type !== t) {
                    ok = false;
                }
                if (y && card.dataset.year !== y) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
            });
        }
        [keyword, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join("");
        return '<article class="movie-card">' +
            '<a href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">' +
            '<div class="card-cover" style="background-image: url(\'' + movie.cover + '\');">' +
            '<span class="card-badge">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
            '<span class="card-year">' + escapeHtml(movie.year) + '</span>' +
            '<span class="card-play">▶</span>' +
            '</div>' +
            '<div class="card-body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.one_line || "") + '</p>' +
            '<div class="card-tags">' + tags + '</div>' +
            '</div>' +
            '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;"
            }[char];
        });
    }

    function setupSearchPage() {
        var form = document.querySelector("[data-search-page-form]");
        var results = document.querySelector("[data-search-results]");
        if (!form || !results || typeof MOVIE_SEARCH_INDEX === "undefined") {
            return;
        }
        var input = form.querySelector("input[name='q']");
        var initial = getQueryValue("q");
        if (input) {
            input.value = initial;
        }
        function render(value) {
            var q = String(value || "").trim().toLowerCase();
            var items = MOVIE_SEARCH_INDEX.filter(function (movie) {
                if (!q) {
                    return false;
                }
                return movie.search_text.toLowerCase().indexOf(q) !== -1;
            }).slice(0, 80);
            if (!q) {
                results.innerHTML = '<p class="empty-text">请输入关键词开始搜索。</p>';
                return;
            }
            if (!items.length) {
                results.innerHTML = '<p class="empty-text">没有找到匹配影片。</p>';
                return;
            }
            results.innerHTML = items.map(cardTemplate).join("");
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var value = input ? input.value.trim() : "";
            var nextUrl = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
            window.history.replaceState(null, "", nextUrl);
            render(value);
        });
        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
        render(initial);
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupSiteSearch();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
