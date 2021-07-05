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
