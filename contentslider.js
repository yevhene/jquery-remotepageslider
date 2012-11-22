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

        var firstLiWithIndex = function(index) {
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

        var lock = {
            show: false
        };
        // animation - attributes map.
        var show = function(index, animation_options) {
            if (lock.show) {
                return;
            }
            lock.show = true;
            if (!_config.hasIndex(index)) {
                return;
            }
            var leftIndex = index - _config.loadRange;
            var rightIndex = index + _config.loadRange;
            var mainLi;
            var i = 0;
            for (i = leftIndex; i <= rightIndex; ++i) {
                if (_config.hasIndex(i)) {
                    var li = firstLiWithIndex(i);
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
                            _ul.append(li);
                        }
                    }
                    if (i === index) {
                        mainLi = li;
                    }
                }
            }

            var mainLiHCenter = mainLi.position().left + mainLi.width() / 2;
            var hPosition = _container.width() / 2 - mainLiHCenter;
            var animation = { duration: 0 };
            if (animation_options) {
                $.extend(animation, animation_options);
            }
            $.extend(animation, {
                complete: function() {
                    lock.show = false;
                }
            });
            _ul.animate({
                left: hPosition
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
