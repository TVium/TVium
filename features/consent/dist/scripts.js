var Consent = function (resetKeyboardEventsPrev, registerKeyboardEventsPrev) {
    var self = this;
    var consentModel = null;

    this.consentsDirectValidationOverlayComponent = new ConsentsDirectValidationOverlayComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);
    this.consentsConfirmationOverlayComponent = new ConsentsConfirmationOverlayComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);
    this.consentsParametersOverlayComponent = new ConsentsParametersOverlayComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);
    this.consentsPrivacyPolicyComponent = new ConsentsPrivacyPolicyComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);
    this.consentsPartnerComponent = new ConsentsPartnerComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);
    this.consentsErrorComponent = new ConsentsErrorComponent(resetKeyboardEventsPrev, registerKeyboardEventsPrev);

    var configuration = {};

    this.configure = function (config) {
        configuration = config;
    };

    this.getConfiguration = function () {
        return configuration;
    };

    this.init = function () {
        var appDataValue = storageManager.getCookie(Constants.MODEL_COOKIE_NAME);
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
        var request = new ConsentRequests();
        request.getConsentGET(function (json) {
                consentModel = json;
                storageManager.setCookie(Constants.MODEL_COOKIE_NAME, JSON.stringify(consentModel));
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

            var request = new ConsentRequests();

            request.getConsentPOST(function (json) {
                    storageManager.setCookie(Constants.MODEL_COOKIE_NAME, JSON.stringify(self.getModel()));
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
                tvId: self.getModel().tvId,
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

var ConsentsConfirmationOverlayComponent = function(resetKeyboardEventsPrev, registerKeyboardEventsPrev){
    var timeDisplay = core.getConfiguration().CONSENT_CONFIRMATION_DISPLAY_TIME;

    this.showConsentConfirmationOverlay = function (timeDisplayConfig) {

        if(timeDisplayConfig != null){
            timeDisplay = timeDisplayConfig;
        }

        if (resetKeyboardEventsPrev) {
            resetKeyboardEventsPrev();
        }

        $('.consent-section').load('features/consent/templates/consent__consents-confirmation-overlay.html', function () {

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
    var timeDisplay = core.getConfiguration().CONSENT_BANNER_DISPLAY_TIME;
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

        $('.consent-section').load('features/consent/templates/consent__consents-direct-validation-overlay.html', function () {

            self.registerKeyboardEvents();

            self.setLabels();

            $('.consent-section__banner').show(0, function () {
                //$('#vospreferences').focus();
                if(consent.getConfiguration().CONSENT_DIRECT_DEFAULT_FOCUS){
                    positionDefault = Number(consent.getConfiguration().CONSENT_DIRECT_DEFAULT_FOCUS);
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
    var timeDisplay = core.getConfiguration().CONSENT_BANNER_DISPLAY_TIME;

    this.showConsentError = function (timeDisplayConfig) {
        activeContext = self;//in case of set consent error prevent register listener of this error popup to overlap on other timed/stream event triggered features (which want to have an own key listener)
        if (timeDisplayConfig != null) {
            timeDisplay = timeDisplayConfig;
        }

        if (resetKeyboardEventsPrev) {
            resetKeyboardEventsPrev();
        }

        $('.consent-section').empty();
        $('.consent-section').load('features/consent/templates/consent__consents-error.html', function () {
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

        $('.consent-section').load('features/consent/templates/consent__consents-parameters-overlay.html', function () {
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

                if(consent.getConfiguration().CONSENT_PARAMETERS_DEFAULT_FOCUS){
                    positionDefault = Number(consent.getConfiguration().CONSENT_PARAMETERS_DEFAULT_FOCUS);
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

        $('.consent-section').load('features/consent/templates/consent__consents-partenaires.html', function () {

            self.registerKeyboardEvents();
            self.setLabels();

            if(consent.getConfiguration().CONSENT_PARTENAIRES_DEFAULT_FOCUS){
                positionDefault = Number(consent.getConfiguration().CONSENT_PARTENAIRES_DEFAULT_FOCUS);
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

            var url = consent.getConfiguration().PARTNER_API_ENDPOINT;
            if(consent.getConfiguration().DUMMY_API == true){
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
            partnerItem += '<li>' + partnerData.CONSENTS[x].CONSENTNAME + '</li>';
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

        $('.consent-section').load('features/consent/templates/consent__consents-privacy-policy.html', function () {

            self.registerKeyboardEvents();
            self.setLabels();

            if(consent.getConfiguration().CONSENT_PRIVACY_DEFAULT_FOCUS){
                positionDefault = Number(consent.getConfiguration().CONSENT_PRIVACY_DEFAULT_FOCUS);
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
var ConsentRequests =function () {

    var self = this;

    var getConsentGETRetries = 0;
    var getConsentMaxRetries = consent.getConfiguration().MAXIMUM_NUMBER_CONSENTS_RETRIES || 1;

    this.getConsentGET=function (onSuccess,onFail) {

        var serviceName="ConsentRequests.getConsent()";
        logManager.log(serviceName);
        var urlManaged=consent.getConfiguration().CONSENT_API_ENDPOINT;
        if(consent.getConfiguration().DUMMY_API == true){
            urlManaged += "/getConsentsDummy.json";
        }
        var ajaxCall;
        var tvIdData = "";
        var logJoiner = "";
        if(consent.getModel() != null && consent.getModel().tvId != null){
            tvIdData = "tvId=" + consent.getModel().tvId;
            logJoiner = "?";
        }
        logManager.log(serviceName + " " + urlManaged + logJoiner + tvIdData);
        ajaxCall = $.ajax({
            type: "GET",
            url: urlManaged,
            data: tvIdData,
            timeout: consent.getConfiguration().GET_CONSENT_CALL_TIMEOUT,
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
        var serviceName="ConsentRequests.getConsentPOST()";
        logManager.log(serviceName);
        if(!retryAttempt){
            retryAttempt = 0; //init at first call
        }
        var jsonData=JSON.stringify(jsonConsent);
        logManager.log(serviceName + " payload: " + jsonData);
        var urlManaged=consent.getConfiguration().CONSENT_API_ENDPOINT;
        if(consent.getConfiguration().DUMMY_API == true){
            urlManaged += "/getConsentsDummy.json";
        }
        $.ajax({
            type: "POST",
            url: urlManaged,
            data:jsonData,
            contentType: "application/json",
            dataType: 'json',
            timeout: consent.getConfiguration().SET_CONSENT_CALL_TIMEOUT,
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
