(function(global, JustGage) {
    'use strict';

    /*
    Read the server config settings from local storage: if no values then show a bootstrap alert.
    */
    function readServerSettings() {
        global.pimon_config.server = global.localStorage.server || "http://app1poy.inpex.com.au:58000";  //with default as POY
        global.pimon_config.server_client = global.localStorage.server_client || "030";
        global.pimon_config.erp_server = global.localStorage.erp_server || "http://app-saperd.inpex.com.au:8002";
        global.pimon_config.dev_user = global.localStorage.dev_user || "";
        global.pimon_config.dev_pass = global.localStorage.dev_pass || "";

        if (global.pimon_config.server === "") {
            $("#js-alert-connection").show(500);
        }
    }

    function ajaxBeforeSend(xhr) {
        if (global.location.href.indexOf("localhost") > -1) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(global.pimon_config.dev_user + ":" + global.pimon_config.dev_pass));
            xhr.withCredentials = true;
        }
    }

    function getStats() {
        console.log("zpigetstats ajax call");
        $.blockUI({ message: "processing..." });

        $.ajax({
            type: "GET",
            url: global.pimon_config.server + "/zpimon/api/stats/monthly",
            dataType: "json",
            beforeSend: function(xhr) {
                ajaxBeforeSend(xhr);
            }
        })
        .done(function(data) {
            global.gaugeIflowPerDay.refresh((data.iflowPerDay === undefined)? 0 : data.iflowPerDay);
            global.gaugeIflowErrorsPerDay.refresh((data.iflowErrorsPerDay === undefined)? 0 : data.iflowErrorsPerDay);
            global.gaugeIflowOutstandingErrorsPerDay.refresh((data.iflowOutstandingErrors === undefined)? 0 : data.iflowOutstandingErrors);

            global.gaugeMessagePerDay.refresh((data.messagePerDay === undefined)? 0 : data.messagePerDay);
            global.gaugeMessageErrorsPerDay.refresh((data.messageErrorsPerDay === undefined)? 0 : data.messageErrorsPerDay);
            global.gaugeMessageOutstandingErrorsPerDay.refresh((data.messageOutstandingErrors === undefined)? 0 : data.messageOutstandingErrors);

            $.unblockUI();

            //update the page block elements
            $(".pimon-error-alltime").text((data.errorsAllTime === undefined)? "" : data.errorsAllTime);
            $(".pimon-delivering-alltime").text((data.deliveringAllTime === undefined)? "" : data.deliveringAllTime);
            $(".pimon-blacklisted-alltime").text("not implemented");

            // Setup the FLOT CHART
            // messageTimeSeries is a "name:value" pair of Dates (as long values) and integers (number of messages on that day).
            // i.e. a Histogram of messages.
            var dps = [];
            $.each(data.messageTimeSeries, function(longDate, msgCount) {
                dps.push([longDate, msgCount]);
            });
            dps.sort(function(a, b) {
                return b[0] - a[0];
            });

            //sample data format - simple mulit-dimensional array
            //var d = [[1136070000000, 381.40], [1138748400000, 382.20], [1141167600000, 382.66], [1143842400000, 384.69], [1146434400000, 384.94], [1149112800000, 384.01], [1151704800000, 382.14], [1154383200000, 380.31], [1157061600000, 378.81], [1159653600000, 379.03], [1162335600000, 380.17], [1164927600000, 381.85], [1167606000000, 382.94], [1170284400000, 383.86], [1172703600000, 384.49], [1175378400000, 386.37], [1177970400000, 386.54], [1180648800000, 385.98], [1183240800000, 384.36], [1185919200000, 381.85], [1188597600000, 380.74], [1191189600000, 381.15], [1193871600000, 382.38], [1196463600000, 383.94], [1199142000000, 385.44]];

            var placeholder = $(".pimon-chart");
            var plot = $.plot(placeholder, [dps], {
                xaxis: { mode: "time" }
            });
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            $("#js-alert-ajax-text").text(errorThrown);
            $("#js-alert-ajax").show(500);
            $.unblockUI();
        });
    }

    function createGauge(id, title, colours) {
        return new JustGage({
            id: id,
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: colours,  //["#00CC00"],
            title: title,
            relativeGaugeSize: true
        });
    }

    /*
    This function is called at the end of window re-sizing (actually at the end of the 
    pimon-gauges div resizing).
    There is a strange bug that causes the guages graphic not to draw after a resize - 
    but only due to the gauges residing inside a bootstrap tab pane (or carousel) - and
    only after that tabs have been clicked!
    To get around this we use a timer to make it async and quickly click the tabs.
    */
    function resized() {
        $('.pimon-tab-panel a[href="#tab-message-guages"]').tab('show'); // Select tab by name
        setTimeout(function() {
            $('.pimon-tab-panel a[href="#tab-iflow-guages"]').tab('show'); // Select tab by name
        }, 10);
    }

    /*
    Entry point - on document ready
    */
    $(function() {
        global.pimon_config = {
            server: "",
            server_client: "",
            erp_server: ""
        };
        readServerSettings();

        /*
        We want to use AJAX to read the persisted message data here and build up the below data structure. Allow
        for different scales dynamically.
        */
        //getStats();

        // Add the guages to the global window object so we can access them anywhere. Don't know
        // if this is the best way - Surely there is a nice asynchronous way... 
        global.gaugeIflowPerDay = createGauge("gaugeIflowPerDay", "iFlows / Day", ["#00CC00"]);
        global.gaugeIflowErrorsPerDay = createGauge("gaugeIflowErrorsPerDay", "iFlow Errors / Day", ["#efad29"]);
        global.gaugeIflowOutstandingErrorsPerDay = createGauge("gaugeIflowOutstandingErrorsPerDay", "iFlow Current Errors", ["#c95b5b"]);
        global.gaugeMessagePerDay = createGauge("gaugeMessagePerDay", "Messages / Day", ["#00CC00"]);
        global.gaugeMessageErrorsPerDay = createGauge("gaugeMessageErrorsPerDay", "Errors / Day", ["#efad29"]);
        global.gaugeMessageOutstandingErrorsPerDay = createGauge("gaugeMessageOutstandingErrorsPerDay", "Current Errors", ["#c95b5b"]);

        getStats();
        
        // Detect resizing events on the pimon-gauges div using Mark J. Schmidt's great 
        // CSS-Elements-Queries library (without this resize events are only fired on the 
        // window object) -> https://github.com/marcj/css-element-queries.
        // If the size of the guage container div drops too small then  make the guages 
        // render smaller as well.
        // Note the timer is used so that we can trap the "end" of the resizing and ignore
        // the continual resize events that a fired while the user is moving things.
        var timer = false;
        new ResizeSensor($(".pimon-gauges"), function() {
            if ($(".pimon-gauges").width() < 680) {
                $(".js-guage").width("150px");
                $(".js-guage").height("120px");
                $(".container-gauges").removeClass("container-gauges").addClass("container-gauges-small");  //width("460px");
                if (timer !== false) {
                    clearTimeout(timer);
                }
                timer = setTimeout(resized, 1000);
            } else {
                $(".js-guage").width("200px");
                $(".js-guage").height("160px");
                $(".container-gauges-small").removeClass("container-gauges-small").addClass("container-gauges"); //width("610px");
                if (timer !== false) {
                    clearTimeout(timer);
                }
                timer = setTimeout(resized, 300);
            }
        });


        // Start an interval timer to auto-refresh the display
        setInterval(function() {
            getStats();
        }, 300000);   //5mins


        // Refresh button click - force a refresh
        $("#refresh_btn").click(function() {
            getStats();
        });


        /*
        Use flotcharts (http://www.flotcharts.org/) to build a chart of message histories
        */
        //var d1 = [];
        //for (var i = 0; i < 14; i += 0.5) {
        //    d1.push([i, Math.sin(i)]);
        //}

        //var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];
        //var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];

        //var placeholder = $(".pimon-chart");
        //var plot = $.plot(placeholder, [dataPoints, dataPoints]); //d1, d2, d3]);
    });
})(this, this.JustGage);