/**
 * Created by wangcb on 2015/4/27.
 */
/**
 * Created by wangcb on 2015/4/2.
 */
(function ($) {

    var myframetabinst;

    function myframetabinit(srcelement) {
        var srctargetele = $(srcelement);

        this.mydefault = {


            tabID: "Tabs",
            frameID: "Frames",
            activeClass: "on",
            lockClass: "locked",
            leftID: "Left",
            rightID: "Right",
            resetID: "Reset",
            closeID: "Close",
            tabs: $("#Tabs") || srctargetele,
            frames: $("#Frames"),
            defaultliwidth: 135,
            prewidth:null,
            maxli: null
        };


        return this;

    }

    $.fn.myframetab = function (option) {

        if (typeof(option) != "undefined") {
            if (myframetabinst[option]) {
                return myframetabinst[option].apply(myframetabinst, Array.prototype.slice.call(arguments, 1));
            }
        }
        else {
            if (option) {

                $.extend(option, {srctarget: this});
            }

            // var $this = this;


            var data = this.data("myframetab");
            if (!data) {
                this.data("myframetab", (myframetabinst = new myframetabinit(this)))
            }
            myframetabinst.setdefault(option);

            myframetabinst.attachPlugin();
            $(window).resize(function () {
                myframetabinst.getcurrentmaxlicount();
                 myframetabinst.pinactiveli();
            });


            return this;
        }

    };
    $.extend(myframetabinit.prototype, {
        attachPlugin: function () {

            var _this = this;
            $("#" + this.mydefault.leftID).click(function () {
                _this.move({action: 'left'});
            });
            $("#" + this.mydefault.rightID).click(function () {
                _this.move({action: 'right'});
            });
            $("#" + this.mydefault.resetID).click(function () {
                _this.move({action: 'reset'});
            });
            $("#" + this.mydefault.closeID).click(function () {
                _this.closeAll();
            });
            this.getcurrentmaxlicount();
            return this;

        },
        getcurrentmaxlicount: function () {

            var alltabswidth = $(".maxWidth").width();
            var addcount= Math.round( (alltabswidth-      this.mydefault.prewidth)    / this.mydefault.defaultliwidth);
            this.mydefault.maxli = Math.round(alltabswidth / this.mydefault.defaultliwidth);


            this.mydefault.prewidth=alltabswidth;
        },

        add: function (option) {


            // 如果已经存在,就激活该菜单
            if (this.isExist(option.id)) {
                this.click(option.id);
                return false;
            }
            this.addTab(option);
            this.addFrame(option);
        },
        isExist: function (id) {
            return $("#" + id).length > 0;
        },

        addTab: function (option) {
            var _this = this;
            var id = option.id;
            var urlimg = option.urlimg;
            var active = this.mydefault.activeClass;
            var title = option.title ? option.title : "";
            var name = this.getCutName(option.name);
            var args = {id: id, name: name, active: active, title: title};
            var html = this.getTabHtml(args);
            var element = $(html);

            $("span.text > span", element).css(
                {
                    "background": "url('" + urlimg + "') no-repeat",
                    "padding-left": "20px",
                    "background-position-y": "-2px"
                }
            );
            // 绑定选择事件并触发。
            $(element).unbind("click").bind("click", function () {


                _this.click(this.id);

            });


            // 绑定关闭按钮事件
            element.find(".closeTab").unbind("click").bind("click", function () {
                _this.close($(this).parent().attr("id"));
                return false;
            });

            if ($("#" + id).length == 0) {
                element.appendTo(this.mydefault.tabs);
                element.click();

            } else {

                this.click(id);
            }
        },
          pinactiveli:function(){

          this.click(    this.mydefault.tabs.find("."+this.mydefault.activeClass).attr("id"));
          },
        getTabHtml: function (o) {
            var li = "<li  id='" + o.id + "' class='" + o.active + "'  title='" + o.title + "'> \n";
            li += "<a href=\"#\" class='li " + o.lock + "'> \n";
            li += "<span class=\"left\"></span> \n";
            li += "<span class=\"text\"><span>" + o.name + "</span></span> \n";
            li += "<span class=\"right\"></span></a>\n";
            li += "<a href='javascript:void(0)' class='closeTab'></a>\n";
            li += "</li> \n";
            return li;
        },
        close: function (id) {
            var activeClass = this.mydefault.activeClass;
            var tab = $("#" + id);

            var isActive = tab.hasClass(activeClass);

            var frame = $("#" + this.getFrameID(id));
            // 如果当前标签是激活状态,要不打开后一个，要不打开前一个
            if (isActive) {
                if (tab.next().is("li")) {
                    this.click(tab.next().attr("id"));
                } else if (tab.prev().is("li")) {
                    this.click(tab.prev().attr("id"));
                }
            }
            tab.remove();// 删除Tab
            frame.remove();// 删除IFrame
        }
        ,
        getFrameID: function (id) {
            return "Frame" + id;
        },
        getCutName: function (name) {
            var text = String(name);
            if (text.length > 6) {
                return text.substring(0, 6) + "...";
            }
            return text;
        }
        ,
        click: function (id) {
            this.mydefault.tabs.find("li").removeClass(this.mydefault.activeClass);
            $("#" + id).addClass(this.mydefault.activeClass);

            if ($("#" + id).is(":hidden")) {


                $("#" + id).show();

                $("#" + id).prevAll().hide();
                $("#" + id).nextAll().show();
            }

            if( this.mydefault.tabs.find("li:visible").index($("#" + id))>this.mydefault.maxli)
            {
                this.hidepreli(id);

            }



            this.loadFrame(id);
        }
        ,
        hidepreli: function (id) {
            if (this.mydefault.tabs.find("li:visible").length > this.mydefault.maxli) {
                var nowstart =this.mydefault.tabs.find("li:visible").index($("#" + id)) +1 - this.mydefault.maxli ;
              // this.mydefault.tabs.find("li:visible").eq(nowstart).hide();
                this.mydefault.tabs.find("li:visible:lt("+nowstart+")").hide();
            }
        },
        loadFrame: function (id) {
            var id = this.getFrameID(id);
            this.mydefault.frames.find("iframe").hide();
            $("#" + id).show();
        },
        addFrame: function (option) {
            var url = option.url;
            var id = this.getFrameID(option.id);
            var frame = option.frame || {};
            var style = frame.style || "width:100%;height:100%";
            var name = frame.name || id;
            var frame = "<iframe id='" + id + "' name='" + name + "' frameborder='0' style='" + style + "' src='" + url + "'></iframe>";
            $(frame).appendTo(this.mydefault.frames);
            this.loadFrame(option.id);
        }
        ,

        closeAll: function () {
            var _this = this;
            // 删除没有锁定的标签
            this.mydefault.tabs.find("li").each(function () {
                $(this).remove();
                var id = _this.getFrameID(this.id);
                $("#" + id).remove();
            });
            /*  var activeClass = this.mydefault.activeClass;
             // 如果没有激活的锁定的标签，那么激活最后一个锁定的标签。
             if( this.tabs.find("." + activeClass).size() == 0 ){
             this.tabs.find("li:last").click();
             }*/
        },
        move: function (option) {

            if (option.action == "left") {
                this.mydefault.tabs.find("li:hidden:last").show();
            } else if (option.action == "right") {
                if (this.mydefault.tabs.find("li:visible").length > 1) {
                    this.mydefault.tabs.find("li:visible:first").hide();
                }
            } else if (option.action == "reset") {
                this.mydefault.tabs.find("li").show();
            }
        },

        setdefault: function (opt) {

            $.extend(true, this.mydefault, opt);

            // alert(this.default.srctarget.length);
        }
    })
    ;

    $.fn.myframetab.constructor = myframetabinit;

})
(jQuery);
/**
 * Created by wangcb on 2015/3/4.
 */
/**
 * Created by wangcb on 2015/3/5.
 */
/**
 * Created by wangcb on 2015/3/28.
 */
/**
 * Created by wangcb on 2015/3/30.
 */
