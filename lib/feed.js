(function() {
  var $, CortexNet, EditorialFeed, promise, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  promise = require('promise');

  $ = require('jquery');

  CortexNet = typeof window !== "undefined" && window !== null ? (ref = window.Cortex) != null ? ref.net : void 0 : void 0;

  EditorialFeed = (function() {
    function EditorialFeed(feedXml, opts) {
      this.feedXml = feedXml;
      this._cache = bind(this._cache, this);
      this.fetch = bind(this.fetch, this);
      if (opts == null) {
        opts = {};
      }
      this._requestThrottleMs = 1000;
      this.assetCacheTTL = 7 * 24 * 60 * 60 * 1000;
      if (opts.assetCacheTTL != null) {
        this.assetCacheTTL = opts.assetCacheTTL;
      }
      this.feedCacheTTL = 24 * 60 * 60 * 1000;
      if (opts.feedCacheTTL != null) {
        this.feedCacheTTL = opts.feedCacheTTL;
      }
      this.feedCachePeriod = 30 * 60 * 1000;
      if (opts.feedCachePeriod != null) {
        this.feedCachePeriod = opts.feedCachePeriod;
      }
      this.imageIndex = 0;
      this.images = [];
      setInterval(this.fetch, this.feedCachePeriod);
      this.fetch();
    }

    EditorialFeed.prototype.get = function() {
      console.log("EditorialFeed will return one of the " + this.images.length + " images in " + this.feedXml);
      return new promise((function(_this) {
        return function(resolve, reject) {
          return resolve(_this._selectImage());
        };
      })(this));
    };

    EditorialFeed.prototype.fetch = function() {
      console.log("About to start a new Editorial Content fetch url = " + this.feedXml);
      return new promise((function(_this) {
        return function(resolve, reject) {
          var opts;
          opts = {
            cache: {
              mode: 'refresh',
              ttl: _this.feedCacheTTL
            },
            stripBom: true,
            retry: 3
          };
          if (CortexNet != null) {
            return CortexNet.download(_this.feedXml, opts, (function(file) {
              return $.get(file, (function(data) {
                var i, imageUrls, promises, url;
                imageUrls = _this._parse(data);
                if ((imageUrls != null) && imageUrls.length > 0) {
                  console.log("Replacing images " + _this.images.length + " -> " + imageUrls.length);
                  promises = (function() {
                    var j, len, results;
                    results = [];
                    for (i = j = 0, len = imageUrls.length; j < len; i = ++j) {
                      url = imageUrls[i];
                      results.push(this._cache(url, i * this._requestThrottleMs));
                    }
                    return results;
                  }).call(_this);
                  promise.all(promises).then(function(res) {
                    return _this.images = res;
                  })["catch"](function(e) {
                    return console.error(e);
                  }).done();
                }
                return resolve();
              })).fail(function(e) {
                _this.images = [];
                console.log("Failed to fetch local editorial feed. e=", e);
                return reject(e);
              });
            }), (function(e) {
              _this.images = [];
              console.log("Failed to fetch remote editorial feed. e=", e);
              return reject(e);
            }));
          } else {
            return reject(new Error("Cortex network is not available."));
          }
        };
      })(this));
    };

    EditorialFeed.prototype._parse = function(data) {
      var images, img, item, items, j, len, url, xml, xmlDoc;
      xmlDoc = $.parseXML(data);
      xml = $(xmlDoc);
      items = xml.find('item');
      images = [];
      for (j = 0, len = items.length; j < len; j++) {
        item = items[j];
        item = $(item);
        img = item.find('media\\:content, content');
        url = img.attr('url');
        images.push(url);
      }
      console.log("Feed parsed: Total images found: " + images.length);
      return images;
    };

    EditorialFeed.prototype._selectImage = function() {
      var image;
      image = void 0;
      if ((this.images != null) && this.images.length > 0) {
        if (this.imageIndex >= this.images.length) {
          this.imageIndex = 0;
        }
        image = this.images[this.imageIndex];
        this.imageIndex = this.imageIndex + 1;
      }
      return image;
    };

    EditorialFeed.prototype._cache = function(image, wait) {
      if (wait == null) {
        wait = 0;
      }
      return new promise((function(_this) {
        return function(resolve, reject) {
          var error, fetch, opts, success;
          if (CortexNet != null) {
            opts = {
              cache: {
                mode: 'normal',
                ttl: _this.assetCacheTTL
              },
              stripBom: false,
              retry: 3
            };
            error = function(e) {
              console.log("Failed to cache image " + image + ", err=", err);
              return reject(err);
            };
            success = function(path) {
              console.log("Cached image " + image + " => " + path);
              return resolve(path);
            };
            fetch = function() {
              return CortexNet.download(image, opts, success, error);
            };
            return setTimeout(fetch, wait);
          } else {
            console.log("Cortex network is not available. ");
            return resolve(image);
          }
        };
      })(this));
    };

    return EditorialFeed;

  })();

  module.exports = EditorialFeed;

}).call(this);
