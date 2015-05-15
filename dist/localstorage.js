/* jshint strict: true */
/* globals define, localStorage, chrome, setTimeout */

define('localstorage',[],function() {
  'use strict';

  var defer = function(func) {
    var args = Array.prototype.slice.call(arguments, 2);
    return setTimeout(function() {
      return func.apply(null, args);
    }, 1);
  };

  var noop = function() {};

  // Flag to indicate weather init function was called or not.
  var INIT_WAS_CALLED = false;
  var CACHE = {};
  var IS_CHROME_APP = chrome && chrome.storage && chrome.storage.local;

  return {
    init: function(cb) {
      if (!IS_CHROME_APP) {
        INIT_WAS_CALLED = true;
        cb();
      } else {
        // Chrome storage API is async that is why we should load everything
        // from chrome.storage.local and store it in cache.
        chrome.storage.local.get(null, function(data) {
          CACHE = data;
          INIT_WAS_CALLED = true;
          cb();
        });
      }
    },
    clear: function(cb) {
      cb = cb || noop;
      if (!IS_CHROME_APP) {
        localStorage.clear();
        defer(cb);
      } else {
        if (!INIT_WAS_CALLED) {
          throw Error('localstorage.init was not called');
        }
        chrome.storage.local.clear(cb);
      }
      // IMPORTANT: Clear CACHE before it actually will be cleared in
      // chrome.storage.local to follow localStorage semantic.
      CACHE = {};
    },
    setItem: function(name, value, cb) {
      cb = cb || noop;
      if (!IS_CHROME_APP) {
        localStorage.setItem(name, value);
        defer(cb);
      } else {
        if (!INIT_WAS_CALLED) {
          throw Error('localstorage.init was not called');
        }
        var o = {};
        o[name] = value;
        chrome.storage.local.set(o, cb);
      }
      // IMPORTANT: Update cached value before it actually getting saved to
      // chrome.storage.local to follow localStorage semantic.
      CACHE[name] = value;
    },
    getItem: function(name, cb) {
      cb = cb || noop;
      if (!IS_CHROME_APP) {
        CACHE[name] = localStorage.getItem(name);
        defer(cb, CACHE[name]);
      } else {
        if (!INIT_WAS_CALLED) {
          throw Error('localstorage.init was not called');
        }
        chrome.storage.local.get(name, function(value) {
          // NOTE: Update stored value just in case it was modified somewhere
          // else.
          CACHE[name] = value[name];
          cb(value[name]);
        });
      }
      return CACHE[name];
    },
    removeItem: function(name, cb) {
      cb = cb || noop;
      if (!IS_CHROME_APP) {
        localStorage.removeItem(name);
        defer(cb);
      } else {
        if (!INIT_WAS_CALLED) {
          throw Error('localstorage.init was not called');
        }
        chrome.storage.local.remove([name], cb);
      }
      // IMPORTANT: Delete item before it actually removed from
      // chrome.storage.local to follow localStorage semantic.
      delete CACHE[name];
    }
  };
});

