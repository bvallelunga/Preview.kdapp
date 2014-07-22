/* Compiled by kdc on Tue Jul 22 2014 21:03:57 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
/* BLOCK STARTS: /home/bvallelunga/Applications/Preview.kdapp/kitehelper.coffee */
var KiteHelper,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KiteHelper = (function(_super) {
  __extends(KiteHelper, _super);

  function KiteHelper() {
    return KiteHelper.__super__.constructor.apply(this, arguments);
  }

  KiteHelper.prototype.mvIsStarting = false;

  KiteHelper.prototype.getReady = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
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
      };
    })(this));
  };

  KiteHelper.prototype.getVm = function() {
    this._vm || (this._vm = this._vms.first);
    return this._vm;
  };

  KiteHelper.prototype.getKite = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
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
      };
    })(this));
  };

  KiteHelper.prototype.run = function(cmd, timeout, callback) {
    var _ref;
    if (!callback) {
      _ref = [callback, timeout], timeout = _ref[0], callback = _ref[1];
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
    var appPath, hostname, publishTarget;
    appPath = this.getParameterByName("path");
    hostname = this.getParameterByName("hostname");
    publishTarget = this.getParameterByName("publish");
    switch (publishTarget) {
      case "test":
      case "production":
        return this.publishApp(appPath, hostname, publishTarget);
      default:
        return this.previewApp();
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

  PreviewMainView.prototype.pathExists = function(path, cb) {
    return this.kiteHelper.getKite().then((function(_this) {
      return function(kite) {
        return kite.fsExists({
          path: path
        }).then(cb);
      };
    })(this));
  };

  PreviewMainView.prototype.showAlert = function(message) {
    if (!this.alert) {
      this.addSubView(this.alert = new KDCustomHTMLView({
        tagName: "div",
        cssClass: "alert"
      }));
    }
    return this.alert.updatePartial(message);
  };

  PreviewMainView.prototype.previewApp = function() {
    var app, appPath;
    app = this.getParameterByName("app");
    appPath = "/home/" + this.user + "/Web/" + app + ".kdapp";
    if (!app) {
      return this.showAlert("Please specify a kdapp to preview...");
    }
    window.appPreview = this;
    KodingAppsController.appendHeadElements({
      identifier: "preview",
      items: [
        {
          type: 'style',
          url: "//" + this.user + ".kd.io/" + app + ".kdapp/style.css"
        }, {
          type: 'script',
          url: "//" + this.user + ".kd.io/" + app + ".kdapp/index.js"
        }
      ]
    }, (function(_this) {
      return function(err) {
        delete window.appPreview;
        if (!err) {
          return _this.setClass("reset");
        } else {
          _this.showAlert("Failed to preview " + app + ".kdapp...");
          throw Error(err);
        }
      };
    })(this));
    return this.pathExists(appPath, (function(_this) {
      return function(state) {
        if (!state) {
          return _this.showAlert("Failed to preview " + app + ".kdapp...");
        }
      };
    })(this));
  };

  PreviewMainView.prototype.publishApp = function(appPath, hostname, target) {
    if (target == null) {
      target = 'test';
    }
    if (!(appPath && hostname)) {
      this.showAlert("Please specify a kdapp to publish...");
    } else {
      this.showAlert("Publishing app, please wait...");
    }
    return this.pathExists(appPath, (function(_this) {
      return function(state) {
        if (state) {
          return KodingAppsController.createJApp({
            path: "[" + hostname + "]" + appPath,
            target: target
          }, _this.publishCallback);
        } else {
          return _this.showAlert("Please specify a kdapp to publish...");
        }
      };
    })(this));
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