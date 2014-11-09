var Ghost, SiteMap, colors, commands, fs, generate, init, initSiteMap, jf, logSymbols, messages, mkdirp, nut, pluralize, _;

SiteMap = require('./lib/sitemap');

Ghost = require('./lib/ghost');

jf = require('jsonfile');

messages = require('./messages');

colors = require('colors');

fs = require('fs');

pluralize = require('pluralize');

_ = require('lodash');

mkdirp = require('mkdirp');

nut = require('nut-cli');

logSymbols = require('log-symbols');

initSiteMap = '';

nut.bootCommand('ghostSiteMapBuilder');

nut.addCommand('init', false, 'Initiate a new sitemap builder inside ghost root directory');

nut.addCommand('generate', false, 'Generate new sitemaps');

commands = nut.parse();

init = function() {
  return jf.readFile('package.json', function(err, obj) {
    var data;
    if (err) {
      console.log(colors.red(logSymbols.error, messages.not_inside_root));
      process.exit(1);
    } else {
      data = {
        ghost_config_path: './config.js',
        env: process.env.ENV_VARIABLE || 'development',
        output_dir: 'sitemap',
        posts: {
          frequency: 'hourly',
          priority: '0.1'
        },
        pages: {
          frequency: 'monthly',
          priority: '0.1'
        },
        tags: {
          frequency: 'daily',
          priority: '0.3'
        }
      };
      return fs.writeFile('./sitemapfile.json', JSON.stringify(data, null, 4), function(err) {
        if (err) {
          console.log(colors.red(logSymbols.error, messages.not_writable));
          return process.exit(1);
        } else {
          console.log(colors.green(logSymbols.success, messages.writable));
          return console.log(JSON.stringify(data, null, 4));
        }
      });
    }
  });
};

generate = function() {
  return jf.readFile('sitemapfile.json', function(err, obj) {
    var initGhostConfig;
    if (err) {
      console.log(colors.red(logSymbols.error, messages.config_not_found));
    } else {
      mkdirp.sync(obj.output_dir);
      initGhostConfig = new Ghost(obj);
      initGhostConfig.ghostToMine().then(function(configration) {
        console.log(colors.cyan(messages.init));
        initSiteMap = new SiteMap(configration);
        console.log(colors.cyan(_.template(messages.fetching, {
          type: 'posts'
        })));
        return initSiteMap.getPosts();
      }).then(function(posts) {
        var counts;
        counts = _.size(posts);
        if (counts > 0) {
          console.log(colors.green(logSymbols.success, _.template(messages.fetched, {
            counts: counts,
            type: pluralize('post', counts)
          })));
        } else {
          console.log(colors.blue(logSymbols.info, _.template(messages.not_found, {
            type: 'posts'
          })));
        }
        return initSiteMap.objectToXML(posts, 'posts');
      }).then(function(postsXml) {
        if (postsXml !== "bypass") {
          console.log(colors.cyan(_.template(messages.writing, {
            type: 'posts',
            file: 'posts.xml'
          })));
        }
        return initSiteMap.xmlToFile(postsXml, 'posts.xml');
      }).then(function() {
        console.log(colors.green(logSymbols.success, _.template(messages.written, {
          file: 'posts.xml'
        })));
        console.log(colors.cyan(_.template(messages.fetching, {
          type: 'tags'
        })));
        return initSiteMap.getTags();
      }).then(function(tags) {
        var counts;
        counts = _.size(tags);
        if (counts > 0) {
          console.log(colors.green(logSymbols.success, _.template(messages.fetched, {
            counts: counts,
            type: pluralize('tag', counts)
          })));
        } else {
          console.log(colors.blue(logSymbols.info, _.template(messages.not_found, {
            type: 'tags'
          })));
        }
        return initSiteMap.objectToXML(tags, 'tags', 'tag');
      }).then(function(tagsXml) {
        if (tagsXml !== "bypass") {
          console.log(colors.cyan(_.template(messages.writing, {
            type: 'tags',
            file: 'tags.xml'
          })));
        }
        return initSiteMap.xmlToFile(tagsXml, 'tags.xml');
      }).then(function() {
        console.log(colors.green(logSymbols.success, _.template(messages.written, {
          file: 'tags.xml'
        })));
        console.log(colors.cyan(_.template(messages.fetching, {
          type: 'pages'
        })));
        return initSiteMap.getPages();
      }).then(function(pages) {
        var counts;
        counts = _.size(pages);
        if (counts > 0) {
          console.log(colors.green(logSymbols.success, _.template(messages.fetched, {
            counts: counts,
            type: pluralize('page', counts)
          })));
        } else {
          console.log(colors.blue(logSymbols.info, _.template(messages.not_found, {
            type: 'pages'
          })));
        }
        return initSiteMap.objectToXML(pages, 'pages');
      }).then(function(pagesXml) {
        if (pagesXml !== "bypass") {
          console.log(colors.cyan(_.template(messages.writing, {
            type: 'pages',
            file: 'pages.xml'
          })));
        }
        return initSiteMap.xmlToFile(pagesXml, 'pages.xml');
      }).then(function() {
        console.log(colors.cyan(messages.building));
        return initSiteMap.finalSiteMap();
      }).then(function(xml) {
        return initSiteMap.xmlToFile(xml, 'sitemap.xml');
      }).then(function() {
        return console.log(colors.green(logSymbols.success, messages.alldone));
      })["catch"](function(error) {
        console.log(colors.red(logSymbols.error, error));
        return process.exit(1);
      }).done(function() {
        return process.exit(0);
      });
    }
  });
};

if (commands.generate) {
  generate();
}

if (commands.init) {
  init();
}