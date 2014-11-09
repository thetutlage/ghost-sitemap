knex = require 'knex'
q = require 'q'
fs = require 'fs'
_ = require 'lodash'
sm = require 'sitemap'
path = require 'path'

class SiteMap
  constructor: (@config) ->
    connection = @config.database
    @baseUrl = @config.url
    knex = knex(connection)

  getPosts: ->
    defer = q.defer()
    error =
      error: 'No posts found'
    knex .select('slug','published_at').from('posts').where () ->
      @.where('status','published').where 'page',0
      return
    .then (posts) ->
      if posts then defer.resolve posts else defer.reject error
      return
    .catch (err) ->
      defer.reject error
      return
    defer.promise

  getPages: ->
    defer = q.defer()
    error =
      error: 'No pages found'
    knex .select('slug','published_at').from('posts').where () ->
      @.where('status','published').where 'page',1
      return
    .then (posts) ->
      if posts then defer.resolve posts else defer.reject error
      return
    .catch (err) ->
      defer.reject error
      return
    defer.promise

  getTags: ->
    defer = q.defer()
    error =
      error: 'No tags found'
    knex .select('tags.slug').from('tags').innerJoin 'posts_tags', () ->
      @.on('tags.id','=','posts_tags.tag_id')
      return
    .then (tags) ->
      if tags then defer.resolve tags else defer.reject error
      return
    .catch (err) ->
      defer.resolve error
      return
    defer.promise

  objectToXML: (object,type,prefix) ->
    urls = []
    defer = q.defer()
    params = @config[type]
    if _.size(object) > 0
      if prefix then baseUrl = "#{@baseUrl}/#{prefix}/" else baseUrl = "#{@baseUrl}/"
      for key,value of object
        urls.push({url:value.slug,changefreq:params.frequency,priority:params.priority})

      sitemap = sm.createSitemap
        hostname: baseUrl
        cacheTime: 600000
        urls:urls
      sitemap.toXML (xml) ->
        defer.resolve xml
    else
      defer.resolve "bypass"
    defer.promise

  xmlToFile: (xml,name) ->
    defer = q.defer()
    innerPath = path.join(process.cwd(),"#{@config.output_dir}/#{name}")

    if xml isnt "bypass"
      fs.writeFile innerPath , xml , (err) ->
        if err then defer.reject err else defer.resolve "created file #{path}"
        return
    else
      fs.exists innerPath , (exists) ->
        if(exists)
          fs.unlink innerPath , (err) ->
            if err then defer.reject err else defer.resolve "created file #{path}"
            return
        else
          defer.resolve "bypass"
          return

    defer.promise

  finalSiteMap: () ->
    defer = q.defer()
    innerPath = path.join(process.cwd(),@config.output_dir+"/")
    dir = @config.output_dir
    baseUrl = @baseUrl
    fs.readdir innerPath , (err,files) ->
      if files
        urls = []
        for file in files
          urls.push({url:"/#{dir}/#{file}",changefreq:'monthly',priority:'0.7'})
        sitemap = sm.createSitemap
          hostname: baseUrl
          cacheTime: 600000
          urls:urls
        sitemap.toXML (xml) ->
          defer.resolve xml
      else
        defer.reject err
    defer.promise

module.exports = SiteMap
