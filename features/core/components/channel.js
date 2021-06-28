var Channel=function (obj) {

    var channel=obj;

    //get the object
    this.getChannelObj=function () {
        return channel;
    };

    //get the object in string format (the values of the triplet are concatenated)
    this.getChannelToString=function () {
        checkIfObjNull();
        return channel.onid+'.'+channel.tsid+'.'+channel.sid;
    };

    this.isChannelEqualTo=function (channelObj) {
        return channelObj.getChannelToString()===channel.getChannelToString();
    };

    function checkIfObjNull() {
        if(!channel || !channel.onid){
            logManager.log("current channel obj is null or has no triplet - reloading current channel obj from broadcast object");
            channel = serviceManager.getObjVideo().currentChannel;
            logManager.log("new channel obj: "+ channel);
        }
    }

};
