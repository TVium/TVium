var StreamEvent = function () {
    var targeturl = null;
    var eventDefinition = {
        AdEvent: "ADEVENT",
        BinaryEvent: "BINARY_EVENT"
    };
    var self = this;
    var configuration = {};

    this.configure = function (config) {
        configuration = config;
    };

    this.getConfiguration = function () {
        return configuration;
    };

    this.initStreamEventsMethod = function() {
        logManager.log('Stream Events Listening Method init...');
        objVideo = serviceManager.getObjVideo();
        try {
            if (featuresManager.getFeature("streamEventDVBMethod")) {
                logManager.log("Adv Listening Method: streamEventDVBMethod");
                broadcastPlayStateCheck(registerStreamEventsListeners);
            } else if (featuresManager.getFeature("streamEventXMLMethod")) {
                logManager.log("Adv Listening Method: streamEventXMLMethod");
                broadcastPlayStateCheck(registerStreamEventsListeners);
            } else {
                logManager.log("Adv Listening Method: none (as per features file definition)");
            }
        } catch (e) {
            logManager.error("initStreamEventsMethod: " + e);
        }
    };

    function broadcastPlayStateCheck(callback) {
        if (objVideo) {
            if (objVideo.playState === 2) {
                logManager.log("presenting channel ready");
                // if video broadcast object is already in the presenting state add stream event listener
                callback();
            } else {
                logManager.log("presenting channel not ready, listen playstateChange");
                // if not, wait for the presenting state
                objVideo.onPlayStateChange = onPlayStateChangeCallback;
            }
        } else {
            logManager.warning("The application is broadcast dependent, try to attach to broadcast");
        }
    }

    /**
     * Listens for state changes and errors of the video broadcast object.
     *
     * If it goes to the presenting state add stream event listener.
     */
    function onPlayStateChangeCallback(state, error) {
        switch (state) {
            case 0: // unrealized
                logManager.log("state video broadcast: unrealized");
                break;
            case 1: // connecting
                logManager.log("state video broadcast: connecting");
                break;
            case 2: // presenting
                logManager.log("state video broadcast: presenting");
                self.initStreamEventsMethod();
                // remove listener of onPlayStateChangeCallback
                objVideo.onPlayStateChange = function () {
                };
                break;
            case 3: // stopped
                logManager.log("state video broadcast: stopped");
                break;
        }
    }

    function registerStreamEventsListeners() {
        try {
            targeturl = getUrlStreamEventObj();
            var e1, e2;
            if (targeturl != null) {
                logManager.log('streamEventObjectURL: ' + targeturl);
                e1 = objVideo.addStreamEventListener(targeturl, "ADEVENT", onAdEventReceived);
                logManager.log('ADEVENT Registered');
                e2 = objVideo.addStreamEventListener(targeturl, "BINARY_EVENT", onBinaryEventReceived);
                logManager.log('BINARY_EVENT Registered');
            } else {
                logManager.warning("registerEvents: Stream Events Listeners not registered, no Carousel definition for this channel");
            }
        } catch (e) {
            logManager.error("registerEvents: " + e);
        }
    }

    function unregisterStreamEventsListeners() {
        logManager.log('Stream event Unregistering...');
        try {
            if (onAdEventReceived) objVideo.removeStreamEventListener(targeturl, "ADEVENT", onAdEventReceived);
            logManager.log('ADEVENT Unregistered');
            if (onBinaryEventReceived) objVideo.removeStreamEventListener(targeturl, "BINARY_EVENT", onBinaryEventReceived);
            logManager.log('BINARY_EVENT Unregistered');
        } catch (e) {
            logManager.error('Error on Stream event Unregistered: ' + e.message);
        }
        logManager.log('Stream event Unregistered');
    }

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
                if (self.getConfiguration().STREAM_EVENT_CONFIGURATION[channelString] == null) {
                    logManager.warning('getUrlStreamEventObj - No DVB STREAM EVENT CONFIGURATION for this channel (' + channelString + ')');
                } else {
                    urlStreamEventObj = "dvb://" + channelID + "." + self.getConfiguration().STREAM_EVENT_CONFIGURATION[channelString].DVB_OBJECT_CAROUSEL_COMPONENT_TAG.toString(16) + "/" + self.getConfiguration().STREAM_EVENT_CONFIGURATION[channelString].DVB_STREAM_EVENTS_OBJECT_NAME;
                }
            }
            return urlStreamEventObj;
        } else if (featuresManager.getFeature("streamEventXMLMethod")) {
            if (serviceManager.getCurrentChannel()) {
                channelString = serviceManager.getCurrentChannel().getChannelToString();
            }
            logManager.log(self.getConfiguration().STREAM_EVENT_CONFIGURATION[channelString].XML_STREAM_EVENTS_XML_DEFINITION);
            return self.getConfiguration().STREAM_EVENT_CONFIGURATION[channelString].XML_STREAM_EVENTS_XML_DEFINITION;
        }
    }

    function onBinaryEventReceived(obj, isRetry) {
        try {
            if (obj && obj.name === eventDefinition.BinaryEvent) {
                logManager.log('onBinaryEventReceived: ' + getPrintablePayload(obj));
                if (obj.status === "error") {
                    logManager.warning("Event onBinaryEventReceived on error status, re-registering Stream Events listeners.");
                    unregisterStreamEventsListeners();
                    self.initStreamEventsMethod();
                } else if (obj.status === "trigger") {
                    logManager.log("BINARY_EVENT received");
                    var parser = new SCTE35Parser();
                    if(isRetry) {
                        logManager.log("retrying...");
                    }
                    logManager.log("parsing with BASE64");
                    var decodedObj = parser.parseFromBase64(obj.text);
                    logManager.log(JSON.stringify(decodedObj));
                    var descriptors = decodedObj.descriptors;
                    var triggeredFn = {};
                    if(descriptors && descriptors.length > 0){
                        for(var i =0; i < descriptors.length; i++){
                            logManager.log(descriptors[i].segmentation_type_id);
                            if (self.getConfiguration().TRIGGERABLE_FN_ON_SCTE35_MAP && self.getConfiguration().TRIGGERABLE_FN_ON_SCTE35_MAP[descriptors[i].segmentation_type_id] && self.getConfiguration().TRIGGERABLE_FN_ON_SCTE35_MAP[descriptors[i].segmentation_type_id].FN){
                                logManager.log("triggerable function by " + descriptors[i].segmentation_type_id + " found");
                                var params = {};
                                var attributesFilter = self.getConfiguration().TRIGGERABLE_FN_ON_SCTE35_MAP[descriptors[i].segmentation_type_id].ATTRIBUTES;
                                if(attributesFilter && attributesFilter.length > 0){
                                    for(var j=0; j < attributesFilter.length; j++){
                                        params[attributesFilter[j]] = descriptors[i][attributesFilter[j]];
                                    }
                                }
                                triggeredFn[descriptors[i].segmentation_type_id] = self.getConfiguration().TRIGGERABLE_FN_ON_SCTE35_MAP[descriptors[i].segmentation_type_id].FN(params, decodedObj);
                            }
                        }
                    } else {
                        if(!isRetry){//prevent loop
                            onBinaryEventReceived(obj,true);
                        }
                    }
                }
            } else {
                if (obj) {
                    logManager.warning('onBinaryEventReceived - wrong event Name: ' + obj.name);
                } else {
                    logManager.warning('onBinaryEventReceived - payload not defined');
                }
            }
        } catch (e) {
            logManager.error('onBinaryEventReceived - error: ' + e.message);
        }
    }

    function onAdEventReceived(obj) {
        try {
            if (obj && obj.name === eventDefinition.AdEvent) {
                logManager.log('onAdEventReceived: ' + getPrintablePayload(obj));
                if (obj.status === "error") {
                    logManager.warning("Event onAdEventReceived on error status, re-registering Stream Events listeners.");
                    unregisterStreamEventsListeners();
                    self.initStreamEventsMethod();
                } else if (obj.status === "trigger") {
                    if (obj.text) {
                        var payloadEvent = JSON.parse(obj.text);
                        if (!payloadEvent.hasOwnProperty("event_type")) {
                            //single Stream Event management
                            if(self.getConfiguration().TRIGGERABLE_FN_ON_EVENT) {
                                self.getConfiguration().TRIGGERABLE_FN_ON_EVENT(obj);
                            }
                        } else {
                            logManager.error('onAdEventReceived - Stream Event ignored.');
                        }
                    } else {
                        logManager.error('onAdEventReceived - empty payload!');
                    }
                }
            } else {
                if (obj) {
                    logManager.warning('onAdEventReceived - wrong event Name: ' + obj.name);
                } else {
                    logManager.warning('onAdEventReceived - payload not defined');
                }
            }
        } catch (e) {
            logManager.error('onAdEventReceived - error: ' + e.message);
        }
    }

    function getPrintablePayload(obj) {
        var text = "";
        try {
            var payload = JSON.stringify(obj, null, 4);
            if (payload === "{}") {
                text = "Status:" + obj.status + " - Text: " + obj.text;
            } else {
                text = payload;
            }
        } catch (e) {
        }
        return text;
    }

};