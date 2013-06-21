/// <reference path="Scripts/jquery-2.0.2.min.js" />



(function ($) {
    "use strict";

    var TrieView = function (selector) {
        this.$selector = $(selector);

        this.init();
        
        this.$selector.each()
    }

    TrieView.prototype = {

        init: function () {
            this.collapseAll();
            this.addArrowsForNestedBlocks()
            this.addEvents();
        },

        collapseAll: function () {            
            this.$selector.find("ul > li").parent().addClass("collapsed")
        },

        addArrowsForNestedBlocks: function () {
            var li = this.$selector.find("li");

            li.each(function () {
                if ($(this).find("ul").length > 0) {

                    var span = $(this).children("span");

                    var div = $("<div/>", {

                        "class": "hit-area"
                    })

                    div.insertBefore(span);

                   // $(this).addClass("nested-elements")
                }
            })
        },

        addEvents: function () {
            $(".nested-elements > span, .hit-area").on("click", function () {
                console.log($(this).parent())
                $(this).parent().children("ul").slideToggle()

                $(this).parent().children(".hit-area").toggleClass("expanded")
            })
        }


    }
    $.fn.TrieView = function () {
        var trieView = new TrieView(this.selector);
    }
})(window.jQuery)