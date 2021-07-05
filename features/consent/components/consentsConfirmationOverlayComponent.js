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