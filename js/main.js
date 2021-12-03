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
var streamEvent = null;
var adv = null;
var banner = null;
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
                MODEL_COOKIE_NAME: "appData",
                CONSENT_BANNER_DISPLAY_TIME: 10000,
                CONSENT_CONFIRMATION_DISPLAY_TIME: 5000
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
                    DISABLE_PARTNERS: true
                });
                consent.init();

                banner = new Banner(resetRemoteKeys, setRemoteKeys);
                banner.configure({
                    CTS_URL: "../features/banner/assets/banner.png",
                    BANNER_DISPLAY_TIME: 4000,
                    APP_URL: ""
                });

                //Before call the getConsent (it's the call on the start of the app) I'm waiting for TIME_BEFORE_CONSENT_CALL seconds
                setTimeout(function () {
                    consent.loadConsentData(function (timeDisplayConsentDirectValidationOverlay) {
                        consent.consentsDirectValidationOverlayComponent.showConsentDirectValidationOverlay(timeDisplayConsentDirectValidationOverlay);
                    }, function (consentOverlayDisplaying) {
                        streamEvent = new StreamEvent();
                        adv = new Adv();
                        streamEvent.configure({
                            STREAM_EVENT_CONFIGURATION: {
                            "399.5.2": { //example value
                                NAME: "name",
                                    DVB_STREAM_EVENTS_OBJECT_NAME: "object_name",
                                    DVB_OBJECT_CAROUSEL_COMPONENT_TAG: 100,//example value
                                    CHANNEL_NAME: "channel_name",
                                    XML_STREAM_EVENTS_XML_DEFINITION: "filepath/file.xml"
                            }
                            },
                            TRIGGERABLE_FN_ON_SCTE35_MAP: {
                                0x10: {//0x10 is Program start segmentation type id
                                    FN : function (selectedAttributes, raw_json) {//selectedAttributes are the ones retrieved by scte-35 according to the below ATTRIBUTES
                                        logManager.log("triggered function on scte-35 event");
                                        banner.startJourney();//show L shaped banner - anyway you can set here the function you want to be triggered by scte-35 Program Start (0x10)
                                    },
                                    ATTRIBUTES: ["pts_time"]
                                },
                                0x02: {
                                    FN: function (selectedAttributes, raw_json) {
                                        var adStaticConf = {
                                            ADSERVER_FREEWHEEL_NET_DOMAIN : "7e28b",
                                            ADSERVER_FREEWHEEL_FW_NET_ID : "516747",
                                            ADSERVER_FREEWHEEL_FW_MODE : "live",
                                            ADSERVER_FREEWHEEL_FW_PLAYER_PROFILE : "516747:alpha_JL_XML",
                                            ADSERVER_FREEWHEEL_FW_CAID : "jl_videoasset1",
                                            ADSERVER_FREEWHEEL_FW_CSID : "alpha_jl_sitesection_iptv_1",
                                            ADSERVER_FREEWHEEL_FW_RESP : "vmap1",
                                            ADSERVER_FREEWHEEL_FW_METR : "7",
                                            ADSERVER_FREEWHEEL_FW_VRDU : selectedAttributes.segmentation_duration || "",
                                            ADSERVER_FREEWHEEL_FW_FLAG : "+emcr+qtcb+slcb+scpv+exvt",
                                            ADSERVER_FREEWHEEL_FW_HYLDA : selectedAttributes.segmentation_duration,
                                            ADSERVER_FREEWHEEL_FW_ACID : "alpha2",
                                            ADSERVER_FREEWHEEL_FW_AIID : selectedAttributes.segmentation_upid,
                                            ADSERVER_FREEWHEEL_FW_ABID : selectedAttributes.segmentation_upid,
                                            ADSERVER_FREEWHEEL_FW_VCID2 : consent ? consent.getModel().tvId: "",
                                            ADSERVER_FREEWHEEL_FW_SLID : selectedAttributes.segmentation_upid,
                                            ADSERVER_FREEWHEEL_FW_TPCL : "MIDROLL",
                                            ADSERVER_FREEWHEEL_FW_PTGT : "a",
                                            ADSERVER_FREEWHEEL_FW_MAXD : selectedAttributes.segmentation_duration || "",
                                            ADSERVER_FREEWHEEL_FW_MIND : selectedAttributes.segmentation_duration || ""
                                        }
                                        //it s possible to trigger ad server call only if consent is true adding an IF
                                        adv.callVastAdServerProcess(adStaticConf, selectedAttributes, raw_json);
                                    },
                                    ATTRIBUTES: ["segmentation_upid", "segmentation_duration"]
                                },
                                0x30: {
                                    FN: function (selectedAttributes, raw_json) {
                                        adv.startSCTEProcess(selectedAttributes, raw_json);
                                    },
                                    ATTRIBUTES: ["segmentation_upid", "segmentation_duration", "segment_num"]
                                }
                            },
                            TRIGGERABLE_FN_ON_EVENT: function(obj){
                                adv.onFiredAdv(obj);
                            }
                        });
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
                        });
                        streamEvent.initStreamEventsMethod();
                    });
                }, consent.getConfiguration().TIME_BEFORE_CONSENT_CALL);

            });
        } catch (e) {
            logManager.generalError(e.message);
        }

        konamiManager = new KonamiManager();
        konamiManager.loadKonamis();
        var logLoadTimer = window.setInterval(function () {// debugging logs
            if (core && core.getConfiguration() != null && core.getConfiguration().ENABLE_LOGS) {
                logManager.showLogOverlay();
                window.clearInterval(logLoadTimer);
            }
        }, 1000);

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
            var keyToLock =  keyset.YELLOW + keyset.BLUE + keyset.RED + keyset.GREEN;
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
