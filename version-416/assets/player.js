(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var url = window.__player_url || "";
        var video = document.getElementById("main-player");
        var cover = document.getElementById("watch-cover");
        var hlsInstance = null;
        var prepared = false;
        var wantsPlay = false;

        function playVideo() {
            if (!video || !video.play) {
                return;
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        function bindHlsObject(HlsObject) {
            hlsInstance = new HlsObject({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(HlsObject.Events.MANIFEST_PARSED, function () {
                if (wantsPlay) {
                    playVideo();
                }
            });
        }

        function attachHls() {
            if (!video || !url || prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                if (wantsPlay) {
                    playVideo();
                }
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                bindHlsObject(window.Hls);
                return;
            }

            var loader = document.createElement("script");
            loader.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
            loader.onload = function () {
                if (window.Hls && window.Hls.isSupported()) {
                    bindHlsObject(window.Hls);
                } else {
                    video.src = url;
                    if (wantsPlay) {
                        playVideo();
                    }
                }
            };
            loader.onerror = function () {
                video.src = url;
                if (wantsPlay) {
                    playVideo();
                }
            };
            document.head.appendChild(loader);
        }

        function startPlay() {
            wantsPlay = true;
            attachHls();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            if (prepared && video && video.src) {
                playVideo();
            }
        }

        if (cover) {
            cover.addEventListener("click", startPlay);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!prepared) {
                    startPlay();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    });
})();
