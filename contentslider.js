(function($) {
    $.fn.contentSlider = function(options) {
        var _ = $(this);
        var _ul = $(this).find('ul');
        var cfg = {
            width: _.width(),
            height: _.height(),
            index: 0
        };
        $.extend(cfg, options);

        var currentIndex = cfg.index;

        (function init() {
            _.css({
                'overflow': 'hidden',
                'position': 'relative'
            });
            _ul.css({
                'overflow': 'visible',
                'width': '999999px',
                'height': '100%',
                'margin': '0',
                'padding': '0',
                'position': 'relative'
            });
            _ul.children().each(function() {
                $(this).width(cfg.width);
                $(this).height(cfg.height);
                $(this).css({
                    'float': 'left',
                    'list-style': 'none',
                    'margin': '0',
                    'padding': '0',
                    'position': 'relative'
                });
            });
        }());

        var moveLock = false;
        var move = function(left) {
            if (moveLock) {
                return;
            }
            moveLock = true;
            _ul.animate({
                left: left
            }, 'slow', function() {
                moveLock = false;
            });
        };

        var prev = function() {
            var left = _ul.position().left + cfg.width;
            move(left);
        };

        var next = function() {
            var left = _ul.position().left - cfg.width;
            move(left);
        };

        return {
            next: next,
            prev: prev
        };
    };
}(jQuery));
