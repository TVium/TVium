var ConsentRequests =function () {

    var self = this;

    var getConsentGETRetries = 0;
    var getConsentMaxRetries = configManager.getConfigurations().MAXIMUM_NUMBER_CONSENTS_RETRIES || 1;

    this.getConsentGET=function (onSuccess,onFail) {

        var serviceName="ConsentRequests.getConsent()";
        logManager.log(serviceName);
        var urlManaged=configManager.getConfigurations().API_ENDPOINT + "consents";
        if(configManager.getConfigurations().DUMMY_API == true){
            urlManaged += "/getConsentsDummy.json";
        }
        var ajaxCall;
        var tvIdData = "";
        var logJoiner = "";
        if(consentManager.getModel() != null && consentManager.getModel().tvId != null){
            tvIdData = "tvId=" + consentManager.getModel().tvId;
            logJoiner = "?";
        }
        logManager.log(serviceName + " " + urlManaged + logJoiner + tvIdData);
        ajaxCall = $.ajax({
            type: "GET",
            url: urlManaged,
            data: tvIdData,
            timeout: configManager.getConfigurations().GET_CONSENT_CALL_TIMEOUT,
            success: function(data, textStatus, jqXHR){
                logManager.log(serviceName + " - Response : " + JSON.stringify(data, null, 4));
                onSuccess(data);
            },
            error: function(error){
                if(getConsentGETRetries < getConsentMaxRetries) {
                    getConsentGETRetries++;
                    self.getConsentGET(onSuccess,onFail);
                } else {
                    logManager.error(serviceName + " - Error " + ": " + JSON.stringify(error, null, 4));
                    onFail();
                }
            }
        });

    };

    this.getConsentPOST=function (onSuccess,onFail,jsonConsent,retryAttempt) {
        var serviceName="ConsentRequests.getConsentPOST()";
        logManager.log(serviceName);
        if(!retryAttempt){
            retryAttempt = 0; //init at first call
        }
        var jsonData=JSON.stringify(jsonConsent);
        logManager.log(serviceName + " payload: " + jsonData);
        var urlManaged=configManager.getConfigurations().API_ENDPOINT + "consents";
        if(configManager.getConfigurations().DUMMY_API == true){
            urlManaged += "/getConsentsDummy.json";
        }
        $.ajax({
            type: "POST",
            url: urlManaged,
            data:jsonData,
            contentType: "application/json",
            dataType: 'json',
            timeout: configManager.getConfigurations().SET_CONSENT_CALL_TIMEOUT,
            success: function(data){
                logManager.log("Response " + serviceName + ": " + JSON.stringify(data, null,4));
                if(data.result=="OK"){
                    onSuccess(data);
                }else{
                    onFail(data);
                }
            },
            error: function(error){
                if(retryAttempt < getConsentMaxRetries){
                    retryAttempt++;
                    self.getConsentPOST(onSuccess,onFail,jsonConsent,retryAttempt);
                }else {
                    logManager.error("Error " + serviceName + ": " + JSON.stringify(error, null, 4));
                    onFail();
                }
            }
        });

    };
};
