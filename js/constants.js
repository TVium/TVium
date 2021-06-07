var Constants = {
    VERSION: "0.1.0",
    CONFIG_FILE: "config/hbbtvConfig.json",
    CONFIG_FILE_TIMEOUT: 30000,
    LANG_FOLDER: "config/languages",
    CONSENT_BANNER_DISPLAY_TIME: 10000,
    CONSENT_CONFIRMATION_DISPLAY_TIME: 5000,
    COOKIES_MONTHS_DURATION: 6,
    MODEL_COOKIE_NAME: "appData",
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
};
