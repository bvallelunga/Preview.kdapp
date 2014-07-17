class PreviewMainView extends KDView

  constructor:(options = {}, data)->
    options.cssClass = 'preview main-view'
    @user = KD.nick()
    @kiteHelper = new KiteHelper
    super options, data

  viewAppended:->
    @addSubView @alert = new KDCustomHTMLView
      tagName    : "div"
      cssClass   : "alert hidden"
    
    appPath = @getParameterByName "path"
    publishTarget = @getParameterByName "publish"
      
    switch publishTarget
      when "test", "production"
        @publishApp appPath, publishTarget
      else
        @previewApp()
  
  getParameterByName: (name)->
    name = name.replace(/[\[]/, "\\[").replace /[\]]/, "\\]"
    regex = new RegExp "[\\?&]#{name}=([^&#]*)"
    results = regex.exec location.search
    return if results then decodeURIComponent results[1].replace /\+/g, "" else ""
  
  pathExists: (path, cb)->
    @kiteHelper.getKite().then (kite)=>
      kite.fsExists(path : path).then cb
  
  previewApp:->
    app = @getParameterByName "app"
    appPath = "/home/#{@user}/Web/#{app}.kdapp"
    @alert.show()
    
    return @alert.updatePartial "Please specify a kdapp to serve..." unless app
    
    @alert.updatePartial "Loading app..."
    @pathExists appPath, (state)=>
      if state
          @setClass "reset"
          @destroySubViews()
          window.appPreview = @
          
          KodingAppsController.appendHeadElements
            identifier  : "preview"
            items       : [
              type    : 'style'
              url     : "//#{@user}.kd.io/#{app}.kdapp/style.css"
            ,
              type    : 'script'
              url     : "//#{@user}.kd.io/#{app}.kdapp/index.js"
            ]
          , (err)->
            delete window.appPreview
            throw Error err if err
      else
        @alert.updatePartial "Failed to serve #{app}.kdapp..."
    
  publishApp:(appPath, target='test')->
    unless appPath
      @alert.updatePartial "Please specify a kdapp to publish..."
      return @alert.show()
    
    @pathExists appPath, (state)=>
      if state
        KodingAppsController.createJApp {
          appPath, target
        }, @publishCallback
      else
        @alert.updatePartial "Please specify a kdapp to publish..."
        @alert.show()

  publishCallback:(err, app)->
    if err or not app
      warn err
      return new KDNotificationView
        title : "Failed to publish"

    new KDNotificationView
      title: "Published successfully!"

    KD.singletons
      .router.handleRoute "/Apps/#{app.manifest.authorNick}/#{app.name}"
  
class PreviewController extends AppController

  constructor:(options = {}, data)->
    options.view    = new PreviewMainView
    options.appInfo =
      name : "Preview"
      type : "application"

    super options, data

do ->

  # In live mode you can add your App view to window's appView
  if appView?

    view = new PreviewMainView
    appView.addSubView view

  else

    KD.registerAppClass PreviewController,
      name     : "Preview"
      routes   :
        "/:name?/Preview" : null
        "/:name?/bvallelunga/Apps/Preview" : null
      dockPath : "/bvallelunga/Apps/Preview"
      behavior : "application"