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