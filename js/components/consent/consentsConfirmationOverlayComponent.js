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