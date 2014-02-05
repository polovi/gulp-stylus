'use strict';

var stylus          = require('stylus'),
    gutil           = require('gulp-util'),
    transform       = require('stream').Transform,
    bufferstreams   = require('bufferstreams'),

    PLUGIN_NAME     = 'gulp-stylus';


function gulpstylus(options) {
  var stream = new transform({ objectMode: true });

  stream._transform = function(file, unused, done) {
    // Pass through if null
    if (file.isNull()) {
      stream.push(file);
      done();
      return;
    }

    if (!file.isStream()) {
      try {
        stylus(file.contents.toString('utf8'))
          .set('filename', file.path)
          .set('compress', false)
          .render(function(error, css) {
            if (error) throw error;

            file.path = gutil.replaceExtension(file.path, '.css');
            file.contents = new Buffer(css);
            stream.push(file);
            done();
          });
      } catch (error) {
        gutil.log(String(new gutil.PluginError(PLUGIN_NAME, error)));
        done();
      }
    }

  };

  return stream;
}

module.exports = gulpstylus;
