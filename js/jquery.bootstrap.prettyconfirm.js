/* ========================================================================
 * jQuery plugin to display a confirm popup using a Twitter Bootstrap 3
 * modal dialog.
 * Version 0.1.0
 * Dependencies: jQuery 2+, Bootstrap 3+.
 *
 * http://twbs.github.com/bootstrap/javascript.html
 * ========================================================================
 * This plugin binds the click event to each of the objects in the jQuery
 * collection. When clicked, a Bootstrap 3 modal dialog is dynamically
 * built, based on 'options'.
 * Clicking 'ok' will call the callback, passing it a jQuery object that 
 * the plugin is attached to (so that a user can extract context 
 * information). On 'Cancel' the dialog is simply closed.
 * The a href attributes use "javascript:;" to ensure no scrolling takes 
 * place on a click. If you use '#' the page scrolls to the top after a 
 * click.
 *
 * Send "none" as the heading for no heading.
 *
 * Example usage:
 *
 * $(".pimon-action-cancel").prettyConfirm({
 *   "heading"           : "none",
 *   "question"          : "Are you sure you wish to cancel this message? Cancellation cannot be undone.",
 *   "cancelButtonTxt"   : "Cancel",
 *   "okButtonTxt"       : "Ok",
 *   "callback"          : function ($elem) {
 *       alert("Do something...");
 *   }
 * });
 *
 * Alternatively options can be set before prettyConfirm is called like
 * so:
 * $.prettyConfirm.defaults.heading = "blue";
 *
 * Copyright 2013 Jason Scott.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */
(function($){
	$.fn.prettyConfirm = function (options) {
        // Extend our default options with those provided
        var settings = $.extend({}, $.fn.prettyConfirm.defaults, options);

        // Return this.each returns this for chainability
        return this.each(function () {
            var $elem = $(this);

            $elem.bind('click', function(e) {
                var confirmModal;
                
                e.preventDefault();
    
                if (settings.heading === "none") {
                    confirmModal =
                        $('<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
                            '<div class="modal-dialog">' +
                                '<div class="modal-content">' +
                                    '<div class="modal-body">' +
                                        '<p>' + settings.question + '</p>' +
                                    '</div>' +

                                    '<div class="modal-footer">' +
                                        '<a href="javascript:;" class="btn" data-dismiss="modal">' +
                                            settings.cancelButtonTxt +
                                        '</a>' +
                                        '<a href="javascript:;" id="okButton" class="btn btn-primary">' +
                                            settings.okButtonTxt +
                                        '</a>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>');
                } else {
                    confirmModal =
                        $('<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
                            '<div class="modal-dialog">' +
                                '<div class="modal-content">' +
                                    '<div class="modal-header">' +
                                        '<a class="close" data-dismiss="modal" >&times;</a>' +
                                        '<h3>' + settings.heading +'</h3>' +
                                    '</div>' +

                                    '<div class="modal-body">' +
                                        '<p>' + settings.question + '</p>' +
                                    '</div>' +

                                    '<div class="modal-footer">' +
                                        '<a href="javascript:;" class="btn" data-dismiss="modal">' +
                                            settings.cancelButtonTxt +
                                        '</a>' +
                                        '<a href="javascript:;" id="okButton" class="btn btn-primary">' +
                                            settings.okButtonTxt +
                                        '</a>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>');
                } //if (heading === "")

                confirmModal.find("#okButton").click(function(event) {
                    settings.callback($elem);
                    confirmModal.modal("hide");
                });

                confirmModal.modal("show");
            });
        });
	};

    // Plugin defaults – added as a property on our plugin function.
    // This enables the defaults to be set like this as well"
    // $.fn.prettyConfirm.defaults.heading = "blue";
    $.fn.prettyConfirm.defaults = {
        heading: "Confirmation",
        question: "Are you really sure ?",
        cancelButtonTxt: "Cancel",
        okButtonTxt: "Ok",
        callback: function () {}
    };
})(jQuery);