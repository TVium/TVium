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
