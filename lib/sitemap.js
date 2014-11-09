var SiteMap, fs, knex, path, q, sm, _;

knex = require('knex');

q = require('q');

fs = require('fs');

_ = require('lodash');

sm = require('sitemap');

path = require('path');

SiteMap = (function() {
  function SiteMap(config) {
    var connection;
    this.config = config;
    connection = this.config.database;
    this.baseUrl = this.config.url;
    knex = knex(connection);
  }

  SiteMap.prototype.getPermalink = function() {
    var defer;
    defer = q.defer();
    knex.select('value').from('settings').where(function() {
      this.where('key', 'permalinks');
    }).then(function(permalink) {
      defer.resolve(permalink);
    })["catch"](function(err) {
      defer.reject(err);
    });
    return defer.promise;
  };

  SiteMap.prototype.getPosts = function(permalink) {
    var defer, error;
    defer = q.defer();
    error = {
      error: 'No posts found'
    };
    knex.select('slug', 'published_at').from('posts').where(function() {
      this.where('status', 'published').where('page', 0);
    }).then(function(posts) {
      var filtered_posts;
      filtered_posts = _.map(posts, function(item) {
        var date, day, mapObj, month, re, slug_to_return, year;
        date = new Date(item.published_at);
        year = date.getFullYear();
        month = date.getMonth();
        day = date.getDay();
        mapObj = {
          '/:year': year,
          '/:month': month,
          '/:day': day,
          '/:slug/': item.slug
        };
        re = new RegExp(Object.keys(mapObj).join("|"), "gi");
        slug_to_return = permalink[0].value.replace(re, function(matched) {
          return "" + mapObj[matched.toLowerCase()] + "/";
        });
        if (slug_to_return.substr(-1) === '/') {
          item.slug = slug_to_return.substr(0, slug_to_return.length - 1);
        } else {
          item.slug = slug_to_return;
        }
      });
      if (posts) {
        defer.resolve(posts);
      } else {
        defer.reject(error);
      }
    })["catch"](function(err) {
      defer.reject(error);
    });
    return defer.promise;
  };

  SiteMap.prototype.getPages = function() {
    var defer, error;
    defer = q.defer();
    error = {
      error: 'No pages found'
    };
    knex.select('slug', 'published_at').from('posts').where(function() {
      this.where('status', 'published').where('page', 1);
    }).then(function(posts) {
      if (posts) {
        defer.resolve(posts);
      } else {
        defer.reject(error);
      }
    })["catch"](function(err) {
      defer.reject(error);
    });
    return defer.promise;
  };

  SiteMap.prototype.getTags = function() {
    var defer, error;
    defer = q.defer();
    error = {
      error: 'No tags found'
    };
    knex.select('tags.slug').from('tags').innerJoin('posts_tags', function() {
      this.on('tags.id', '=', 'posts_tags.tag_id');
    }).then(function(tags) {
      if (tags) {
        defer.resolve(tags);
      } else {
        defer.reject(error);
      }
    })["catch"](function(err) {
      defer.resolve(error);
    });
    return defer.promise;
  };

  SiteMap.prototype.objectToXML = function(object, type, prefix) {
    var baseUrl, defer, key, params, sitemap, urls, value;
    urls = [];
    defer = q.defer();
    params = this.config[type];
    if (_.size(object) > 0) {
      if (prefix) {
        baseUrl = "" + this.baseUrl + "/" + prefix + "/";
      } else {
        baseUrl = "" + this.baseUrl + "/";
      }
      for (key in object) {
        value = object[key];
        urls.push({
          url: value.slug,
          changefreq: params.frequency,
          priority: params.priority
        });
      }
      sitemap = sm.createSitemap({
        hostname: baseUrl,
        cacheTime: 600000,
        urls: urls
      });
      sitemap.toXML(function(xml) {
        return defer.resolve(xml);
      });
    } else {
      defer.resolve("bypass");
    }
    return defer.promise;
  };

  SiteMap.prototype.xmlToFile = function(xml, name) {
    var defer, innerPath;
    defer = q.defer();
    innerPath = path.join(process.cwd(), "" + this.config.output_dir + "/" + name);
    if (xml !== "bypass") {
      fs.writeFile(innerPath, xml, function(err) {
        if (err) {
          defer.reject(err);
        } else {
          defer.resolve("created file " + path);
        }
      });
    } else {
      fs.exists(innerPath, function(exists) {
        if (exists) {
          return fs.unlink(innerPath, function(err) {
            if (err) {
              defer.reject(err);
            } else {
              defer.resolve("created file " + path);
            }
          });
        } else {
          defer.resolve("bypass");
        }
      });
    }
    return defer.promise;
  };

  SiteMap.prototype.finalSiteMap = function() {
    var baseUrl, defer, dir, innerPath;
    defer = q.defer();
    innerPath = path.join(process.cwd(), this.config.output_dir + "/");
    dir = this.config.output_dir;
    baseUrl = this.baseUrl;
    fs.readdir(innerPath, function(err, files) {
      var file, sitemap, urls, _i, _len;
      if (files) {
        urls = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          if (file !== 'sitemap.xml') {
            urls.push({
              url: "/" + dir + "/" + file,
              changefreq: 'monthly',
              priority: '0.7'
            });
          }
        }
        sitemap = sm.createSitemap({
          hostname: baseUrl,
          cacheTime: 600000,
          urls: urls
        });
        return sitemap.toXML(function(xml) {
          return defer.resolve(xml);
        });
      } else {
        return defer.reject(err);
      }
    });
    return defer.promise;
  };

  return SiteMap;

})();

module.exports = SiteMap;
