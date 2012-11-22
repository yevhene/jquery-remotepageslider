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
        getPageContent: function(index) {
            return null;
        },
        hasPageWithIndex: function(index) {
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
        var _list;

        var findPageWithIndex = function(index) {
            var result = null;
            _list.find('li').each(function() {
                if ($(this).data('index') === index) {
                    result = $(this);
                    return false;
                }
            });
            return result;
        };

        var findPageBeforeIndex = function(index) {
            var result = null;
            _list.find('li').each(function(){
                if ($(this).data('index') > index) {
                    return false;
                }
                result = $(this);
            });
            return result;
        };

        // If no page, search hPosition for current page.
        var listHPosition = function(page) {
            if (!page) {
                page = findPageWithIndex(_currentIndex);
            }
            var pageHCenter = page.position().left + page.width() / 2;
            return _container.width() / 2 - pageHCenter;
        };

        var loadRange = function(index) {
            var firstIndex = index - _config.loadRange;
            var lastIndex = index + _config.loadRange;
            var centerPage;
            var i = 0;
            for (i = firstIndex; i <= lastIndex; ++i) {
                if (_config.hasPageWithIndex(i)) {
                    var page = findPageWithIndex(i);
                    if (!page) {
                        var pageContent = _config.getPageContent(i);
                        page = $('<li></li>');
                        page.data('index', i);
                        page.css(LI_CSS);
                        page.append(pageContent);
                        var pageBeforeI = findPageBeforeIndex(i);
                        if (pageBeforeI) {
                            pageBeforeI.after(page);
                        } else {
                            _list.prepend(page);
                        }
                    }
                    if (i === index) {
                        centerPage = page;
                    }
                }
            }
            _list.css("left", listHPosition());
            return centerPage;
        };

        var lock = false;
        var show = function(index, animation_options) {
            if (!_config.hasPageWithIndex(index)) {
                return;
            }
            if (lock) {
                return;
            }
            lock = true;

            var page = loadRange(index);
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
            _list.animate({
                left: listHPosition(page)
            }, animation);
        };

        (function init() {
            _container = $('<div></div>');
            _container.css({
                'overflow': 'hidden',
                'position': 'relative'
            });
            _root.append(_container);
            _list = $('<ul></ul>');
            _list.css({
                'overflow': 'visible',
                'width': '999999px',
                'height': '100%',
                'margin': '0',
                'padding': '0',
                'position': 'relative'
            });
            _container.append(_list);
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
