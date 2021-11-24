var AdvHashmap = function () {
    var lstAdv = {
        status: null,
        dictionary: null
    };
    var advIDLoaded = null;
    var lstStatus = {
        LOADING: "LOADING",
        LOADED: "LOADED",
        STARTING: "STARTING",
        STARTED: "STARTED",
        STOP: "STOP"
    };

    var type = {
        STREAMEVENT: "STREAMEVENT"
    };

    function deleteAdv(advID) {
        delete lstAdv[advID];
        logManager.log('deleteAdv -  Adv Deleted!');
    }

    function clearLst() {
        lstAdv = {};
        advIDLoaded = null;
    }

    function initialize(advID) {
        lstAdv[advID.toString()] = {
            status: null,
            dictionary: null
        };
    }

    function setValue(advID, obj, type) {
        /*jshint ignore:start*/
        if (!isAdvIDExists(advID)) {
            lstAdv[advID] = {};
        }
        lstAdv[advID]["dictionary"] = obj;
        lstAdv[advID]["type"] = type;
        /*jshint ignore:end*/
    }

    function getValue(advID) {
        if (isAdvIDExists(advID)) {
            return lstAdv[advID];
        } else {
            return null;
        }

    }

    function isAdvIDExists(advID) {
        return advID in lstAdv;
    }

    function setStatus(advID, status) {
        if (isAdvIDExists(advID)) {
            /*jshint ignore:start*/
            lstAdv[advID]["status"] = status;
            /*jshint ignore:end*/
            if (status == lstStatus.LOADED) {
                advIDLoaded = advID;
            } else if (status == lstStatus.STOP) {
                advIDLoaded = null;
                logManager.log('Status: ' + status);
            }
        } else {
            logManager.warning('Adv ID not found: ' + advID);
        }
    }

    function lstAdvIsEmpty() {
        return Object.keys(lstAdv).length == 0 || Object.keys(lstAdv).length == 0;
    }

    function isAdvAlreadyLoaded() {
        return advIDLoaded != null;
    }

    function getLoadedAdv() {
        return advIDLoaded;
    }

    return {
        deleteAdv: deleteAdv,
        initialize: initialize,
        setValue: setValue,
        getValue: getValue,
        setStatus: setStatus,
        isAdvIDExists: isAdvIDExists,
        isAdvAlreadyLoaded: isAdvAlreadyLoaded,
        lstStatus: lstStatus,
        type: type,
        clearLst: clearLst,
        lstAdvIsEmpty: lstAdvIsEmpty,
        getLoadedAdv: getLoadedAdv
    };
};
