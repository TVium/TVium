var AdvRequests =function () {
    var getWizadsDataRetries = 0;
    var getWizadsDataMaxRetries = 1;

    this.getWizadsData = function (url, onSuccess, onFail) {
        var serviceName = "AdvRequests.getWizadsData()";
        var urlManaged = url;
        var ajaxCall;
        logManager.log(serviceName + " CALLED - url: " + url);
        ajaxCall = $.ajax({
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            url: urlManaged,
            timeout: adv.getConfiguration().GET_WIZADS_TIMEOUT,
            success: function (data, textStatus, jqXHR) {
                logManager.log(serviceName + " - Response : OK");
                onSuccess(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                logManager.error(serviceName + " - Error " + ": " + JSON.stringify(errorThrown, null, 4));
                if (textStatus === "timeout" && getWizadsDataRetries < getWizadsDataMaxRetries) {
                    getWizadsDataRetries++;
                    self.getWizadsData(url, onSuccess, onFail);
                }
                onFail();
            }
        });

    };

    this.doFreewheelAdCall = function (staticConfiguration, attributes, scte_json, onSuccess, onFail) {
        var serviceName = "AdvRequests.doFreewheelAdCall()";
        var urlManaged = "https://" + staticConfiguration.ADSERVER_FREEWHEEL_NET_DOMAIN  + ".v.fwmrm.net/ad/g/1?nw=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_NET_ID +
        "&mode=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_MODE + "&prof=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_PLAYER_PROFILE + "&caid=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_CAID +
        "&csid=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_CSID + "&resp=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_RESP + "&metr=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_METR +
        "&" +
            "vrdu=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_VRDU +"&flag=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_FLAG + ";_fw_hylda=" +
            "acid=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_ACID + "%26" +
            "aiid=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_AIID + "%26" +
            "abid%3D" + staticConfiguration.ADSERVER_FREEWHEEL_FW_ABID + "&_fw_vcid2=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_VCID2 + "&tvium=yes;" +
            "slid=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_SLID + "&tpcl=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_TPCL + "&ptgt=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_PTGT  + "&" +
            "maxd=" + staticConfiguration.ADSERVER_FREEWHEEL_FW_MAXD +"&mind="+ staticConfiguration.ADSERVER_FREEWHEEL_FW_MIND;

        var ajaxCall;
        logManager.log(serviceName + " CALLED - url: " + urlManaged);
        ajaxCall = $.ajax({
            type: "GET",
            dataType: "xml",
            url: urlManaged,
            success: function (data, textStatus, jqXHR) {
                logManager.log(serviceName + " - Response : OK");
                onSuccess(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                logManager.error(serviceName + " - Error " + ": " + JSON.stringify(errorThrown, null, 4));
                onFail();
            }
        });
    };
}