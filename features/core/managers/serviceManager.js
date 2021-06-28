var ServiceManager=function () {

    var objVideo=null;
    var currentChannel=null;

    function initialize() {
        try{
            objVideo=document.getElementById('video');
            if (!objVideo){
                logManager.log("html tag 'video' broadcast not found");
            }else{
                logManager.log("binding.. to current channel");
                if(featuresManager.getFeature("bindToCurrentChannel")){
                    try{
                        objVideo.bindToCurrentChannel();
                        logManager.log("objVideo.bindToCurrentChannel() executed correctly");
                    } catch(e) {
                        logManager.error("Error executing bindToCurrentChannel() method. Channel data not retrieved.");
                    }
                }
                logManager.log("setting.. full screen");
                objVideo.setFullScreen(false);
                logManager.log("attaching.. to onChannelChangeSucceeded event");
                objVideo.onChannelChangeSucceeded = onChannelChangeOK;
                logManager.log("attaching.. to onChannelChangeKO event");
                objVideo.onChannelChangeError=onChannelChangeKO;
                logManager.log("attaching.. to onPlayStateChange event");
                objVideo.onPlayStateChange=function (state, error) {
                    if (error){
                        logManager.log("onPlayStateChange() - new state: " + getStateString(state) + " - error:" + error);
                    }else{
                        logManager.log("onPlayStateChange() - new state: " + getStateString(state) );
                    }

                };
                logManager.log("saving.. the current triplet");
                setCurrentChannel(objVideo.currentChannel);
            }
        }catch (e) {
            logManager.error("ServiceManager.initialize() - " + e.message);
        }
    }
    function getCurrentChannel() {
        return currentChannel;
    }
    function setCurrentChannel(obj) {
        currentChannel=new Channel(obj);
    }

    function bindToCurrentChannel() {
        try{
            objVideo.bindToCurrentChannel();
            logManager.log("objVideo binded");
        }catch (e){
            logManager.log("bindToCurrentChannel ERROR: " +e.message);
        }

    }
    function setFullScreen() {
        try{
            objVideo.setFullScreen(true);
            logManager.log("setFullScreen ok");
        }catch (e){
            logManager.log("setFullScreen ERROR: " +e.message);
        }

    }

    function onChannelChangeOK(newChannel) {

        var currentTriplet = newChannel.onid+'.'+newChannel.tsid+'.'+newChannel.sid;

        if (getChannelToString()!= currentTriplet) {
            app.destroyApplication();
        }
    }
    function onChannelChangeKO(channel, errorState) {
        logManager.log("onChannelChangeError() - " + errorState + " - playstate:" + getPlayStateString());
    }


    function getStateString(value) {
        if (value==0){
            return "Unrelized";
        }else if (value==1){
            return "Connecting";
        }else if (value==2){
            return "Presenting";
        }else if (value==3){
            return "stopped";
        }else{
            return "not defined: " +value;
        }
    }

    function getPlayStateString() {
        if (objVideo){
            try{
                return getStateString(objVideo.playState);
            }catch (e){
                return " error: " +e.message;
            }
        }else{
            logManager.warning("The application is broadcast indipendet, press GREEN button to attach to broadcast");
        }
    }

    function getObjVideo() {
        return objVideo;
    }



    function setChannel(onid, tsid, sid) {
        var lstChannels;
        var ch=null;
        logManager.log("change channel to:" +  onid+"."+tsid+"."+sid);
        try {
            if (objVideo){
                lstChannels = objVideo.getChannelConfig().channelList;
            }else{
                logManager.warning("The application is broadcast indipendet, press GREEN button to attach to broadcast");
            }
        } catch (e) {
            logManager.warning('get channelList failed ',e);
            throw e;
        }

        try {
            ch = lstChannels.getChannelByTriplet(onid, tsid, sid);
        } catch (e) {
            logManager.warning('getChannelByTriplet failed for '+onid+'.'+tsid+'.'+sid,e);
            throw e;
        }


        try {
            logManager.log('Setting channel, waiting for onChannelChangeSucceeded...');
            objVideo.setChannel(ch, false);
        } catch (e) {
            logManager.warning('setChannel('+ch+') failed',e);
            throw e;
        }

    }

    function stopBroadcast() {
        if (objVideo){
            try{
                objVideo.stop();
                logManager.log("broadcast stopped");
            }catch (e){
                logManager.warning("stopBroadcast() - error:"+ e.message);
            }
        }else{
            logManager.error("stopBroadcast() - objVideo broadcast not set");
        }
    }
    function startBroadcast() {
        if (objVideo){
            try{
                objVideo.bindToCurrentChannel();
                logManager.log("broadcast binded");
            }catch (e){
                logManager.warning("startBroadcast() - error:"+ e.message);
            }
        }else{
            logManager.error("startBroadcast() - objVideo broadcast not set");
        }

    }

    return {
        initialize:initialize,
        setChannel:setChannel,
        getObjVideo:getObjVideo,
        bindToCurrentChannel:bindToCurrentChannel,
        setFullScreen:setFullScreen,
        stopBroadcast:stopBroadcast,
        startBroadcast:startBroadcast,
        getCurrentChannel:getCurrentChannel,
        setCurrentChannel:setCurrentChannel
    };

};
