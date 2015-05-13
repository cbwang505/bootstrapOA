/**
 * Created by wangcb on 2015/4/2.
 */
(function ($) {

    var mytreetableinst, Node;

    Node = (function () {
        function Node(row, tree, settings) {
            var parentId;

            this.row = row;
            this.tree = tree;
            this.settings = settings;

            // TODO Ensure id/parentId is always a string (not int)
            this.id = this.row.data(this.settings.nodeIdAttr);

            // TODO Move this to a setParentId function?
            parentId = this.row.data(this.settings.parentIdAttr);
            if (parentId != null && parentId !== "") {
                this.parentId = parentId;
            }

            this.treeCell = $(this.row.children(this.settings.columnElType)[this.settings.column]);
            this.expander = $(this.settings.expanderTemplate);
            this.indenter = $(this.settings.indenterTemplate);
            this.children = [];
            this.initialized = false;
            this.treeCell.prepend(this.indenter);
        }

        Node.prototype.addChild = function (child) {
            return this.children.push(child);
        };

        Node.prototype.ancestors = function () {
            var ancestors, node;
            node = this;
            ancestors = [];
            while (node = node.parentNode()) {
                ancestors.push(node);
            }
            return ancestors;
        };

        Node.prototype.collapse = function () {
            this._hideChildren();
            this.row.removeClass("expanded").addClass("collapsed");
            this.expander.attr("title", this.settings.stringExpand);

            if (this.initialized && this.settings.onNodeCollapse != null) {
                this.settings.onNodeCollapse.apply(this);
            }

            return this;
        };

        // TODO destroy: remove event handlers, expander, indenter, etc.

        Node.prototype.expand = function () {
            if (this.initialized && this.settings.onNodeExpand != null) {
                this.settings.onNodeExpand.apply(this);
            }

            this.row.removeClass("collapsed").addClass("expanded");
            this._showChildren();
            this.expander.attr("title", this.settings.stringCollapse);

            return this;
        };

        Node.prototype.expanded = function () {
            return this.row.hasClass("expanded");
        };

        Node.prototype.hide = function () {
            this._hideChildren();
            this.row.hide();
            return this;
        };

        Node.prototype.isBranchNode = function () {
            if (this.children.length > 0 || this.row.data(this.settings.branchAttr) === true) {
                return true;
            } else {
                return false;
            }
        };

        Node.prototype.level = function () {
            return this.ancestors().length;
        };

        Node.prototype.parentNode = function () {
            if (this.parentId != null) {
                return this.tree[this.parentId];
            } else {
                return null;
            }
        };

        Node.prototype.removeChild = function (child) {
            var i = $.inArray(child, this.children);
            return this.children.splice(i, 1)
        };

        Node.prototype.render = function () {
            var settings = this.settings, target;

            if (settings.expandable === true && this.isBranchNode()) {
                this.indenter.html(this.expander);
                target = settings.clickableNodeNames === true ? this.treeCell : this.expander;

                var nowid=this.id;
                target.unbind("click.treetable").bind("click.treetable", $.proxy(function (event) {
                    //    $(this).parents("table").treetable("node", $(this).parents("tr").data(settings.nodeIdAttr)).toggle();
                 //   alert(nowid);

                    this.tree[nowid].toggle()
                    return event.preventDefault();
                }, this));

              /*  target.unbind("click.treetable").bind("click.treetable", function(event) {
                    alert(2);
                    return event.preventDefault();
                });*/
            }

            if (settings.expandable === true && settings.initialState === "collapsed") {
                this.collapse();
            } else {
                this.expand();
            }

            this.indenter[0].style.paddingLeft = "" + (this.level() * settings.indent) + "px";

            return this;
        };

        Node.prototype.reveal = function () {
            if (this.parentId != null) {
                this.parentNode().reveal();
            }
            return this.expand();
        };

        Node.prototype.setParent = function (node) {
            if (this.parentId != null) {
                this.tree[this.parentId].removeChild(this);
            }
            this.parentId = node.id;
            this.row.data(this.settings.parentIdAttr, node.id);
            return node.addChild(this);
        };

        Node.prototype.show = function () {
            if (!this.initialized) {
                this._initialize();
            }
            this.row.show();
            if (this.expanded()) {
                this._showChildren();
            }
            return this;
        };

        Node.prototype.toggle = function () {
            if (this.expanded()) {
                this.collapse();
            } else {
                this.expand();
            }
            return this;
        };

        Node.prototype._hideChildren = function () {
            var child, _i, _len, _ref, _results;
            _ref = this.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                _results.push(child.hide());
            }
            return _results;
        };

        Node.prototype._initialize = function () {
            this.render();
            if (this.settings.onNodeInitialized != null) {
                this.settings.onNodeInitialized.apply(this);
            }
            return this.initialized = true;
        };

        Node.prototype._showChildren = function () {
            var child, _i, _len, _ref, _results;
            _ref = this.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                _results.push(child.show());
            }
            return _results;
        };

        return Node;
    })();

    function mytreetableint(srcelement) {


        var srctargetele = $(srcelement);
        this.tree = {};

        // Cache the nodes and roots in simple arrays for quick access/iteration
        this.nodes = [];
        this.roots = [];
        this.mydefault = {


            srctarget: srctargetele,
            branchAttr: "ttBranch",
            clickableNodeNames: false,
            column: 0,
            columnElType: "td", // i.e. 'td', 'th' or 'td,th'
            expandable: false,
            expanderTemplate: "<a href='#'  style='text-decoration: none;'>&nbsp;</a>",
            indent: 19,
            indenterTemplate: "<span class='indenter'></span>",
            initialState: "collapsed",
            nodeIdAttr: "ttId", // maps to data-tt-id
            parentIdAttr: "ttParentId", // maps to data-tt-parent-id
            stringExpand: "Expand",
            stringCollapse: "Collapse"

        };


    }

    $.fn.mytreetable = function (option) {


        if (option) {

            $.extend(option, {srctarget: this});
        }

        // var $this = this;

        this.each(function () {


            var data = $(this).data("mytreetable")
            if (!data) {
                $(this).data("mytreetable", (mytreetableinst = new mytreetableint(this)))
            }
            mytreetableinst.setdefault(option);

            mytreetableinst.attachPlugin(this.rows).render();
        })

    }
    $.extend(mytreetableint.prototype, {
        attachPlugin: function (rows) {
            var node, row, i;

            if (rows != null) {
                for (i = 0; i < rows.length; i++) {
                    row = $(rows[i]);

                    if (row.data(this.mydefault.nodeIdAttr) != null) {
                        node = new Node(row, this.tree, this.mydefault);
                        this.nodes.push(node);
                        this.tree[node.id] = node;

                        if (node.parentId != null) {
                            this.tree[node.parentId].addChild(node);
                        } else {
                            this.roots.push(node);
                        }
                    }
                }
            }

            return this;
        },

        collapseAll: function () {
            var node, _i, _len, _ref, _results;
            _ref = this.nodes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                node = _ref[_i];
                _results.push(node.collapse());
            }
            return _results;
        },
        expandAll: function () {
            var node, _i, _len, _ref, _results;
            _ref = this.nodes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                node = _ref[_i];
                _results.push(node.expand());
            }
            return _results;
        },


        move: function (node, destination) {
            // Conditions:
            // 1: +node+ should not be inserted as a child of +node+ itself.
            // 2: +destination+ should not be the same as +node+'s current parent (this
            //    prevents +node+ from being moved to the same location where it already
            //    is).
            // 3: +node+ should not be inserted in a location in a branch if this would
            //    result in +node+ being an ancestor of itself.
            if (node !== destination && destination.id !== node.parentId && $.inArray(node, destination.ancestors()) === -1) {
                node.setParent(destination);
                this._moveRows(node, destination);

                // Re-render parentNode if this is its first child node, and therefore
                // doesn't have the expander yet.
                if (node.parentNode().children.length === 1) {
                    node.parentNode().render();
                }
            }
        },

        render: function () {
            var root, _i, _len, _ref;
            _ref = this.roots;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                root = _ref[_i];

                // Naming is confusing (show/render). I do not call render on node from
                // here.
                root.show();
            }
            return this;
        },
        _moveRows: function (node, destination) {
            var child, _i, _len, _ref, _results;
            node.row.insertAfter(destination.row);
            node.render();
            _ref = node.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                _results.push(this._moveRows(child, node));
            }
            return _results;
        },
        unloadBranch: function (node) {
            var child, children, i;

            for (i = 0; i < node.children.length; i++) {
                child = node.children[i];

                // Recursively remove all descendants of +node+
                this.unloadBranch(child);

                // Remove child from DOM (<tr>)
                child.row.remove();

                // Clean up Tree object (so Node objects are GC-ed)
                delete this.tree[child.id];
                this.nodes.splice($.inArray(child, this.nodes), 1)
            }

            // Reset node's collection of children
            node.children = [];

            return this;
        },
        setdefault: function (opt) {

            $.extend(true, this.mydefault, opt);

            // alert(this.default.srctarget.length);
        }
    });

    $.fn.mytreetable.constructor = mytreetableint;

})(jQuery)
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
/**
 * Created by wangcb on 2015/4/14.
 */
