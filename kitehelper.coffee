class KiteHelper extends KDController
  
  mvIsStarting: false
  
  getReady:->

    new Promise (resolve, reject) =>

      {JVM} = KD.remote.api
      JVM.fetchVmsByContext (err, vms)=>

        console.warn err  if err
        return unless vms

        @_vms = vms
        @_kites = {}

        kiteController = KD.getSingleton 'kiteController'

        for vm in vms
          alias = vm.hostnameAlias
          @_kites[alias] = kiteController
            .getKite "os-#{ vm.region }", alias, 'os'
        
        @emit 'ready'
        resolve()

  getVm:->
    @_vm or= @_vms.first
    return @_vm

  getKite:->

    new Promise (resolve, reject)=>

      @getReady().then =>

        vm = @getVm().hostnameAlias
        {vmController} = KD.singletons

        unless kite = @_kites[vm]
          return reject
            message: "No such kite for #{vm}"
        
        vmController.info vm, (err, vmn, info)=>
          if !@mvIsStarting and info.state is "STOPPED"
            @mvIsStarting = true
            timeout = 10 * 60 * 1000
            kite.options.timeout = timeout
            
            kite.vmOn().then ->
              resolve kite
            .timeout(timeout)
            .catch (err)->
              reject err
          else
            resolve kite

  run:(cmd, timeout, callback)->

    unless callback
      [timeout, callback] = [callback, timeout]

    # Set it to 10 min if not given
    timeout ?= 10 * 60 * 1000
    @getKite().then (kite)->
      kite.options.timeout = timeout
      kite.exec(command: cmd).then (result)->
        if callback
          callback null, result
      .catch (err)->
          if callback
            callback
              message : "Failed to run #{cmd}"
              details : err
          else
            console.error err
    .catch (err)->
      if callback
        callback
          message : "Failed to run #{cmd}"
          details : err
      else 
        console.error err