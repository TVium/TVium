var PlayerADS = function (fnOnEndVideo, sequenceId) {

    var video = null;
    var videoUrl = null;
    var self = this;
    var canPlay = false;
    var domId = sequenceId || '';

    this.setUrl = function (url, forcePreload) {
        videoUrl = url;
        video = new VideoHTML5(self);
        logManager.log("HTML5 player");
        video.createHtmlObjects();
        video.setUrl(videoUrl);
        if (forcePreload) {
            video.load();
        }
    };

    this.onVideoPlayStarted = function () {
    };

    this.onVideoError = function onVideoError() {
    };

    this.onVideoEndVideo = function onVideoEndVideo() {
        if (featuresManager.getFeature("numberOfVideoDecoders") !== 2) {
           serviceManager.startBroadcast();
        }
        fnOnEndVideo();
    };

    this.onProgressVideo = function (time, duration) {
    };

    this.onSeeked = function () {
    };

    this.onCanPlay = function () {
        canPlay = true;
    }

    this.play = function () {
        logManager.log("PlayerADS - play() ");
        if(video) {
            if (featuresManager.getFeature("numberOfVideoDecoders") !== 2) {
                serviceManager.stopBroadcast();
            }
            video.play();
        } else {
            logManager.log("skipping play() - video player not initialized yet (probably due to prefetch not completed)");
        }
    };

    this.isPlaying = function () {
        return video.isPlaying();
    };

    this.stop = function () {
        video.stop();
        video = null;
        self.onVideoEndVideo();
    };

    this.canPlay = function () {
        if(videoUrl && videoUrl.indexOf("http") == 0){
            return canPlay;
        }else{
            return false;
        }
    }

    this.getDomId = function () {
        return domId;
    };
};
