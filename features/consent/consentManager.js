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
        var request = new ConsentRequests();
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

            var request = new ConsentRequests();

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
