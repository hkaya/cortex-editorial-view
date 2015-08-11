(function() {
  var CortexView, EditorialFeed, EditorialView, ref;

  CortexView = typeof window !== "undefined" && window !== null ? (ref = window.Cortex) != null ? ref.view : void 0 : void 0;

  EditorialFeed = require('./feed');

  EditorialView = (function() {
    function EditorialView(feedXml, opts) {
      if (opts == null) {
        opts = {};
      }
      this.displayTime = 7500;
      if (opts.displayTime != null) {
        this.displayTime = opts.displayTime;
      }
      this.feed = new EditorialFeed(feedXml, opts);
    }

    EditorialView.prototype.run = function() {
      var callbacks, image, onerror;
      onerror = (function(_this) {
        return function(err) {
          var run;
          console.log("Failed to render editorial content: " + (err != null ? err.message : void 0));
          run = function() {
            return _this.run();
          };
          return setTimeout(run, 1000);
        };
      })(this);
      image = this.feed.get();
      if (image != null) {
        callbacks = {
          error: onerror,
          begin: (function(_this) {
            return function() {
              return _this.run();
            };
          })(this)
        };
        return CortexView.submitView(this.constructor.name, this.render(image), this.displayTime, callbacks);
      } else {
        return onerror(new Error("No editorial image found."));
      }
    };

    EditorialView.prototype.render = function(img) {
      return "<div style=\"background: url(" + img + ") no-repeat center center local;\"\n  class=\"editorial\">\n</div>";
    };

    return EditorialView;

  })();

  module.exports = EditorialView;

}).call(this);
