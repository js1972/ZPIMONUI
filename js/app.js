/* ========================================================================
 * Application logic for the pimon SAP NetWeaver PI Monitoring tool.
 * Version 0.1.0
 * Dependencies: jQuery 2+, Bootstrap 3+.
 *
 * http://twbs.github.com/bootstrap/javascript.html
 * ======================================================================== */
(function (global, console, $) {
    'use strict';

    /* function to pad a number with leading zeroes */
    function pad(num, size) {
        var s = num + "";
        while (s.length < size) {
            s = "0" + s;
        }
        return s;
    }

    /* 
    Format date time from a string - dateAsString is in Java format: "Oct 10, 2013 2:00:49 AM"

    */
    function formatTime(dateAsString) {
        var d = new Date(dateAsString);
        //var d = new Date(ds.substring(0, 4), ds.substring(4, 6), ds.substring(6, 8), ds.substring(8, 10), ds.substring(10, 12), ds.substring(12, 14));
        var curr_date = pad(d.getDate(), 2);
        var curr_month = d.toString().split(" ")[1]; //pad(d.getMonth() + 1, 2);  //months are zero-based
        var curr_year = d.getFullYear();
        var curr_hour = pad(d.getHours(), 2);
        var curr_min = pad(d.getMinutes(), 2);
        var curr_sec = pad(d.getSeconds(), 2);
        var formatted_time = curr_date + " " + curr_month + " " + curr_year + ", " + curr_hour + ":" + curr_min + ":" + curr_sec;
        return formatted_time;
    }

    /*
    Format a XML string - pretty printer (with line feeds)
    */
    function formatXml(xml) {
        var formatted = '';
        var reg = /(>)(<)(\/*)/g;
        var pad = 0;

        xml = xml.replace(reg, '$1\r\n$2$3');

        $.each(xml.split('\r\n'), function (index, node) {
            var indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0;
            } else if (node.match(/^<\/\w/)) {
                if (pad !== 0) {
                    pad -= 1;
                }
            } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                indent = 1;
            } else {
                indent = 0;
            }

            var padding = '';
            for (var i = 0; i < pad; i++) {
                padding += '  ';
            }

            formatted += padding + node + '\r\n';
            pad += indent;
        });

        return formatted;
    }

    /* Remove any pop-in rows on display*/
    function removeExistingPopinRows() {
        $("tbody > tr.row-popin").remove();
    }

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

    /* Save the settings modal dialog value into localStorage */
    function saveSettings(server, server_client, erp_server, dev_user, dev_pass) {
        global.pimon_config.server = server;
        global.pimon_config.server_client = server_client;
        global.pimon_config.erp_server = erp_server;
        global.pimon_config.dev_user = dev_user;
        global.pimon_config.dev_pass = dev_pass;

        global.localStorage.server = server;
        global.localStorage.server_client = server_client;
        global.localStorage.erp_server = erp_server;
        global.localStorage.dev_user = dev_user;
        global.localStorage.dev_pass = dev_pass;
    }

    function setupNavBarTargetsAndHandlers() {
        // refresh the display on the refresh button click based on currently selected period
        $("#refresh_btn").click(function() {
            getIflows($(".selectpicker").val(), false);
        });

        $("#clear_cache_link").click(function() {
            updateServer();
        });

        /* 
        Setup the target link for opening up the standard message monitors.
        The sap msgmonitor opens up t-code SXMB_MONI in the webgui. This works fine so long as you have the 'XML Tree'
        Chrome plugin.
        */
        //The java message monitor does dodgy stuff with cross frame calls - so we get CORS issues listed in the console here... Still works though.
        $("#pi_std_monitor").attr("href", global.pimon_config.server + "/webdynpro/resources/sap.com/tc~lm~itsam~ui~mainframe~wd/FloorPlanApp?applicationID=com.sap.itsam.mon.xi.msg");
        $("#pi_std_monitor").attr("target", "_blank");

        $("#pi_sxmb_moni").attr("href", global.pimon_config.erp_server + "/sap/bc/gui/sap/its/webgui?~transaction=sxmb_moni&sap-language=EN&sap-client=" + global.pimon_config.server_client);
        $("#pi_sxmb_moni").attr("target", "_blank");

        /* Handle the settings button by opening the settings modal dialog */
        $(".js-settings-btn").click(function() {
            $(".alert").hide(1000);     //hide any visible alerts

            $("#myModalSettings").modal();
            $("#myModalSettings #serverSetting").val(global.pimon_config.server); //pre-populate current value
            $("#myModalSettings #serverClientSetting").val(global.pimon_config.server_client);
            $("#myModalSettings #serverERPSetting").val(global.pimon_config.erp_server); //pre-populate current value
            $("#myModalSettings #developerUsername").val(global.pimon_config.dev_user);
            $("#myModalSettings #developerPassword").val(global.pimon_config.dev_pass);
        });

        /* Handle the settings modal dialog SAVE button */
        $("#myModalSettings .modal-footer button").click(function() {
            saveSettings($("#myModalSettings #serverSetting").val(),
                         $("#myModalSettings #serverClientSetting").val(),
                         $("#myModalSettings #serverERPSetting").val(),
                         $("#myModalSettings #developerUsername").val(),
                         $("#myModalSettings #developerPassword").val()
            );
            $("#footerSettings").show(100).delay(2000).hide(100);
        });
    }

    function updateNavbarNotifications() {
        $.ajax({
            type: "GET",
            url: global.pimon_config.server + "/zpimon/api/stats/monthly",
            dataType: "json",
            beforeSend: function(xhr) {
                ajaxBeforeSend(xhr);
            }
        })
        .done(function(data) {
            $(".pimon-error-num").text(data.iflowOutstandingErrors);

            $(".pimon-notifications li :not(.dropdown-header)").remove();
            $(".pimon-notifications").append(
                $("<li></li>").append("<a id='pimon-notification-error-link' href='javascript:;' tabindex='-1' role='menuitem'>View outstanding errors</a>")
            );

            $("#pimon-notification-error-link").click(function() {
                getIflows("year", true);
                //global.alert("not implemented");
            });
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("Error reading error stats (rest call: /zpimon/api/stats/monthly): " + errorThrown);
        });
    }

    /*
    Cancel a message in PI via a REST call.
    */
    function cancelMessage(msgId, $td) {
        $.ajax({
            type: "POST",
            url: global.pimon_config.server + "/zpimon/api/iflows/messages/" + msgId + "/cancel/",
            beforeSend: function(xhr) {
                ajaxBeforeSend(xhr);
            }
        })
        .done(function(data, textStatus, jqXHR) {
            if (jqXHR.status == 200) {
                //clear the action dropdown button as the message is no longer cancellable!
                $td.html("");
                //directly set the status to cancelled without waiting for page refresh
                var statustextNode = $td.parent().children()[1];
                $(statustextNode).html("cancelled");
                /* note: delay() only works with animations so must enter a fade in and out for show/hide or it wont work! */
                $("#footerMsgCancelled").show(100).delay(2000).hide(100);
            } else {
                global.alert("invalid response");
            }
        
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            $("#js-alert-ajax-text").text(jqXHR.responseText);
            $("#js-alert-ajax").show(500);
        });
    }

    /*
    Re-send a message in PI via a REST call.
    */
    function resendMessage(msgId, $td) {
        $.ajax({
            type: "POST",
            url: global.pimon_config.server + "/zpimon/api/iflows/messages/" + msgId + "/resend/",
            beforeSend: function(xhr) {
                ajaxBeforeSend(xhr);
            }
        })
        .done(function(data, textStatus, jqXHR) {
            if (jqXHR.status == 200) {
                //clear the action dropdown button as the message is no longer cancellable!
                $td.html("");
                //directly set the status to cancelled without waiting for page refresh
                //var statustextNode = $td.parent().children()[1];
                //$(statustextNode).html("cancelled");
                /* note: delay() only works with animations so must enter a fade in and out for show/hide or it wont work! */
                $("#footerMsgCancelled").show(100).delay(2000).hide(100);
            } else {
                global.alert("invalid response");
            }
        
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            $("#js-alert-ajax-text").text(jqXHR.responseText);
            $("#js-alert-ajax").show(500);
        });
    }

    /* call an icf service to execute the caching of PI messages into local table YPIMON */
    function updateServer() {
        $.ajax({
            type: "POST",
            //url: global.pimon_config.server + "/sap/bc/zpipersistmsgs",
            url: global.pimon_config.server + "/zpimon/api/update",
            data: { "sap-client": global.pimon_config.server_client },
            beforeSend: function(xhr) {
                $.blockUI({ message: null });
                ajaxBeforeSend(xhr);
            },
            complete: function() {
                $.unblockUI();
            }
        })
        .done(function() {
            getIflows($(".selectpicker").val(), false);
            /* note: delay() only works with animations so must enter a fade in and out for show/hide or it wont work! */
            $("#footer").show(100).delay(2000).hide(100);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            /*
            If we get the fixed error message below it means the message caching program is already executing.
            Tell user to wait...
            */
            if (errorThrown == "Instance already exists") {
                getIflows($(".selectpicker").val(), false);
                $("#footerAlreadyRunning").show(100).delay(2000).hide(100);
            } else {  /* Real error... */
                $("#js-alert-ajax-text").text(errorThrown);
                $("#js-alert-ajax").show(500);
            }
        });
    }

    /*
    Given the Message Key, read the message log and on success build a html table to
    display the resultset.
    */
    function getMessageLog(msgId) {
        $("#modal-tab-log-table").empty();

        $.ajax({
            type: "GET",
            url: global.pimon_config.server + "/zpimon/api/iflows/messages/" + msgId + "/log/",
            dataType: "json",
            beforeSend: function(xhr) {
                ajaxBeforeSend(xhr);
            }
        })
        .done(function (data) {
            var logTable = $("<table></table>").addClass("table status_log_table");
            var header = $("<thead><tr><th>status</th><th>message</th></tr></thead><tbody>");
            $.each(data, function (i, item) {
                var row = $("<tr></tr");
                var status;
                if (item.status == "E") {
                    status = $("<td></td>").html("<img src='img/led_circle_red.svg.png' class='img-traffic-light'>");
                } else {
                    status = $("<td></td").html("<img src='img/led_circle_green.svg.png' class='img-traffic-light'>");
                }
                status.children("img").popover({
                    "trigger": "hover",
                    "content": formatTime("" + item.timestamp),
                    "placement": "auto left"
                });
                var statusText = $("<td></td>").text(item.text);
                row.append(status).append(statusText);
                logTable.append(row);
            });
            logTable.append("</tbody>");
            $("#modal-tab-log-table").append(logTable);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            global.alert("something went wrong reading message log!");
        });
    }

    /*
    Get the message payload based on the message id
    */
    function getPayload(msgId, msgKey, erpFlag) {
        $.ajax({
            type: "GET",
            url: global.pimon_config.server + "/zpimon/api/iflows/messages/" + msgId + "/payload/",
            dataType: "xml",
            beforeSend: function(xhr) {
                ajaxBeforeSend(xhr);
            }
        })
        .done(function(xml, textStatus, jqXHR) {
            /* Large payloads take a very long time to render - check */
            if (jqXHR.responseText.length > 200000) {
                if (global.confirm("Large payload over 200kB. Rendering will take some time... Continue (with no pretty print)?")) {
                    $.blockUI({ message: "processing..." });

                    //Hack - we need a timeout here to give the browser time to render the blockUI call!
                    setTimeout(function() {
                        $("#payload_div").text(formatXml(jqXHR.responseText));
                        $('#pimon-payload-modal').modal();

                        //************* DONT THINK MSGKEY IS NECESSARY ANY MORE **************
                        //Hide the message key on the message details modal popup so it can be used
                        // by the code to retrieve the status log later on...
                        //Also force the first tab to be shown.
                        $("#pimon-payload-modal").attr("data-js-msgkey", msgKey);
                        $("#modal-payload-tab-list a:first").tab("show");
                        getMessageLog(msgId);

                        $.unblockUI();
                    }, 1000);
                }
            } else {
                $("#payload_div").text(formatXml(jqXHR.responseText));
                $("#pimon-payload-modal").modal();

                //Hide the message key on the message details modal popup so it can be used
                // by the code to retrieve the status log later on...
                //Also force the first tab to be shown.
                $("#pimon-payload-modal").attr("data-js-msgkey", msgKey);
                $("#modal-payload-tab-list a:first").tab("show");
                getMessageLog(msgId);

                /* PrettyPrint adds this class to pre elements that have already
                been pretty-printed; therefore we need to remove it to make
                it run again.
                Pretty print is very slow for large blocks of code!
                The prettyprint function is added to the global object
                */
                $("#payload_div").removeClass("prettyprinted");
                global.prettyPrint();
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            $("#js-alert-ajax-text").text(errorThrown);
            $("#js-alert-ajax").show(500);
        });
    }

    /*
    Call ICF service zpigetmsgsand to get all the messages
    for the specified reference message id.
    */
    function getMessages(refId, rowElement, toggle) {
        removeExistingPopinRows();

        if (toggle === true) {
            var selectedRow = $(rowElement);

            $.ajax({
                type: "GET",
                url: global.pimon_config.server + "/zpimon/api/iflows/" + refId + "/messages/",
                dataType: "json",
                beforeSend: function(xhr) {
                    ajaxBeforeSend(xhr);
                }
            })
            .done(function(data) {
                //add an extra row with one cell - insert a new table within
                var newRow = $("<tr></tr>").addClass("row-popin");
                var newCell = $("<td colspan = '5'></td>");
                var responsiveDiv = $("<div></div>").addClass("table-responsive");

                var popinTable = $("<table></table>").addClass("js-popin-table table table-condensed");
                var header = $("<thead><tr><th> </th><th>status</th><th>start time</th><th>end time</th><th>sender system</th><th>sender interface</th><th>sender namespace</th><th></th></tr></thead>");
                popinTable.append(header).append("<tbody>");

                $.each(data, function(i, item){
                    var iflow = $("<td></td>").text("-");  //.text(item.iflow);
                    var status = $("<td></td>").text(item.status);
                    var start_time = $("<td></td>").text(formatTime(item.start_time));
                    var end_time = $("<td></td>").text(formatTime(item.end_time));
                    var sender_name = $("<td></td>").text(item.sender_name);
                    var interface_name = $("<td></td>").text(item.sender_interface);
                    var interface_namespace = $("<td></td>").text(item.sender_namespace);
                    var action_dropdown;
                    if (item.status == "system error" || item.status == "waiting") {
                        //build the html for a bootstrap dropdown for re-send/cancel
                        action_dropdown = $("<td></td>").addClass("js-msg-cancel");
                        var dropdown = $("<div class='btn-group'></div>");
                        dropdown.append("<button type='button' class='btn btn-warning btn-sm dropdown-toggle' data-toggle='dropdown'> Action <span class='caret'></span></button>");
                        var ul = $("<ul class='dropdown-menu' role='menu'>");
                        var li = $("<li></li>");
                        var a = $("<a class='pimon-action-resend' href='javascript:;'>Re-send</a>").attr("data-js-msg-id", item.id);  //item.message_key
                        li.append(a);
                        ul.append(li);
                        var li2 = $("<li></li>");
                        var a2 = $("<a class='pimon-action-cancel' href='javascript:;'>Cancel</a>").attr("data-js-msg-id", item.id);  //item.message_key
                        li2.append(a2);
                        ul.append(li2);
                        dropdown.append(ul);
                        action_dropdown.append(dropdown);
                    } else {
                        action_dropdown = $("<td></td>");
                    }
                
                    var popinRow = $("<tr></tr>").attr("data-js-msg-id", item.id).attr("data-js-msg-key", item.message_key);
                    popinRow.append(iflow).append(status).append(start_time).append(end_time).append(sender_name).append(interface_name).append(interface_namespace).append(action_dropdown);
                    popinTable.append(popinRow);
                });

                popinTable.append("</tbody>");
                responsiveDiv.append(popinTable);
                newCell.append(responsiveDiv);
                newRow.append(newCell);

                selectedRow.after(newRow);

                //setup click handlers for popin table

                //Enable the click on all row cell except the last one which only holds the 'action' dropdown for cancel and re-send!
                $(".js-popin-table > tbody > tr td:not(:last-child)").click(function() {
                    getPayload($(this).parent().attr("data-js-msg-id"), $(this).parent().attr("data-js-msg-key"), $(this).parent().attr("data-js-erp"));
                });

                //Enable a confirm dialog on the dropdown links using my jquery.bootstrap.confirm plugin
                $(".pimon-action-resend").prettyConfirm({
                    "heading"           : "none",
                    "question"          : "Are you sure you wish to re-send this message?",
                    "cancelButtonTxt"   : "Cancel",
                    "okButtonTxt"       : "Ok",
                    "callback"          : function ($elem) {
                        var tdNode = $elem.parent().parent().parent().parent();
                        resendMessage($elem.attr("data-js-msg-id"), tdNode);
                    }
                });
                $(".pimon-action-cancel").prettyConfirm({
                    "heading"           : "none",
                    "question"          : "Are you sure you wish to cancel this message? Cancellation cannot be undone.",
                    "cancelButtonTxt"   : "Cancel",
                    "okButtonTxt"       : "Ok",
                    "callback"          : function ($elem) {
                        var tdNode = $elem.parent().parent().parent().parent();
                        cancelMessage($elem.attr("data-js-msg-id"), tdNode);
                    }
                });
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                $("#js-alert-ajax-text").text(errorThrown);
                $("#js-alert-ajax").show(500);
            });
        }
    }

    function ajaxBeforeSend(xhr) {
        if (global.location.href.indexOf("localhost") > -1) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(global.pimon_config.dev_user + ":" + global.pimon_config.dev_pass));
            xhr.withCredentials = true;
        }
    }

    /*
    Get all iFlows for the chosen timeframe
    */
    function getIflows(timeframe, errorsOnly) {
        var url;

        //remove any previous table data
        $("#msgs_container").empty();

        if (errorsOnly) {
            url = global.pimon_config.server + "/zpimon/api/iflows/" + timeframe + "?errors=X";
        } else {
            url = global.pimon_config.server + "/zpimon/api/iflows/" + timeframe;
        }
        
        if(timeframe === "others") {
          url += "?from=" + getDatePickerVal("customPeriodDateFrom").format("YYYY-MM-DD") + "&to=" + getDatePickerVal("customPeriodDateTo").format("YYYY-MM-DD");
        }

        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            beforeSend: function(xhr) {
                ajaxBeforeSend(xhr);
            }
        })
        .done(function(data) {
            //build table of iflows and position at msgs_container
            var table = $("<table></table>").addClass("js-iflows table table-striped table-hover");  /* table-condensed */
            var header = $("<thead><tr><th>iFlow</th><th>status</th><th>start time</th><th>end time</th><th>sender system</th></tr></thead>");
            table.append(header).append("<tbody>");
            $.each(data, function(i, item){
                var row = $("<tr></tr>").attr("data-js-ref-id", item.ref_id);
                var iflow = $("<td></td>").text(item.iflow);
                var status = $("<td></td>").text(item.status);

                var start_time = $("<td></td>").text(formatTime(item.startTime));
                var end_time = $("<td></td>").text(formatTime(item.endTime));
                var sender_name = $("<td></td>").text(item.sender_name);
                row.append(iflow).append(status).append(start_time).append(end_time).append(sender_name);

                switch (item.status) {
                    case "cancelled":
                        row.addClass("warning");
                        break;
                    case "system error":
                        row.addClass("danger");
                        break;
                    default:
                        break;
                }

                table.append(row);
            });
            table.append("</tbody>");
            $("#msgs_container").append(table);

            //table row click handler -> display individual messages
            $(".js-iflows > tbody > tr").click(function() {
                var toggle;

                if ($(this).attr("data-js-open") == "true") {
                    $(this).removeAttr("data-js-open");
                    toggle = false;
                } else {
                    //remove the open attribute from all rows first
                    $(".js-iflows > tbody > tr").each(function() {
                        $(this).removeAttr("data-js-open");
                    });
                    $(this).attr("data-js-open", "true");
                    toggle = true;
                }

                getMessages($(this).attr("data-js-ref-id"), this, toggle);
            });

            $.extend($.tablesorter.themes.bootstrap, {
                // these classes are added to the table. To see other table classes available,
                // look here: http://twitter.github.com/bootstrap/base-css.html#tables
                table      : 'table table-bordered',
                header     : 'bootstrap-header', // give the header a gradient background
                footerRow  : '',
                footerCells: '',
                icons      : '', // add "icon-white" to make them white; this icon class is added to the <i> in the header
                sortNone   : 'bootstrap-icon-unsorted',
                sortAsc    : 'icon-chevron-up',
                sortDesc   : 'icon-chevron-down',
                active     : '', // applied when column is sorted
                hover      : '', // use custom css here - bootstrap class may not override it
                filterRow  : '', // filter row class
                even       : '', // odd row zebra striping
                odd        : ''  // even row zebra striping
            });

            $(".js-iflows").tablesorter({
                // this will apply the bootstrap theme if "uitheme" widget is included
                // the widgetOptions.uitheme is no longer required to be set
                theme : "bootstrap",
                headerTemplate : "{content} {icon}",
                widgets : [ "uitheme", "filter" ],
                sortReset: true,
                widgetOptions : {
                    filter_reset : ".reset"
                }
            });
            $(".js-iflows").bind("sortStart", function() {
                removeExistingPopinRows();

                //remove the open attribute from all rows first
                $(".js-iflows > tbody > tr").each(function() {
                    $(this).removeAttr("data-js-open");
                });
            });

            $(".js-iflow-num").text(data.length);

            updateNavbarNotifications();
        })
        .fail(function(jqXHR, textStatus) {
            $("#js-alert-ajax-text").text(textStatus + " : " + jqXHR.status);
            $("#js-alert-ajax").show(500);
        });
    }
    
    //NOTE: This returs a Moment (momentjs.com) object, not a standard date object
    function getDatePickerVal(datePicker) {
      var moment = $("#"+datePicker).data("DateTimePicker").getDate();
      if(moment !== null && moment.isValid()) {
        return moment;  
      } else {
        return null;
      }
    }
    
    function validateDates () {
      var dateFrom = getDatePickerVal("customPeriodDateFrom");
      var dateTo = getDatePickerVal("customPeriodDateTo");
      var validSelection = false;
      
      if(dateFrom !== null && dateTo !== null) {
        //Can be equal as just dates, rest layer converts dateFrom to 00:00:00 and dateTo to 23:59:59
        if(dateFrom.unix() <= dateTo.unix()) {
          validSelection = true;
        }
      }
      
      if(validSelection === true) {
        $("#btnCustomDateSearch").removeAttr("disabled", "disabled");
      }
      else {
        $("#btnCustomDateSearch").attr("disabled", "disabled");
      }
    }

    /*
    Entry point - on document ready
    */
    $(function() {
        global.pimon_config = {
            server: "",
            server_client: "",
            erp_server: "",
            dev_user: "",
            dev_pass: ""
        };

        /* Hide any alerts when their cancel button is clicked */
        $(".alert .close").click(function() {
            $(this).parent().hide(1000);
        });

        readServerSettings();

        //enable Bootstrap-Select (http://caseyjhol.github.io/bootstrap-select/)
        $(".selectpicker").selectpicker().change(function() {
            if(this.value === "others") {
              $("#customDates").show(300);
              $("#msgs_container").empty();
            } else {
              $("#customDates").hide(300);
              getIflows(this.value, false);
            }            
        });
        
        //Add date pickers: https://github.com/Eonasdan/bootstrap-datetimepicker
        $('.date').datetimepicker({
          pickTime: false
        });
        
        $(".date").on("change.dp",function (e) {
          validateDates();
        });
        
        $("#btnCustomDateSearch").click(function() {
          getIflows($(".selectpicker").val(), false);
        });
        
        //Initialise date pickers to null so they don't pass validation (else default to today)
        $(".date").data("DateTimePicker").setValue();
        validateDates();
        
        getIflows("today", false);
        setupNavBarTargetsAndHandlers();
    });
})(this, console, jQuery);