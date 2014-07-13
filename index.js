/* Compiled by kdc on Sun Jul 13 2014 03:06:55 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
/* BLOCK STARTS: /home/bvallelunga/Applications/Preview.kdapp/kitehelper.coffee */

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
    window.appPreview = this;
    this.user = KD.nick();
    this.app = this.getParameterByName("app");
    this.appPath = "/home/" + this.user + "/Web/" + this.app + ".kdapp";
    this.kiteHelper = new KiteHelper;
    PreviewMainView.__super__.constructor.call(this, options, data);
  }

  PreviewMainView.prototype.viewAppended = function() {
    var _this = this;
    this.addSubView(this.alert = new KDCustomHTMLView({
      tagName: "div",
      cssClass: "alert"
    }));
    if (this.app) {
      this.alert.updatePartial("Loading app...");
      return this.kiteHelper.getKite().then(function(kite) {
        return kite.fsExists({
          path: _this.appPath
        }).then(function(state) {
          if (state) {
            _this.addClass("reset");
            return KodingAppsController.appendHeadElements({
              identifier: "preview",
              items: [
                {
                  type: 'style',
                  url: "//" + _this.user + ".kd.io/" + _this.app + ".kdapp/style.css"
                }, {
                  type: 'script',
                  url: "//" + _this.user + ".kd.io/" + _this.app + ".kdapp/index.js"
                }
              ]
            }, console.log);
          } else {
            return _this.alert.updatePartial("Please specify a kdapp to serve...");
          }
        });
      });
    } else {
      return this.alert.updatePartial("Please specify a kdapp to serve...");
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