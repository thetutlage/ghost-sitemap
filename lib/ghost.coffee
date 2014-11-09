fs = require 'fs'
q = require 'q'
_ = require 'lodash'
messages = require '../messages'
colors = require 'colors'
path = require 'path'

class GhostConfig
  constructor: (@obj) ->
    @path = path.join(process.cwd(),@obj.ghost_config_path)
    @env = @obj.env
    try
      @ghostConfig = require @path
    catch e
      console.log colors.red messages.ghost_config_not_found.replace '%path%',@path
      process.exit 1


  ghostToMine: () ->
    defer = q.defer()
    defer.resolve _.assign @ghostConfig[@env],@obj
    defer.promise

module.exports = GhostConfig
