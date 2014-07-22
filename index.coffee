class PreviewMainView extends KDView

  constructor:(options = {}, data)->
    options.cssClass = 'preview main-view'
    @user = KD.nick()
    @kiteHelper = new KiteHelper
    super options, data

  viewAppended:->
    appPath       = @getParameterByName "path"
    hostname      = @getParameterByName "hostname"
    publishTarget = @getParameterByName "publish"
      
    switch publishTarget
      when "test", "production"
        @publishApp appPath, hostname, publishTarget
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
  
  showAlert: (message)->
    unless @alert
      @addSubView @alert = new KDCustomHTMLView
        tagName    : "div"
        cssClass   : "alert"
    
    @alert.updatePartial message
    
  previewApp: ->
    app = @getParameterByName "app"
    appPath = "/home/#{@user}/Web/#{app}.kdapp"
    
    unless app
      return @showAlert "Please specify a kdapp to preview..."

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
    , (err)=>
      delete window.appPreview
      
      unless err
        @setClass "reset"
      else
        @showAlert "Failed to preview #{app}.kdapp..."
        throw Error err
    
    @pathExists appPath, (state)=>
      unless state
        @showAlert "Failed to preview #{app}.kdapp..."
    
  publishApp:(appPath, hostname, target='test')->
    unless appPath and hostname
      @showAlert "Please specify a kdapp to publish..."
    else
      @showAlert "Publishing app, please wait..."
    
    @pathExists appPath, (state)=>
      if state
        KodingAppsController.createJApp {
          path: "[#{hostname}]#{appPath}", 
          target: target
        }, @publishCallback
      else
        @showAlert "Please specify a kdapp to publish..."

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