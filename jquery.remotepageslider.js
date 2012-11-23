(function($) {
    var CONTAINER_CSS = {
        'overflow': 'hidden',
        'position': 'relative'
    };

    var LIST_CSS = {
        'overflow': 'visible',
        'width': '999999px',
        'height': '100%',
        'margin': '0',
        'padding': '0',
        'position': 'relative'
    };

    var PAGE_CSS = {
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
        getPageContent: function(index, callback) {
            callback(null);
        },
        indexRange: {
            min: null,
            max: null
        }
    };

    $.fn.remotePageSlider = function(options) {
        var _config = {};
        $.extend(_config, CONFIG_DEFAULTS);
        $.extend(_config, options);

        var _currentIndex = _config.index;

        var _root = $(this);
        var _container;
        var _list;

        var isValidIndex = function(index) {
            var min = _config.indexRange.min;
            var max = _config.indexRange.max;
            if (min !== undefined && min !== null && index < min) {
                return false;
            }
            if (max !== undefined && min !== null && index > max) {
                return false;
            }
            return true;
        };

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

        var appendPagesWithContents = function(pagesContents) {
            $.each(pagesContents, function(i, content) {
                // int to string jquery fix.
                i = parseInt(i, 10);
                page = $('<li></li>');
                page.data('index', i);
                page.css(PAGE_CSS);
                page.append(content);
                var pageBeforeI = findPageBeforeIndex(i);
                if (pageBeforeI) {
                    pageBeforeI.after(page);
                } else {
                    _list.prepend(page);
                }
            });
        };

        var loadPagesRange = function(index, callback) {
            var firstIndex = index - _config.loadRange;
            var lastIndex = index + _config.loadRange;
            var pagesContents = {};
            var i = 0;
            var isAllPagesLoaded = function() {
                var result = true;
                $.each(pagesContents, function(key, value) {
                    if (value === null) {
                        result = false;
                    }
                });
                return result;
            };
            var finish = function(hasNewPages) {
                if (hasNewPages) {
                    appendPagesWithContents(pagesContents);
                    // Fix list position after elements inserted.
                    _list.css("left", listHPosition());
                }

                callback(findPageWithIndex(index));
            };
            var getPageContent = function(i) {
                _config.getPageContent(i, function(content) {
                    pagesContents[i] = $(content);
                    if (isAllPagesLoaded()) {
                        finish(true);
                    }
                });
            };
            for (i = firstIndex; i <= lastIndex; ++i) {
                if (isValidIndex(i)) {
                    var page = findPageWithIndex(i);
                    if (!page) {
                        pagesContents[i] = null;
                    }
                }
            }
            if (Object.keys(pagesContents).length > 0) {
                $.each(pagesContents, function(i) {
                    // int to string jquery fix.
                    i = parseInt(i, 10);
                    setTimeout(function() {
                        getPageContent(i);
                    }, 0);
                });
            } else {
                finish();
                return false;
            }
            return true; // Is have pages need to be loaded.
        };

        var moveTo = function(page, animation_options, complete) {
            var animation = { duration: 0 };
            if (animation_options) {
                $.extend(animation, animation_options);
            }
            if (complete) {
                $.extend(animation, {
                    complete: complete
                });
            }
            _list.animate({
                left: listHPosition(page)
            }, animation);
        };

        var _lock = false;
        // Returns true if something need to be loaded.
        var show = function(index, options) {
            if (!isValidIndex(index)) {
                return false;
            }
            if (_lock) {
                return false;
            }
            _lock = true;
            options = options || {};

            var loadRangeCallback = function(page) {
                if (options && options.loaded) {
                    options.loaded();
                }
                moveTo(page, options.animation, function() {
                    _currentIndex = index;
                    _lock = false;
                    if (options && options.done) {
                        options.done();
                    }
                });
            };

            return loadPagesRange(index, loadRangeCallback);
        };

        (function init() {
            _container = $('<div></div>');
            _container.css(CONTAINER_CSS);
            _root.append(_container);
            _list = $('<ul></ul>');
            _list.css(LIST_CSS);
            _container.append(_list);
            show(_currentIndex);
        }());

        var index = function() {
            return _currentIndex;
        };

        var isLocked = function() {
            return _lock;
        };

        return {
            show: show,
            index: index,
            isLocked: isLocked
        };
    };
}(jQuery));
