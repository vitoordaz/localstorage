/* jshint strict: true */
/* globals define, localStorage, chrome, setTimeout */

define('localstorage',['underscore'], function(_) {
  'use strict';

  var noop = function() {};

  // Flag to indicate weather init function was called or not.
  var INIT_WAS_CALLED = false;
  var CACHE = {};
  var IS_CHROME_APP = window.chrome && chrome.storage && chrome.storage.local;

  if (IS_CHROME_APP) {
    return {
      init: function(cb) {
        // Chrome storage API is async that is why we should load everything
        // from chrome.storage.local and store it in cache.
        chrome.storage.local.get(null, function(data) {
          CACHE = data;
          INIT_WAS_CALLED = true;
          cb();
        });
      },
      clear: function(cb) {
        if (!INIT_WAS_CALLED && !cb) {
          throw Error('localstorage.init was not called');
        }
        cb = cb || noop;
        chrome.storage.local.clear(cb);
        // IMPORTANT: Clear CACHE before it actually will be cleared in
        // chrome.storage.local to follow localStorage semantic.
        CACHE = {};
      },
      setItem: function(name, value, cb) {
        if (!INIT_WAS_CALLED && !cb) {
          throw Error('localstorage.init was not called');
        }
        cb = cb || noop;
        var o = {};
        o[name] = value;
        chrome.storage.local.set(o, cb);
        // IMPORTANT: Update cached value before it actually getting saved to
        // chrome.storage.local to follow localStorage semantic.
        CACHE[name] = value;
      },
      getItem: function(name, cb) {
        if (!INIT_WAS_CALLED && !cb) {
          throw Error('localstorage.init was not called');
        }
        cb = cb || noop;
        chrome.storage.local.get(name, function(value) {
          // NOTE: Update stored value just in case it was modified somewhere
          // else.
          CACHE[name] = value[name];
          cb(value[name]);
        });
        return CACHE[name];
      },
      removeItem: function(name, cb) {
        if (!INIT_WAS_CALLED && !cb) {
          throw Error('localstorage.init was not called');
        }
        cb = cb || noop;
        chrome.storage.local.remove([name], cb);
        // IMPORTANT: Delete item before it actually removed from
        // chrome.storage.local to follow localStorage semantic.
        delete CACHE[name];
      }
    };
  }

  return {
    init: _.defer,
    clear: function(cb) {
      _.defer(function() {
        localStorage.clear();
        (cb || noop)();
      });
    },
    setItem: function(key, value, cb) {
      _.defer(function() {
        localStorage.setItem(key, value);
        (cb || noop)();
      });
    },
    getItem: function(key, cb) {
      _.defer(function() {
        (cb || noop)(localStorage.getItem(key));
      });
    },
    removeItem: function(key, cb) {
      _.defer(function() {
        localStorage.removeItem(key);
        (cb || noop)();
      });
    }
  };
});

