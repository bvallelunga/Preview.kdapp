/* Compiled by kdc on Wed Jul 16 2014 20:56:23 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
/* BLOCK STARTS: /home/bvallelunga/Applications/Preview.kdapp/kitehelper.coffee */
var KiteHelper, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KiteHelper = (function(_super) {
  __extends(KiteHelper, _super);

  function KiteHelper() {
    _ref = KiteHelper.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  KiteHelper.prototype.mvIsStarting = false;

  KiteHelper.prototype.getReady = function() {
    var _this = this;
    return new Promise(function(resolve, reject) {
      var JVM;
      JVM = KD.remote.api.JVM;
      return JVM.fetchVmsByContext(function(err, vms) {
        var alias, kiteController, vm, _i, _len;
        if (err) {
          console.warn(err);
        }
        if (!vms) {
          return;
        }
        _this._vms = vms;
        _this._kites = {};
        kiteController = KD.getSingleton('kiteController');
        for (_i = 0, _len = vms.length; _i < _len; _i++) {
          vm = vms[_i];
          alias = vm.hostnameAlias;
          _this._kites[alias] = kiteController.getKite("os-" + vm.region, alias, 'os');
        }
        _this.emit('ready');
        return resolve();
      });
    });
  };

  KiteHelper.prototype.getVm = function() {
    this._vm || (this._vm = this._vms.first);
    return this._vm;
  };

  KiteHelper.prototype.getKite = function() {
    var _this = this;
    return new Promise(function(resolve, reject) {
      return _this.getReady().then(function() {
        var kite, vm, vmController;
        vm = _this.getVm().hostnameAlias;
        vmController = KD.singletons.vmController;
        if (!(kite = _this._kites[vm])) {
          return reject({
            message: "No such kite for " + vm
          });
        }
        return vmController.info(vm, function(err, vmn, info) {
          var timeout;
          if (!_this.mvIsStarting && info.state === "STOPPED") {
            _this.mvIsStarting = true;
            timeout = 10 * 60 * 1000;
            kite.options.timeout = timeout;
            return kite.vmOn().then(function() {
              return resolve(kite);
            }).timeout(timeout)["catch"](function(err) {
              return reject(err);
            });
          } else {
            return resolve(kite);
          }
        });
      });
    });
  };

  KiteHelper.prototype.run = function(cmd, timeout, callback) {
    var _ref1;
    if (!callback) {
      _ref1 = [callback, timeout], timeout = _ref1[0], callback = _ref1[1];
    }
    if (timeout == null) {
      timeout = 10 * 60 * 1000;
    }
    return this.getKite().then(function(kite) {
      kite.options.timeout = timeout;
      return kite.exec({
        command: cmd
      }).then(function(result) {
        if (callback) {
          return callback(null, result);
        }
      })["catch"](function(err) {
        if (callback) {
          return callback({
            message: "Failed to run " + cmd,
            details: err
          });
        } else {
          return console.error(err);
        }
      });
    })["catch"](function(err) {
      if (callback) {
        return callback({
          message: "Failed to run " + cmd,
          details: err
        });
      } else {
        return console.error(err);
      }
    });
  };

  return KiteHelper;

})(KDController);
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
    this.kiteHelper = new KiteHelper;
    PreviewMainView.__super__.constructor.call(this, options, data);
  }

  PreviewMainView.prototype.viewAppended = function() {
    var appPath, publishTarget;
    this.addSubView(this.alert = new KDCustomHTMLView({
      tagName: "div",
      cssClass: "alert hidden"
    }));
    appPath = this.getParameterByName("path");
    publishTarget = this.getParameterByName("publish");
    switch (publishTarget) {
      case "test":
      case "production":
        return this.publishApp(appPath, publishTarget);
      default:
        return previewApp();
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

  PreviewMainView.prototype.previewApp = function() {
    var app, appPath,
      _this = this;
    app = this.getParameterByName("app");
    appPath = "/home/" + this.user + "/Web/" + this.app + ".kdapp";
    if (this.app) {
      this.alert.updatePartial("Loading app...");
      this.alert.show();
      return this.kiteHelper.getKite().then(function(kite) {
        return kite.fsExists({
          path: appPath
        }).then(function(state) {
          if (state) {
            _this.setClass("reset");
            _this.destroySubViews();
            window.appPreview = _this;
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
            }, function(err) {
              delete window.appPreview;
              if (err) {
                throw Error(err);
              }
            });
          } else {
            return _this.alert.updatePartial("Failed to serve " + _this.app + ".kdapp...");
          }
        });
      });
    } else {
      return this.alert.updatePartial("Please specify a kdapp to serve...");
    }
  };

  PreviewMainView.prototype.publishApp = function(path, target) {
    if (target == null) {
      target = 'test';
    }
    if (path && target) {
      return KodingAppsController.createJApp({
        path: path,
        target: target
      }, this.publishCallback);
    } else {
      this.alert.updatePartial("Please specify a kdapp to publish...");
      return this.alert.show();
    }
  };

  PreviewMainView.prototype.publishCallback = function(err, app) {
    if (err || !app) {
      warn(err);
      return new KDNotificationView({
        title: "Failed to publish"
      });
    }
    new KDNotificationView({
      title: "Published successfully!"
    });
    return KD.singletons.router.handleRoute("/Apps/" + app.manifest.authorNick + "/" + app.name);
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