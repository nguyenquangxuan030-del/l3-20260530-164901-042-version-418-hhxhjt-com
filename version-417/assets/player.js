(function () {
    function attachSource(video, source) {
        if (!video || !source || video.dataset.loaded === "1") {
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
            video.dataset.loaded = "1";
            return Promise.resolve();
        }
        video.src = source;
        video.dataset.loaded = "1";
        return Promise.resolve();
    }

    function setupPlayer(player) {
        var video = player.querySelector("video[data-video-url]");
        var button = player.querySelector(".player-start");
        if (!video || !button) {
            return;
        }
        var source = video.getAttribute("data-video-url");
        function play() {
            attachSource(video, source).then(function () {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            });
        }
        button.addEventListener("click", function () {
            button.classList.add("hidden");
            player.classList.add("is-loaded");
            play();
        });
        video.addEventListener("play", function () {
            player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            player.classList.remove("is-playing");
        });
        video.addEventListener("ended", function () {
            player.classList.remove("is-playing");
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("[data-player]").forEach(setupPlayer);
    });
})();
