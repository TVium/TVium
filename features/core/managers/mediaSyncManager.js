var MediaSyncManager = function () {

    var TIMELINES = [
        "urn:dvb:css:timeline:pts"
    ];

    var TIMELINE_SELECTOR;
    var initReady = false;

    var init = function () {
        TIMELINE_SELECTOR = TIMELINES[0];

        window.msync = document.getElementById("msync");
        window.vb = document.getElementById("video");

        if (window.msync === undefined || window.vb === undefined) {
            logManager.error("mediaSyncManager - Could not obtain MediaSynchroniser or v/b objects.");
            return;
        } else {
            if (window.vb.playState === 2 /* presenting */) {
                step_initMediaSync();
            } else {
                step_listenVbAndBind();
            }
        }
    };

    var step_listenVbAndBind = function () {
        try {
            if (typeof (window.vb.addEventListener) !== "function") {
                logManager.error("mediaSyncManager - video/broadcast.addEventListener() not a function");
                return;
            }

            var movedOn = false;
            if (typeof (window.vb.onPlayStateChange) != "function") {
                logManager.log("mediaSyncManager - onPlayStateChange not available");
            }

            window.vb.onPlayStateChange = vb_onPlayStateChange;

            if (typeof (window.vb.bindToCurrentChannel) !== "function") {
                logManager.error("mediaSyncManager - video/broadcast.bindToCurrentChannel() not a function");
                return;
            }

            logManager.log("mediaSyncManager - Waiting for v/b object to transition to 'presenting' state...");

        } catch (err) {
            logManager.error("mediaSyncManager - " + err);
        }
    };

    var movedOn = false;
    var vb_onPlayStateChange = function () {
        try {
            logManager.log("mediaSyncManager - video/broadcast.playState: " + vbStateToString(window.vb.playState));

            if (window.vb.playState === 2 /* presenting */ && !movedOn) {
                step_initMediaSync();
                movedOn = true;
            }
        } catch (err) {
            logManager.error("mediaSyncManager" - err);
        }
    };

    var step_initMediaSync = function () {
        try {
            if (typeof (window.msync.addEventListener) !== "function") {
                logManager.error("mediaSyncManager - MediaSynchroniser.addEventListener() not a function");
                return;
            }

            window.msync.addEventListener("error", function (e) {
                try {
                    logManager.error("mediaSyncManager - MediaSynchroniser error code: " + window.msync.lastError);
                } catch (err) {
                    logManager.error("mediaSyncManager - " + err);
                }
            });

            logManager.log("mediaSyncManager - Calling MediaSynchroniser.initMediaSynchroniser() timelineSelector=" + TIMELINE_SELECTOR);

            if (typeof (window.msync.initMediaSynchroniser) !== "function") {
                logManager.error("mediaSyncManager - MediaSynchroniser.initMediaSynchroniser() not a function. Broadcast Timecode reading not supported.");
                return;
            }

            window.msync.initMediaSynchroniser(window.vb, TIMELINE_SELECTOR);

            logManager.log("mediaSyncManager - MediaSynchroniser initialised.");
            initReady = true;

            // setInterval(function () {
            //     try {
            //         var t = window.msync.currentTime;
            //         if (typeof t == "number") {
            //             t = t.toFixed(3);
            //         } else {
            //             t = String(t);
            //         }
            //         logManager.log("mediaSyncManager - MediaSynchroniser.currentTime = " + t + " (secs)");
            //         //do stuff here
            //     } catch (err) {
            //         logManager.error("mediaSyncManager - cannot read mediaSynchroniser currentTime field, not compatible - " + err);
            //     }
            // }, 2000);

        } catch (err) {
            logManager.error(err);
        }
    };

    var getCurrentTime = function () {
        if (initReady && window.msync != null && window.msync.currentTime != null) {
            return Math.trunc(window.msync.currentTime * 1000);
        } else {
            logManager.error("mediaSyncManager not ready yet.");
            return null;
        }
    };

    var vbStateToString = function (state) {
        switch (state) {
            case 0:
                return "0 (unrealized)";
            case 1:
                return "1 (connecting)";
            case 2:
                return "2 (presenting)";
            case 3:
                return "3 (stopped)";
            default:
                return String(state) + " (unrecognised)";
        }
    };

    return {
        init: init,
        getCurrentTime: getCurrentTime
    };
};