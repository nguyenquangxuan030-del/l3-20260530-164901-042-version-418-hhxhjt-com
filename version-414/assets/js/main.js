(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
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

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    var reset = document.querySelector("[data-filter-reset]");
    var count = document.querySelector("[data-filter-count]");
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));

    if (input && list) {
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilter() {
        var keyword = normalize(input.value);
        var visible = 0;
        var selectedValues = selects.map(function (select) {
          return normalize(select.value);
        }).filter(Boolean);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.textContent
          ].join(" "));
          var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
          var selectedMatched = selectedValues.every(function (value) {
            return haystack.indexOf(value) !== -1;
          });
          var matched = keywordMatched && selectedMatched;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + " 部内容";
        }
      }

      input.addEventListener("input", applyFilter);
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilter);
      });

      if (reset) {
        reset.addEventListener("click", function () {
          input.value = "";
          selects.forEach(function (select) {
            select.value = "";
          });
          applyFilter();
          input.focus();
        });
      }

      applyFilter();
    }
  });
})();
