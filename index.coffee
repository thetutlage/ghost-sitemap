#!/usr/bin/env node

SiteMap = require './lib/sitemap'
Ghost = require './lib/ghost'
jf = require 'jsonfile'
messages = require './messages'
colors = require 'colors'
fs = require 'fs'
pluralize = require 'pluralize'
_ = require 'lodash'
mkdirp = require 'mkdirp'
nut = require 'nut-cli'
Ping = require './lib/ping'
logSymbols = require 'log-symbols'
initSiteMap = ''

nut.bootCommand 'ghostSiteMapBuilder'
nut.addCommand 'init',false,'Initiate a new sitemap builder inside ghost root directory'
nut.addCommand 'generate',false,'Generate new sitemaps'
nut.addCommand 'ping','[searchEngine:String]','Ping google and bing about your update'

commands = nut.parse();

init = () ->
  jf.readFile 'package.json', (err,obj) ->
    if err
      console.log colors.red logSymbols.error,messages.not_inside_root
      process.exit 1
      return
    else
      data =
        ghost_config_path: './config.js'
        env: process.env.ENV_VARIABLE || 'development'
        output_dir: 'sitemap'
        posts:
          frequency: 'hourly'
          priority: '0.1'
        pages:
          frequency: 'monthly'
          priority: '0.1'
        tags:
          frequency: 'daily'
          priority: '0.3'
      fs.writeFile './sitemapfile.json' , JSON.stringify(data,null,4) , (err) ->
        if(err)
          console.log colors.red logSymbols.error,messages.not_writable
          process.exit 1
        else
          console.log colors.green logSymbols.success,messages.writable
          console.log JSON.stringify(data,null, 4)


generate = (initGhostConfig) ->
  initGhostConfig.ghostToMine()
  .then (configration) ->
    console.log colors.cyan messages.init
    initSiteMap = new SiteMap configration
    console.log colors.cyan _.template(messages.fetching,{type:'posts'})
    initSiteMap.getPermalink()
  .then (permalink) ->
    initSiteMap.getPosts(permalink)
  .then (posts) ->
    counts = _.size posts
    if counts > 0
      console.log colors.green logSymbols.success,_.template(messages.fetched,{counts:counts,type:pluralize('post', counts)})
    else
      console.log colors.blue logSymbols.info,_.template(messages.not_found,{type:'posts'})
    initSiteMap.objectToXML posts,'posts'
  .then (postsXml) ->
    if postsXml isnt "bypass"
      console.log colors.cyan _.template(messages.writing,{type:'posts',file:'posts.xml'})
    initSiteMap.xmlToFile postsXml,'posts.xml'
  .then () ->
    console.log colors.green logSymbols.success,_.template(messages.written,{file:'posts.xml'})
    console.log colors.cyan _.template(messages.fetching,{type:'tags'});
    initSiteMap.getTags()
  .then (tags) ->
    counts = _.size tags
    if counts > 0
      console.log colors.green logSymbols.success,_.template(messages.fetched,{counts:counts,type:pluralize('tag', counts)})
    else
      console.log colors.blue logSymbols.info,_.template(messages.not_found,{type:'tags'})
    initSiteMap.objectToXML tags,'tags','tag'
  .then (tagsXml) ->
    if tagsXml isnt "bypass"
      console.log colors.cyan _.template(messages.writing,{type:'tags',file:'tags.xml'})
    initSiteMap.xmlToFile tagsXml,'tags.xml'
  .then () ->
    console.log colors.green logSymbols.success,_.template(messages.written,{file:'tags.xml'})
    console.log colors.cyan _.template(messages.fetching,{type:'pages'});
    initSiteMap.getPages()
  .then (pages) ->
    counts = _.size pages
    if counts > 0
      console.log colors.green logSymbols.success,_.template(messages.fetched,{counts:counts,type:pluralize('page', counts)})
    else
      console.log colors.blue logSymbols.info,_.template(messages.not_found,{type:'pages'})
    initSiteMap.objectToXML pages,'pages'
  .then (pagesXml) ->
    if pagesXml isnt "bypass"
      console.log colors.cyan _.template(messages.writing,{type:'pages',file:'pages.xml'})
    initSiteMap.xmlToFile pagesXml,'pages.xml'
  .then () ->
    console.log colors.cyan messages.building
    initSiteMap.finalSiteMap()
  .then (xml) ->
    initSiteMap.xmlToFile xml,'sitemap.xml'
  .then () ->
    console.log colors.green logSymbols.success,messages.alldone
  .catch (error) ->
    console.log colors.red logSymbols.error,error
    process.exit 1
  .done () ->
    process.exit 0
  return

ping = (initGhostConfig,service) ->
  initGhostConfig.ghostToMine()
  .then (configration) ->
    console.log colors.cyan _.template(messages.pinging,{service:service})
    initPings = new Ping configration
    initPings.pingServer(service)
  .then (success) ->
    _.map success, (val) ->
      if val.status is 200
        console.log colors.green logSymbols.success,_.template(messages.ping_success,{file:val.file,service:service})
      else
        console.log colors.red logSymbols.error,_.template(messages.ping_error,{file:val.file,service:service,status_code:val.status})
  .catch (error) ->
    console.log colors.red logSymbols.error,error
    process.exit 1

if commands.init
  init()
else #if _.size(commands) > 0
  jf.readFile 'sitemapfile.json', (err,obj) ->
    if err
      console.log colors.red logSymbols.error,messages.config_not_found
      return
    else
      mkdirp.sync obj.output_dir
      initGhostConfig = new Ghost obj
      generate(initGhostConfig)

      if commands.generate
        generate(initGhostConfig)

      if commands.ping
        if commands.ping is 'all'
          ping_to = ['google','bing']
        else
          ping_to = commands.ping.split ','
        _.each ping_to, (to) ->
          ping(initGhostConfig,to)
