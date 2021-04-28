var Constants = {
    VERSION: "0.1.0",
    CONFIG_FILE: "config/hbbtvConfig.json",
    CONFIG_FILE_TIMEOUT: 30000,
    LANG_FOLDER: "config/languages",
    CONSENT_BANNER_DISPLAY_TIME: 10000,
    CONSENT_CONFIRMATION_DISPLAY_TIME: 5000,
    COOKIES_MONTHS_DURATION: 6,
    MODEL_COOKIE_NAME: "appData"
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
var app = null;
var logManager = null;
var konamiManager = null;
var serviceManager = null;
var consentManager = null;
var configManager = null;
var storageManager = null;
var labelsManager = null;
var featuresManager = null;
var keyset = null;
var trackingConsent = null;
var yellowButtonEnabled = false;
var activeContext = null;//used to avoid concurrenvy conflict between different features (example: partnerBanner and consentOverlay)

window.onload = function () {
    try {
        logManager = new LogManager();
        logManager.generalLog("User Agent - " + navigator.userAgent);
        logManager.generalLog("App Host - " + window.location.host);

        try {
            //Initialize HbbTV Application
            var appMan = document.getElementById("appMan");
            app = appMan.getOwnerApplication(document);
            app.show();
            keyset = app.privateData.keyset;
        } catch (e) {
            logManager.generalError(e.message);
        }

        try {
            //Load all remote configurations
            configManager = new ConfigurationManager();
            configManager.initPlatformData();
            logManager.generalLog("HbbTvVersion: " + configManager.getPlatform().hbbtvversion + " - Brand: " + configManager.getPlatform().brand + " - Model: " + configManager.getPlatform().model);
            configManager.loadRemoteAppConfiguration(function () {

                featuresManager = new FeaturesManager();
                featuresManager.loadFeaturesConfiguration(function () {
                    //Initialize the class to manage the broadcast
                    serviceManager = new ServiceManager();
                    serviceManager.initialize();

                    //Initialize the class to manage editorial labels
                    labelsManager = new LabelsManager();
                    labelsManager.init();

                    //Initialize the class to manage cookies and other storage
                    storageManager = new StorageManager();

                    //Begin Consent flow
                    logManager.log("getConsent wait-time started");
                    //Initialize the consent manager
                    consentManager = new ConsentManager(resetRemoteKeys, setRemoteKeys);
                    consentManager.init();

                    //Before call the getConsent (it's the call on the start of the app) I'm waiting for TIME_BEFORE_CONSENT_CALL seconds
                    setTimeout(function () {
                        consentManager.loadConsentData(function (timeDisplayConsentDirectValidationOverlay) {
                            consentManager.consentsDirectValidationOverlayComponent.showConsentDirectValidationOverlay(timeDisplayConsentDirectValidationOverlay);
                        }, function (consentOverlayDisplaying) {
                        });
                    }, configManager.getConfigurations().TIME_BEFORE_CONSENT_CALL);

                });

            }, function (data) {
                logManager.generalError(data);
            });
        } catch (e) {
            logManager.generalError(e.message);
        }

        konamiManager = new KonamiManager();
        konamiManager.loadKonamis();

        setRemoteKeys();
        try {
            logManager.generalLog("Keyset bound: " + JSON.stringify(keyset, null, 4) + " - Example key (yellow button): " + keyset.YELLOW);
        } catch (e) {
            logManager.generalError("Init Keyset: " + e.message);
        }

    } catch (e) {    ////<=== START Added after the problem of crash of some Samsung TV
        logManager.generalError("General Error: " + e.message);
    }               //////<=== END Added after the problem of crash of some Samsung TV

    function setRemoteKeys() {

        try {
            var keyToLock =  keyset.YELLOW/* + keyset.BLUE + keyset.RED + keyset.GREEN*/;
            keyset.setValue(keyToLock);
        } catch (e) {
            logManager.generalError("General Error: " + e.message);
        }
    }

    function resetRemoteKeys() {
        try {
            keyset.setValue(0);
        } catch (e) {
            logManager.generalError("General Error: " + e.message);
        }
    }
};

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

ConfigurationManager = function () {
    var remoteConfiguration = null;
    var allConfiguration = null;
    var platform = {
        brand: "",
        model: "",
        hbbtvversion: ""
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

    this.loadRemoteAppConfigurationPromise = function () {
        return new Promise(function (resolve, reject) {
            try {
                $.ajax({
                    type: "GET",
                    url: Constants.CONFIG_FILE,
                    contentType: "application/json",
                    dataType: "json",
                    timeout: Constants.CONFIG_FILE_TIMEOUT
                }).done(function (data, textStatus, request) {
                    remoteConfiguration = data;
                    logManager.log("remoteConfiguration:" + JSON.stringify(data, null, 4));
                    allConfiguration = Object.assign(remoteConfiguration, Constants);
                    logManager.log(JSON.stringify(allConfiguration, null, 4));
                    resolve();
                }).fail(function (jqXHR, textStatus, error) {
                    var errorDesc = textStatus + " - " + JSON.stringify(jqXHR.responseJSON);
                    reject(serviceName + " - KO " + errorDesc);
                });
            } catch (e) {
                reject(e.message);
            }
        });
    };

    this.loadRemoteAppConfiguration = function (onOK, OnKO) {
        try {
            logManager.generalLog(Constants.CONFIG_FILE + " loading...");
            $.ajax({
                type: "GET",
                url: Constants.CONFIG_FILE,
                contentType: "application/json",
                dataType: "json",
                timeout: Constants.CONFIG_FILE_TIMEOUT,
                success: function (data) {
                    logManager.generalLog(Constants.CONFIG_FILE + " LOADED!");
                    remoteConfiguration = data;
                    allConfiguration = extend(remoteConfiguration, Constants);
                    logManager.generalLog("Server config file and app config file are merged");
                    logManager.generalLog(JSON.stringify(allConfiguration, null, 4));
                    onOK();
                },
                error: function (data) {
                    logManager.generalError(Constants.CONFIG_FILE + " ERROR!");
                    var errorDesc = JSON.stringify(data);
                    logManager.generalError(Constants.CONFIG_FILE + " ERROR DESC:" + errorDesc);
                    OnKO(errorDesc);
                }
            });
        } catch (e) {
            OnKO(e.message);
        }
    };
    //Return all configurations: remote and local configuration in the same object
    this.getConfigurations = function () {
        return allConfiguration;
    };

    this.setConfigurations = function (field, value) {
        if (allConfiguration != null) {
            allConfiguration[field] = value;
        }
    };

};

var ConsentManager = function (resetKeyboardEventsPrev, registerKeyboardEventsPrev) {
    var self = this;
    var consentModel = null;

    this.consentsDirectValidationOverlayComponent = new ConsentsDirectValidationOverlayComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);
    this.consentsConfirmationOverlayComponent = new ConsentsConfirmationOverlayComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);
    this.consentsParametersOverlayComponent = new ConsentsParametersOverlayComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);
    this.consentsPrivacyPolicyComponent = new ConsentsPrivacyPolicyComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);
    this.consentsPartnerComponent = new ConsentsPartnerComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);
    this.consentsErrorComponent = new ConsentsErrorComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);

    this.init = function () {
        var appDataValue = storageManager.getCookie(configManager.getConfigurations().MODEL_COOKIE_NAME);
        if (appDataValue != null) {
            consentModel = JSON.parse(appDataValue);
        }
    };

    this.editAllConsentAndSend = function (consentAllValue,currentOverlay) {
        for (var i = 0; i < consentModel.consents.length; i++) {
            var e = i;
            consentModel.consents[e].consentStatus = consentAllValue;
        }
        self.sendConsents(function (timeDisplayConsentConfirmationOverlay) {
                currentOverlay.removeKeyboardEvents();
                //self.consentsDirectValidationOverlayComponent.removeKeyboardEvents();
                var displayTimeout = null;
                if (timeDisplayConsentConfirmationOverlay != null && timeDisplayConsentConfirmationOverlay != undefined) {
                    displayTimeout = timeDisplayConsentConfirmationOverlay;
                }
                self.consentsConfirmationOverlayComponent.showConsentConfirmationOverlay(displayTimeout);
            },
            function () {
                logManager.error("postConsent Error");
                currentOverlay.removeKeyboardEvents();
                //self.consentsDirectValidationOverlayComponent.removeKeyboardEvents();
                self.consentsErrorComponent.showConsentError();
            });
    };

    //VALIDATION PAGE
    this.consentsDirectValidationOverlayComponent.setEnterKeyEventHandler(function () {
        try {
            switch (self.consentsDirectValidationOverlayComponent.getCurrentPosition()) {
                case 0: //Ok button
                    //All consents set to true
                    self.editAllConsentAndSend(true,self.consentsDirectValidationOverlayComponent);
                    break;
                case 1://Refuser button
                    self.editAllConsentAndSend(false,self.consentsDirectValidationOverlayComponent);
                    break;
                case 2: //Parametree button
                    self.consentsDirectValidationOverlayComponent.removeKeyboardEvents();
                    self.consentsParametersOverlayComponent.init(consentModel);
                    self.consentsParametersOverlayComponent.showConsentParametersOverlay(yellowButtonEnabled);
                    break;
                case 3: //Politique button
                    self.consentsDirectValidationOverlayComponent.manageShowPrivacyPolicy();
                    break;
                case 4: //Partenaires button
                    self.consentsDirectValidationOverlayComponent.manageShowPartner();
                    break;
            }
        } catch (ex) {
            logManager.error(ex.message);
        }
    });

    //FROM VALIDATION PAGE TO POLITIQUE PAGE
    this.consentsDirectValidationOverlayComponent.manageShowPrivacyPolicy = function () {
        self.consentsDirectValidationOverlayComponent.removeKeyboardEvents();
        self.consentsPrivacyPolicyComponent.showConsentPrivacyPolicy('validation');
    };
    //FROM VALIDATION PAGE TO PARTENAIRES
    this.consentsDirectValidationOverlayComponent.manageShowPartner = function () {
        self.consentsDirectValidationOverlayComponent.removeKeyboardEvents();
        self.consentsPartnerComponent.showConsentPartner('validation');
    };

    //MANAGE ENTER BUTTON IN POLITIQUE PAGE
    this.consentsPrivacyPolicyComponent.setEnterKeyEventHandler(function () {
        if($('.tvium-container .focused')[0]) {
            var tempID = $('.tvium-container .focused')[0].id;
            var pageFrom = $('#backButton').attr('pagefrom');
            switch (tempID) {
                case "backButton":
                    self.consentsPrivacyPolicyComponent.removeKeyboardEvents();
                    if(pageFrom == 'validation'){
                        self.consentsDirectValidationOverlayComponent.showConsentDirectValidationOverlay();
                    }else if(pageFrom == 'parameters'){
                        self.consentsParametersOverlayComponent.showConsentParametersOverlay(yellowButtonEnabled);
                    }else if(pageFrom == 'partenaires'){
                        self.consentsPartnerComponent.showConsentPartner('');/*NON SI SA DA DOVE SEI ARRIVATO*/
                    }
                    break;
            }
        }
    });

    //MANAGE BACK BUTTON IN POLITIQUE PAGE
    this.consentsPrivacyPolicyComponent.setBackKeyEventHandler(function () {
        var pageFrom = $('#backButton').attr('pagefrom');
        self.consentsPrivacyPolicyComponent.removeKeyboardEvents();
        if(pageFrom == 'validation'){
            self.consentsDirectValidationOverlayComponent.showConsentDirectValidationOverlay();
        }else if(pageFrom == 'parameters'){
            self.consentsParametersOverlayComponent.showConsentParametersOverlay(yellowButtonEnabled);
        }else if(pageFrom == 'partenaires'){
        self.consentsPartnerComponent.showConsentPartner('');
        }

    });

    //MANAGE ENTER BUTTON IN PARTENAIRES PAGE
    this.consentsPartnerComponent.setEnterKeyEventHandler(function () {
        if ($('.tvium-container .focused')[0]) {
            var tempID = $('.tvium-container .focused')[0].id;
            var pageFrom = $('#backButton').attr('pagefrom');
            switch (tempID) {
                case "backButton":
                    self.consentsPartnerComponent.removeKeyboardEvents();
                    if(pageFrom == 'validation'){
                        self.consentsDirectValidationOverlayComponent.showConsentDirectValidationOverlay();
                    }else if(pageFrom == 'parameters'){
                        self.consentsParametersOverlayComponent.showConsentParametersOverlay(yellowButtonEnabled);
                    }
                    break;
                case "politique":
                    self.consentsPartnerComponent.removeKeyboardEvents();
                    self.consentsPrivacyPolicyComponent.showConsentPrivacyPolicy('partenaires');
                    break;
            }
        }
    });

    //MANAGE BACK BUTTON IN PARTENAIRES PAGE
    this.consentsPartnerComponent.setBackKeyEventHandler(function () {
        var pageFrom = $('#backButton').attr('pagefrom');
        self.consentsPartnerComponent.removeKeyboardEvents();
        if(pageFrom == 'validation'){
            self.consentsDirectValidationOverlayComponent.showConsentDirectValidationOverlay();
        }else if(pageFrom == 'parameters'){
            self.consentsParametersOverlayComponent.showConsentParametersOverlay(yellowButtonEnabled);
        }
    });

    //FROM PARAMETERS PAGE TO POLITIQUE PAGE
    this.consentsParametersOverlayComponent.manageShowPrivacyPolicy = function (pageFrom) {
        self.consentsParametersOverlayComponent.removeKeyboardEvents();
        self.consentsPrivacyPolicyComponent.showConsentPrivacyPolicy('parameters');
    };

    //FROM PARAMETERS PAGE TO PARTENAIRES
    this.consentsParametersOverlayComponent.manageShowPartner = function (pageFrom) {
        self.consentsParametersOverlayComponent.removeKeyboardEvents();
        self.consentsPartnerComponent.showConsentPartner('parameters');
    };

    this.consentsParametersOverlayComponent.manageShowErrorMessage = function () {
        self.consentsParametersOverlayComponent.removeKeyboardEvents();
        var displayTimeout = null;
        if (consentModel.toRequest != null && consentModel.toRequest != undefined) {
            displayTimeout = consentModel.toRequest;
        }
        self.consentsErrorComponent.showConsentError(displayTimeout);
    };

    //MANAGE ENTER BUTTON IN PARAMETERS PAGE
    this.consentsParametersOverlayComponent.setEnterKeyEventHandler(function (editMode) {
        var buttonID;
        var positionJson;
        try {
           //CLICK ENTER ON SINGLE BUTTON OUI OR SINGLE BUTTON NON
           if(($('.focused').attr('name') == 'Oui' || $('.focused').attr('name') == 'Non') && !$('.focused').hasClass('all')){
                //Enable button oui and non to next row
                $('.focused').parent().nextAll('.consent-section__page__contain__buttons-container').first().children().removeClass('disabled');
                //Delete class active from all button of row
                if($('.focused').parent().children('.active').length > 0){
                    $('.focused').parent().children().removeClass('active');
                }
                //Add class active to button selected
                $('.focused').addClass('active');
                //Update json width the new value
                buttonID = $('.focused')[0].id;
                positionJson =  buttonID.replace('t', '').replace('f', '');
                if(buttonID.charAt(0) == 't'){
                    parameterValue = true;
                }else{
                    parameterValue = false;
                }
               self.consentsParametersOverlayComponent.manageDownKeyEvent();//move focus to button below
                consentModel.consents[parseInt(
                    positionJson)].consentStatus = parameterValue;
                //End update json width the new value
                self.consentsParametersOverlayComponent.updateModel(consentModel);
            //CLICK ON TOUT ACCEPTER OR TOUT REFUSER
            }else if(($('.focused').attr('name') == 'Oui' || $('.focused').attr('name') == 'Non') && $('.focused').hasClass('all')){
                 if($('.focused').attr('name') == 'Oui'){
                     //console.log("FUNZIONE TOUT ACCEPTER");
                     self.editAllConsentAndSend(true,self.consentsParametersOverlayComponent);
                 }else{
                     //console.log("FUNZIONE TOUT REFUSER");
                     self.editAllConsentAndSend(false,self.consentsParametersOverlayComponent);
                 }
            //CLICK ON VALIDER
            }else if($('.focused').attr('name') == 'Valider'){
                //console.log("FUNZIONE VALIDER");
                self.sendConsents(function (timeDisplayConsentConfirmationOverlay) {
                    self.consentsParametersOverlayComponent.removeKeyboardEvents();
                    var displayTimeout = null;
                    if (timeDisplayConsentConfirmationOverlay != null && timeDisplayConsentConfirmationOverlay != undefined) {
                        displayTimeout = timeDisplayConsentConfirmationOverlay;
                    }
                    self.consentsConfirmationOverlayComponent.showConsentConfirmationOverlay(displayTimeout);
                },
                function () {
                    logManager.error("postConsent Error");

                    consentModel = JSON.parse(JSON.stringify(self.consentsParametersOverlayComponent.getAuxContentModel()));
                    self.consentsParametersOverlayComponent.updateModel(consentModel);

                    self.consentsParametersOverlayComponent.removeKeyboardEvents();
                    self.consentsErrorComponent.showConsentError();
                });
            //CLICK ON BACK BUTTON
            }else if($('#backButton').hasClass('focused')){
                var displayTimeout = null;
                if (consentModel.toRequest != null && consentModel.toRequest != undefined) {
                    displayTimeout = consentModel.toRequest;
                }
                if (yellowButtonEnabled == true) {
                    consentModel = JSON.parse(JSON.stringify(self.consentsParametersOverlayComponent.getAuxContentModel()));
                    self.consentsParametersOverlayComponent.updateModel(consentModel);

                    self.consentsParametersOverlayComponent.removeKeyboardEvents();
                } else {
                    consentModel = JSON.parse(JSON.stringify(self.consentsParametersOverlayComponent.getAuxContentModel()));
                    self.consentsParametersOverlayComponent.updateModel(consentModel);

                    self.consentsParametersOverlayComponent.removeKeyboardEvents();
                    self.consentsDirectValidationOverlayComponent.showConsentDirectValidationOverlay(displayTimeout);
                }
            //CLICK ON POLITIQUE BUTTON
            }else if($('#politique').hasClass('focused')){
                consentModel = JSON.parse(JSON.stringify(self.consentsParametersOverlayComponent.getAuxContentModel()));
                self.consentsParametersOverlayComponent.updateModel(consentModel);

                self.consentsParametersOverlayComponent.manageShowPrivacyPolicy('parameters');
            //CLICK ON PARTENAIRES BUTTON
            }else if($('#partenaires').hasClass('focused')){
                consentModel = JSON.parse(JSON.stringify(self.consentsParametersOverlayComponent.getAuxContentModel()));
                self.consentsParametersOverlayComponent.updateModel(consentModel);

                self.consentsParametersOverlayComponent.manageShowPartner('parameters');
            }
        } catch (e) {
            logManager.error(e.message);
        }
    });

    //MANAGE BACK BUTTON IN PARAMETERS PAGE
    this.consentsParametersOverlayComponent.setBackKeyEventHandler(function () {
        try {
            var displayTimeout = null;
            if (consentModel.toRequest != null && consentModel.toRequest != undefined) {
                displayTimeout = consentModel.toRequest;
            }
            if (yellowButtonEnabled == true) {

                consentModel = JSON.parse(JSON.stringify(self.consentsParametersOverlayComponent.getAuxContentModel()));
                self.consentsParametersOverlayComponent.updateModel(consentModel);

                self.consentsParametersOverlayComponent.removeKeyboardEvents();
            } else {

                consentModel = JSON.parse(JSON.stringify(self.consentsParametersOverlayComponent.getAuxContentModel()));
                self.consentsParametersOverlayComponent.updateModel(consentModel);

                self.consentsParametersOverlayComponent.removeKeyboardEvents();
                self.consentsDirectValidationOverlayComponent.showConsentDirectValidationOverlay(displayTimeout);
            }

        } catch (e) {
            logManager.error(e.message);
        }
    });

    this.loadConsentData = function (onDataLoaded, completeFunction) {
        var request = new RequestPlatform();
        request.getConsentGET(function (json) {
                consentModel = json;
                storageManager.setCookie(configManager.getConfigurations().MODEL_COOKIE_NAME, JSON.stringify(consentModel));
                var isEditable = true;
                for (var i = 0; i < json.consents.length; i++) {
                    var e = i;
                    if (json.consents[e].purposeName == "TRACKING") {
                        trackingConsent = json.consents[e].consentStatus;
                    }

                    //If at least one consent is null, edit mode is deactivated.
                    if (json.consents[e].consentStatus == null) {
                        isEditable = false;
                    }
                }
                var toRequestFlag = json.toRequest != 0;
                if (toRequestFlag) {
                    onDataLoaded(json.toRequest);
                } else if (isEditable == true) {
                    yellowButtonEnabled = true;
                }

                completeFunction(toRequestFlag);//toRequestFlag used to know if consent overlay banner will be shown
            },
            function () {
                logManager.error("getConsent Error");
            });
    };

    this.sendConsents = function (onDataSent, onError) {
        try {
            var postModel = self.parseModelForPost(consentModel);

            for (var i = 0; i < consentModel.consents.length; i++) {
                var e = i;
                if (consentModel.consents[e].purposeName == "TRACKING") {
                    trackingConsent = consentModel.consents[e].consentStatus;
                }
            }

            var request = new RequestPlatform();

            request.getConsentPOST(function (json) {
                    storageManager.setCookie(configManager.getConfigurations().MODEL_COOKIE_NAME, JSON.stringify(consentManager.getModel()));
                    onDataSent(json.toAcknowledge);
                },
                function () {
                    onError();
                },
                postModel);
        } catch (er) {
            logManager.error(er.message);
        }
        //onDataSent();
    };

    this.parseModelForPost = function (originModel) {
        try {
            var parsedModel = {
                tvId: consentManager.getModel().tvId,
                consents: []
            };

            for (var i = 0; i < originModel.consents.length; i++) {
                var e = i;
                var consent = {
                    purposeName: originModel.consents[e].purposeName,
                    consentStatus: originModel.consents[e].consentStatus,
                    purposeId: originModel.consents[e].purposeId
                };
                parsedModel.consents.push(consent);
            }

            return parsedModel;
        } catch (error) {
            logManager.error(error.message);
        }
    };

    this.getModel = function () {
        return consentModel;
    };

    this.getModelConsents = function () {
        var consents = [];

        for (var i = 0; i < consentModel.consents.length; i++) {
            var e = i;
            var consent = {
                purposeName: consentModel.consents[e].purposeName,
                consentStatus: consentModel.consents[e].consentStatus,
                purposeId: consentModel.consents[e].purposeId
            };
            consents[consentModel.consents[e].purposeName] = consent;
        }

        return consents;
    };
};

var FeaturesManager = function () {
    var features;

    this.loadFeaturesConfiguration = function (onOK) {

        $.ajax({
            type: "GET",
            url: configManager.getConfigurations().FEATURES_FILE,
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
                    consentManager.consentsParametersOverlayComponent.init(consentManager.getModel());
                    consentManager.consentsParametersOverlayComponent.showConsentParametersOverlay(yellowButtonEnabled);
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
            url: Constants.LANG_FOLDER + "/labels."+ configManager.getConfigurations().LANGUAGE + ".json",
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
        if (configManager != null && configManager.getConfigurations().ENABLE_LOGS == true) {
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
        if (configManager != null && configManager.getConfigurations().ENABLE_LOGS == true) {
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
        if (configManager && configManager.getConfigurations().ENABLE_LOGS == true) {
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
            var d = new Date(today.setMonth(today.getMonth() + configManager.getConfigurations().COOKIES_MONTHS_DURATION));
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
var RequestPlatform =function () {

    var self = this;

    var getConsentGETRetries = 0;
    var getConsentMaxRetries = configManager.getConfigurations().MAXIMUM_NUMBER_CONSENTS_RETRIES || 1;

    this.getConsentGET=function (onSuccess,onFail) {

        var serviceName="RequestPlatform.getConsent()";
        logManager.log(serviceName);
        var urlManaged=configManager.getConfigurations().API_ENDPOINT + "consents";
        if(configManager.getConfigurations().DUMMY_API == true){
            urlManaged += "/getConsentsDummy.json";
        }
        var ajaxCall;
        var tvIdData = "";
        var logJoiner = "";
        if(consentManager.getModel() != null && consentManager.getModel().tvId != null){
            tvIdData = "tvId=" + consentManager.getModel().tvId;
            logJoiner = "?";
        }
        logManager.log(serviceName + " " + urlManaged + logJoiner + tvIdData);
        ajaxCall = $.ajax({
            type: "GET",
            url: urlManaged,
            data: tvIdData,
            timeout: configManager.getConfigurations().GET_CONSENT_CALL_TIMEOUT,
            success: function(data, textStatus, jqXHR){
                logManager.log(serviceName + " - Response : " + JSON.stringify(data, null, 4));
                onSuccess(data);
            },
            error: function(error){
                if(getConsentGETRetries < getConsentMaxRetries) {
                    getConsentGETRetries++;
                    self.getConsentGET(onSuccess,onFail);
                } else {
                    logManager.error(serviceName + " - Error " + ": " + JSON.stringify(error, null, 4));
                    onFail();
                }
            }
        });

    };

    this.getConsentPOST=function (onSuccess,onFail,jsonConsent,retryAttempt) {
        var serviceName="RequestPlatform.getConsentPOST()";
        logManager.log(serviceName);
        if(!retryAttempt){
            retryAttempt = 0; //init at first call
        }
        var jsonData=JSON.stringify(jsonConsent);
        logManager.log(serviceName + " payload: " + jsonData);
        var urlManaged=configManager.getConfigurations().API_ENDPOINT + "consents";
        if(configManager.getConfigurations().DUMMY_API == true){
            urlManaged += "/getConsentsDummy.json";
        }
        $.ajax({
            type: "POST",
            url: urlManaged,
            data:jsonData,
            contentType: "application/json",
            dataType: 'json',
            timeout: configManager.getConfigurations().SET_CONSENT_CALL_TIMEOUT,
            success: function(data){
                logManager.log("Response " + serviceName + ": " + JSON.stringify(data, null,4));
                if(data.result=="OK"){
                    onSuccess(data);
                }else{
                    onFail(data);
                }
            },
            error: function(error){
                if(retryAttempt < getConsentMaxRetries){
                    retryAttempt++;
                    self.getConsentPOST(onSuccess,onFail,jsonConsent,retryAttempt);
                }else {
                    logManager.error("Error " + serviceName + ": " + JSON.stringify(error, null, 4));
                    onFail();
                }
            }
        });

    };
};

var ConsentsConfirmationOverlayComponent = function(resetKeyboardEventsPrev, registerKeyboardEventsPrev){
    var timeDisplay = Constants.CONSENT_CONFIRMATION_DISPLAY_TIME;

    this.showConsentConfirmationOverlay = function (timeDisplayConfig) {

        if(timeDisplayConfig != null){
            timeDisplay = timeDisplayConfig;
        }

        if (resetKeyboardEventsPrev) {
            resetKeyboardEventsPrev();
        }

        $('.consent-section').load('templates/consent/consent__consents-confirmation-overlay.html', function () {

            setLabels();

            $('.consent-section__banner').show(0, function () {

                yellowButtonEnabled = true;

                keyDownTimeout = window.setTimeout(fadeOutBanner, timeDisplay);
            });
        });
    };

    function fadeOutBanner() {
        $('.consent-section__banner').hide(0, function () {
            registerKeyboardEventsPrev();
            $('.consent-section').empty();
        });
    }

    function setLabels() {

        $('.consent-section__banner__message').html(labelsManager.getLabel('CONSENT_CONFIRMATION_OVERLAY_TEXT'));
    }
};
var ConsentsDirectValidationOverlayComponent = function (resetKeyboardEventsPrev, registerKeyboardEventsPrev) {
    var self = this;
    var keyDownTimeout = null;
    var timeDisplay = Constants.CONSENT_BANNER_DISPLAY_TIME;
    var currentPosition = 0;
    //-1 = Title up button
    // 0 = First button on the right
    // 1 = Second button on the right
    // 2 = Third button on the right
    // 3 = First button on the bottom
    // 4 = Second button on the bottom
    var positionDefault = 0;
    var maxPosition = 3;

    this.showConsentDirectValidationOverlay = function (timeDisplayConfig) {
        if (timeDisplayConfig != null) {
            timeDisplay = timeDisplayConfig;
        }
        /*DEPRECATED - always with three button now
        if(isThirdButtonEnabled){
            $('.consent-section').addClass('withThreeButton');
        }*/

        if (resetKeyboardEventsPrev) {
            resetKeyboardEventsPrev();
        }

        $('.consent-section').load('templates/consent/consent__consents-direct-validation-overlay.html', function () {

            self.registerKeyboardEvents();

            self.setLabels();

            $('.consent-section__banner').show(0, function () {
                //$('#vospreferences').focus();
                if(configManager.getConfigurations().CONSENT_DIRECT_DEFAULT_FOCUS){
                    positionDefault = Number(configManager.getConfigurations().CONSENT_DIRECT_DEFAULT_FOCUS);
                }
                currentPosition = positionDefault;

                $('.tvium-container [tabindex="'+currentPosition+'"]').focus();
                keyDownTimeout = window.setTimeout(fadeOutBanner, timeDisplay);
            });
        });
    };

    function fadeOutBanner() {
        $('.consent-section__banner').hide(0, function () {
            self.removeKeyboardEvents();
            registerKeyboardEventsPrev();
            $('.consent-section').empty();
        });
    }

    this.removeKeyboardEvents = function () {
        keyset.setValue(0);
        document.removeEventListener("keydown", onKeyDown);
        registerKeyboardEventsPrev();
        $('.consent-section').empty();
    };

    this.registerKeyboardEvents = function () {
        keyset.setValue(keyset.NAVIGATION);
        logManager.log("Keyset bound: keyset.NAVIGATION - " + JSON.stringify(app.privateData.keyset));
        document.addEventListener("keydown", onKeyDown);
    };

    function onKeyDown(e) {

        window.clearTimeout(keyDownTimeout);
        logManager.log("Keyset check - e.keyCode: " + e.keyCode + " e.code: " + e.code);
        switch (e.keyCode) {
            case KeyEvent.VK_UP:
            case e.VK_UP:
            case VK_UP:
                self.manageUpKeyEvent();
                break;
            case KeyEvent.VK_DOWN:
            case e.VK_DOWN:
            case VK_DOWN:
                self.manageDownKeyEvent();
                break;
            case KeyEvent.VK_RIGHT:
            case e.VK_RIGHT:
            case VK_RIGHT:
                self.manageRightKeyEvent();
                break;
            case KeyEvent.VK_LEFT:
            case e.VK_LEFT:
            case VK_LEFT:
                self.manageLeftKeyEvent();
                break;
            case KeyEvent.VK_ENTER:
            case e.VK_ENTER:
            case VK_ENTER:
                self.manageEnterKeyEvent();
                break;
        }
        e.preventDefault();
    }

    this.manageDownKeyEvent = function manageDowntKeyEvent() {
        try {

            if(currentPosition < maxPosition) {
                currentPosition++;
                //console.log(currentPosition);
                keyDownTimeout = window.setTimeout(fadeOutBanner, timeDisplay);

                if(currentPosition <= maxPosition){
                    $('.tvium-container [tabindex="'+currentPosition+'"]').focus();
                }
            }
        } catch (e) {
            logManager.error("manageDownKeyEvent()" + e.message);
        }
    };

    this.manageUpKeyEvent = function manageUpKeyEvent() {
        try {
            if(currentPosition == -1){
                currentPosition++;
            }else if($(':focus').hasClass('link--reset')){
                //currentPosition = positionDefault + 1;
                currentPosition = Number($('.skipfocus').attr('tabindex')) + 1;
            }else if (currentPosition > 0 && currentPosition <= maxPosition) {
                currentPosition--;
                keyDownTimeout = window.setTimeout(fadeOutBanner, timeDisplay);
            }
            $('.tvium-container [tabindex="'+currentPosition+'"]').focus();
        } catch (e) {
            logManager.error("manageUpKeyEvent()" + e.message);
        }
    };

    this.manageRightKeyEvent = function manageRightKeyEvent() {
        try {
            if(currentPosition == maxPosition || currentPosition == -1){
               currentPosition++;
            }
            $('.tvium-container [tabindex="'+currentPosition+'"]').focus();
        } catch (e) {
            logManager.error("manageRightKeyEvent()" + e.message);
        }
    };

    this.manageLeftKeyEvent = function manageLeftKeyEvent() {
        try {
            if(currentPosition == -1){
                currentPosition++;
            }else if(currentPosition == maxPosition +1){
               currentPosition--;
            }
            $('.tvium-container [tabindex="'+currentPosition+'"]').focus();
        } catch (e) {
            logManager.error("manageLeftKeyEvent()" + e.message);
        }
    };

    this.manageEnterKeyEvent = null;

    this.setEnterKeyEventHandler = function (handler) {
        self.manageEnterKeyEvent = handler;
    };

    this.setLabels = function () {
        $('.consent-section__banner__left__logo').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_LEFT_LOGO'));
        $('.consent-section__banner__left__title').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_LEFT_TITLE'));
        $('.consent-section__banner__left__message').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_LEFT_TEXT'));
        $('#politique').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_LEFT_TEXT_DOWN_POLITIQUE'));
        $('#partenaires').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_LEFT_TEXT_DOWN_PARTENAIRES'));

        $('.consent-section__banner__right__title').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_RIGHT_TITLE'));
        $('#buttonOk').val(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_OK_BUTTON'));
        $('#buttonParameter').val(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_PARAMETERS_BUTTON'));
        $('#buttonRefuser').val(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_REFUSER_BUTTON'));
    };

    this.getCurrentPosition = function () {
        return currentPosition;
    };
};
var ConsentsErrorComponent = function (resetKeyboardEventsPrev, registerKeyboardEventsPrev) {

    var self = this;
    var keyDownTimeout = null;
    var timeDisplay = Constants.CONSENT_BANNER_DISPLAY_TIME;

    this.showConsentError = function (timeDisplayConfig) {
        activeContext = self;//in case of set consent error prevent register listener of this error popup to overlap on the salto banner one
        if (timeDisplayConfig != null) {
            timeDisplay = timeDisplayConfig;
        }

        if (resetKeyboardEventsPrev) {
            resetKeyboardEventsPrev();
        }

        $('.consent-section').empty();
        $('.consent-section').load('templates/consent/consent__consents-error.html', function () {
            self.registerKeyboardEvents();
            self.setLabels();
            $('.consent-section__banner').show(0);
            keyDownTimeout = window.setTimeout(fadeOutBanner, timeDisplay);
        });
    };

    function fadeOutBanner() {
        $('.consent-section__banner').hide(0, function () {
            window.clearTimeout(keyDownTimeout);
            self.removeKeyboardEvents();
            activeContext = null; //resetting so partner banner can be shown on next iteration - the registerKeyboardEventsPrev below will ri-register enter key for partner banner app launch
            registerKeyboardEventsPrev();
            $('.consent-section').empty();
        });
    }

    function onKeyDown(e) {

        logManager.log("Keyset check - e.keyCode: " + e.keyCode + " e.code: " + e.code);
        switch (e.keyCode) {
            case KeyEvent.VK_UP:
            case e.VK_UP:
            case VK_UP:
                break;
            case KeyEvent.VK_DOWN:
            case e.VK_DOWN:
            case VK_DOWN:
                break;
            case KeyEvent.VK_RIGHT:
            case e.VK_RIGHT:
            case VK_RIGHT:
                break;
            case KeyEvent.VK_LEFT:
            case e.VK_LEFT:
            case VK_LEFT:
                break;
            case KeyEvent.VK_ENTER:
            case e.VK_ENTER:
            case VK_ENTER:
                break;
        }
        e.preventDefault();
    }

    this.removeKeyboardEvents = function () {
        keyset.setValue(0);
        document.removeEventListener("keydown", onKeyDown);
        registerKeyboardEventsPrev();
        $('.consent-section').empty();
    };
    this.registerKeyboardEvents = function () {
        keyset.setValue(keyset.NAVIGATION);
        document.addEventListener("keydown", onKeyDown);
    };

    this.setLabels = function () {

        $('.consent-section__banner__message').html(labelsManager.getLabel('CONSENT_ERROR_OVERLAY_TEXT'));
    };
};

var ConsentsParametersOverlayComponent = function (resetKeyboardEventsPrev, registerKeyboardEventsPrev) {
    var self = this;
    var consentModel = null;
    var firstPosition = -1;
    var currentPosition = 0;
    //-1 = Back Button
    // 0 = Title
    // 1 = First button on the right
    // 2 = Second button on the right
    // 3 = Third button on the right
    // 4 = Fourth button on the right
    //10 = First button on the bottom
    //11 = Second button  on the bottom
    var positionDefault = -1;
    var maxPosition = 11;
    var maxButtonActive = 3;
    var auxConsentModel = null;
    var arrayConsents;

    this.init = function (model) {
        self.consentModel = model;
    };

    this.showConsentParametersOverlay = function (editMode) {
        activeContext = self;// used to avoid other feature activation - usually when activation is by stream event or timer (example: partner banner)
        if (resetKeyboardEventsPrev) {
            resetKeyboardEventsPrev();
        }

        $('.consent-section').load('templates/consent/consent__consents-parameters-overlay.html', function () {
            try {
                self.registerKeyboardEvents();

                self.setLabels();

                $('#confirmButtonAll').html(labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_CONFIRM_ALL'));
                $('#refuserButtonAll').html(labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_REFUSER_ALL'));
                $('#politique').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_LEFT_TEXT_DOWN_POLITIQUE'));
                $('#partenaires').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_LEFT_TEXT_DOWN_PARTENAIRES'));

                if (self.consentModel.consents != null) {

                    var consentDOMItemButton = '';
                    var tagIndexCounter = 3;
                    var activeClass = " active";

                    self.auxConsentModel = JSON.parse(JSON.stringify(self.consentModel)); //Object copy workaround

                    for (var i = 0; i < self.consentModel.consents.length; i++) {

                        var currentConsentItem = self.consentModel.consents[i];
                        var consentText = '';
                        var consentStatus;

                        if (editMode != null && editMode == true) {
                            consentText = currentConsentItem.modificationText;
                            if (currentConsentItem.consentStatus != null) {
                                consentStatus = currentConsentItem.consentStatus;
                            }
                        } else {
                            consentText = currentConsentItem.consentText;
                            consentStatus = currentConsentItem.consentStatus;
                        }

                        consentDOMItemButton += '<div class="consent-section__page__contain__text">' + consentText + '</div>' +
                            '<div class="consent-section__page__contain__buttons-container">'+
                            '<button ' +
                            'class="consent-section__page__contain__buttons-container__button button ' + (tagIndexCounter >= 5 && editMode != true ? ' disabled' : '') + (consentStatus == true ? activeClass : '') + '" ' +
                            'id="t' + i + '" ' +
                            'name="' + labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_YES_BUTTON') + '" ' +
                            'value="true" ' +
                            'tabindex="' + tagIndexCounter + '">' +
                            labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_YES_BUTTON') +
                            '</button>';

                        tagIndexCounter++;

                        consentDOMItemButton += '<button ' +
                            'class="consent-section__page__contain__buttons-container__button button ' + (tagIndexCounter >= 5 && editMode != true ? ' disabled' : '') + (consentStatus == false ? activeClass : '') + '" ' +
                            'id="f' + i + '" ' +
                            'name="' + labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_NO_BUTTON') + '" ' +
                            'value="false" ' +
                            'tabindex="' + tagIndexCounter + '">' +
                            labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_NO_BUTTON') +
                            '</button>' +
                            '</div>';

                        tagIndexCounter++;
                    }

                    $('.consent-section__page__contain__buttons-container-all').after(consentDOMItemButton);
                }

                if(configManager.getConfigurations().CONSENT_PARAMETERS_DEFAULT_FOCUS){
                    positionDefault = Number(configManager.getConfigurations().CONSENT_PARAMETERS_DEFAULT_FOCUS);
                }

                if (editMode != null && editMode == true) {
                    $('#confirmButton').focus();
                    $('#confirmButton').addClass('focused');
                    $('#headerText').html(labelsManager.getLabel('CONSENT_MODIFICATION_OVERLAY_HEADER_TEXT'));
                    currentPosition = parseInt($('#confirmButton').attr('tabindex'));
                } else {
                    currentPosition = positionDefault;
                    $('.tvium-container [tabindex="'+currentPosition+'"]').addClass('focused');
                    $('#headerText').html(labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_HEADER_TEXT'));
                    $('.consent-section__page__contain__message').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_LEFT_TEXT'));
                }

            } catch (e) {
                logManager.error(e.message);
            }
        });
    };

    function checkIfMoveDown(){
        if(currentPosition == positionDefault && $('.tvium-container [tabindex="'+currentPosition+'"]').hasClass('skipfocus')){
            return true;
        }else{
            return false;
        }
    }

    function onKeyDown(e) {
        logManager.log("Keyset check - e.keyCode: " + e.keyCode + " e.code: " + e.code);

        switch (e.keyCode) {
            case KeyEvent.VK_UP:
            case e.VK_UP:
            case VK_UP:
                if(checkIfMoveDown()){
                    self.manageDownKeyEvent(yellowButtonEnabled);
                }else{
                    self.manageUpKeyEvent(yellowButtonEnabled);
                }
                break;
            case KeyEvent.VK_DOWN:
            case e.VK_DOWN:
            case VK_DOWN:
                self.manageDownKeyEvent(yellowButtonEnabled);
                break;
            case KeyEvent.VK_RIGHT:
            case e.VK_RIGHT:
            case VK_RIGHT:
                if(checkIfMoveDown()){
                    self.manageDownKeyEvent(yellowButtonEnabled);
                }else{
                    self.manageRightKeyEvent();
                }
                break;
            case KeyEvent.VK_LEFT:
            case e.VK_LEFT:
            case VK_LEFT:
                if(checkIfMoveDown()){
                    self.manageDownKeyEvent(yellowButtonEnabled);
                }else{
                    self.manageLeftKeyEvent();
                }
                break;
            case KeyEvent.VK_ENTER:
            case e.VK_ENTER:
            case VK_ENTER:
                self.manageEnterKeyEvent(yellowButtonEnabled);
                break;
            case KeyEvent.VK_BACK:
            case e.VK_BACK:
            case VK_BACK:
                self.manageBackKeyEvent();
                break;
        }
        e.preventDefault();
    }

    this.manageRightKeyEvent = function () {
        var stepToMove;
        try {
            //If focus on Oui move to 1 position
            //If focus on Non nothing to do
            //If focus on rowbutton:
              //-if last position nothing to do
              //-else move to 1 position

            if($('.focused').attr('name') == 'Oui' || ($('.focused').attr('name') == 'rowbutton' && currentPosition != maxPosition)){
                stepToMove = 1;
            }else if(currentPosition == firstPosition){
                stepToMove = 2;
            }else{
                stepToMove = 0;
            }

            $('*').removeClass('focused');
            currentPosition = currentPosition + stepToMove;

            if($('.tvium-container [tabindex="'+currentPosition+'"]').hasClass('skipfocus')){
                currentPosition++;
            }

            $('.tvium-container [tabindex="'+currentPosition+'"]').addClass('focused');
        } catch (e) {
            logManager.error(e.message);
        }
    };

    this.manageLeftKeyEvent = function () {
        var stepToMove;
        try {
            //If focuse on Non move to 1 position
            //If focused on last position move to 1 position
            //If focus on Oui width class all move to 9 (politique)
            if($('.focused').attr('name') == 'Non' || currentPosition == maxPosition){
                stepToMove = 1;
                currentPosition = currentPosition - stepToMove;
            }else if($('.focused').attr('name') == 'Oui' && $('.focused').hasClass('all')){
                stepToMove = 9;
                currentPosition = currentPosition + stepToMove;
            }else{
                stepToMove = 0;
            }

            $('*').removeClass('focused');

            if($('.tvium-container [tabindex="'+currentPosition+'"]').hasClass('skipfocus')){
                currentPosition--;
            }

            $('.tvium-container [tabindex="'+currentPosition+'"]').addClass('focused');

        } catch (e) {
            logManager.error(e.message);
        }
    };

    this.manageUpKeyEvent = function (editMode) {
        var stepToMove;
        try {
            //if focus on buttonback (firstposition) nothing to do
            //if focus on VosPreferences nothing to do
            //If focus on rowbutton:
            //-if not exixt disables move to valider
            //-else move to tout accepter
            //If focus on valider move to 2 position
            //If focus on Oui move to 2 position
            //If focus on Non move to 1 position
            //If focus on Oui width class all move to 2 position

            if(currentPosition != firstPosition && currentPosition != firstPosition+1){
                if($('.focused').attr('name') == 'rowbutton'){
                    if($('*').hasClass('disabled')){
                        if(currentPosition == maxPosition){
                            stepToMove = 10;
                        }else{
                            stepToMove = 9;
                        }
                    }else{
                        if(currentPosition == maxPosition){
                            stepToMove = 2;
                        }else{
                            stepToMove = 1;
                        }
                    }
                }else if($('.focused').attr('name') == 'Non'){
                    stepToMove = 3;
                }else{
                    stepToMove = 2;
                }
                $('*').removeClass('focused');
                currentPosition = currentPosition - stepToMove;
            }else{
                stepToMove = 0;
            }

            if($('.tvium-container [tabindex="'+currentPosition+'"]').hasClass('skipfocus')){
                currentPosition--;
            }

            $('.tvium-container [tabindex="'+currentPosition+'"]').addClass('focused');

        } catch (e) {
            logManager.error(e.message);
        }
    };

    this.manageDownKeyEvent = function (editMode) {
        var stepToMove;
        try {
            //If oui and next row is disabled nothing to do
            //If oui and next row is enable move to 2 position
            //If non and next row is disabled nothing to do
            //If non and next row is enable move to 1 position
            //If oui and next element is not a button and total button active = maxButtonActive move to 2 position
            //If non and next element is not a button and total button active = maxButtonActive move to 1 position
            //If focus on backbutton (position-1) move to 2 position
            //If focus on validerbutton move to position 1
            //If focus on defaultposition move to position 1
            //If focus on rowbutton nothing to do

            if(currentPosition == positionDefault && $('.tvium-container [tabindex="'+currentPosition+'"]').hasClass('skipfocus')){
                stepToMove = 1;
            }else if(($('.focused').attr('name') == 'Oui' && $('.tvium-container [tabindex="'+(currentPosition+2)+'"]').hasClass('button') && !$('.tvium-container [tabindex="'+(currentPosition+2)+'"]').hasClass('disabled')) || currentPosition == -1){
                stepToMove = 2;
            }else if(($('.focused').attr('name') == 'Non' && $('.tvium-container [tabindex="'+(currentPosition+2)+'"]').hasClass('button') && !$('.tvium-container [tabindex="'+(currentPosition+2)+'"]').hasClass('disabled')) || $('.focused').attr('name') == 'Valider'){
                stepToMove = 1;
            }else if(($('.focused').attr('name') == 'Oui' && $('button.active').length == maxButtonActive)){
                stepToMove = 2;
            }else if(($('.focused').attr('name') == 'Non' && $('button.active').length == maxButtonActive)){
                stepToMove = 1;
            }else{
                stepToMove = 0;
            }

            if(stepToMove != 0){
                $('*').removeClass('focused');
                currentPosition = currentPosition + stepToMove;

                if($('.tvium-container [tabindex="'+currentPosition+'"]').hasClass('skipfocus')){
                    currentPosition++;
                }

                $('.tvium-container [tabindex="'+currentPosition+'"]').addClass('focused');
            }
        } catch (e) {
            logManager.error(e.message);
        }
    };

    this.manageEnterKeyEvent = null;
    this.manageBackKeyEvent = null;
    this.manageShowPrivacyPolicy = null;
    this.manageShowPartner = null;
    this.manageShowErrorMessage = null;

    this.getAuxContentModel = function () {
        return self.auxConsentModel;
    };

    this.setEnterKeyEventHandler = function (handler) {
        self.manageEnterKeyEvent = handler;
    };

    this.setBackKeyEventHandler = function (handler) {
        self.manageBackKeyEvent = handler;
    };

    function fadeOutSection() {
        $(".consent-section__page").hide(0, function () {
            self.removeKeyboardEvents();
            registerKeyboardEventsPrev();
        });
    }

    this.fadeOutError = function () {
        $(".consent-section__banner").fadeOut(1000, function () {
            self.removeKeyboardEvents();
            registerKeyboardEventsPrev();
        });
    };

    this.removeKeyboardEvents = function () {
        keyset.setValue(0);
        document.removeEventListener("keydown", onKeyDown);
        registerKeyboardEventsPrev();
        $('.consent-section').empty();
        activeContext = null; // no more active consent overlay - resetting flag
    };
    this.registerKeyboardEvents = function () {
        keyset.setValue(keyset.NAVIGATION);
        logManager.log("Keyset bound: keyset.NAVIGATION - " + JSON.stringify(app.privateData.keyset));
        document.addEventListener("keydown", onKeyDown);
        // window.document.addEventListener("keydown", function (e) {
        //     logManager.log("Responded to keydown - " + e.keyCode);
        // });
        // window.document.addEventListener("keypress", function (e) {
        //     logManager.log("Responded to keypress - " + e.keyCode);
        // });
        // window.document.addEventListener("keyup", function (e) {
        //     logManager.log("Responded to keyup - " + e.keyCode);
        // })
    };

    this.setLabels = function () {
        $('#backButton').html(labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_BACK_BUTTON'));
        $('#headerTitle').html(labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_TITLE'));
        $('#headerButton').text(labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_LEFT_HEADER_BUTTON'));
        $('#confirmButton').text(labelsManager.getLabel('CONSENT_PARAMETERS_OVERLAY_LEFT_CONFIRM_BUTTON'));
        $('.consent-section__page__left__message_down_link_1').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_LEFT_TEXT_DOWN_LINK_1'));
        $('.consent-section__page__left__message_down_link_2').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_LEFT_TEXT_DOWN_LINK_2'));
        $('.consent-section__page__title_dx').html(labelsManager.getLabel('CONSENT_DIRECT_VALIDATION_OVERLAY_RIGHT_TITLE'));
    };

    this.updateModel = function (newModel) {
        try {
            self.consentModel = newModel;
        } catch (e) {
            logManager.error(e.message);
        }
    };
};
var ConsentsPartnerComponent = function (resetKeyboardEventsPrev, registerKeyboardEventsPrev) {

    var self = this;

    var firstPosition = 0;
    var currentPosition = 0;
    //0 = Back Button
    //1 = Text
    //2 = First button on bottom
    var positionDefault = 2;
    var stepDown = 0;
    var previousPage = '';// store what page is the one before partner page - needed in case flow is: parameters/validation-> partner-> privacypolicy.

    this.showConsentPartner = function (pageFrom) {

        if (resetKeyboardEventsPrev) {
            resetKeyboardEventsPrev();
        }

        $('.consent-section').empty();

        $('.consent-section').load('templates/consent/consent__consents-partenaires.html', function () {

            self.registerKeyboardEvents();
            self.setLabels();

            if(configManager.getConfigurations().CONSENT_PARTENAIRES_DEFAULT_FOCUS){
                positionDefault = Number(configManager.getConfigurations().CONSENT_PARTENAIRES_DEFAULT_FOCUS);
            }
            currentPosition = positionDefault;

            /*$('#backButton').focus();
            $('#backButton').addClass('focused');*/
            $('.tvium-container [tabindex="'+positionDefault+'"]').focus();
            $('.tvium-container [tabindex="'+positionDefault+'"]').addClass('focused');
            if(pageFrom && pageFrom != ''){
                previousPage = pageFrom; //update previousPage
            }
            $('#backButton').attr('pagefrom', previousPage);

            var url = configManager.getConfigurations().API_ENDPOINT + "partners";
            if(configManager.getConfigurations().DUMMY_API == true){
                url += "/getPartnerBannerDummy.json";
            }
            $.ajax({
                type: "GET",
                url: url,
                contentType: "application/json",
                dataType: "json"
            }).done(function (data, textStatus, request) {
                showPartnerList(data);
            }).fail(function (jqXHR, textStatus, error) {
                logManager.log(error);
            });


        });
    };

    function drawPartner(partnerData, i) {
        var partnerItem = '<div class="consent-section__page__contain__partenaires__partners__partner_item" id="partner_' + i +'">' +
            '<div class="consent-section__page__contain__partenaires__partners__partner_item__name">'+ partnerData.NAME +'</div>' +
            '<span>' + labelsManager.getLabel("CONSENT_PARTENAIRES_FINALITE") + '</span>' +
            '<ul>';
        for (var x = 0; x < partnerData.CONSENTS.length; x++) {
            partnerItem += '<li>' + partnerData.CONSENTS[x].CONSENSNAME + '</li>';
        }
        partnerItem += '</ul>' +
            '<div class="consent-section__page__contain__partenaires__partners__partner_item__link">' + labelsManager.getLabel("CONSENT_PARTENAIRES_SITE") +
            '<a href="' + partnerData.URL_POLITIQUE + '">'+ partnerData.URL_POLITIQUE +'</a></div></div>';
        return partnerItem;
    }

    function showPartnerList(data) {
        var partnerItems = '';
        if (data && data.PARTNERS) {
            var partnersList = data.PARTNERS;
            var keys = Object.keys(partnersList);
            if(keys.length > 0) {
                for (var i = 0; i < keys.length; i++) {
                    var partner = partnersList[keys[i]];
                    partnerItems += drawPartner(partner, i);
                }
                $('.consent-section__page__contain__partenaires--txt').html(labelsManager.getLabel('CONSENT_PARTENAIRES_HEADER_TEXT'));
                $('#politique').html(labelsManager.getLabel("CONSENT_PARTENAIRES_POLITIQUE"));
                $('.consent-section__page__contain__partenaires__partners').html(partnerItems);
            }
        }
        if(partnerItems == '') {
            $('.consent-section__page__contain__partenaires--txt').html(labelsManager.getLabel('CONSENT_PARTENAIRES_HEADER_EMPTY_TEXT'));
        }
    }

    function onKeyDown(e) {

        logManager.log("Keyset check - e.keyCode: " + e.keyCode + " e.code: " + e.code);
        switch (e.keyCode) {
            case KeyEvent.VK_ENTER:
            case e.VK_ENTER:
            case VK_ENTER:
                self.manageEnterKeyEvent();
                break;
            case KeyEvent.VK_BACK:
            case e.VK_BACK:
            case VK_BACK:
                self.manageBackKeyEvent();
                break;
            case KeyEvent.VK_UP:
            case e.VK_UP:
            case VK_UP:
                self.manageUpKeyEvent();
                break;
            case KeyEvent.VK_DOWN:
            case e.VK_DOWN:
            case VK_DOWN:
                self.manageDownKeyEvent();
                break;
            case KeyEvent.VK_LEFT:
            case e.VK_LEFT:
            case VK_LEFT:
                self.manageLeftKeyEvent();
                break;
            case KeyEvent.VK_RIGHT:
            case e.VK_RIGHT:
            case VK_RIGHT:
                self.manageRightKeyEvent();
                break;
        }
        e.preventDefault();
    }

    this.manageEnterKeyEvent = null;
    this.manageBackKeyEvent = null;

    this.setEnterKeyEventHandler = function (handler) {
        self.manageEnterKeyEvent = handler;
    };

    this.setBackKeyEventHandler = function (handler) {
        self.manageBackKeyEvent = handler;
    };

    this.manageLeftKeyEvent = function () {
        var tempID;
        if ($('.tvium-container .focused')[0]) {
            tempID = $('.tvium-container .focused')[0].id;
            switch (tempID) {
                case "partenairesText":
                    $('#backButton').addClass("focused");
                    $('#' + tempID).removeClass("focused");
                    break;
            }
        }
    };

    this.manageRightKeyEvent = function () {
        var tempID;
        if ($('.tvium-container .focused')[0]) {
            tempID = $('.tvium-container .focused')[0].id;
            switch (tempID) {
                case "backButton":
                    $('#partenairesText').addClass("focused");
                    $('#' + tempID).removeClass("focused");
                    break;
            }
        }
    };

    this.manageUpKeyEvent = function () {
        var tempID;
        if($('.tvium-container .focused')[0]) {
            tempID = $('.tvium-container .focused')[0].id;
            switch (tempID) {
                case "partenairesText":
                    if ($('#partenairesText')[0].scrollTop <= 0) {
                        $('#backButton').addClass("focused");
                        $('#' + tempID).removeClass("focused");
                    } else {
                        $('#partenairesText')[0].scrollTop = $('#partenairesText')[0].scrollTop - 50;
                    }
                    break;
                case "politique":
                    $('#' + tempID).removeClass('focused');
                    $('#' + tempID).removeClass('active');
                    $('#backButton').addClass('focused');
                    //$('#partenairesText').addClass('focused');
                    break;
            }
        }
    };

    this.manageDownKeyEvent = function () {
        var tempID;
        var heightContainer = $('#partenairesText').height();
        var heightContain = $('.consent-section__page__contain__partenaires__partners').height();
        var diffHeight = heightContain - heightContainer;
        if ($('.tvium-container .focused')[0]) {
            tempID = $('.tvium-container .focused')[0].id;
            switch (tempID) {
                case "backButton":
                    $('#partenairesText').addClass("focused");
                    $('#' + tempID).removeClass("focused");
                    break;
                case "partenairesText":
                    if(stepDown * 50 < diffHeight){
                        $('#partenairesText')[0].scrollTop = $('#partenairesText')[0].scrollTop + 50;
                        stepDown = stepDown + 1;
                    }else{
                        $('#' + tempID).removeClass("focused");
                        $('#politique').addClass("focused");
                        $('#politique').addClass("active");
                        //console.log("POLITIQUE");
                    }
                    break;
            }
        }
    };

    this.removeKeyboardEvents = function () {
        keyset.setValue(0);
        document.removeEventListener("keydown", onKeyDown);
        registerKeyboardEventsPrev();
        $('.consent-section').empty();
    };
    this.registerKeyboardEvents = function () {
        keyset.setValue(keyset.NAVIGATION);
        document.addEventListener("keydown", onKeyDown);
    };

    this.setLabels = function () {
        $('.consent-section__page__back-button').html(labelsManager.getLabel('CONSENT_PARTENAIRES_BACK_BUTTON'));
        $('.consent-section__page__title').html(labelsManager.getLabel('CONSENT_PARTENAIRES_HEADER_TITLE'));
        //$('.consent-section__page__contain__partenaires--txt').html(labelsManager.getLabel('CONSENT_PARTENAIRES_HEADER_TEXT'));
        //$('.consent-section__page__contain__partenaires--body').html(labelsManager.getLabel('CONSENT_PARTENAIRES_TEXT'));
    };
};
var ConsentsPrivacyPolicyComponent = function (resetKeyboardEventsPrev, registerKeyboardEventsPrev) {
    var self = this;

    var firstPosition = -1;
    var currentPosition = 0;
    //-1 = Back Button
    // 0 = Text
    var positionDefault = 0;
    var maxPosition = 0;

    this.showConsentPrivacyPolicy = function (pageFrom) {

        if (resetKeyboardEventsPrev) {
            resetKeyboardEventsPrev();
        }

        $('.consent-section').empty();

        $('.consent-section').load('templates/consent/consent__consents-privacy-policy.html', function () {

            self.registerKeyboardEvents();
            self.setLabels();

            if(configManager.getConfigurations().CONSENT_PRIVACY_DEFAULT_FOCUS){
                positionDefault = Number(configManager.getConfigurations().CONSENT_PRIVACY_DEFAULT_FOCUS);
            }
            currentPosition = positionDefault;

            //$('#backButton').focus();
            //$('#backButton').addClass('focused');
            $('.tvium-container [tabindex="'+currentPosition+'"]').focus();
            $('.tvium-container [tabindex="'+currentPosition+'"]').addClass('focused');

            $('#backButton').attr('pagefrom', pageFrom);
        });
    };

    function onKeyDown(e) {

        logManager.log("Keyset check - e.keyCode: " + e.keyCode + " e.code: " + e.code);
        switch (e.keyCode) {
            case KeyEvent.VK_ENTER:
            case e.VK_ENTER:
            case VK_ENTER:
                self.manageEnterKeyEvent();
                break;
            case KeyEvent.VK_BACK:
            case e.VK_BACK:
            case VK_BACK:
                self.manageBackKeyEvent();
                break;
            case KeyEvent.VK_UP:
            case e.VK_UP:
            case VK_UP:
                self.manageUpKeyEvent();
                break;
            case KeyEvent.VK_DOWN:
            case e.VK_DOWN:
            case VK_DOWN:
                self.manageDownKeyEvent();
                break;
            case KeyEvent.VK_LEFT:
            case e.VK_LEFT:
            case VK_LEFT:
                self.manageLeftKeyEvent();
                break;
            case KeyEvent.VK_RIGHT:
            case e.VK_RIGHT:
            case VK_RIGHT:
                self.manageRightKeyEvent();
                break;
        }
        e.preventDefault();
    }

    this.manageEnterKeyEvent = null;
    this.manageBackKeyEvent = null;

    this.setEnterKeyEventHandler = function (handler) {
        self.manageEnterKeyEvent = handler;
    };

    this.setBackKeyEventHandler = function (handler) {
        self.manageBackKeyEvent = handler;
    };

    this.manageLeftKeyEvent = function () {
        /*var tempID;
        if ($('.focused')[0]) {
            tempID = $('.focused')[0].id;
            switch (tempID) {
                case "privacyPolicyText":
                    $('#backButton').addClass("focused");
                    $('#' + tempID).removeClass("focused");
                    break;
            }
        }*/
        try {
            if(currentPosition == maxPosition) {
                $('*').removeClass('focused');
                currentPosition--;
                $('.tvium-container [tabindex="'+currentPosition+'"]').addClass('focused');
            }
        } catch (e) {
            logManager.error(e.message);
        }
    };

    this.manageRightKeyEvent = function () {
        /*var tempID;
        if ($('.focused')[0]) {
            tempID = $('.focused')[0].id;
            switch (tempID) {
                case "backButton":
                    $('#privacyPolicyText').addClass("focused");
                    $('#' + tempID).removeClass("focused");
                    break;
            }
        }*/
        try {
            if(currentPosition == firstPosition) {
                $('*').removeClass('focused');
                currentPosition++;
                $('.tvium-container [tabindex="'+currentPosition+'"]').addClass('focused');
            }
        } catch (e) {
            logManager.error(e.message);
        }
    };

    this.manageUpKeyEvent = function () {
        /*var tempID;
        if ($('.focused')[0]) {
            tempID = $('.focused')[0].id;
            switch (tempID) {
                case "privacyPolicyText":
                    $('#privacyPolicyText')[0].scrollTop = $('#privacyPolicyText')[0].scrollTop - 50;
                    break;
            }
        }*/
        try {
            if(currentPosition == maxPosition) {
                $('#privacyPolicyText')[0].scrollTop = $('#privacyPolicyText')[0].scrollTop - 50;
            }
        } catch (e) {
            logManager.error(e.message);
        }
    };

    this.manageDownKeyEvent = function () {
        /*var tempID;
        if ($('.focused')[0]) {
            tempID = $('.focused')[0].id;
            switch (tempID) {
                case "privacyPolicyText":
                    $('#privacyPolicyText')[0].scrollTop = $('#privacyPolicyText')[0].scrollTop + 50;
                    break;
            }
        }*/
        try {
            if(currentPosition == maxPosition) {
                $('#privacyPolicyText')[0].scrollTop = $('#privacyPolicyText')[0].scrollTop + 50;
            }
        } catch (e) {
            logManager.error(e.message);
        }
    };

    this.removeKeyboardEvents = function () {
        keyset.setValue(0);
        document.removeEventListener("keydown", onKeyDown);
        registerKeyboardEventsPrev();
        $('.consent-section').empty();
    };
    this.registerKeyboardEvents = function () {
        keyset.setValue(keyset.NAVIGATION);
        document.addEventListener("keydown", onKeyDown);
    };

    this.setLabels = function () {
        $('.consent-section__page__back-button').html(labelsManager.getLabel('CONSENT_PRIVACY_POLICY_BACK_BUTTON'));
        $('.consent-section__page__title').html(labelsManager.getLabel('CONSENT_PRIVACY_POLICY_HEADER_TITLE'));
        $('.consent-section__page__contain__politique--upper').html(labelsManager.getLabel('CONSENT_PRIVACY_POLICY_HEADER_TEXT'));
        $('.consent-section__page__contain__politique--body').html(labelsManager.getLabel('CONSENT_PRIVACY_POLICY_TEXT'));
    };
};