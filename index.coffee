class PreviewMainView extends KDView

  constructor:(options = {}, data)->
    options.cssClass = 'preview main-view'
    @user = KD.nick()
    @port = @getParameterByName "port"
    super options, data

  viewAppended:->  
    if @port
      KodingAppsController.appendHeadElements
          identifier  : "preview"
          items       : [
            type    : 'style'
            url     : "http://#{@user}.kd.io:#{@port}/style.css"
          ,
            type    : 'script'
            url     : "http://#{@user}.kd.io:#{@port}/index.js"
          ]
       , console.log
    else
      @addSubView @alert = new KDCustomHTMLView
        tagName    : "div"
        cssClass   : "alert"
        partial    : "Please specify a port to listen to..."
        
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