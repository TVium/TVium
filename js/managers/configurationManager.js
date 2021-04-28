ConfigurationManager = function () {
    var remoteConfiguration = null;
    var allConfiguration = null;
    var platform = {
        brand: "",
        model: "",
        hbbtvversion: ""
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

    this.loadRemoteAppConfigurationPromise = function () {
        return new Promise(function (resolve, reject) {
            try {
                $.ajax({
                    type: "GET",
                    url: Constants.CONFIG_FILE,
                    contentType: "application/json",
                    dataType: "json",
                    timeout: Constants.CONFIG_FILE_TIMEOUT
                }).done(function (data, textStatus, request) {
                    remoteConfiguration = data;
                    logManager.log("remoteConfiguration:" + JSON.stringify(data, null, 4));
                    allConfiguration = Object.assign(remoteConfiguration, Constants);
                    logManager.log(JSON.stringify(allConfiguration, null, 4));
                    resolve();
                }).fail(function (jqXHR, textStatus, error) {
                    var errorDesc = textStatus + " - " + JSON.stringify(jqXHR.responseJSON);
                    reject(serviceName + " - KO " + errorDesc);
                });
            } catch (e) {
                reject(e.message);
            }
        });
    };

    this.loadRemoteAppConfiguration = function (onOK, OnKO) {
        try {
            logManager.generalLog(Constants.CONFIG_FILE + " loading...");
            $.ajax({
                type: "GET",
                url: Constants.CONFIG_FILE,
                contentType: "application/json",
                dataType: "json",
                timeout: Constants.CONFIG_FILE_TIMEOUT,
                success: function (data) {
                    logManager.generalLog(Constants.CONFIG_FILE + " LOADED!");
                    remoteConfiguration = data;
                    allConfiguration = extend(remoteConfiguration, Constants);
                    logManager.generalLog("Server config file and app config file are merged");
                    logManager.generalLog(JSON.stringify(allConfiguration, null, 4));
                    onOK();
                },
                error: function (data) {
                    logManager.generalError(Constants.CONFIG_FILE + " ERROR!");
                    var errorDesc = JSON.stringify(data);
                    logManager.generalError(Constants.CONFIG_FILE + " ERROR DESC:" + errorDesc);
                    OnKO(errorDesc);
                }
            });
        } catch (e) {
            OnKO(e.message);
        }
    };
    //Return all configurations: remote and local configuration in the same object
    this.getConfigurations = function () {
        return allConfiguration;
    };

    this.setConfigurations = function (field, value) {
        if (allConfiguration != null) {
            allConfiguration[field] = value;
        }
    };

};
