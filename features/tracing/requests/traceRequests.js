var TraceRequests =function () {

    var self = this;

    this.heartbeat=function () {

        var serviceName="TraceRequests.heartbeat()";

        var channelString="";
        var tvIdString = "";

        if (serviceManager.getCurrentChannel()){
            channelString=serviceManager.getCurrentChannel().getChannelToString();

            if (consent && consent.getModel() != null && consent.getModel().tvId != null){
                tvIdString = consent.getModel().tvId;
            }

            var jsonData=JSON.stringify({
                tvId: tvIdString,
                triplet: channelString,
                timestamp: new Date().getTime().toString()
            });
            logManager.log(serviceName + " - payload heartbeat: " + jsonData);
            var urlManaged=trace.getConfiguration().HEARTBEAT_URL;
            if(urlManaged && urlManaged !== "") {
                $.ajax({
                    type: "POST",
                    url: urlManaged,
                    data: jsonData,
                    timeout: trace.getConfiguration().HEARTBEAT_TIME_INTERVAL,
                    success: function (data) {
                        logManager.log(serviceName + " - Response: " + JSON.stringify(data));
                    },
                    error: function (error) {
                        logManager.error(serviceName + " - Error:" + JSON.stringify(error));
                    }
                });
            }
        }else{
            logManager.error(serviceName + " - currentChannel is not set");
        }
    };
};
