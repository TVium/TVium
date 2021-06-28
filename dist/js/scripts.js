var Constants = {
    VERSION: "0.1.0"
};

var app = null;
var logManager = null;
var konamiManager = null;
var serviceManager = null;
var mediaSyncManager = null;
var trace = null;
var consent = null;
var core = null;
var storageManager = null;
var labelsManager = null;
var featuresManager = null;
var keyset = null;
var trackingConsent = null;
var yellowButtonEnabled = false;
var adv = null;
var activeContext = null;//used to avoid concurrenvy conflict between different features (wanting to access key listener - one of them could be a consentOverlay)

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
            core = new Core();
            core.configure({
                ENABLE_LOGS: false,
                FEATURES_FILE: "config/features/features_stag.json",
                LANG_FOLDER: "config/languages",
                LANGUAGE: "fr",
                COOKIES_MONTHS_DURATION: 6,
                MODEL_COOKIE_NAME: "appData"
            });
            core.initPlatformData();
            logManager.generalLog("HbbTvVersion: " + core.getPlatform().hbbtvversion + " - Brand: " + core.getPlatform().brand + " - Model: " + core.getPlatform().model);
            featuresManager = new FeaturesManager();
            featuresManager.loadFeaturesConfiguration(function () {
                //Initialize the class to manage the broadcast
                serviceManager = new ServiceManager();
                serviceManager.initialize();

                //Initialize the class to manage the media synchroniser (in order to get the broadcast timeline)
                mediaSyncManager = new MediaSyncManager();
                if (featuresManager.getFeature("PTSMethod")) {
                    mediaSyncManager.init();
                }

                //Initialize the class to manage editorial labels
                labelsManager = new LabelsManager();
                labelsManager.init();

                //Initialize the class to manage the trace services
                trace = new Trace();
                trace.configure({
                    HEARTBEAT_URL: "",
                    HEARTBEAT_TIME_INTERVAL: 10000
                });
                if (featuresManager.getFeature("periodicHeartbeat")) {
                    trace.startHeartbeat();
                }

                //Initialize the class to manage cookies and other storage
                storageManager = new StorageManager();

                //Begin Consent flow
                logManager.log("getConsent wait-time started");
                //Initialize the consent manager
                consent = new Consent(resetRemoteKeys, setRemoteKeys);
                consent.configure({
                    CONSENT_API_ENDPOINT: "./api/consents",
                    PARTNER_API_ENDPOINT: "./api/partners",
                    DUMMY_API: true,
                    GET_CONSENT_CALL_TIMEOUT: 30000,
                    SET_CONSENT_CALL_TIMEOUT: 30000,
                    TIME_BEFORE_CONSENT_CALL: 5000,
                    MAXIMUM_NUMBER_CONSENTS_RETRIES: "1",
                    CONSENT_DIRECT_DEFAULT_FOCUS : "-1",
                    CONSENT_PARAMETERS_DEFAULT_FOCUS: "0",
                    CONSENT_PRIVACY_DEFAULT_FOCUS: "-1",
                    CONSENT_PARTENAIRES_DEFAULT_FOCUS: "0",
                    CONSENT_BANNER_DISPLAY_TIME: 10000,
                    CONSENT_CONFIRMATION_DISPLAY_TIME: 5000
                });
                consent.init();

                //Before call the getConsent (it's the call on the start of the app) I'm waiting for TIME_BEFORE_CONSENT_CALL seconds
                setTimeout(function () {
                    consent.loadConsentData(function (timeDisplayConsentDirectValidationOverlay) {
                        consent.consentsDirectValidationOverlayComponent.showConsentDirectValidationOverlay(timeDisplayConsentDirectValidationOverlay);
                    }, function (consentOverlayDisplaying) {
                        adv = new Adv();
                        adv.configure({
                            ADSERVER_URL: "",
                            GET_WIZADS_TIMEOUT: 1000,
                            PTS_CHECK_START_TIME: 400,
                            PTS_CHECK_INTERVAL_TIME: 4,
                            PTS_CHECK_TOLERANCE: 40,
                            BLACK_FRAMES_DURATION_AFTER_SPOT: 360,
                            VISIBLE_AD_TRACKING: false,
                            AD_SUBSTITUTION_METHOD: "break",//or "spot"
                            CALL_ADSERVER_FALLBACK_ON_STARTEVENT: true,
                            STREAM_EVENT_CONFIGURATION: {
                                "399.5.2": { //example value
                                    NAME: "name",
                                    DVB_STREAM_EVENTS_OBJECT_NAME: "object_name",
                                    DVB_OBJECT_CAROUSEL_COMPONENT_TAG: 100,//example value
                                    CHANNEL_NAME: "channel_name",
                                    XML_STREAM_EVENTS_XML_DEFINITION: "filepath/file.xml"
                                }
                            }
                        });
                        adv.initStreamEventsMethod();
                    });
                }, consent.getConfiguration().TIME_BEFORE_CONSENT_CALL);

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
