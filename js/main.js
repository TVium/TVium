var app = null;
var logManager = null;
var konamiManager = null;
var serviceManager = null;
var consentManager = null;
var configManager = null;
var storageManager = null;
var labelsManager = null;
var featuresManager = null;
var keyset = null;
var trackingConsent = null;
var yellowButtonEnabled = false;
var activeContext = null;//used to avoid concurrenvy conflict between different features (example: partnerBanner and consentOverlay)

window.onload = function () {
    try {
        logManager = new LogManager();
        logManager.generalLog("User Agent - " + navigator.userAgent);
        logManager.generalLog("App Host - " + window.location.host);

        try {
            //Initialize HbbTV Application
            var appMan = document.getElementById("appMan");
            app = appMan.getOwnerApplication(document);
            app.show();
            keyset = app.privateData.keyset;
        } catch (e) {
            logManager.generalError(e.message);
        }

        try {
            //Load all remote configurations
            configManager = new ConfigurationManager();
            configManager.initPlatformData();
            logManager.generalLog("HbbTvVersion: " + configManager.getPlatform().hbbtvversion + " - Brand: " + configManager.getPlatform().brand + " - Model: " + configManager.getPlatform().model);
            configManager.loadRemoteAppConfiguration(function () {

                featuresManager = new FeaturesManager();
                featuresManager.loadFeaturesConfiguration(function () {
                    //Initialize the class to manage the broadcast
                    serviceManager = new ServiceManager();
                    serviceManager.initialize();

                    //Initialize the class to manage editorial labels
                    labelsManager = new LabelsManager();
                    labelsManager.init();

                    //Initialize the class to manage cookies and other storage
                    storageManager = new StorageManager();

                    //Begin Consent flow
                    logManager.log("getConsent wait-time started");
                    //Initialize the consent manager
                    consentManager = new ConsentManager(resetRemoteKeys, setRemoteKeys);
                    consentManager.init();

                    //Before call the getConsent (it's the call on the start of the app) I'm waiting for TIME_BEFORE_CONSENT_CALL seconds
                    setTimeout(function () {
                        consentManager.loadConsentData(function (timeDisplayConsentDirectValidationOverlay) {
                            consentManager.consentsDirectValidationOverlayComponent.showConsentDirectValidationOverlay(timeDisplayConsentDirectValidationOverlay);
                        }, function (consentOverlayDisplaying) {
                        });
                    }, configManager.getConfigurations().TIME_BEFORE_CONSENT_CALL);

                });

            }, function (data) {
                logManager.generalError(data);
            });
        } catch (e) {
            logManager.generalError(e.message);
        }

        konamiManager = new KonamiManager();
        konamiManager.loadKonamis();

        setRemoteKeys();
        try {
            logManager.generalLog("Keyset bound: " + JSON.stringify(keyset, null, 4) + " - Example key (yellow button): " + keyset.YELLOW);
        } catch (e) {
            logManager.generalError("Init Keyset: " + e.message);
        }

    } catch (e) {    ////<=== START Added after the problem of crash of some Samsung TV
        logManager.generalError("General Error: " + e.message);
    }               //////<=== END Added after the problem of crash of some Samsung TV

    function setRemoteKeys() {

        try {
            var keyToLock =  keyset.YELLOW/* + keyset.BLUE + keyset.RED + keyset.GREEN*/;
            keyset.setValue(keyToLock);
        } catch (e) {
            logManager.generalError("General Error: " + e.message);
        }
    }

    function resetRemoteKeys() {
        try {
            keyset.setValue(0);
        } catch (e) {
            logManager.generalError("General Error: " + e.message);
        }
    }
};
