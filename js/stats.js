(function(global, JustGage, Chart) {
    'use strict';

    /*
    Read the server config settings from local storage: if no values then show a bootstrap alert.
    */
    function readServerSettings() {
        global.pimon_config.server = global.localStorage.server || "http://app1poy.inpex.com.au:58000";  //with default as POY
        global.pimon_config.server_client = global.localStorage.server_client || "030";
        global.pimon_config.pi_server = global.localStorage.pi_server || "http://app1pod.inpex.com.au:58200";

        if (global.pimon_config.server === "" || global.pimon_config.server_client === "") {
            $("#js-alert-connection").show(500);
        }
    }

    function getStats() {
        console.log("zpigetstats ajax call");
        $.blockUI({ message: "processing..." });

        $.ajax({
            type: "GET",
            url: global.pimon_config.server + "/zpimon/api/stats/monthly",
            //data: { "sap-client": global.pimon_config.server_client },
            dataType: "json"
            //xhrFields: {
            //    withCredentials: true
            //}
        })
        .done(function(data) {
            global.gaugeIflowPerDay.refresh((data.iflowPerDay === undefined)? 0 : data.iflowPerDay);
            global.gaugeIflowErrorsPerDay.refresh((data.iflowErrorsPerDay === undefined)? 0 : data.iflowErrorsPerDay);
            global.gaugeIflowOutstandingErrorsPerDay.refresh((data.iflowOutstandingErrors === undefined)? 0 : data.iflowOutstandingErrors);

            global.gaugeMessagePerDay.refresh((data.messagePerDay === undefined)? 0 : data.messagePerDay);
            global.gaugeMessageErrorsPerDay.refresh((data.messageErrorsPerDay === undefined)? 0 : data.messageErrorsPerDay);
            global.gaugeMessageOutstandingErrorsPerDay.refresh((data.messageOutstandingErrors === undefined)? 0 : data.messageOutstandingErrors);

            $.unblockUI();
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            $("#js-alert-ajax-text").text(errorThrown);
            $("#js-alert-ajax").show(500);
            $.unblockUI();
        });
    }

    /*
    Entry point - on document ready
    */
    $(function() {
        global.pimon_config = {
            server: "",
            server_client: "",
            pi_server: ""
        };
        readServerSettings();

        /*
        We want to use AJAX to read the persisted message data here and build up the below data structure. Allow
        for different scales dynamically.
        */
        getStats();

        /* Add the guages to the global window object so we can access them anywhere. don't know
           if this is the best way - Surely there is a nice asynchronous way... */
        global.gaugeIflowPerDay = new JustGage({
            id: "gaugeIflowPerDay",
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: ["#00CC00"],
            title: "iFlows / Day"
        });
        global.gaugeIflowErrorsPerDay = new JustGage({
            id: "gaugeIflowErrorsPerDay",
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: ["#FFFF66", "#FF0000"],
            levelColorsGradient: false,
            title: "iFlow Errors / Day"
        });
        global.gaugeIflowOutstandingErrorsPerDay = new JustGage({
            id: "gaugeIflowOutstandingErrorsPerDay",
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: ["#FF0000"],
            title: "iFlow Current Errors"
        });

        global.gaugeMessagePerDay = new JustGage({
            id: "gaugeMessagePerDay",
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: ["#00CC00"],
            title: "Messages / Day"
        });
        global.gaugeMessageErrorsPerDay = new JustGage({
            id: "gaugeMessageErrorsPerDay",
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: ["#FFFF66", "#FF0000"],
            levelColorsGradient: false,
            title: "Errors / Day"
        });
        global.gaugeMessageOutstandingErrorsPerDay = new JustGage({
            id: "gaugeMessageOutstandingErrorsPerDay",
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: ["#FF0000"],
            title: "Current Errors"
        });

        setInterval(function() {
            getStats();
        }, 300000);   //5mins


        // force a refresh
        $("#refresh_btn").click(function() {
            getStats();
        });


        /* Charts.js*/
        var lineChartData = {
            labels : ["January","February","March","April","May","June","July"],
            datasets : [
                {
                    fillColor : "rgba(220,220,220,0.5)",
                    strokeColor : "rgba(220,220,220,1)",
                    pointColor : "rgba(220,220,220,1)",
                    pointStrokeColor : "#fff",
                    data : [65,59,90,81,56,55,40]
                },
                {
                    fillColor : "rgba(151,187,205,0.5)",
                    strokeColor : "rgba(151,187,205,1)",
                    pointColor : "rgba(151,187,205,1)",
                    pointStrokeColor : "#fff",
                    data : [28,48,40,19,96,27,100]
                }
            ]
        };

        var myLine = new Chart(document.getElementById("msgPerDayCanvas").getContext("2d")).Line(lineChartData);
    });
})(this, this.JustGage, this.Chart);