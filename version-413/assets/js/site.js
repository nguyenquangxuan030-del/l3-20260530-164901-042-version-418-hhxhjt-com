import { H as Hls } from "./hls.js";

function setupNavigation() {
    const button = document.querySelector(".nav-toggle");
    const menu = document.querySelector("#primary-nav");

    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
    });
}

function setupHero() {
    const root = document.querySelector("[data-hero]");

    if (!root) {
        return;
    }

    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    const prev = root.querySelector("[data-hero-prev]");
    const next = root.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = (target) => {
        if (!slides.length) {
            return;
        }

        index = (target + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    prev?.addEventListener("click", () => {
        show(index - 1);
        start();
    });

    next?.addEventListener("click", () => {
        show(index + 1);
        start();
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const target = Number(dot.getAttribute("data-hero-dot") || "0");
            show(target);
            start();
        });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
}

function setupFiltering() {
    const input = document.querySelector("[data-filter-input]");
    const list = document.querySelector("[data-filter-list]");

    if (!input || !list) {
        return;
    }

    const items = Array.from(list.querySelectorAll("[data-search]"));

    input.addEventListener("input", () => {
        const keyword = input.value.trim().toLowerCase();

        items.forEach((item) => {
            const text = item.getAttribute("data-search") || "";
            item.classList.toggle("is-hidden", Boolean(keyword) && !text.includes(keyword));
        });
    });
}

function setupHlsPlayers() {
    const shells = Array.from(document.querySelectorAll("[data-hls-player]"));

    shells.forEach((shell) => {
        const video = shell.querySelector("video");
        const trigger = shell.querySelector(".player-cover");

        if (!video) {
            return;
        }

        const source = video.getAttribute("data-src");
        let hls = null;

        const attachSource = () => {
            if (!source || video.dataset.loaded === "true") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            video.dataset.loaded = "true";
        };

        const play = () => {
            attachSource();
            shell.classList.add("is-playing");
            const attempt = video.play();

            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(() => {
                    shell.classList.remove("is-playing");
                    video.setAttribute("controls", "controls");
                });
            }
        };

        trigger?.addEventListener("click", play);
        video.addEventListener("play", () => shell.classList.add("is-playing"));
        video.addEventListener("pause", () => {
            if (video.currentTime === 0 || video.ended) {
                shell.classList.remove("is-playing");
            }
        });
        video.addEventListener("ended", () => shell.classList.remove("is-playing"));
        video.addEventListener("error", () => {
            shell.classList.remove("is-playing");
        });

        shell.addEventListener("remove", () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupHero();
    setupFiltering();
    setupHlsPlayers();
});
