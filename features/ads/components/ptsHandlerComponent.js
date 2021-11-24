var PtsHandlerComponent = function () {

    this.ptsStartEventTimeCheck = function (pts, payloadEvent, callback) {
        if (mediaSyncManager.getCurrentTime() != null) {
            //pts=mediaSyncManager.getCurrentTime() + 30 * 1000;//test purpose only
            logManager.log("ptsStartEventTimeCheck - currentTime: " + mediaSyncManager.getCurrentTime() + " - PTS check starting in " + (pts - mediaSyncManager.getCurrentTime() - adv.getConfiguration().PTS_CHECK_START_TIME - featuresManager.getFeature("ptsSpotModeSwitchInDurationFineTuning")) + "Ms.");
            setTimeout(function () {
                var ptsCheckPoll = setInterval(function () {
                    var currentTime = mediaSyncManager.getCurrentTime();
                    logManager.log("MediaSynchroniser.currentTime = " + currentTime + " - Event PTS time = " + pts + " - Time difference = " + (Math.abs(pts - currentTime ) - featuresManager.getFeature("ptsSpotModeSwitchInDurationFineTuning")));
                    if (pts - currentTime - featuresManager.getFeature("ptsSpotModeSwitchInDurationFineTuning") + adv.getConfiguration().PTS_CHECK_TOLERANCE < 0) {
                        logManager.warning("ptsStartEventTimeCheck - payload PTS already expired. We can't go back in time Morty!");
                        window.clearInterval(ptsCheckPoll);
                    }
                    if ((Math.abs(pts - currentTime - featuresManager.getFeature("ptsSpotModeSwitchInDurationFineTuning")) <= adv.getConfiguration().PTS_CHECK_TOLERANCE)) {
                        callback(payloadEvent);
                        window.clearInterval(ptsCheckPoll);
                    }
                }, adv.getConfiguration().PTS_CHECK_INTERVAL_TIME + featuresManager.getFeature("PTSCheckIntervalFineTuning"));
            }, pts - mediaSyncManager.getCurrentTime() - adv.getConfiguration().PTS_CHECK_START_TIME - featuresManager.getFeature("ptsSpotModeSwitchInDurationFineTuning"));
        } else {
            logManager.error("ptsStartEventTimeCheck - MediaSynchroniser not available");
        }
    };
};