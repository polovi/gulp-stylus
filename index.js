'use strict';

var stylus          = require('stylus'),
    gutil           = require('gulp-util'),
    PluginError     = gutil.PluginError,
    log             = gutil.log,
    Transform       = require('stream').Transform,
    defaults        = require('lodash.defaults'),

    PLUGIN_NAME     = 'gulp-stylus';


function gulpstylus(options) {
  var stream = new Transform({ objectMode: true }),
      opts = defaults(options, {
        compress: false,
        silent: false
      });

  stream._transform = function(file, unused, done) {

    // Pass through if null
    if (file.isNull()) {
      stream.push(file);
      done();
      return;
    }

    if (file.isStream()) {
      return done(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    var s = stylus(file.contents.toString('utf8'))
              .set('filename', file.path)
              .set('compress', opts.compress);

    try {
      s.render(function(err, css) {
        if (err) throw err;

        file.path = gutil.replaceExtension(file.path, '.css');
        file.contents = new Buffer(css);
        stream.push(file);
        done();
      });
    } catch(err) {
      if (opts.silent) {
        log(String(new PluginError(PLUGIN_NAME, err)));
        return done();
      }
      done(new PluginError(PLUGIN_NAME, err));
    }

  };

  return stream;
}

module.exports = gulpstylus;
