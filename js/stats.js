(function(global, JustGage) {
    'use strict';

    /*
    Read the server config settings from local storage: if no values then show a bootstrap alert.
    */
    function readServerSettings() {
        global.pimon_config.server = global.localStorage.server || "http://app1poy.inpex.com.au:58000";  //with default as POY
        global.pimon_config.server_client = global.localStorage.server_client || "030";
        global.pimon_config.erp_server = global.localStorage.erp_server || "http://app-saperd.inpex.com.au:8002";

        if (global.pimon_config.server === "") {
            $("#js-alert-connection").show(500);
        }
    }

    function getStats() {
        console.log("zpigetstats ajax call");
        $.blockUI({ message: "processing..." });

        $.ajax({
            type: "GET",
            url: global.pimon_config.server + "/zpimon/api/stats/monthly",
            dataType: "json"
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
            //var words = $("<wbr></wbr>");
            //words.text("not implemented");
            //$(".pimon-blacklisted-alltime").html(words);
            $(".pimon-blacklisted-alltime").text("not implemented");
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            $("#js-alert-ajax-text").text(errorThrown);
            $("#js-alert-ajax").show(500);
            $.unblockUI();
        });
    }

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
        getStats();

        /* Add the guages to the global window object so we can access them anywhere. don't know
           if this is the best way - Surely there is a nice asynchronous way... 
        */
        global.gaugeIflowPerDay = new JustGage({
            id: "gaugeIflowPerDay",
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: ["#00CC00"],
            title: "iFlows / Day",
            relativeGaugeSize: true
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
            title: "iFlow Errors / Day",
            relativeGaugeSize: true
        });
        global.gaugeIflowOutstandingErrorsPerDay = new JustGage({
            id: "gaugeIflowOutstandingErrorsPerDay",
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: ["#FF0000"],
            title: "iFlow Current Errors",
            relativeGaugeSize: true
        });

        global.gaugeMessagePerDay = new JustGage({
            id: "gaugeMessagePerDay",
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: ["#00CC00"],
            title: "Messages / Day",
            relativeGaugeSize: true
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
            title: "Errors / Day",
            relativeGaugeSize: true
        });
        global.gaugeMessageOutstandingErrorsPerDay = new JustGage({
            id: "gaugeMessageOutstandingErrorsPerDay",
            value: 0,
            min: 0,
            max: 100,
            showMinMax: false,
            refreshAnimationType: "bounce",
            levelColors: ["#FF0000"],
            title: "Current Errors",
            relativeGaugeSize: true
        });


        var timer = false;
        new ResizeSensor($(".pimon-gauges"), function() {
            if ($(".pimon-gauges").width() < 680) {
                $(".js-guage").width("150px");
                $(".js-guage").height("120px");
                $(".container-gauges").removeClass("container-gauges").addClass("container-gauges-small");  //width("460px");
                //$(".js-guage").css('display', 'block');
                //$(".js-guage").css('display', 'inline-block');
                //$("#tab-iflow-guages").css("display", "block");
                if (timer !== false) {
                    clearTimeout(timer);
                }
                timer = setTimeout(resized, 1000);
            } else {
                $(".js-guage").width("200px");
                $(".js-guage").height("160px");
                $(".container-gauges-small").removeClass("container-gauges-small").addClass("container-gauges"); //width("610px");
                //$(".js-guage").css('display', 'block');
                //$(".js-guage").css('display', 'inline-block');
                //$("#tab-iflow-guages").css("display", "block");
                if (timer !== false) {
                    clearTimeout(timer);
                }
                timer = setTimeout(resized, 300);
            }
        });


        setInterval(function() {
            getStats();
        }, 300000);   //5mins


        // force a refresh
        $("#refresh_btn").click(function() {
            getStats();
        });



        var d1 = [];
        for (var i = 0; i < 14; i += 0.5) {
            d1.push([i, Math.sin(i)]);
        }

        var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];
        var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];

        var placeholder = $(".pimon-chart");
        var plot = $.plot(placeholder, [d1, d2, d3]);
    });
})(this, this.JustGage);