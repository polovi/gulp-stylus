'use strict';

var stylus          = require('stylus'),
    gutil           = require('gulp-util'),
    PluginError     = gutil.PluginError,
    log             = gutil.log,
    Transform       = require('stream').Transform,
    defaults        = require('lodash.defaults'),

    PLUGIN_NAME     = 'gulp-stylus';

function formatException(e) {
  return e.name+' in plugin \''+gutil.colors.cyan(PLUGIN_NAME)+'\''+': '+e.message
}

function gulpstylus(options) {
  var stream = new Transform({ objectMode: true }),
      opts = defaults({}, options ,{
        compress: false,
        silent: false
      });

  stream._transform = function(file, unused, done) {

    if (file.isNull()) {
      stream.push(file);
      return done();
    }

    if (file.isStream()) {
      return done(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    var s = stylus(file.contents.toString('utf8'))
              .set('filename', file.path)
              .set('compress', opts.compress);

    try {
      var css = s.render();
      file.path = gutil.replaceExtension(file.path, '.css');
      file.contents = new Buffer(css);
      stream.push(file);
      done();

    } catch (e) {
      if (opts.silent) {
        log(formatException(e));
        file.path = gutil.replaceExtension(file.path, '.css');
        file.contents = new Buffer('');
        stream.push(file);
        return done();
      }

      done(new PluginError(PLUGIN_NAME, e));
    }

  };

  return stream;
}

module.exports = gulpstylus;
