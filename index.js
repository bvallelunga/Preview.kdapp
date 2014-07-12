/* Compiled by kdc on Sat Jul 12 2014 20:49:02 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
/* BLOCK STARTS: /home/bvallelunga/Applications/Preview.kdapp/index.coffee */
var PreviewController, PreviewMainView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PreviewMainView = (function(_super) {
  __extends(PreviewMainView, _super);

  function PreviewMainView(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = 'preview main-view';
    this.user = KD.nick();
    this.app = this.getParameterByName("app");
    window.appView = this;
    PreviewMainView.__super__.constructor.call(this, options, data);
  }

  PreviewMainView.prototype.viewAppended = function() {
    if (this.app) {
      return KodingAppsController.appendHeadElements({
        identifier: "preview",
        items: [
          {
            type: 'style',
            url: "//" + this.user + ".kd.io/" + this.app + ".kdapp/style.css"
          }, {
            type: 'script',
            url: "//" + this.user + ".kd.io/" + this.app + ".kdapp/index.js"
          }
        ]
      }, console.log);
    } else {
      this.setClass("active");
      return this.addSubView(this.alert = new KDCustomHTMLView({
        tagName: "div",
        cssClass: "alert",
        partial: "Please specify a kdapp to serve..."
      }));
    }
  };

  PreviewMainView.prototype.getParameterByName = function(name) {
    var regex, results;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    results = regex.exec(location.search);
    if (results) {
      return decodeURIComponent(results[1].replace(/\+/g, ""));
    } else {
      return "";
    }
  };

  return PreviewMainView;

})(KDView);

PreviewController = (function(_super) {
  __extends(PreviewController, _super);

  function PreviewController(options, data) {
    if (options == null) {
      options = {};
    }
    options.view = new PreviewMainView;
    options.appInfo = {
      name: "Preview",
      type: "application"
    };
    PreviewController.__super__.constructor.call(this, options, data);
  }

  return PreviewController;

})(AppController);

(function() {
  var view;
  if (typeof appView !== "undefined" && appView !== null) {
    view = new PreviewMainView;
    return appView.addSubView(view);
  } else {
    return KD.registerAppClass(PreviewController, {
      name: "Preview",
      routes: {
        "/:name?/Preview": null,
        "/:name?/bvallelunga/Apps/Preview": null
      },
      dockPath: "/bvallelunga/Apps/Preview",
      behavior: "application"
    });
  }
})();

/* KDAPP ENDS */
}).call();