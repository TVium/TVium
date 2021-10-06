var Banner = function (resetKeyboardEventsPrev, registerKeyboardEventsPrev) {
    var self = this;
    var bannerElement;
    var displayDurationTimer;
    var configuration = {};

    this.configure = function(config) {
        configuration = config;
    };

    this.getConfiguration = function() {
        return configuration;
    };

    this.buildBanner = function (onLoadEvent) {
        $('.banner-section').empty();
        //build banner, keep hidden
        var width = "auto";
        var height = "auto";
        var fromRight = 0;
        var fromBottom = 0;
        var bannerUrl = self.getConfiguration().CTS_URL;

        bannerElement = $("<img />").addClass("banner-section__banner").attr("src", bannerUrl).css(
            {
                "right": fromRight,
                "bottom": fromBottom,
                "width": width,
                "height": height
            });
        $('.banner-section').append(bannerElement);
        if(onLoadEvent){
            $('img.banner-section__banner').on('load', function() {
                logManager.log("banner img loaded");
                onLoadEvent();
            }).on('error', function(e) {
                logManager.log("banner img failed to load")
            });
        }
    };

    this.startJourney = function () {
        self.stopJourney();//avoid double timer and banner creation
        var displayTime = self.getConfiguration().BANNER_DISPLAY_TIME;
        if (resetKeyboardEventsPrev) {
            resetKeyboardEventsPrev();
        }
        var whenImgLoaded = function () {//show img only when has been loaded
            var showBanner = function () {
                if (activeContext == null) {//check if other overlays or popups are open - e.g consent overlays
                    $('.banner-section').show(0, function () {
                        registerKeyboardEvents();
                        $(':focus').blur();
                        $('.banner-section__banner').addClass("focus").focus();
                        displayDurationTimer = window.setTimeout(function () {
                            $('.banner-section').hide(0);
                            //Resize video fullscreen
                            serviceManager.resizeBroadcast(true);
                            $(':focus').blur();
                            removeKeyboardEvents();
                        }, displayTime);
                    });
                    //Resize video smaller
                    serviceManager.resizeBroadcast(false);
                    //}
                }
            };
            showBanner();
        }
        if (bannerElement == null) {
            self.buildBanner(whenImgLoaded);//wait to show banner until img load event is fired
        }else {
            whenImgLoaded();//img already loaded - no need to check img load event
        }
    };

    this.stopJourney = function () {
    };

    function removeKeyboardEvents () {
        keyset.setValue(0);
        window.removeEventListener("keydown", onKeyDown);
        registerKeyboardEventsPrev();
    };

    function registerKeyboardEvents () {
        var keyToLock = keyset.NAVIGATION;
        keyset.setValue(keyToLock);
        window.addEventListener("keydown", onKeyDown);
    };

    function onKeyDown(e) {

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
                manageEnterKeyEvent();
                break;
        }
        e.preventDefault();
    }

    function manageEnterKeyEvent() {
        logManager.log("ENTER key pressed - launching banner APP.");
        logManager.log("opening SALTO APP: " + self.getConfiguration().APP_URL);
        window.location.href = self.getConfiguration().APP_URL;

    };
};