q = require 'q'
request = require 'request'
async = require 'async'
path = require 'path'
fs = require 'fs'

class Ping
  constructor: (@config) ->
    @baseUrl = @config.url
    return

  pingServer: (service) ->
    defer = q.defer()
    if service is 'google'
      serviceUrl = "http://www.google.com/webmasters/sitemaps/ping?sitemap="
    else if service is 'bing'
      serviceUrl = "http://www.bing.com/webmaster/ping.aspx?siteMap="

    prefix = "#{@baseUrl}/#{@config.output_dir}"
    makeRequest = (file,callback) ->
      postfix = "#{prefix}/#{file}"
      url = "#{serviceUrl}#{postfix}"
      request url, (err,response,body) ->
        callback null, {status:response.statusCode,file:postfix}
      return

    innerPath = path.join(process.cwd(),@config.output_dir+"/")
    fs.readdir innerPath , (err,files) ->
      if files
        async.map files,makeRequest,(error,results) ->
          if error
            defer.reject error
          else
            defer.resolve results
        return
      else
        defer.reject err

    return defer.promise

module.exports = Ping
