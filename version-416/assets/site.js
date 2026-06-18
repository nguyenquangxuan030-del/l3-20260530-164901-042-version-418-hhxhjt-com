(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var searchInput = document.querySelector(".catalog-search");
        var typeSelect = document.querySelector(".catalog-type");
        var regionSelect = document.querySelector(".catalog-region");
        var yearSelect = document.querySelector(".catalog-year");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-card"));
        var status = document.querySelector(".search-status");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }

            var query = normalize(searchInput && searchInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var matched = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.textContent
                ].join(" "));
                var ok = true;

                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }

                if (type && normalize(card.dataset.type) !== type) {
                    ok = false;
                }

                if (region && normalize(card.dataset.region) !== region) {
                    ok = false;
                }

                if (year && normalize(card.dataset.year) !== year) {
                    ok = false;
                }

                card.classList.toggle("is-hidden", !ok);

                if (ok) {
                    matched += 1;
                }
            });

            if (status) {
                status.textContent = query || type || region || year ? "筛选结果：" + matched + " 部" : "";
            }
        }

        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var keyword = params.get("q");
            if (keyword) {
                searchInput.value = keyword;
            }
            searchInput.addEventListener("input", applyFilters);
        }

        [typeSelect, regionSelect, yearSelect].forEach(function (node) {
            if (node) {
                node.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    });
})();
