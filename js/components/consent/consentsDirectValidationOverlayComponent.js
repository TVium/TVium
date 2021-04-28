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