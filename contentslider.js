(function($) {
    var LI_CSS = {
        'float': 'left',
        'list-style': 'none',
        'margin': '0',
        'padding': '0',
        'position': 'relative',
        'height': '100%'
    };

    var CONFIG_DEFAULTS = {
        index: 0,
        loadRange: 1,
        getPage: function(index) {
            return null;
        },
        hasIndex: function(index) {
            return false;
        }
    };

    $.fn.contentSlider = function(options) {
        var _config = {};
        $.extend(_config, CONFIG_DEFAULTS);
        $.extend(_config, options);

        var _currentIndex = _config.index;

        var _root = $(this);
        var _container;
        var _ul;

        var findLiWithIndex = function(index) {
            var result = null;
            _ul.find('li').each(function() {
                if ($(this).data('index') === index) {
                    result = $(this);
                    return false;
                }
            });
            return result;
        };

        var findLiBeforeIndex = function(index) {
            var result = null;
            _ul.find('li').each(function(){
                if ($(this).data('index') > index) {
                    return false;
                }
                result = $(this);
            });
            return result;
        };

        var ulPosition = function(li) {
            if (!li) {
                li = findLiWithIndex(_currentIndex);
            }
            var liHCenter = li.position().left + li.width() / 2;
            return _container.width() / 2 - liHCenter;
        };

        var loadRange = function(index) {
            var firstIndex = index - _config.loadRange;
            var lastIndex = index + _config.loadRange;
            var centerLi;
            var i = 0;
            for (i = firstIndex; i <= lastIndex; ++i) {
                if (_config.hasIndex(i)) {
                    var li = findLiWithIndex(i);
                    if (!li) {
                        var page = _config.getPage(i);
                        li = $('<li></li>');
                        li.data('index', i);
                        li.css(LI_CSS);
                        li.append(page);
                        var liBeforeI = findLiBeforeIndex(i);
                        if (liBeforeI) {
                            liBeforeI.after(li);
                        } else {
                            _ul.prepend(li);
                        }
                    }
                    if (i === index) {
                        centerLi = li;
                    }
                }
            }
            _ul.css("left", ulPosition());
            return centerLi;
        };

        var lock = false;
        var show = function(index, animation_options) {
            if (lock) {
                return;
            }
            lock = true;
            if (!_config.hasIndex(index)) {
                return;
            }

            var li = loadRange(index);
            var animation = { duration: 0 };
            if (animation_options) {
                $.extend(animation, animation_options);
            }
            $.extend(animation, {
                complete: function() {
                    _currentIndex = index;
                    lock = false;
                }
            });
            _ul.animate({
                left: ulPosition(li)
            }, animation);
        };

        (function init() {
            _container = $('<div></div>');
            _container.css({
                'overflow': 'hidden',
                'position': 'relative'
            });
            _root.append(_container);
            _ul = $('<ul></ul>');
            _ul.css({
                'overflow': 'visible',
                'width': '999999px',
                'height': '100%',
                'margin': '0',
                'padding': '0',
                'position': 'relative'
            });
            _container.append(_ul);
            show(_currentIndex);
        }());

        var index = function() {
            return _currentIndex;
        };

        return {
            show: show,
            index: index
        };
    };
}(jQuery));
