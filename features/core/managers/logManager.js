var LogManager = function () {

    //Standard non-config dependant logging
    function generalLog(message) {
        var d = new Date(),
            dformat = [d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
        var valueWithTime = dformat + " - " + message;
        valueWithTime = valueWithTime.replace(/&/g, "#");
        console.log(valueWithTime);

    }

    //Standard logging
    function log(message) {
        if (core.getConfiguration().ENABLE_LOGS == true) {
            var d = new Date(),
                dformat = [d.getHours().padLeft(),
                    d.getMinutes().padLeft(),
                    d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
            var valueWithTime = dformat + " - " + message;
            valueWithTime = valueWithTime.replace(/&/g, "#");
            console.log(valueWithTime);
        }
    }

    //Error non-config dependant logging
    function generalError(message) {
        var d = new Date(),
            dformat = [d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
        var valueWithTime = dformat + " -  ERROR: " + message;
        valueWithTime = valueWithTime.replace(/&/g, "#");
        console.error(valueWithTime);
    }

    //Error logging
    function error(message) {
        if (core.getConfiguration().ENABLE_LOGS == true) {
            var d = new Date(),
                dformat = [d.getHours().padLeft(),
                    d.getMinutes().padLeft(),
                    d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
            var valueWithTime = dformat + " - ERROR: " + message;
            valueWithTime = valueWithTime.replace(/&/g, "#");
            console.error(valueWithTime);
        }
    }

    //Warning logging
    function warning(message) {
        if (core.getConfiguration().ENABLE_LOGS == true) {
            var d = new Date(),
                dformat = [d.getHours().padLeft(),
                    d.getMinutes().padLeft(),
                    d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
            var valueWithTime = dformat + " - WARNING: " + message;
            valueWithTime = valueWithTime.replace(/&/g, "#");

            console.warn(valueWithTime);
        }
    }



    return {
        generalLog: generalLog,
        log: log,
        generalError: generalError,
        error: error,
        warning: warning
    };
};
