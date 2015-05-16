'use strict';
/* jshint strict: true */
/* globals define, describe, it, afterEach */

var defer = function(func) {
  var args = Array.prototype.slice.call(arguments, 2);
  return setTimeout(function() {
    return func.apply(null, args);
  }, 1);
};

function FakeStorage() {
  this.cache = {};
}

FakeStorage.prototype.init = function(cb) {
  defer(function() {
    this.cache = {};
    cb();
  }.bind(this));
};

FakeStorage.prototype.clear = function(cb) {
  defer(function() {
    this.cache = {};
    cb();
  }.bind(this));
};

FakeStorage.prototype.set = function(obj, cb) {
  defer(function() {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        this.cache[i] = obj[i];
      }
    }
    cb();
  }.bind(this));
};

FakeStorage.prototype.get = function(name, cb) {
  defer(function() {
    if (!name) {
      cb(this.cache);
    } else {
      var o = {};
      o[name] = this.cache[name];
      cb(o)
    }
  }.bind(this));
};

FakeStorage.prototype.remove = function(names, cb) {
  defer(function() {
    for (var i = 0; i < names.length; ++i) {
      delete this.cache[i];
    }
    cb();
  }.bind(this));
};

// Fake chrome.storage.local implementation.
window.chrome = {
  storage: {
    local: new FakeStorage()
  }
};

define(['should', 'localstorage'], function(should, localstorage) {
  describe('Test localstorage in chrome app environment', function() {
    afterEach(function(done) {
      chrome.storage.local.clear(done);
    });

    it('should fail if init wasn\'t called in chrome app env', function() {
      var msg = 'localstorage.init was not called';

      should(localstorage.clear).throwError(msg);

      should(function() {
        localstorage.setItem('foo', 'value');
      }).throwError(msg);

      should(function() {
        localstorage.getItem('foo');
      }).throwError(msg);

      should(function() {
        localstorage.removeItem('foo');
      }).throwError(msg);
    });

    it('should implement setItem', function() {
      localstorage.init(function() {
        localstorage.setItem('foo', 'bar');
        should(localstorage.getItem('foo')).be.eql('bar');
      });
    });

    it('should implement getItem', function(done) {
      localstorage.init(function() {
        localstorage.setItem('foo', 'bar', function() {
          should(localstorage.getItem('foo', function(v) {
            should(v).be.eql('bar');
            done();
          })).be.eql('bar')
        });
      });
    });

    it('should implement removeItem', function(done) {
      localstorage.init(function() {
        localstorage.setItem('foo', 'bar', function() {
          should(localstorage.getItem('foo', function(v) {
            should(v).be.eql('bar');

            localstorage.removeItem('foo', function() {
              should(localstorage.getItem('foo', function(v) {
                should(v).be.undefined;
                done();
              })).be.undefined;
            });

            should(localstorage.getItem('foo')).be.undefined;

          })).be.eql('bar');
        });
      })
    });

    it('should implement clear', function(done) {
      localstorage.init(function() {
        localstorage.setItem('foo', 'bar', function() {
          localstorage.getItem('foo', function(v) {
            should(v).be.eql('bar');

            localstorage.clear(function() {
              localstorage.getItem('foo', function(v) {
                should(v).be.undefined;

                done();
              })
            });
          });
        });
      });
    });
  });
});