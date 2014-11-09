var GhostConfig, colors, fs, messages, path, q, _;

fs = require('fs');

q = require('q');

_ = require('lodash');

messages = require('../messages');

colors = require('colors');

path = require('path');

GhostConfig = (function() {
  function GhostConfig(obj) {
    var e;
    this.obj = obj;
    this.path = path.join(process.cwd(), this.obj.ghost_config_path);
    this.env = this.obj.env;
    try {
      this.ghostConfig = require(this.path);
    } catch (_error) {
      e = _error;
      console.log(colors.red(messages.ghost_config_not_found.replace('%path%', this.path)));
      process.exit(1);
    }
  }

  GhostConfig.prototype.ghostToMine = function() {
    var defer;
    defer = q.defer();
    defer.resolve(_.assign(this.ghostConfig[this.env], this.obj));
    return defer.promise;
  };

  return GhostConfig;

})();

module.exports = GhostConfig;
