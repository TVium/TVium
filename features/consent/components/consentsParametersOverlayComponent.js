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