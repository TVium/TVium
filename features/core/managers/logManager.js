var LogManager = function () {
    var even = true;

    //Standard non-config dependant logging
    function generalLog(message) {
        var d = new Date(),
            dformat = [d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
        var valueWithTime = dformat + " - " + message;
        var v = $("#logContainer");
        valueWithTime = valueWithTime.replace(/&/g, "#");
        var bg = "";
        if (even) {
            bg = "style='background-color: rgba(0, 0, 0, 0.8);'";
        }
        v.append("<p class='colorLogWithEvidence' " + bg + ">" + valueWithTime + "<br/></p>");
        v.scrollTop(v.prop("scrollHeight"));

        console.log(valueWithTime);

        even = !even;
    }

    //Standard logging
    function log(message) {
        if (core.getConfiguration().ENABLE_LOGS == true) {
            var d = new Date(),
                dformat = [d.getHours().padLeft(),
                    d.getMinutes().padLeft(),
                    d.getSeconds().padLeft(), d.getMilliseconds().padLeft()].join(':');
            var valueWithTime = dformat + " - " + message;
            var v = $("#logContainer");
            valueWithTime = valueWithTime.replace(/&/g, "#");
            var bg = "";
            if (even) {
                bg = "style='background-color: rgba(0, 0, 0, 0.8);'";
            }
            v.append("<p class='colorLogWithEvidence' " + bg + ">" + valueWithTime + "<br/></p>");
            v.scrollTop(v.prop("scrollHeight"));

            console.log(valueWithTime);

            even = !even;
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
        var v = $("#logContainer");
        v.append("<p class='colorLogError' >" + valueWithTime + "<br/></p>");
        v.scrollTop(v.prop("scrollHeight"));
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
            var v = $("#logContainer");
            v.append("<p class='colorLogError' >" + valueWithTime + "<br/></p>");
            v.scrollTop(v.prop("scrollHeight"));
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
            var v = $("#logContainer");
            v.append("<p class='colorLogWarning'>" + valueWithTime + "<br/></p>");
            v.scrollTop(v.prop("scrollHeight"));
            console.warn(valueWithTime);
        }
    }


    function showLogOverlay() {
        $("#logContainer").css("display", "block");
        if (core.getConfiguration().ENABLE_LOGS != null) {
            core.getConfiguration().ENABLE_LOGS =  true;
            core.configure(core.getConfiguration());
        }
    }

    function hideLogOverlay() {
        $("#logContainer").css("display", "none");
        if (core.getConfiguration().ENABLE_LOGS != null) {
            core.getConfiguration().ENABLE_LOGS =  false;
            core.configure(core.getConfiguration());
        }
    }

    return {
        generalLog: generalLog,
        log: log,
        generalError: generalError,
        error: error,
        warning: warning,
        showLogOverlay: showLogOverlay,
        hideLogOverlay: hideLogOverlay
    };
};
