var Adv = function () {
    var self = this;
    var advHashmap = new AdvHashmap();
    var request = new AdvRequests();
    var breakTimer;
    var dictionary = {};
    var eventDefinition = {
        AdEvent: "ADEVENT",
        BinaryEvent: "BINARY_EVENT"
    };
    this.streamEventsHandlerComponent = new StreamEventsHandlerComponent(onAdEventReceived, onBinaryEventReceived);
    this.ptsHandlerComponent = new PtsHandlerComponent();

    this.callAdServerRoundTripTime = 0;

    var configuration = {};

    function configure(config) {
        configuration = config;
    };

    function getConfiguration() {
        return configuration;
    };

    function initStreamEventsMethod() {
        logManager.log('Stream Events Listening Method init...');
        objVideo = serviceManager.getObjVideo();
        try {
            if (featuresManager.getFeature("streamEventDVBMethod")) {
                logManager.log("Adv Listening Method: streamEventDVBMethod");
                broadcastPlayStateCheck(self.streamEventsHandlerComponent.registerStreamEventsListeners);
            } else if (featuresManager.getFeature("streamEventXMLMethod")) {
                logManager.log("Adv Listening Method: streamEventXMLMethod");
                broadcastPlayStateCheck(self.streamEventsHandlerComponent.registerStreamEventsListeners);
            } else {
                logManager.log("Adv Listening Method: none (as per features file definition)");
            }
        } catch (e) {
            logManager.error("initStreamEventsMethod: " + e);
        }
    }

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
                initStreamEventsMethod();
                // remove listener of onPlayStateChangeCallback
                objVideo.onPlayStateChange = function () {
                };
                break;
            case 3: // stopped
                logManager.log("state video broadcast: stopped");
                break;
        }
    }

    function onAdEventReceived(obj) {
        try {
            if (obj && obj.name === eventDefinition.AdEvent) {
                logManager.log('onAdEventReceived: ' + getPrintablePayload(obj));
                if (obj.status === "error") {
                    logManager.warning("Event onAdEventReceived on error status, re-registering Stream Events listeners.");
                    self.streamEventsHandlerComponent.unregisterStreamEventsListeners();
                    initStreamEventsMethod();
                } else if (obj.status === "trigger") {
                    if (obj.text) {
                        var payloadEvent = JSON.parse(obj.text);
                        if (!payloadEvent.hasOwnProperty("event_type")) {
                            //single Stream Event management
                            if (self.getConfiguration().AD_SUBSTITUTION_METHOD === "spot") {
                                startEventProcess(obj.text);
                            } else if (self.getConfiguration().AD_SUBSTITUTION_METHOD === "break") {
                                callAdServerProcess(obj.text, null);
                            } else {
                                logManager.warning("onAdEventReceived - No SpotMode or BreakMode set in the configuration.");
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

    function onBinaryEventReceived(obj, isRetry) {
        try {
            if (obj && obj.name === eventDefinition.BinaryEvent) {
                logManager.log('onBinaryEventReceived: ' + getPrintablePayload(obj));
                if (obj.status === "error") {
                    logManager.warning("Event onBinaryEventReceived on error status, re-registering Stream Events listeners.");
                    this.streamEventsHandlerComponent.unregisterStreamEventsListeners();
                    initStreamEventsMethod();
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
                    if(descriptors && descriptors.length > 0){
                        for(var i =0; i < descriptors.length; i++){
                            logManager.log(descriptors[i].segmentation_type_id);
                            if (self.getConfiguration().TRIGGERABLE_FN_ON_SCTE35_MAP && self.getConfiguration().TRIGGERABLE_FN_ON_SCTE35_MAP[descriptors[i].segmentation_type_id] && self.getConfiguration().TRIGGERABLE_FN_ON_SCTE35_MAP[descriptors[i].segmentation_type_id].FN){
                                logManager.log("triggerable function by " + descriptors[i].segmentation_type_id + " found");
                                var params = {};
                                var attributesFilter = self.getConfiguration().TRIGGERABLE_FN_MAP[descriptors[i].segmentation_type_id].ATTRIBUTES;
                                if(attributesFilter && attributesFilter.length > 0){
                                    for(var j=0; j < attributesFilter.length; j++){
                                        params[attributesFilter[j]] = descriptors[i][attributesFilter[j]];
                                    }
                                }
                                self.getConfiguration().TRIGGERABLE_FN_MAP[descriptors[i].segmentation_type_id].FN(params, decodedObj);
                                break;
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

    function startEventProcess(objString) {
        //
        //Example event payload:
        // {
        //  "LOADdata":
        //    {
        //      "dai_version":"1.0",
        //      "channel":"33a1",
        //      "break_code":"1430",
        //      "triplet":"65535.6.1537",
        //      "break_duration":"291320"
        //    },
        //  "STARTdata":
        //    {
        //      "break_code":"1430",
        //      "sequence":1,
        //      "duration":30000,
        //      "triplet":"65535.6.1537",
        //      "pts":45023032
        //    }
        // }
        try {
            var payloadEvent = JSON.parse(objString);
            if (payloadEvent.STARTdata.triplet !== serviceManager.getCurrentChannel().getChannelToString()) { //Triplet match check
                logManager.warning('startEventProcess - event triplet (' + payloadEvent.STARTdata.triplet + ') not corresponding to current channel\'s triplet (' + serviceManager.getCurrentChannel().getChannelToString() + ')');
                return;
            }
            if (!advHashmap.getValue(payloadEvent.STARTdata.break_code)) {
                //If this event's break_code is not in the dictionary yet, callAdServer is triggered.
                if (self.getConfiguration().CALL_ADSERVER_FALLBACK_ON_STARTEVENT && self.getConfiguration().AD_SUBSTITUTION_METHOD === 'spot') {
                    logManager.log('startEventProcess - break_code not found in dictionary: triggering callAdServer.');
                    callAdServerProcess(objString, function () {
                        //Going back to the START tracking after the callAdServer fallback.
                        startEventProcessPostValidation(objString);
                    });
                } else {
                    logManager.warning('startEventProcess - break code not found in dictionary.');
                }
            } else {
                startEventProcessPostValidation(objString);
            }
        } catch (e) {
            logManager.error('startEventProcess - error: ' + e.message);
        }
    }

    function callAdServerProcess(objString, resumeStartFallbackCallback) {
        try {
            if (featuresManager.getFeature("linearAdTracking") == null || featuresManager.getFeature("linearAdTracking") !== true) {
                logManager.warning('callAdServerProcess - linearAdTracking feature is not true');
                return;
            }
            if (consent && (consent.getModel() == null || consent.getModelConsents().TRACKING.consentStatus !== true)) { //Check TRACKING user consent status (Mandatory)
                logManager.warning('callAdServerProcess - user consent not given to TRACKING');
                return;
            }
            var payloadEvent = JSON.parse(objString);
            if (Object.keys(dictionary).length !== 0 && self.getConfiguration().AD_SUBSTITUTION_METHOD === 'break') {
                logManager.warning("callAdServerProcess - Discarding Event: Break tracking already in progress.");
                return;
            }
            if (payloadEvent.LOADdata.triplet !== serviceManager.getCurrentChannel().getChannelToString()) { //Triplet match check
                logManager.warning('callAdServerProcess - event triplet (' + payloadEvent.LOADdata.triplet + ') not corresponding to current channel\'s triplet (' + serviceManager.getCurrentChannel().getChannelToString() + ')');
                return;
            }
            if (advHashmap.isAdvIDExists(payloadEvent.LOADdata.break_code)) { //Check if there's already an entry with the same break code in the advHashmap
                logManager.warning('callAdServerProcess - break code already loaded');
                return;
            }
            advHashmap.initialize(payloadEvent.LOADdata.break_code);
            // advID never received yet => we continue to manage the id
            advHashmap.setStatus(payloadEvent.LOADdata.break_code, advHashmap.lstStatus.LOADING);
            if (consent && consent.getModel() == null) {
                logManager.warning("callAdServerProcess - getWizadsData() the tvId is not retrived yet");
                return;
            }
            if (payloadEvent.LOADdata.channel) { // workaround to force channel uppercase - quicker than fix it on BEN
                payloadEvent.LOADdata.channel = payloadEvent.LOADdata.channel.toUpperCase();
            }
            var tvID = consent ? consent.getModel().tvId : "";
            var transactionID = tvID + (new Date()).getTime(); //random number
            var daiVersion = payloadEvent.LOADdata.dai_version;
            var channel = payloadEvent.LOADdata.channel;
            var breakCode = payloadEvent.LOADdata.break_code;
            var breakDay = payloadEvent.LOADdata.bday || "";
            var breakduration = payloadEvent.LOADdata.break_duration;
            var platform = core.getPlatform().brand.toLowerCase().trim();
            var response_type = self.getConfiguration().AD_SUBSTITUTION_METHOD;
            var url = self.getConfiguration().ADSERVER_URL;
            url += "?dai_version=" + daiVersion + "&transaction_id=" + transactionID + "&response_type=" + response_type + "&channel=" + channel + "&break_code=" + breakCode +
                "&break_day=" + breakDay + "&break_duration=" + breakduration + "&advertising_id=" + tvID + "&platform=" + platform + "&context=live&current_spot=0";
            var roundTripStart = Date.now();
            request.getWizadsData(url,
                function (data) { //This call is asynchronous, later the app checks if it's data is successfully retrieved.
                    self.callAdServerRoundTripTime = Date.now() - roundTripStart;
                    if (Object.keys(data).length === 0) {
                        logManager.log("callAdServerProcess - VAST file is an empty object.");
                        return;
                    }
                    createDictionary(payloadEvent.LOADdata.break_code, data);
                    //Save dictionary on queue
                    advHashmap.setValue(payloadEvent.LOADdata.break_code, dictionary, advHashmap.type.STREAMEVENT);
                    advHashmap.setStatus(payloadEvent.LOADdata.break_code, advHashmap.lstStatus.LOADED);

                    if (resumeStartFallbackCallback != null) {
                        resumeStartFallbackCallback();
                    }

                    if (self.getConfiguration().AD_SUBSTITUTION_METHOD === 'break') {
                        breakTracking(payloadEvent);
                    }
                }, function (error) {
                    clearAdv(payloadEvent.LOADdata.break_code);
                    logManager.error("getWizadsData() KO Response");
                });
        } catch (e) {
            logManager.error('callAdServerProcess - error: ' + e.message);
        }
    }

    function startEventProcessPostValidation(objString) {
        var payloadEvent = JSON.parse(objString);
        var currentAdv = advHashmap.getValue(payloadEvent.STARTdata.break_code);
        if (currentAdv.status !== advHashmap.lstStatus.LOADED && currentAdv.status !== advHashmap.lstStatus.STARTED) {
            logManager.warning('startEventProcess - incorrect status : ' + currentAdv.status);
            return;
        }
        advHashmap.setStatus(payloadEvent.STARTdata.break_code, advHashmap.lstStatus.STARTED);
        if (!dictionary.spots.hasOwnProperty(payloadEvent.STARTdata.sequence)) { //Check if requested sequence is available in the Dictionary
            logManager.warning('startEventProcess - sequence not found: ' + payloadEvent.STARTdata.sequence);
            return;
        }
        logManager.log("startEventProcessPostValidation - Event payload: " + objString);
        if (payloadEvent.STARTdata.duration !== dictionary.spots[payloadEvent.STARTdata.sequence].duration) { //Spot Duration check
            logManager.warning('startEventProcess - spot duration in Stream Event payload (' + payloadEvent.STARTdata.duration + ') not matching the VAST duration for this spot (' + dictionary.spots[payloadEvent.STARTdata.sequence].duration + ')');
            return;
        }
        switch (self.getConfiguration().AD_SUBSTITUTION_METHOD) { //Replacement mode switch
            case "spot":
                if (featuresManager.getFeature("PTSMethod")) {
                    self.ptsHandlerComponent.ptsStartEventTimeCheck(payloadEvent, startEventCoreProcess); //In spot mode the LOAD event is triggered as soon as it is received, and then Ad Starts are triggered using their PTS
                } else {
                    logManager.warning('startEventProcess - no PTS or Delay method for this client in the feature file.');
                }
                break;
            case "break":
                startEventCoreProcess(payloadEvent);
                break;
            default:
                logManager.warning('startEventProcess - no "break" or "spot" mode enabled.');
                break;
        }
    }

    function createDictionary(break_code, data) {
        try {
            /*jshint ignore:start*/
            dictionary = {};
            logManager.log("createDictionary() - Creating dictionary");
            var arrayAds = data.Ads;
            if (arrayAds.length > 0) {
                dictionary.id = break_code;
                logManager.log("createDictionary() - dictionary.id: " + dictionary.id);
                dictionary.spots = [];
                for (var i = 0; i < arrayAds.length; i++) {
                    dictionary.spots[parseInt(arrayAds[i].Sequence)] = createDictionaryItems(arrayAds[i]);
                    logManager.log('createDictionary() - dictionary.spots[' + (parseInt(arrayAds[i].Sequence)) + '] tracking items loaded');
                }
            } else {
                logManager.log("createDictionary() - no Ads found in VAST file.");
            }
            /*jshint ignore:end*/
        } catch (e) {
            logManager.error("createDictionary: " + e);
        }
    }

    function createDictionaryItems(arrayAd) {
        var item;
        item = createTrackingItemsForDictionary(arrayAd);
        /*jshint ignore:start*/
        item['companionAd'] = createCompanionAdForDictionary(arrayAd);
        /*jshint ignore:end*/
        return item;
    }

    function createTrackingItemsForDictionary(currentAD) {
        try {
            var item = {};
            /*jshint ignore:start*/
            var durationHms = currentAD.InLine.Creatives[0].Linear.Duration;
            //var durationArray = durationHms.split(':');
            //item["duration"] = (+durationArray[0]) * 60 * 60 + (+durationArray[1]) * 60 + (+durationArray[2]) * 1000;
            item["duration"] = (+durationHms) * 1000;
            item["tracking"] = {};
            var trackingNodes = currentAD.InLine.Creatives[0].Linear.TrackingEvents;
            item.tracking["impression"] = currentAD.InLine.Impressions[0].Data.trim();
            /*jshint ignore:end*/
            for (var i = 0; i < trackingNodes.length; i++) {
                /*jshint ignore:start*/
                switch (trackingNodes[i].Event) {
                    case "firstQuartile":
                        item.tracking["firstQuartile"] = trackingNodes[i].Data.trim();
                        break;
                    case "midpoint":
                        item.tracking["midpoint"] = trackingNodes[i].Data.trim();
                        break;
                    case "thirdQuartile":
                        item.tracking["thirdQuartile"] = trackingNodes[i].Data.trim();
                        break;
                    case "complete":
                        item.tracking["complete"] = trackingNodes[i].Data.trim();
                        break;
                }
                /*jshint ignore:end*/
            }
            var mediaFileUrl = currentAD.InLine.Creatives[0].Linear.MediaFiles[0].Data.trim();
            /*jshint ignore:start*/
            item["media_file_url"] = mediaFileUrl;
            /*jshint ignore:end*/
            //Type is "ADDRESSED" by default.
            /*jshint ignore:start*/
            item["media_file_type"] = "addressed";
            /*jshint ignore:end*/
            if (mediaFileUrl.indexOf("broadcasted") !== -1) {
                /*jshint ignore:start*/
                item["media_file_type"] = "broadcasted";
                /*jshint ignore:end*/
            }
            return item;
        } catch (e) {
            logManager.error("createTrackingItemsForDictionary: " + e);
        }
    }

    function createCompanionAdForDictionary(currentAD) {
        try {
            var item = {};
            /*jshint ignore:start*/
            if (currentAD.InLine.Creatives[0].CompanionAds != null) {
                item = currentAD.InLine.Creatives[0].CompanionAds;
            }
            /*jshint ignore:end*/
            return item;
        } catch (e) {
            logManager.error("createCompanionAdForDictionary: " + e);
        }
    }

    function startEventCoreProcess(payloadEvent) {
        var currentAdv = advHashmap.getValue(payloadEvent.STARTdata.break_code);
        if (!currentAdv) {
            logManager.warning('startEventCoreProcess - break code not found');
            return;
        }
        //not needed anymore - if Tracking consent status is not true, ad server call is not performed and this check will not be done
        if (consent && (consent.getModel() == null || consent.getModelConsents().TRACKING.consentStatus !== true)) { //Check TRACKING user consent status (Mandatory for all next steps)
            logManager.warning('startEventCoreProcess - user consent not given to TRACKING');
            removeSpotFromDictionary(payloadEvent.STARTdata.break_code, payloadEvent.STARTdata.sequence);
        } else { // check if linearAdTracking is true - mandatory to perform tracking
            if (featuresManager.getFeature("linearAdTracking") && featuresManager.getFeature("linearAdTracking") === true) {
                scheduleSpotTracking(payloadEvent);
            }
        }
    }

    function breakTracking(payloadEvent) {
        var sequenceCounter = payloadEvent.STARTdata.sequence;

        function breakTimerCallback() {
            logManager.log("breakTracking - Processing break[" + payloadEvent.LOADdata.break_code + "] - Sequence[" + sequenceCounter + "] started");
            var startPayload = {
                "LOADdata": payloadEvent.LOADdata,
                "STARTdata": {
                    "break_code": payloadEvent.STARTdata.break_code,
                    "sequence": sequenceCounter,
                    "triplet": payloadEvent.STARTdata.triplet,
                    "duration": dictionary.spots[sequenceCounter].duration, //Needed to perform the Spot duration check without a true Start event.
                    "pts": 0
                }
            };
            if (dictionary.spots[sequenceCounter + 1] != null) {
                //Recursive timeout to schedule the tracking of the all spots in the dictionary
                window.setTimeout(breakTimerCallback, dictionary.spots[sequenceCounter].duration + self.getConfiguration().BLACK_FRAMES_DURATION_AFTER_SPOT);
            }
            startEventProcess(JSON.stringify(startPayload));

            sequenceCounter++;
        }

        //Using PTS in order to trigger the first START. Subsequent ones are chained based on their durations.
        if (featuresManager.getFeature("PTSMethod")) {
            logManager.warning('breakTracking - Waiting first START PTS time in order to start tracking queue.');
            self.ptsHandlerComponent.ptsStartEventTimeCheck(payloadEvent, breakTimerCallback);
        } else {
            logManager.warning('breakTracking - no PTS or Delay method for this client in the feature file. Queuing starts immediately.');
            breakTimerCallback();
        }
    }

    function scheduleSpotTracking(payloadEvent) {
        try {
            if (dictionary != null && Object.keys(dictionary).length > 0 && payloadEvent.STARTdata.sequence != null && dictionary.id === payloadEvent.STARTdata.break_code) {
                /*jshint ignore:start*/
                var timeInterval = dictionary.spots[payloadEvent.STARTdata.sequence].duration / 4;
                var quartileCounter = 0;
                injectTrackingPixel(dictionary.spots[payloadEvent.STARTdata.sequence].tracking["impression"], "impression", payloadEvent.STARTdata.sequence);
                breakTimer = window.setInterval(function () {
                    quartileCounter++;
                    switch (quartileCounter) {
                        case 1:
                            injectTrackingPixel(dictionary.spots[payloadEvent.STARTdata.sequence].tracking["firstQuartile"], "firstQuartile", payloadEvent.STARTdata.sequence);
                            break;
                        case 2:
                            injectTrackingPixel(dictionary.spots[payloadEvent.STARTdata.sequence].tracking["midpoint"], "midpoint", payloadEvent.STARTdata.sequence);
                            break;
                        case 3:
                            injectTrackingPixel(dictionary.spots[payloadEvent.STARTdata.sequence].tracking["thirdQuartile"], "thirdQuartile", payloadEvent.STARTdata.sequence);
                            break;
                        case 4:
                            endProcedure(payloadEvent);
                            break;
                    }
                }, timeInterval);
                /*jshint ignore:end*/
            } else {
                logManager.warning('scheduleSpotTracking - empty dictionary');
            }
        } catch (e) {
            logManager.error("scheduleSpotTracking: " + e);
            removeSpotFromDictionary(payloadEvent.STARTdata.break_code, payloadEvent.STARTdata.sequence);
        }
    }

    function injectTrackingPixel(url, name, sequenceNumber) {
        if(trace){
            trace.injectTrackingPixel(url);
        }
        if (self.getConfiguration().VISIBLE_AD_TRACKING) {// ENABLE FOR DEBUG ONLY
            switch (name) {
                case 'impression':
                case 'complete':
                    trackingPopup(name, url, sequenceNumber);
                    break;
            }
        }
        logManager.log("Sequence[" + sequenceNumber + "] - " + name + " pixel image loaded - " + escapeXml(url));
    }

    function trackingPopup(name, url, sequenceNumber) {
        var container = $(".trackingPopupContainer");
        var top = "5%";
        if (container.length >= 1) {
            top = "50%";
        }
        var $trackPopup = $("<div class='trackingPopupContainer' style='position:absolute; top:" + top + "; left:65px; width: 50%; padding:5px; z-index: 9999; background-color:rgba(255,255,255,0.7); color:#000; border:1px solid #000; word-break: break-all;'><b>Sequence: </b>" + sequenceNumber + "<br /><b>Tracking: </b>" + $.camelCase(name) + "<br /><b>URL: </b> " + escapeXml(url) + "</div>");
        $(".tvium-container").append($trackPopup);

        window.setTimeout(function () {
            $trackPopup.remove();
        }, 3000);
    }

    function endProcedure(payloadEvent) {
        /*jshint ignore:start*/
        injectTrackingPixel(dictionary.spots[payloadEvent.STARTdata.sequence].tracking["complete"], "complete", payloadEvent.STARTdata.sequence);
        /*jshint ignore:end*/
        if (breakTimer) {
            window.clearInterval(breakTimer);
        }
        removeSpotFromDictionary(payloadEvent.STARTdata.break_code, payloadEvent.STARTdata.sequence);
        logManager.log("Adv pixel tracking schedulation ended.");
    }

    function removeSpotFromDictionary(advID, sequence) {
        if (dictionary.spots.hasOwnProperty(sequence)) {
            delete dictionary.spots[sequence];
            if (Object.keys(dictionary.spots).length === 0) {
                //No spots
                resetBreak(advID);
                logManager.log("All spots of the break has been removed!");
            }
        } else {
            logManager.warning('removeSpotFromDictionary - ' + sequence + " not found");
        }
    }

    function resetBreak(advID) {
        clearAdv(advID);
        advHashmap.clearLst();
        dictionary = {};
    }

    function clearAdv(advID) {
        if (advHashmap.isAdvIDExists(advID)) {
            advHashmap.setStatus(advID, advHashmap.lstStatus.STOP);
            advHashmap.deleteAdv(advID);
        } else {
            logManager.warning('clearAdv - event ID not found');
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

    return {
        configure: configure,
        getConfiguration: getConfiguration,
        initStreamEventsMethod: initStreamEventsMethod,
        onAdEventReceived: onAdEventReceived,
        callAdServerProcess: callAdServerProcess,
        startProcess: startEventProcess,
        registerStreamEventsListeners: this.streamEventsHandlerComponent.registerStreamEventsListeners,
        unregisterStreamEventsListeners: this.streamEventsHandlerComponent.unregisterStreamEventsListeners
    };
};

var AdvHashmap = function () {
    var lstAdv = {
        status: null,
        dictionary: null
    };
    var advIDStarted = null;
    var lstStatus = {
        LOADING: "LOADING",
        LOADED: "LOADED",
        STARTING: "STARTING",
        STARTED: "STARTED",
        STOP: "STOP"
    };

    var type = {
        STREAMEVENT: "STREAMEVENT"
    };

    function deleteAdv(advID) {
        delete lstAdv[advID];
        logManager.log('deleteAdv -  Adv Deleted!');
    }

    function clearLst() {
        lstAdv = {};
        advIDStarted = null;
    }

    function initialize(advID) {
        lstAdv[advID.toString()] = {
            status: null,
            dictionary: null
        };
    }

    function setValue(advID, obj, type) {
        /*jshint ignore:start*/
        if (!isAdvIDExists(advID)) {
            lstAdv[advID] = {};
        }
        lstAdv[advID]["dictionary"] = obj;
        lstAdv[advID]["type"] = type;
        /*jshint ignore:end*/
    }

    function getValue(advID) {
        if (isAdvIDExists(advID)) {
            return lstAdv[advID];
        } else {
            return null;
        }

    }

    function isAdvIDExists(advID) {
        return advID in lstAdv;
    }

    function setStatus(advID, status) {
        if (isAdvIDExists(advID)) {
            /*jshint ignore:start*/
            lstAdv[advID]["status"] = status;
            /*jshint ignore:end*/
            if (status == lstStatus.STARTING) {
                advIDStarted = advID;
            } else if (status == lstStatus.STOP) {
                advIDStarted = null;
                logManager.log('Status: ' + status);
            }
        } else {
            logManager.warning('Adv ID not found: ' + advID);
        }
    }

    function lstAdvIsEmpty() {
        return Object.keys(lstAdv).length == 0 || Object.keys(lstAdv).length == 0;
    }

    function isAdvAlreadyStarted() {
        return advIDStarted != null;
    }

    return {
        deleteAdv: deleteAdv,
        initialize: initialize,
        setValue: setValue,
        getValue: getValue,
        setStatus: setStatus,
        isAdvIDExists: isAdvIDExists,
        isAdvAlreadyStarted: isAdvAlreadyStarted,
        lstStatus: lstStatus,
        type: type,
        clearLst: clearLst,
        lstAdvIsEmpty: lstAdvIsEmpty
    };
};

var PtsHandlerComponent = function () {

    this.ptsStartEventTimeCheck = function (payloadEvent, callback) {
        if (mediaSyncManager.getCurrentTime() != null) {
            logManager.log("ptsStartEventTimeCheck - currentTime: " + mediaSyncManager.getCurrentTime() + " - PTS check starting in " + (payloadEvent.STARTdata.pts - mediaSyncManager.getCurrentTime() - adv.getConfiguration().PTS_CHECK_START_TIME - featuresManager.getFeature("ptsSpotModeSwitchInDurationFineTuning")) + "Ms.");
            setTimeout(function () {
                var ptsCheckPoll = setInterval(function () {
                    var currentTime = mediaSyncManager.getCurrentTime();
                    logManager.log("MediaSynchroniser.currentTime = " + currentTime + " - Event PTS time = " + payloadEvent.STARTdata.pts + " - Time difference = " + (Math.abs(payloadEvent.STARTdata.pts - currentTime ) - featuresManager.getFeature("ptsSpotModeSwitchInDurationFineTuning")));
                    if (payloadEvent.STARTdata.pts - currentTime - featuresManager.getFeature("ptsSpotModeSwitchInDurationFineTuning") + adv.getConfiguration().PTS_CHECK_TOLERANCE < 0) {
                        logManager.warning("ptsStartEventTimeCheck - payload PTS already expired. We can't go back in time Morty!");
                        window.clearInterval(ptsCheckPoll);
                    }
                    if ((Math.abs(payloadEvent.STARTdata.pts - currentTime - featuresManager.getFeature("ptsSpotModeSwitchInDurationFineTuning")) <= adv.getConfiguration().PTS_CHECK_TOLERANCE)) {
                        callback(payloadEvent);
                        window.clearInterval(ptsCheckPoll);
                    }
                }, adv.getConfiguration().PTS_CHECK_INTERVAL_TIME + featuresManager.getFeature("PTSCheckIntervalFineTuning"));
            }, payloadEvent.STARTdata.pts - mediaSyncManager.getCurrentTime() - adv.getConfiguration().PTS_CHECK_START_TIME - featuresManager.getFeature("ptsSpotModeSwitchInDurationFineTuning"));
        } else {
            logManager.error("ptsStartEventTimeCheck - MediaSynchroniser not available");
        }
    };
};
/**
 * Reference:
 1. SCTE-35 spec: http://www.scte.org/SCTEDocs/Standards/SCTE%2035%202016.pdf
 **/
function SCTE35Parser() {

    this.init = function() {
        this.scte35_bitarray = new Array();
        this.spliceInfo = {};
    }

    function base64toHEX(base64) {
        var raw = atob(base64);
        var HEX = '';
        for (i = 0; i < raw.length; i++) {
            var _hex = raw.charCodeAt(i).toString(16)
            HEX += (_hex.length == 2 ? _hex : '0' + _hex);
        }
        return HEX;
    }

    this.parseFromBase64 = function(data) {
        this.init();
        var raw = window.atob(data);
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));

        for(var i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
            this.writeToBitArray(array[i]);
        }
        this.parse();
        return this.spliceInfo;
    }

    this.parseFromHex = function(data) {
        this.init();
        if (!data || data.length < 0) {
            return 'no data';
        }
        for (var i = 0; i < data.length; i+=2) {
            var d = parseInt('0x' + data[i] + data[i+1]);
            this.writeToBitArray(parseInt(data[i] + data[i+1], 16));
        }
        this.parse();
        return this.spliceInfo;
    }

    this.parse = function() {
        var table_id = this.read(8);
        if (table_id == 0xfc) { // table_id – This is an 8-bit field. Its value shall be 0xFC for SpliceInfo.
            var spliceInfo = this.spliceInfo;
            spliceInfo.table_id = table_id;
            spliceInfo.section_syntax_indicator = this.read(1);
            spliceInfo.private_indicator = this.read(1);
            //reserved 2 bits
            this.read(2);
            spliceInfo.section_length = this.read(12);
            spliceInfo.protocol_version = this.read(8);
            spliceInfo.encrypted_packet = this.read(1);
            spliceInfo.encryption_algorithm = this.read(6);
            spliceInfo.pts_adjustment = this.read(33);
            spliceInfo.cw_index = this.read(8);
            spliceInfo.tier = this.read(12);
            spliceInfo.splice_command_length = this.read(12);

            spliceInfo.splice_command_type = this.read(8);

            if (spliceInfo.splice_command_type == 0x00) {
                this.parse_splice_null();
            } else if (spliceInfo.splice_command_type == 0x04) {
                this.parse_splice_schedule();
            } else if (spliceInfo.splice_command_type == 0x05) {
                spliceInfo.splice_command_type_text = 'splice_insert';
                this.parse_splice_insert();
            } else if (spliceInfo.splice_command_type == 0x06) {
                spliceInfo.splice_command_type_text = 'time_signal';
                this.parse_time_signal();
            } else if (spliceInfo.splice_command_type == 0x07) {
                this.bandwidth_reservation();
            } else if (spliceInfo.splice_command_type == 0x06) {
                this.parse_private_command();
            }

            spliceInfo.descriptor_loop_length = this.read(16);
            spliceInfo.descriptors = [];

            var remainingBytes = this.scte35_bitarray.length;
            for(var i = 0; i < spliceInfo.descriptor_loop_length; i++) {
                if(remainingBytes - this.scte35_bitarray.length >= spliceInfo.descriptor_loop_length*8){
                    break;
                }
                var descriptor = {};
                descriptor.splice_descriptor_tag = this.read(8);
                descriptor.descriptor_length = this.read(8);
                descriptor.identifier = this.read(32);
                if(descriptor.identifier == 0x43554549) {
                    switch (descriptor.splice_descriptor_tag) {
                        case 0://Avail Descriptor
                            break;
                        case 1://DTMF Descriptor
                            break;
                        case 2://Segmentation Descriptor
                            descriptor.segmentation_event_id = this.read(32);
                            descriptor.segmentation_event_cancel_indicator = this.read(1);
                            descriptor.reserved = this.read(7);
                            if (descriptor.segmentation_event_cancel_indicator == "0") {
                                descriptor.program_segmentation_flag = this.read(1);
                                descriptor.segmentation_duration_flag = this.read(1);
                                descriptor.delivery_not_restricted_flag = this.read(1);
                                if (descriptor.delivery_not_restricted_flag == "0") {
                                    descriptor.web_delivery_allowed_flag = this.read(1);
                                    descriptor.no_regional_blackout_flag = this.read(1);
                                    descriptor.archive_allowed_flag = this.read(1);
                                    descriptor.device_restrictions = this.read(2);
                                } else {
                                    descriptor.reserved = this.read(5);
                                }
                                if (descriptor.program_segmentation_flag == "0") {
                                    descriptor.component_count = this.read(8);
                                    descriptor.components = [];
                                    for (var k = 0; k < descriptor.component_count; k++) {
                                        var component = {};
                                        component.component_tag = this.read(8);
                                        component.reserved = this.read(7);
                                        component.pts_offset = this.read(33);
                                        descriptor.components.push(component);
                                    }
                                }
                            }
                            if (descriptor.segmentation_duration_flag == "1") {
                                descriptor.segmentation_duration = this.read(40);
                            }
                            descriptor.segmentation_upid_type = this.read(8);
                            descriptor.segmentation_upid_length = this.read(8);

                            //descriptor.segmentation_upid = this.read(8);
                            this.parse_segmentation_upid(descriptor);

                            descriptor.segmentation_type_id = this.read(8);
                            switch (descriptor.segmentation_type_id) {//logging segmentation type
                                case 0x00:
                                   logManager.log("Type = Not Indicated\n");
                                    break;
                                case 0x01:
                                   logManager.log("Type = Content Identification\n");
                                    break;
                                case 0x10:
                                   logManager.log("Type = Program Start\n");
                                    break;
                                case 0x11:
                                   logManager.log("Type = Program End\n");
                                    break;
                                case 0x12:
                                   logManager.log("Type = Program Early Termination\n");
                                    break;
                                case 0x13:
                                   logManager.log("Type = Program Breakaway\n");
                                    break;
                                case 0x14:
                                   logManager.log("Type = Program Resumption\n");
                                    break;
                                case 0x15:
                                   logManager.log("Type = Program Runover Planned\n");
                                    break;
                                case 0x16:
                                   logManager.log("Type = Program Runover Unplanned\n");
                                    break;
                                case 0x17:
                                   logManager.log("Type = Program Overlap Start\n");
                                    break;
                                case 0x20:
                                   logManager.log("Type = Chapter Start\n");
                                    break;
                                case 0x21:
                                   logManager.log("Type = Chapter End\n");
                                    break;
                                case 0x30:
                                   logManager.log("Type = Provider Advertisement Start\n");
                                    break;
                                case 0x31:
                                   logManager.log("Type = Provider Advertisement End\n");
                                    break;
                                case 0x32:
                                   logManager.log("Type = Distributor Advertisement Start\n");
                                    break;
                                case 0x33:
                                   logManager.log("Type = Distributor Advertisement End\n");
                                    break;
                                case 0x34:
                                   logManager.log("Type = Placement Opportunity Start\n");
                                    break;
                                case 0x35:
                                   logManager.log("Type = Placement Opportunity End\n");
                                    break;
                                case 0x40:
                                   logManager.log("Type = Unscheduled Event Start\n");
                                    break;
                                case 0x41:
                                   logManager.log("Type = Unscheduled Event End\n");
                                    break;
                                case 0x50:
                                   logManager.log("Type = Network Start\n");
                                    break;
                                case 0x51:
                                   logManager.log("Type = Network End\n");
                                    break;
                                default:
                                   logManager.log("Type = Unknown = " + descriptor.segmentation_type_id + "\n");
                                    break;
                            }
                            descriptor.segment_num = this.read(8);
                            descriptor.segments_expected = this.read(8);
                            break;
                        case 3://Time Descriptor
                            break;
                        case 4://Audio Descriptor
                            break;
                        //0x05 – 0xFF  Reserved for future SCTE splice_descriptors
                    }

                    spliceInfo.descriptors.push(descriptor);
                } else {
                    this.read((descriptor.descriptor_length*8) - 32);//removing 32 bits of identifier
                }

            }
        }
    }

    this.parse_splice_null = function() {
        throw 'command_type splice_null not supported yet';
    }

    this.parse_splice_schedule = function() {
        throw 'command_type splice_schedule not supported yet';
    }

    this.parse_splice_insert = function() {
        var splice_event = {};
        this.spliceInfo.splice_event = splice_event;
        splice_event.splice_event_id = this.read(32);
        splice_event.splice_event_cancel_indicator = this.read(1);
        //reserved 7 bits
        this.read(7);
        if (splice_event.splice_event_cancel_indicator == 0) {
            splice_event.out_of_network_indicator = this.read(1);
            splice_event.program_splice_flag = this.read(1);
            splice_event.duration_flag = this.read(1);
            splice_event.splice_immediate_flag = this.read(1);
            //reserved 4 bits
            this.read(4);
            if((splice_event.program_splice_flag == 1) && (splice_event.splice_immediate_flag == 0)) {
                this.parse_splice_time(this.spliceInfo.splice_event);
            }

            if(splice_event.duration_flag == 1) {
                this.parse_break_duration();
            }
            splice_event.unique_program_id = this.read(16);
            splice_event.avail_num = this.read(8);
            splice_event.avails_expected = this.read(8);
        }
    }

    this.parse_time_signal = function() {
        //throw 'command_type time_signal not supported yet';
        var splice_event = {};
        this.spliceInfo.splice_event = splice_event;
        this.parse_splice_time(splice_event);

    }

    this.parse_bandwidth_reservation = function() {
        throw 'command_type bandwidth_reservation not supported yet';
    }

    this.parse_private_command = function() {
        throw 'command_type private_command not supported yet';
    }

    this.parse_splice_time = function (spliceEvent) {
        spliceEvent.time_specified_flag = this.read(1);
        if(spliceEvent.time_specified_flag == 1) {
            //reserved 6 bits
            this.read(6);
            spliceEvent.pts_time = this.read(33);
        } else {
            //reserved 7 bits
            this.read(7);
        }
    }

    this.parse_break_duration = function() {
        var break_duration = {};
        this.spliceInfo.splice_event.break_duration = break_duration;
        break_duration.auto_return = this.read(1);
        break_duration.reserved = this.read(6);
        break_duration.duration = this.read(33);
    }

    this.parse_segmentation_upid = function (descriptor) {
        switch (descriptor.segmentation_upid_type) {
            case 0x00:
                break;
            case 0x08:
                break;
            case 0xC:
                descriptor.segmentation_upid = this.read(descriptor.segmentation_upid_length);
                break;
            default: //!= 0x00
                break;
        }
    }

    this.writeToBitArray = function(val) {
        var r = 128;
        for (var i=0; i<8; i++){
            var bVal = false;
            if(r & val) {
                bVal = true;
            }
            this.scte35_bitarray[this.scte35_bitarray.length] = bVal;
            r = r >> 1;
        }
    }

    this.read = function(size) {
        var a = this.scte35_bitarray.splice(0, size);
        var hSigNum = 0;
        if (size > 32) {
            for(var i = 0; i < size - 32; i++){
                hSigNum = hSigNum << 1;
                var aVal = a.shift();
                if (aVal) {
                    hSigNum += 1;
                }
            }
            hSigNum = hSigNum * Math.pow(2, 32);
            size = 32;
        }
        var num = 0;
        for(var i = 0; i < size; i++){
            num = num << 1;
            var aVal = a.shift();
            if (aVal) {
                num += 1;
            }
        }
        if (size >= 32) {
            num = num>>>0;
        }
        return hSigNum + num;
    }

    this.test = function(testString) {
        //var testString = 'fc300800000000000000001000067f234567890010020043554549400000007f9c00000000';
        if(!testString){
            testString = 'fc302000000000000000fff00f05000000007fcfffa7f7abd400680001000088f3ebaf';
        }
       logManager.log('testString = ' + testString);
        var spliceInfo = this.parseFromHex(testString);
       logManager.log(this.scte35_array);
       logManager.log(JSON.stringify(spliceInfo));

    }

}
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
var AdvRequests =function () {
    var getWizadsDataRetries = 0;
    var getWizadsDataMaxRetries = 1;

    this.getWizadsData = function (url, onSuccess, onFail) {
        var serviceName = "AdvRequests.getWizadsData()";
        var urlManaged = url;
        var ajaxCall;
        logManager.log(serviceName + " CALLED - url: " + url);
        ajaxCall = $.ajax({
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            url: urlManaged,
            timeout: adv.getConfiguration().GET_WIZADS_TIMEOUT,
            success: function (data, textStatus, jqXHR) {
                logManager.log(serviceName + " - Response : OK");
                onSuccess(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                logManager.error(serviceName + " - Error " + ": " + JSON.stringify(errorThrown, null, 4));
                if (textStatus === "timeout" && getWizadsDataRetries < getWizadsDataMaxRetries) {
                    getWizadsDataRetries++;
                    self.getWizadsData(url, onSuccess, onFail);
                }
                onFail();
            }
        });

    };
}