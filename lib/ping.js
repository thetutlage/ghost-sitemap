var Ping, async, fs, path, q, request;

q = require('q');

request = require('request');

async = require('async');

path = require('path');

fs = require('fs');

Ping = (function() {
  function Ping(config) {
    this.config = config;
    this.baseUrl = this.config.url;
    return;
  }

  Ping.prototype.pingServer = function(service) {
    var defer, innerPath, makeRequest, prefix, serviceUrl;
    defer = q.defer();
    if (service === 'google') {
      serviceUrl = "http://www.google.com/webmasters/sitemaps/ping?sitemap=";
    } else if (service === 'bing') {
      serviceUrl = "http://www.bing.com/webmaster/ping.aspx?siteMap=";
    }
    prefix = "" + this.baseUrl + "/" + this.config.output_dir;
    makeRequest = function(file, callback) {
      var postfix, url;
      postfix = "" + prefix + "/" + file;
      url = "" + serviceUrl + postfix;
      request(url, function(err, response, body) {
        return callback(null, {
          status: response.statusCode,
          file: postfix
        });
      });
    };
    innerPath = path.join(process.cwd(), this.config.output_dir + "/");
    fs.readdir(innerPath, function(err, files) {
      if (files) {
        async.map(files, makeRequest, function(error, results) {
          if (error) {
            return defer.reject(error);
          } else {
            return defer.resolve(results);
          }
        });
      } else {
        return defer.reject(err);
      }
    });
    return defer.promise;
  };

  return Ping;

})();

module.exports = Ping;
