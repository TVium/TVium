Core = function () {
    var remoteConfiguration = null;
    var platform = {
        brand: "",
        model: "",
        hbbtvversion: ""
    };

    var configuration = {};

    this.configure = function (config) {
        configuration = config;
    };

    this.getConfiguration = function () {
        return configuration;
    };

    this.initPlatformData = function () {
        /*jshint ignore:start*/
        var hbbtvVersion = window.navigator.userAgent.match(/HbbTV\/\d\.(\d).(\d)/g)[0];
        var arrayUserAgent;
        if (hbbtvVersion) {
            platform['hbbtvversion'] = hbbtvVersion;
            var temp = window.navigator.userAgent.substring(window.navigator.userAgent.indexOf(hbbtvVersion) + hbbtvVersion.length);
            var userAgentData = temp.match(/\(([^)]+)\)/)[1];
            if (userAgentData) {
                arrayUserAgent = userAgentData.split(";");
            }
        }
        if (arrayUserAgent && arrayUserAgent.length >= 2) {
            platform['brand'] = arrayUserAgent[1];
        }
        if (arrayUserAgent && arrayUserAgent.length >= 3) {
            platform['model'] = arrayUserAgent[2];
        }
        /*jshint ignore:end*/
    };

    this.getPlatform = function () {
        return platform;
    };

    this.loadRemoteAppConfiguration = function (onOK, OnKO) {//other way to load configuration(from exteranal json instead than using configure())
        try {
            logManager.generalLog(configuration.CONFIG_FILE + " loading...");
            $.ajax({
                type: "GET",
                url: configuration.CONFIG_FILE,
                contentType: "application/json",
                dataType: "json",
                timeout: configuration.CONFIG_FILE_TIMEOUT,
                success: function (data) {
                    logManager.generalLog(configuration.CONFIG_FILE + " LOADED!");
                    remoteConfiguration = data;
                    configuration = extend(remoteConfiguration, Constants);
                    logManager.generalLog("Server config file and app config file are merged");
                    logManager.generalLog(JSON.stringify(configuration, null, 4));
                    onOK();
                },
                error: function (data) {
                    logManager.generalError(configuration.CONFIG_FILE + " ERROR!");
                    var errorDesc = JSON.stringify(data);
                    logManager.generalError(configuration.CONFIG_FILE + " ERROR DESC:" + errorDesc);
                    OnKO(errorDesc);
                }
            });
        } catch (e) {
            OnKO(e.message);
        }
    };

    this.setConfiguration = function (field, value) {//inject single key-value config
        if (configuration != null) {
            configuration[field] = value;
        }
    };

};
