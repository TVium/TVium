var Trace=function () {

    var heartbeat=null;
    var request= new TraceRequests();
    var self=this;
    var configuration = {};

    this.configure = function (config) {
        configuration = config;
    };

    this.getConfiguration = function () {
        return configuration;
    };

    //trace the heartbeat every X second
    this.startHeartbeat=function () {
        if (self.getConfiguration().HEARTBEAT_TIME_INTERVAL!=-1){
            heartbeat=setInterval(function () {
                try{
                    request.heartbeat();
                }catch(e){
                    logManager.error(e.message);
                }

            },self.getConfiguration().HEARTBEAT_TIME_INTERVAL);
        }
    };

    this.injectTrackingPixel=function (url) {
        $("#trackingPixel").remove();
        var trackingPixel = document.createElement("img");
        trackingPixel.setAttribute("id", "trackingPixel");
        trackingPixel.src = escapeXml(url);
        trackingPixel.setAttribute("alt", escapeXml(url));
        document.getElementsByClassName("tvium-container")[0].appendChild(trackingPixel);
    };

};

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
            $.ajax({
                type: "POST",
                url: urlManaged,
                data:jsonData,
                timeout: trace.getConfiguration().HEARTBEAT_TIME_INTERVAL,
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
