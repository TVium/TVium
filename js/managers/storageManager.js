var StorageManager = function () {
    var self = this;

    this.setCookie = function (name, value) {
        var consentDate = this.getCookie("consentDate");
        var expiration = "";
        var domain = window.location.hostname;
        if(consentDate != null){
            expiration = " expires=" + new Date(parseInt(consentDate)).toUTCString() + ";";
        } else {
            var today = new Date();
            var d = new Date(today.setMonth(today.getMonth() + configManager.getConfigurations().COOKIES_MONTHS_DURATION));
            expiration = " expires=" + d.toUTCString() + ";";
            //set consent date cookie - only first time
            document.cookie = "consentDate" + "=" + escape(d.getTime()) + "; domain = " + domain + ";" + expiration + " path=/";
            if(!this.getCookie("consentDate")){
                document.cookie = "consentDate" + "=" + escape(d.getTime()) + ";" + expiration + " path=/";
            }
        }
        document.cookie = name + "=" + escape(value) + "; domain = " + domain + ";" + expiration + " path=/";

        var cookie = this.getCookie(name);
        if (!cookie) {//workaround if cookie with subdomain cannot be set, retry and set without domain attribute
            logManager.warning("cookie " + name + " creation failed. (domain used: " + domain + ")");
            document.cookie = name + "=" + escape(value) + ";" + expiration + " path=/";
            logManager.warning("cookie " + name + " creation without domain succeeded");
        }
    };

    this.getCookie = function (name) {
        var match = document.cookie.match(new RegExp(name + '=([^;]+)'));
        if (match) {
            return unescape(match[1]);
        } else {
            return null;
        }
    };
};