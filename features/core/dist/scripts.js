Core = function () {
    var remoteConfiguration = null;
    var platform = {
        brand: "",
        model: "",
        hbbtvversion: ""
    };

    var configuration = {};

    this.configure = function (config) {
        configuration = config;
    };

    this.getConfiguration = function () {
        return configuration;
    };

    this.initPlatformData = function () {
        /*jshint ignore:start*/
        var hbbtvVersion = window.navigator.userAgent.match(/HbbTV\/\d\.(\d).(\d)/g)[0];
        var arrayUserAgent;
        if (hbbtvVersion) {
            platform['hbbtvversion'] = hbbtvVersion;
            var temp = window.navigator.userAgent.substring(window.navigator.userAgent.indexOf(hbbtvVersion) + hbbtvVersion.length);
            var userAgentData = temp.match(/\(([^)]+)\)/)[1];
            if (userAgentData) {
                arrayUserAgent = userAgentData.split(";");
            }
        }
        if (arrayUserAgent && arrayUserAgent.length >= 2) {
            platform['brand'] = arrayUserAgent[1];
        }
        if (arrayUserAgent && arrayUserAgent.length >= 3) {
            platform['model'] = arrayUserAgent[2];
        }
        /*jshint ignore:end*/
    };

    this.getPlatform = function () {
        return platform;
    };

    this.loadRemoteAppConfiguration = function (onOK, OnKO) {//other way to load configuration(from exteranal json instead than using configure())
        try {
            logManager.generalLog(configuration.CONFIG_FILE + " loading...");
            $.ajax({
                type: "GET",
                url: configuration.CONFIG_FILE,
                contentType: "application/json",
                dataType: "json",
                timeout: configuration.CONFIG_FILE_TIMEOUT,
                success: function (data) {
                    logManager.generalLog(configuration.CONFIG_FILE + " LOADED!");
                    remoteConfiguration = data;
                    configuration = extend(remoteConfiguration, Constants);
                    logManager.generalLog("Server config file and app config file are merged");
                    logManager.generalLog(JSON.stringify(configuration, null, 4));
                    onOK();
                },
                error: function (data) {
                    logManager.generalError(configuration.CONFIG_FILE + " ERROR!");
                    var errorDesc = JSON.stringify(data);
                    logManager.generalError(configuration.CONFIG_FILE + " ERROR DESC:" + errorDesc);
                    OnKO(errorDesc);
                }
            });
        } catch (e) {
            OnKO(e.message);
        }
    };

    this.setConfiguration = function (field, value) {//inject single key-value config
        if (configuration != null) {
            configuration[field] = value;
        }
    };

};

// follow OIPF
// each keycode on Every Application and Every platform should have only one numeric numer
if (typeof(VK_LEFT) == 'undefined') {
  var VK_LEFT = 0x25;
  var VK_UP = 0x26;
  var VK_RIGHT = 0x27;
  var VK_DOWN = 0x28;
}
if (typeof(VK_ENTER)=='undefined') {
  var VK_ENTER = 0x0d;
}
if (typeof(VK_RED)=='undefined') {
  var VK_RED = 0x52;
  var VK_GREEN = 0x56;
  var VK_YELLOW = 0x4A;
  var VK_BLUE = 0x42;
}
if (typeof(VK_PLAY)=='undefined') {
  var VK_PLAY = 0x50;
  var VK_PAUSE = 0x51;
  var VK_STOP = 0x53;
}
if (typeof(VK_FAST_FWD)=='undefined') {
  var VK_FAST_FWD = 0x46;
  var VK_REWIND = 0x52;
}
if (typeof(VK_BACK)=='undefined') {
  var VK_BACK = 0xa6;
}
if (typeof(VK_0)=='undefined') {
  var VK_0 = 0x30;
  var VK_1 = 0x31;
  var VK_2 = 0x32;
  var VK_3 = 0x33;
  var VK_4 = 0x34;
  var VK_5 = 0x35;
  var VK_6 = 0x36;
  var VK_7 = 0x37;
  var VK_8 = 0x38;
  var VK_9 = 0x39;
}
/*window.onerror = function(message, url, lineNumber) {
    try{
        logManager.log(message + " url: " + url + " line: " + lineNumber + "<br>" + (new Error()).stack, 10);
    } catch(e){
        logManager.log("Error: onerror: " + e.description);
    }
    return false; // when false, print it also to js console
};*/

Element.prototype.addClass = function (cls) {
    $(this).addClass(cls);
};

Element.prototype.removeClass = function (cls) {
    $(this).removeClass(cls);
};

Number.prototype.padLeft = function (base, chr) {
    var len = (String(base || 10).length - String(this).length) + 1;
    return len > 0 ? new Array(len).join(chr || '0') + this : this;
};

function extend(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

function escapeXml(unsafe) {
    if (unsafe != null) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
                case '\'':
                    return '&apos;';
                case '"':
                    return '&quot;';
            }
        });
    }
}

if (!Object.keys) {
    Object.keys = (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}
var Channel=function (obj) {

    var channel=obj;

    //get the object
    this.getChannelObj=function () {
        return channel;
    };

    //get the object in string format (the values of the triplet are concatenated)
    this.getChannelToString=function () {
        checkIfObjNull();
        return channel.onid+'.'+channel.tsid+'.'+channel.sid;
    };

    this.isChannelEqualTo=function (channelObj) {
        return channelObj.getChannelToString()===channel.getChannelToString();
    };

    function checkIfObjNull() {
        if(!channel || !channel.onid){
            logManager.log("current channel obj is null or has no triplet - reloading current channel obj from broadcast object");
            channel = serviceManager.getObjVideo().currentChannel;
            logManager.log("new channel obj: "+ channel);
        }
    }

};

var FeaturesManager = function () {
    var features;

    this.loadFeaturesConfiguration = function (onOK) {

        $.ajax({
            type: "GET",
            url: core.getConfiguration().FEATURES_FILE,
            contentType: "application/json",
            dataType: "json"
        }).done(function (data, textStatus, request) {
            //features = data;
            try {
                for (var i = 0; i < data.devices.length; i++) {
                    if (data.devices[i].userAgentInfo.brand.trim() == null) {
                        data.devices[i].userAgentInfo.brand = "";
                    }
                    if (data.devices[i].userAgentInfo.model.trim() == null) {
                        data.devices[i].userAgentInfo.model = "";
                    }
                    if (data.devices[i].userAgentInfo.others.trim() == null) {
                        data.devices[i].userAgentInfo.others = "";
                    }

                    if (window.navigator.userAgent != null &&
                        window.navigator.userAgent.toUpperCase().indexOf(data.devices[i].userAgentInfo.brand.toUpperCase().trim()) > -1 &&
                        window.navigator.userAgent.toUpperCase().indexOf(data.devices[i].userAgentInfo.model.toUpperCase().trim()) > -1 &&
                        window.navigator.userAgent.toUpperCase().indexOf(data.devices[i].userAgentInfo.others.toUpperCase().trim()) > -1) {
                        features = data.devices[i].features;
                        logManager.log("Brand matching: \"" + data.devices[i].userAgentInfo.brand.trim() + "\"\n" +
                            "Model matching: \"" + data.devices[i].userAgentInfo.model.trim() + "\"\n" +
                            "Others matching: \"" + data.devices[i].userAgentInfo.others.trim() + "\"\n" +
                            "Features loaded: " + JSON.stringify(features, null, 4));
                        break;
                    }
                }

                if (features == null || features === "") {
                    logManager.warning("Client not found in Features Whitelist. User Agent: " + window.navigator.userAgent);
                }

                onOK();

            } catch (e) {
                logManager.generalError(e.message);
            }

        }).fail(function (jqXHR, textStatus, error) {
            logManager.log(error);
        });
    };

    this.getFeature = function (id) {

        if (features[id] != null) {
            return features[id];
        } else {
            return features;
        }
    };

    this.setFeature = function (id, value) {

        if (features[id] != null) {
            features[id] = value;
        }
    };
};
var KonamiManager = function () {

    var konamis = {
        EDIT_CONSENT: {
            pattern: "" + KeyEvent.VK_YELLOW,
            code: function () {
                if (yellowButtonEnabled === true) {
                    consent.consentsParametersOverlayComponent.init(consent.getModel());
                    consent.consentsParametersOverlayComponent.showConsentParametersOverlay(yellowButtonEnabled);
                }
            }
        }/*,
        DELETE_COOKIES: {
            pattern: "" + KeyEvent.VK_GREEN + KeyEvent.VK_RED + KeyEvent.VK_RED + KeyEvent.VK_BLUE,
            code: function () {
                var cookies = document.cookie.split(";");

                if (document.cookie.length < 1) {
                    logManager.log("KonamiManager - No cookies to delete found.");
                } else {
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = cookies[i].trim();
                        var eqPos = cookie.indexOf("=");
                        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=" + window.location.hostname + ";path=/";

                        var cookieCheck = storageManager.getCookie(name);
                        if (cookieCheck) {//workaround if cookie with subdomain cannot be set, retry and set without domain attribute
                            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                        }

                        logManager.log("KonamiManager - '" + name + "' cookie deleted on this domain and path.");
                    }
                }
            }
        }  */
    };

    var loadKonamis = function () {

        for (var key in konamis) {
            if (konamis.hasOwnProperty(key)) {
                konamiDefinition(konamis[key]);
            }
        }
    };

    function konamiDefinition(konamiSpecs) {
        var konami = new Konami();
        konami.pattern = konamiSpecs.pattern;
        konami.code = konamiSpecs.code;
        konami.load();
    }

    return {
        loadKonamis: loadKonamis
    };
};
var LabelsManager = function () {
    var labels;

    this.init = function () {

        $.ajax({
            type: "GET",
            url: core.getConfiguration().LANG_FOLDER + "/labels."+ core.getConfiguration().LANGUAGE + ".json",
            contentType: "application/json",
            dataType: "json"
        }).done(function (data, textStatus, request) {
            labels = data;
        }).fail(function (jqXHR, textStatus, error) {
            logManager.log(error);
        });
    };

    this.getLabel = function (id) {

        if(labels[id] != null){
            return labels[id].replace('\n', '<br />');
        } else {
            return '';
        }
    };
};
var LogManager = function () {

    //Standard non-config dependant logging
    function generalLog(message) {
        var d = new Date(),
            dformat = [d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
        var valueWithTime = dformat + " - " + message;
        valueWithTime = valueWithTime.replace(/&/g, "#");
        console.log(valueWithTime);

    }

    //Standard logging
    function log(message) {
        if (core.getConfiguration().ENABLE_LOGS == true) {
            var d = new Date(),
                dformat = [d.getHours().padLeft(),
                    d.getMinutes().padLeft(),
                    d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
            var valueWithTime = dformat + " - " + message;
            valueWithTime = valueWithTime.replace(/&/g, "#");
            console.log(valueWithTime);
        }
    }

    //Error non-config dependant logging
    function generalError(message) {
        var d = new Date(),
            dformat = [d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
        var valueWithTime = dformat + " -  ERROR: " + message;
        valueWithTime = valueWithTime.replace(/&/g, "#");
        console.error(valueWithTime);
    }

    //Error logging
    function error(message) {
        if (core.getConfiguration().ENABLE_LOGS == true) {
            var d = new Date(),
                dformat = [d.getHours().padLeft(),
                    d.getMinutes().padLeft(),
                    d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
            var valueWithTime = dformat + " - ERROR: " + message;
            valueWithTime = valueWithTime.replace(/&/g, "#");
            console.error(valueWithTime);
        }
    }

    //Warning logging
    function warning(message) {
        if (core.getConfiguration().ENABLE_LOGS == true) {
            var d = new Date(),
                dformat = [d.getHours().padLeft(),
                    d.getMinutes().padLeft(),
                    d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
            var valueWithTime = dformat + " - WARNING: " + message;
            valueWithTime = valueWithTime.replace(/&/g, "#");

            console.warn(valueWithTime);
        }
    }



    return {
        generalLog: generalLog,
        log: log,
        generalError: generalError,
        error: error,
        warning: warning
    };
};

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
var ServiceManager=function () {

    var objVideo=null;
    var currentChannel=null;

    function initialize() {
        try{
            objVideo=document.getElementById('video');
            if (!objVideo){
                logManager.log("html tag 'video' broadcast not found");
            }else{
                logManager.log("binding.. to current channel");
                if(featuresManager.getFeature("bindToCurrentChannel")){
                    try{
                        objVideo.bindToCurrentChannel();
                        logManager.log("objVideo.bindToCurrentChannel() executed correctly");
                    } catch(e) {
                        logManager.error("Error executing bindToCurrentChannel() method. Channel data not retrieved.");
                    }
                }
                logManager.log("setting.. full screen");
                objVideo.setFullScreen(false);
                logManager.log("attaching.. to onChannelChangeSucceeded event");
                objVideo.onChannelChangeSucceeded = onChannelChangeOK;
                logManager.log("attaching.. to onChannelChangeKO event");
                objVideo.onChannelChangeError=onChannelChangeKO;
                logManager.log("attaching.. to onPlayStateChange event");
                objVideo.onPlayStateChange=function (state, error) {
                    if (error){
                        logManager.log("onPlayStateChange() - new state: " + getStateString(state) + " - error:" + error);
                    }else{
                        logManager.log("onPlayStateChange() - new state: " + getStateString(state) );
                    }

                };
                logManager.log("saving.. the current triplet");
                setCurrentChannel(objVideo.currentChannel);
            }
        }catch (e) {
            logManager.error("ServiceManager.initialize() - " + e.message);
        }
    }
    function getCurrentChannel() {
        return currentChannel;
    }
    function setCurrentChannel(obj) {
        currentChannel=new Channel(obj);
    }

    function bindToCurrentChannel() {
        try{
            objVideo.bindToCurrentChannel();
            logManager.log("objVideo binded");
        }catch (e){
            logManager.log("bindToCurrentChannel ERROR: " +e.message);
        }

    }
    function setFullScreen() {
        try{
            objVideo.setFullScreen(true);
            logManager.log("setFullScreen ok");
        }catch (e){
            logManager.log("setFullScreen ERROR: " +e.message);
        }

    }

    function onChannelChangeOK(newChannel) {

        var currentTriplet = newChannel.onid+'.'+newChannel.tsid+'.'+newChannel.sid;

        if (getChannelToString()!= currentTriplet) {
            app.destroyApplication();
        }
    }
    function onChannelChangeKO(channel, errorState) {
        logManager.log("onChannelChangeError() - " + errorState + " - playstate:" + getPlayStateString());
    }


    function getStateString(value) {
        if (value==0){
            return "Unrelized";
        }else if (value==1){
            return "Connecting";
        }else if (value==2){
            return "Presenting";
        }else if (value==3){
            return "stopped";
        }else{
            return "not defined: " +value;
        }
    }

    function getPlayStateString() {
        if (objVideo){
            try{
                return getStateString(objVideo.playState);
            }catch (e){
                return " error: " +e.message;
            }
        }else{
            logManager.warning("The application is broadcast indipendet, press GREEN button to attach to broadcast");
        }
    }

    function getObjVideo() {
        return objVideo;
    }



    function setChannel(onid, tsid, sid) {
        var lstChannels;
        var ch=null;
        logManager.log("change channel to:" +  onid+"."+tsid+"."+sid);
        try {
            if (objVideo){
                lstChannels = objVideo.getChannelConfig().channelList;
            }else{
                logManager.warning("The application is broadcast indipendet, press GREEN button to attach to broadcast");
            }
        } catch (e) {
            logManager.warning('get channelList failed ',e);
            throw e;
        }

        try {
            ch = lstChannels.getChannelByTriplet(onid, tsid, sid);
        } catch (e) {
            logManager.warning('getChannelByTriplet failed for '+onid+'.'+tsid+'.'+sid,e);
            throw e;
        }


        try {
            logManager.log('Setting channel, waiting for onChannelChangeSucceeded...');
            objVideo.setChannel(ch, false);
        } catch (e) {
            logManager.warning('setChannel('+ch+') failed',e);
            throw e;
        }

    }

    function stopBroadcast() {
        if (objVideo){
            try{
                objVideo.stop();
                logManager.log("broadcast stopped");
            }catch (e){
                logManager.warning("stopBroadcast() - error:"+ e.message);
            }
        }else{
            logManager.error("stopBroadcast() - objVideo broadcast not set");
        }
    }
    function startBroadcast() {
        if (objVideo){
            try{
                objVideo.bindToCurrentChannel();
                logManager.log("broadcast binded");
            }catch (e){
                logManager.warning("startBroadcast() - error:"+ e.message);
            }
        }else{
            logManager.error("startBroadcast() - objVideo broadcast not set");
        }

    }

    return {
        initialize:initialize,
        setChannel:setChannel,
        getObjVideo:getObjVideo,
        bindToCurrentChannel:bindToCurrentChannel,
        setFullScreen:setFullScreen,
        stopBroadcast:stopBroadcast,
        startBroadcast:startBroadcast,
        getCurrentChannel:getCurrentChannel,
        setCurrentChannel:setCurrentChannel
    };

};

var StorageManager = function () {
    var self = this;

    this.setCookie = function (name, value) {
        var consentDate = this.getCookie("consentDate");
        var expiration = "";
        var domain = window.location.hostname;
        if(consentDate != null){
            expiration = " expires=" + new Date(parseInt(consentDate)).toUTCString() + ";";
        } else {
            var today = new Date();
            var d = new Date(today.setMonth(today.getMonth() + core.getConfiguration().COOKIES_MONTHS_DURATION));
            expiration = " expires=" + d.toUTCString() + ";";
            //set consent date cookie - only first time
            document.cookie = "consentDate" + "=" + escape(d.getTime()) + "; domain = " + domain + ";" + expiration + " path=/";
            if(!this.getCookie("consentDate")){
                document.cookie = "consentDate" + "=" + escape(d.getTime()) + ";" + expiration + " path=/";
            }
        }
        document.cookie = name + "=" + escape(value) + "; domain = " + domain + ";" + expiration + " path=/";

        var cookie = this.getCookie(name);
        if (!cookie) {//workaround if cookie with subdomain cannot be set, retry and set without domain attribute
            logManager.warning("cookie " + name + " creation failed. (domain used: " + domain + ")");
            document.cookie = name + "=" + escape(value) + ";" + expiration + " path=/";
            logManager.warning("cookie " + name + " creation without domain succeeded");
        }
    };

    this.getCookie = function (name) {
        var match = document.cookie.match(new RegExp(name + '=([^;]+)'));
        if (match) {
            return unescape(match[1]);
        } else {
            return null;
        }
    };
};