var KonamiManager = function () {

    var konamis = {
        EDIT_CONSENT: {
            pattern: "" + KeyEvent.VK_YELLOW,
            code: function () {
                if (yellowButtonEnabled === true) {
                    consent.consentsParametersOverlayComponent.init(consent.getModel());
                    consent.consentsParametersOverlayComponent.showConsentParametersOverlay(yellowButtonEnabled);
                }
            }
        },
        SWITCH_LOGS: {
            pattern: "" + KeyEvent.VK_BLUE + KeyEvent.VK_GREEN + KeyEvent.VK_RED + KeyEvent.VK_RED + KeyEvent.VK_GREEN + KeyEvent.VK_BLUE,
            code: function () {
                if (document.getElementById("logContainer").style.display === "block") {
                    logManager.hideLogOverlay();
                } else {
                    logManager.showLogOverlay();
                }
            }
        }/*,
        DELETE_COOKIES: {
            pattern: "" + KeyEvent.VK_GREEN + KeyEvent.VK_RED + KeyEvent.VK_RED + KeyEvent.VK_BLUE,
            code: function () {
                var cookies = document.cookie.split(";");

                if (document.cookie.length < 1) {
                    logManager.log("KonamiManager - No cookies to delete found.");
                } else {
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = cookies[i].trim();
                        var eqPos = cookie.indexOf("=");
                        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=" + window.location.hostname + ";path=/";

                        var cookieCheck = storageManager.getCookie(name);
                        if (cookieCheck) {//workaround if cookie with subdomain cannot be set, retry and set without domain attribute
                            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                        }

                        logManager.log("KonamiManager - '" + name + "' cookie deleted on this domain and path.");
                    }
                }
            }
        }  */
    };

    var loadKonamis = function () {

        for (var key in konamis) {
            if (konamis.hasOwnProperty(key)) {
                konamiDefinition(konamis[key]);
            }
        }
    };

    function konamiDefinition(konamiSpecs) {
        var konami = new Konami();
        konami.pattern = konamiSpecs.pattern;
        konami.code = konamiSpecs.code;
        konami.load();
    }

    return {
        loadKonamis: loadKonamis
    };
};