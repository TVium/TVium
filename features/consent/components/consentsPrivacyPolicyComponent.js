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