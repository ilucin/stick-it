;
(function($, window, document, undefined) {
  'use strct';

  var $window = $(window);
  var $body;
  var pluginName = 'stickIt';

  var defaults = {
    bottomMargin: 60,
    topMargin: 30
  };

  var Position = {
    STATIC: 0,
    FIXED_TOP: 1,
    FIXED_BOTTOM: 2
  }

  function Plugin(element, options) {
    this.el = element;
    this.$el = $(element);
    this.$parent = this.$el.parent();
    $body = $('body');
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var me = this;
      var rect = this.el.getBoundingClientRect();

      var parentFloat = this.$parent.css('float');
      var parentIsFloated = parentFloat === 'left' || parentFloat === 'right';

      this.options.bottomBoundaryEl = this.el.getAttribute('data-bottom-boundary');
      this.options.topBoundaryEl = this.el.getAttribute('data-top-boundary');
      this.options.bottomMargin = parseInt(this.el.getAttribute('data-bottom-margin'), 10);
      this.options.topMargin = parseInt(this.el.getAttribute('data-top-margin'), 10);

      this.options.bottomMargin = isNaN(this.options.bottomMargin) ? defaults.bottomMargin : this.options.bottomMargin;
      this.options.topMargin = isNaN(this.options.topMargin) ? defaults.topMargin : this.options.topMargin;

      if (parentIsFloated) {
        this.$parent.css('height', this.$parent.height());
      }

      if (this.options.topBoundaryEl) {
        var t = this.options.topBoundaryEl;
        this.$top = t instanceof $ ? t : $(t);
      }
      if (this.options.bottomBoundaryEl) {
        var b = this.options.bottomBoundaryEl;
        this.$bottom = b instanceof $ ? b : $(b);
      }

      this.position = Position.STATIC;
      this.initialOffset = this.$el.offset();
      this.initialHeight = this.$el.height();
      this.topBoundary = this.$top ? this.$top[0].getBoundingClientRect().bottom : 0;

      window.stickIt = this;

      $window.on('scroll', function() {
        var rect = me.el.getBoundingClientRect();

        // Return if element is not visible (display none)
        if (rect.height === 0 && rect.width === 0 && rect.left === 0 && rect.right === 0) {
          return;
        }

        var windowScrollY = window.scrollY || window.pageYOffset || window.document.documentElement.scrollTop;
        var elCanGoOutOfTheScreen = rect.height + me.initialOffset.top > window.innerHeight;
        var elBottomIsVisible = rect.bottom < window.innerHeight - me.options.bottomMargin;

        if (me.position === Position.STATIC) {
          if (elCanGoOutOfTheScreen) {
            if (elBottomIsVisible) {
              me.setFixedBottom();
            }
          } else {
            if (windowScrollY >= (me.initialOffset.top - me.topBoundary - me.options.topMargin)) {
              me.setFixedTop(me.topBoundary);
            }
          }

        } else if (me.position == Position.FIXED_TOP) {
          if (windowScrollY < (me.initialOffset.top - me.topBoundary - me.options.topMargin)) {
            me.setStatic();
          } else if (me.$bottom && me.$bottom.length > 0) {
            var bottomOffset = window.innerHeight - me.$bottom[0].getBoundingClientRect().top;
            var elBottomOffset = window.innerHeight - rect.bottom;
            if (bottomOffset >= elBottomOffset - me.options.bottomMargin) {
              me.setFixedBottom(bottomOffset);
            }
          }

        } else if (me.position === Position.FIXED_BOTTOM) {
          if ((windowScrollY + window.innerHeight - me.options.bottomMargin) < (me.initialOffset.top + rect.height)) {
            me.setStatic();
          } else if (!elCanGoOutOfTheScreen && rect.top > me.options.topMargin + me.topBoundary) {
            me.setFixedTop(me.topBoundary);
          } else if (me.$bottom && me.$bottom.length > 0) {
            var bottomOffset = window.innerHeight - me.$bottom[0].getBoundingClientRect().top;
            if (bottomOffset >= 0) {
              me.setFixedBottom(bottomOffset);
            }
          }
        }
      });
    },

    setFixedBottom: function(bottom) {
      this.$el.css({
        position: 'fixed',
        bottom: (bottom || 0) + this.options.bottomMargin,
        top: 'auto',
        width: this.$parent.width(),
      });
      this.position = Position.FIXED_BOTTOM;
    },

    setFixedTop: function(top) {
      var css = {
        top: (top || 0) + this.options.topMargin,
        bottom: 'auto',
        width: this.$parent.width()
      };
      if (this.position === Position.STATIC) {
        css.position = 'fixed';
      }
      this.$el.css(css);
      this.position = Position.FIXED_TOP;
    },

    setStatic: function() {
      this.$el.css({
        position: 'static',
        top: 'auto',
        bottom: 'auto',
        width: 'auto'
      });
      this.position = Position.STATIC;
    },

    destroy: function() {
      $window.off('scroll', this.onWindowScroll);
    }
  };

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      }
      return $.data(this, 'plugin_' + pluginName);
    });
  };

})(jQuery, window, document);