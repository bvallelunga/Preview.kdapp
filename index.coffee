class PreviewMainView extends KDView

  constructor:(options = {}, data)->
    options.cssClass = 'preview main-view'
    @user = KD.nick()
    @app = @getParameterByName "app"
    window.appView = @
    super options, data

  viewAppended:->  
    if @app
        KodingAppsController.appendHeadElements
          identifier  : "preview"
          items       : [
            type    : 'style'
            url     : "//#{@user}.kd.io/#{@app}.kdapp/style.css"
          ,
            type    : 'script'
            url     : "//#{@user}.kd.io/#{@app}.kdapp/index.js"
          ]
        , console.log
    else
      @setClass "active"
      
      @addSubView @alert = new KDCustomHTMLView
        tagName    : "div"
        cssClass   : "alert"
        partial    : "Please specify a kdapp to serve..."
        
  getParameterByName: (name)->
    name = name.replace(/[\[]/, "\\[").replace /[\]]/, "\\]"
    regex = new RegExp "[\\?&]#{name}=([^&#]*)"
    results = regex.exec location.search
    return if results then decodeURIComponent results[1].replace /\+/g, "" else ""
  
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