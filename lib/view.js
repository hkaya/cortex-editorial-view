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
      var onerror;
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
      return this.feed.get().then((function(_this) {
        return function(image) {
          var callbacks;
          callbacks = {
            error: onerror,
            begin: function() {
              return _this.run();
            }
          };
          return CortexView.submitView(_this.constructor.name, _this.render(image), _this.displayTime, callbacks);
        };
      })(this))["catch"](onerror);
    };

    EditorialView.prototype.render = function(img) {
      return "<div style=\"background: url(" + img + ") no-repeat center center local;\"\n  class=\"editorial\">\n</div>";
    };

    return EditorialView;

  })();

  module.exports = EditorialView;

}).call(this);
