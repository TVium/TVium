var FeaturesManager = function () {
    var features;

    this.loadFeaturesConfiguration = function (onOK) {

        $.ajax({
            type: "GET",
            url: core.getConfiguration().FEATURES_FILE,
            contentType: "application/json",
            dataType: "json"
        }).done(function (data, textStatus, request) {
            //features = data;
            try {
                for (var i = 0; i < data.devices.length; i++) {
                    if (data.devices[i].userAgentInfo.brand.trim() == null) {
                        data.devices[i].userAgentInfo.brand = "";
                    }
                    if (data.devices[i].userAgentInfo.model.trim() == null) {
                        data.devices[i].userAgentInfo.model = "";
                    }
                    if (data.devices[i].userAgentInfo.others.trim() == null) {
                        data.devices[i].userAgentInfo.others = "";
                    }

                    if (window.navigator.userAgent != null &&
                        window.navigator.userAgent.toUpperCase().indexOf(data.devices[i].userAgentInfo.brand.toUpperCase().trim()) > -1 &&
                        window.navigator.userAgent.toUpperCase().indexOf(data.devices[i].userAgentInfo.model.toUpperCase().trim()) > -1 &&
                        window.navigator.userAgent.toUpperCase().indexOf(data.devices[i].userAgentInfo.others.toUpperCase().trim()) > -1) {
                        features = data.devices[i].features;
                        logManager.log("Brand matching: \"" + data.devices[i].userAgentInfo.brand.trim() + "\"\n" +
                            "Model matching: \"" + data.devices[i].userAgentInfo.model.trim() + "\"\n" +
                            "Others matching: \"" + data.devices[i].userAgentInfo.others.trim() + "\"\n" +
                            "Features loaded: " + JSON.stringify(features, null, 4));
                        break;
                    }
                }

                if (features == null || features === "") {
                    logManager.warning("Client not found in Features Whitelist. User Agent: " + window.navigator.userAgent);
                }

                onOK();

            } catch (e) {
                logManager.generalError(e.message);
            }

        }).fail(function (jqXHR, textStatus, error) {
            logManager.log(error);
        });
    };

    this.getFeature = function (id) {

        if (features[id] != null) {
            return features[id];
        } else {
            return features;
        }
    };

    this.setFeature = function (id, value) {

        if (features[id] != null) {
            features[id] = value;
        }
    };
};