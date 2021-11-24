var VideoHTML5 = function (player) {

    var videoObj = null;
    var container = null;
    var self = this;
    var domId = player.getDomId();
    var networkErrorHandling = false;

    this.createHtmlObjects = function createHtmlObjects() {
        try {
            var elemDiv = $("<div id='videoContainer" + domId + "' class='fullscreenVideoBroadbandContainer hidden'></div>")[0];
            var tagVideo = $("<video id='videoBB" + domId + "' class='fullscreenVideoBroadband'></video>")[0];
            elemDiv.appendChild(tagVideo);
            document.body.appendChild(elemDiv);
            videoObj = document.getElementById("videoBB" + domId);
            container = document.getElementById("videoContainer" + domId);
            addEventsListener();
        } catch (e) {
            logManager.log("createHtmlObjects() : " + e.message);
        }

    };

    function removeHtmlObjects() {
        videoObj = null;
        container = null;
        $("#videoContainer" + domId).remove();
    }

    function addEventsListener() {
        videoObj.addEventListener('ended', onEnded);
        videoObj.addEventListener('emptied', onEmptied);
        videoObj.addEventListener('error', onError);
        videoObj.addEventListener('abort', onAbort);
        videoObj.addEventListener('play', onPlay);
        videoObj.addEventListener('seeked', onSeeked);
        videoObj.addEventListener('canplay', onCanplay);
        videoObj.addEventListener('canplaythrough', onCanplayThrough);
        videoObj.addEventListener('loadedmetadata', onLoadedmetadata);
        videoObj.addEventListener('loadstart', onLoadstart);
        videoObj.addEventListener("waiting", onWaiting);
        videoObj.addEventListener("stalled", onStalled);
        videoObj.addEventListener("suspend", onSuspended);
        videoObj.addEventListener('progress', onProgress);
        videoObj.addEventListener('pause', onPause);
        videoObj.addEventListener('playing', onPlaying);
        videoObj.addEventListener('timeupdate', onTimeupdate);
    }

    function removeEventsListener() {
        videoObj.removeEventListener('ended', onEnded);
        videoObj.removeEventListener('emptied', onEmptied);
        videoObj.removeEventListener('error', onError);
        videoObj.removeEventListener('abort', onAbort);
        videoObj.removeEventListener('play', onPlay);
        videoObj.removeEventListener('seeked', onSeeked);
        videoObj.removeEventListener('canplay', onCanplay);
        videoObj.removeEventListener('loadedmetadata', onLoadedmetadata);
        videoObj.removeEventListener('loadstart', onLoadstart);
        videoObj.removeEventListener("waiting", onWaiting);
        videoObj.removeEventListener("stalled", onStalled);
        videoObj.removeEventListener("suspend", onSuspended);
        videoObj.removeEventListener('progress', onProgress);
        videoObj.removeEventListener('pause', onPause);
        videoObj.removeEventListener('playing', onPlaying);
        videoObj.removeEventListener('timeupdate', onTimeupdate);
    }

    function onEnded() {
        logManager.log("VideoHTML5Manager - onEnded");
        clearVideo();
        player.onVideoEndVideo();
    }

    function onEmptied() {
        logManager.log("VideoHTML5Manager - onEmptied");
    }

    function onError(e) {
        try {
            networkErrorHandling = true;
            var errorMessage = "undefined";
            if (e && e.target.error) {
                switch (e.target.error.code) {
                    case 1: /* MEDIA_ERR_ABORTED */
                        errorMessage = "fetching process aborted by user";
                        break;
                    case 2: /* MEDIA_ERR_NETWORK */
                        errorMessage = "error occurred when downloading";
                        break;
                    case 3: /* = MEDIA_ERR_DECODE */
                        errorMessage = "error occurred when decoding";
                        break;
                    case 4: /* MEDIA_ERR_SRC_NOT_SUPPORTED */
                        errorMessage = "audio/video not supported";
                        break;
                }
            } else {
                errorMessage = "Error object not defined";
            }

            logManager.error("VideoHTML5Manager - " + errorMessage);

        } catch (exc) {
            logManager.error("VideoHTML5Manager - " + exc.message);
        }
        player.onVideoError();
    }

    function onAbort() {
        logManager.log("VideoHTML5Manager -  abort event triggered");
        if (!networkErrorHandling) {
            clearVideo();
            //player.onAbort();
        } else {
            logManager.log("abort event ignored because triggered by network error");
        }

    }

    function onPlay() {
        logManager.log("VideoHTML5Manager -  play event triggered");
        networkErrorHandling = false;
    }

    function onSeeked() {
        logManager.log("VideoHTML5Manager - Seeked");
        player.onSeeked();
    }

    function onCanplay() {
        player.onCanPlay();
        logManager.log("VideoHTML5Manager - canplay");
    }
    
    function onCanplayThrough() {
        logManager.log("VideoHTML5Manager - canplaythrough");
    }

    function onLoadedmetadata() {
        logManager.log("VideoHTML5Manager - loadedmetadata");
    }

    function onLoadstart() {
        logManager.log("VideoHTML5Manager - loadstart");
    }

    function onWaiting(e) {
        logManager.log("VideoHTML5Manager - " + e.type);
    }

    function onStalled(e) {
        logManager.log("VideoHTML5Manager - " + e.type);
    }

    function onSuspended(e) {
        logManager.log("VideoHTML5Manager - " + e.type);
    }

    function onProgress() {
    }

    function onPause() {
        logManager.log("VideoHTML5Manager - pause");
    }

    function onPlaying() {
        logManager.log("VideoHTML5Manager - playing ");
        player.onVideoPlayStarted();
    }

    function onTimeupdate() {
        var time;
        if (videoObj) {
            try {
                time = videoObj.currentTime;
            } catch (e) {
                logManager.warning("prop currentTime not supported");
            }
            player.onProgressVideo(time, videoObj.duration);
        } else {
            logManager.warning("videoObj not set");
        }
    }

    this.seek = function (sec) {
        try {
            if (sec > videoObj.duration) {
                // the position is not right
                return;
            } else {
                videoObj.currentTime = sec;
            }
        } catch (e) {
            logManager.log("error seeking: " + e.message);
        }
    };

    this.load = function () {
        logManager.log("VideoHTML5Manager - load()");
        videoObj.load();
    };

    this.setUrl = function setUrl(url) {
        logManager.log("VideoHTML5Manager - setURL(" + url + ")");
        try {
            if (url.match(/.mp4/)) {
                videoObj.setAttribute("type", "video/mp4");
            } else {
                videoObj.setAttribute("type", "application/dash+xml");
            }
            videoObj.src = url;
        } catch (e) {
            logManager.warning("VideoHTML5Manager - " + e.message);
        }
    };

    this.play = function (wasPaused) {
        logManager.log("VideoHTML5Manager - play()");
        try {
            container.className = container.className.replace(/\bhidden\b/g, "");
            videoObj.play();
        } catch (e) {
            logManager.warning("VideoHTML5Manager - " + e.message);
            clearVideo();
        }
    };

    this.isPlaying = function () {
        return (videoObj && !videoObj.paused); // return true/false
    };

    this.getDuration = function () {
        if (videoObj) {
            return videoObj.duration;
        } else {
            return 0;
        }
    };

    this.getCurrentTime = function () {
        if (videoObj) {
            return Math.round(videoObj.currentTime);
        } else {
            return 0;
        }
    };

    function clearVideo() {
        try {
            if (videoObj) {
                self.stop();
            }
            removeHtmlObjects();
            videoObj = null;
        } catch (e) {
            logManager.log("VideoHTML5Manager - clearVideo() - " + e.message);
        }
    }

    this.stop = function stop() {
        try {
            if (videoObj) {
                removeEventsListener();
                videoObj.pause();
                videoObj.src = "";
                try {
                    videoObj.removeAttribute("src");
                } catch (e) {
                }
                videoObj.load();
                videoObj.parentNode.removeChild(videoObj);
                videoObj = null;
            }
        } catch (e) {
            logManager.log("VideoHTML5Manager - stop() - " + e.message);
        }
    };

    this.pause = function pause() {
        logManager.log("VideoHTML5Manager -  pause()");
        try {
            videoObj.pause();
        } catch (e) {
            logManager.warning(e);
        }
    };

};
