var TraceRequests =function () {

    var self = this;

    this.heartbeat=function () {

        var serviceName="TraceRequests.heartbeat()";

        var channelString="";
        var tvIdString = "";

        if (serviceManager.getCurrentChannel()){
            channelString=serviceManager.getCurrentChannel().getChannelToString();

            if (consentManager.getModel() != null && consentManager.getModel().tvId != null){
                tvIdString = consentManager.getModel().tvId;
            }

            var jsonData=JSON.stringify({
                tvId: tvIdString,
                triplet: channelString,
                timestamp: new Date().getTime().toString()
            });
            logManager.log(serviceName + " - payload heartbeat: " + jsonData);
            var urlManaged=configManager.getConfigurations().HEARTBEAT_URL;
            $.ajax({
                type: "POST",
                url: urlManaged,
                data:jsonData,
                timeout: configManager.getConfigurations().HEARTBEAT_TIME_INTERVAL,
                success: function(data){
                    logManager.log(serviceName + " - Response: " + JSON.stringify(data));
                },
                error: function(error){
                    logManager.error(serviceName + " - Error:" + JSON.stringify(error));
                }
            });
        }else{
            logManager.error(serviceName + " - currentChannel is not set");
        }
    };
};
