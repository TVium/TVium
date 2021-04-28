var LabelsManager = function () {
    var labels;

    this.init = function () {

        $.ajax({
            type: "GET",
            url: Constants.LANG_FOLDER + "/labels."+ configManager.getConfigurations().LANGUAGE + ".json",
            contentType: "application/json",
            dataType: "json"
        }).done(function (data, textStatus, request) {
            labels = data;
        }).fail(function (jqXHR, textStatus, error) {
            logManager.log(error);
        });
    };

    this.getLabel = function (id) {

        if(labels[id] != null){
            return labels[id].replace('\n', '<br />');
        } else {
            return '';
        }
    };
};