var StreamEventsHandlerComponent = function (onFiredAdEvent, onFiredBinaryEvent) {
    var targeturl = null;

    this.registerStreamEventsListeners = function () {
        try {
            targeturl = getUrlStreamEventObj();
            var e1, e2;
            if (targeturl != null) {
                logManager.log('streamEventObjectURL: ' + targeturl);
                e1 = objVideo.addStreamEventListener(targeturl, "ADEVENT", onFiredAdEvent);
                logManager.log('ADEVENT Registered');
                e2 = objVideo.addStreamEventListener(targeturl, "BINARY_EVENT", onFiredBinaryEvent);
                logManager.log('BINARY_EVENT Registered');
            } else {
                logManager.warning("registerEvents: Stream Events Listeners not registered, no Carousel definition for this channel");
            }
        } catch (e) {
            logManager.error("registerEvents: " + e);
        }
    };

    this.unregisterStreamEventsListeners = function () {
        logManager.log('Stream event Unregistering...');
        try {
            if (onFiredAdEvent) objVideo.removeStreamEventListener(targeturl, "ADEVENT", onFiredAdEvent);
            logManager.log('ADEVENT Unregistered');
            if (onFiredBinaryEvent) objVideo.removeStreamEventListener(targeturl, "BINARY_EVENT", onFiredBinaryEvent);
            logManager.log('BINARY_EVENT Unregistered');
        } catch (e) {
            logManager.error('Error on Stream event Unregistered: ' + e.message);
        }
        logManager.log('Stream event Unregistered');
    };

    function getUrlStreamEventObj() {
        var channelString = null;
        if (featuresManager.getFeature("streamEventDVBMethod")) {
            var channelID = null;
            var type = null;
            var urlStreamEventObj = null;
            try {
                var ch = objVideo.currentChannel;
                if (ch) {
                    channelID = ch.onid.toString(16) + '.' + ch.tsid.toString(16) + '.' + ch.sid.toString(16);
                    logManager.log('current channel ID(hex) = ' + channelID + ', type=' + type + ', name=' + ch.name);
                } else {
                    logManager.warning('currentChannel not defined');
                }
            } catch (e) {
                logManager.error("getUrlStreamEventObj: " + e);
                throw e;
            }
            if (serviceManager.getCurrentChannel()) {
                channelString = serviceManager.getCurrentChannel().getChannelToString();
                if (adv.getConfiguration().STREAM_EVENT_CONFIGURATION[channelString] == null) {
                    logManager.warning('getUrlStreamEventObj - No DVB STREAM EVENT CONFIGURATION for this channel (' + channelString + ')');
                } else {
                    urlStreamEventObj = "dvb://" + channelID + "." + adv.getConfiguration().STREAM_EVENT_CONFIGURATION[channelString].DVB_OBJECT_CAROUSEL_COMPONENT_TAG.toString(16) + "/" + adv.getConfiguration().STREAM_EVENT_CONFIGURATION[channelString].DVB_STREAM_EVENTS_OBJECT_NAME;
                }
            }
            return urlStreamEventObj;
        } else if (featuresManager.getFeature("streamEventXMLMethod")) {
            if (serviceManager.getCurrentChannel()) {
                channelString = serviceManager.getCurrentChannel().getChannelToString();
            }
            logManager.log(adv.getConfiguration().STREAM_EVENT_CONFIGURATION[channelString].XML_STREAM_EVENTS_XML_DEFINITION);
            return adv.getConfiguration().STREAM_EVENT_CONFIGURATION[channelString].XML_STREAM_EVENTS_XML_DEFINITION;
        }
    }
};