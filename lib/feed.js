(function() {
  var $, CortexNet, EditorialFeed, promise, ref;

  promise = require('promise');

  $ = require('jquery');

  CortexNet = typeof window !== "undefined" && window !== null ? (ref = window.Cortex) != null ? ref.net : void 0 : void 0;

  EditorialFeed = (function() {
    function EditorialFeed(feedXml, opts) {
      var fetch;
      this.feedXml = feedXml;
      if (opts == null) {
        opts = {};
      }
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
      this.cacheIndex = 1;
      this.images = [];
      fetch = (function(_this) {
        return function() {
          return _this.fetch();
        };
      })(this);
      setInterval(fetch, this.feedCachePeriod);
      this.fetch();
    }

    EditorialFeed.prototype.get = function() {
      console.log("EditorialFeed will return on of the " + this.images.length + " images in " + this.feedXml);
      return new promise((function(_this) {
        return function(resolve, reject) {
          var image;
          image = _this._selectImage();
          if (image != null) {
            return _this._cache(image).then(resolve)["catch"](reject);
          } else {
            return reject(new Error("No editorial content is available."));
          }
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
                var images;
                images = _this._parse(data);
                if ((images != null) && images.length > 0) {
                  console.log("Replacing images " + _this.images.length + " -> " + images.length);
                  _this.images = images;
                }
                return resolve();
              })).fail(function(e) {
                console.log("Failed to fetch local editorial feed. e=", e);
                return reject(e);
              });
            }), (function(e) {
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
      var i, images, img, item, items, len, url, xml, xmlDoc;
      xmlDoc = $.parseXML(data);
      xml = $(xmlDoc);
      items = xml.find('item');
      images = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
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

    EditorialFeed.prototype._cache = function(image) {
      return new promise((function(_this) {
        return function(resolve, reject) {
          var opts;
          if (CortexNet != null) {
            opts = {
              cache: {
                mode: 'normal',
                ttl: _this.assetCacheTTL
              },
              stripBom: false,
              retry: 3
            };
            return CortexNet.download(image, opts, (function(path) {
              console.log("Cached image " + image + " => " + path);
              return resolve(path);
            }), (function(err) {
              console.log("Failed to cache image " + image + ", err=", err);
              return reject(err);
            }));
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
