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
        loadRange: 1, // 'all' if need to preload all.
        getPageContent: function(index, callback) {
            callback(null);
        },
        indexRange: {
            min: null,
            max: null
        },
        cycle: false, // Need min and max index to be set.
        ready: null // event
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
            if (_config.cycle) {
                if (min === undefined || min === null) {
                    return false;
                }
                if (max === undefined || min === null) {
                    return false;
                }
            } else {
                if (min !== undefined && min !== null && index < min) {
                    return false;
                }
                if (max !== undefined && min !== null && index > max) {
                    return false;
                }
            }
            return true;
        };

        var realIndex = function(cycleIndex) {
            if (cycleIndex === undefined || cycleIndex === null) {
                cycleIndex = _currentIndex;
            }
            var min = _config.indexRange.min;
            var max = _config.indexRange.max;
            if (cycleIndex > max) {
                return min + (cycleIndex - min) % (max - min + 1);
            }
            if (cycleIndex < min) {
                return max - Math.abs(cycleIndex - min + 1) % (max - min + 1);
            }
            return cycleIndex;
        };

        var findPageWithIndex = function(index) {
            var result = null;
            _list.children('li').each(function() {
                if ($(this).data('index') === index) {
                    result = $(this);
                    return false;
                }
            });
            return result;
        };

        var findPageWithCycleIndex = function(index) {
            var result = null;
            var real = realIndex(index);
            _list.children('li').each(function() {
                if (realIndex($(this).data('index')) === real) {
                    result = $(this);
                    return false;
                }
            });
            return result;
        };

        var findPageBeforeIndex = function(index) {
            var result = null;
            _list.children('li').each(function() {
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
                page = findPageWithCycleIndex(_currentIndex);
            }
            var pageHCenter = page.position().left + page.width() / 2;
            return _container.width() / 2 - pageHCenter;
        };

        var insertPage = function(page) {
            var index = page.data('index');
            var pageBeforeIndex = findPageBeforeIndex(index);
            if (pageBeforeIndex) {
                pageBeforeIndex.after(page);
            } else {
                _list.prepend(page);
            }
        };

        var insertPageWithContent = function(index, content) {
            page = $('<li></li>');
            page.data('index', index);
            page.css(PAGE_CSS);
            page.append(content);
            insertPage(page);
        };

        var insertPagesWithContents = function(pagesContents) {
            $.each(pagesContents, function(i, content) {
                // int to string jquery fix.
                i = parseInt(i, 10);
                insertPageWithContent(i, content);
            });
        };

        var movePages = function(pagesToBeMoved) {
            $.each(pagesToBeMoved, function(newIndex, page) {
                newIndex = parseInt(newIndex, 10);
                page.detach();
                page.data('index', newIndex);
                insertPage(page);
            });
        };

        var indexRange = function(index) {
            var firstIndex;
            var lastIndex;
            if (_config.loadRange === 'all') {
                if (_config.cycle === true) {
                    var count = _config.indexRange.max - _config.indexRange.min + 1;
                    if (count % 2 === 0) {
                        firstIndex = index - count / 2 + 1;
                        lastIndex = index + count / 2;
                    } else {
                        firstIndex = index - (count - 1) / 2;
                        lastIndex = index + (count - 1) / 2;
                    }
                } else {
                    firstIndex = _config.indexRange.min;
                    lastIndex = _config.indexRange.max;
                }
            } else {
                firstIndex = index - _config.loadRange;
                lastIndex = index + _config.loadRange;
            }
            return {
                firstIndex: firstIndex,
                lastIndex: lastIndex
            };
        };

        var fixPosition = function() {
            _list.css("left", listHPosition());
        };

        var loadPagesRange = function(index, callback) {
            var range = indexRange(index);
            var pagesContents = {};
            var pagesToBeMoved = {};
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
            var finish = function() {
                if (Object.keys(pagesToBeMoved).length > 0) {
                    movePages(pagesToBeMoved);
                }
                if (Object.keys(pagesContents).length > 0) {
                    insertPagesWithContents(pagesContents);
                }
                if (Object.keys(pagesToBeMoved).length > 0 ||
                    Object.keys(pagesContents).length > 0) {
                    fixPosition();
                }

                callback(findPageWithIndex(index));
            };
            var getPageContent = function(i) {
                // if cycle index.
                real = realIndex(i);
                _config.getPageContent(real, function(content) {
                    pagesContents[i] = $(content);
                    if (isAllPagesLoaded()) {
                        finish();
                    }
                });
            };
            for (i = range.firstIndex; i <= range.lastIndex; ++i) {
                if (isValidIndex(i)) {
                    var page = findPageWithIndex(i);
                    if (!page && _config.cycle) {
                        page = findPageWithCycleIndex(i);
                        if (page) {
                            pagesToBeMoved[i] = page;
                        }
                    }
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
            show(_currentIndex, {
                done: function() {
                    if (_config.ready) {
                        _config.ready();
                    }
                }
            });
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
            isLocked: isLocked,
            realIndex: realIndex,
            fixPosition: fixPosition
        };
    };
}(jQuery));
