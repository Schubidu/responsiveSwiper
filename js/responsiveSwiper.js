(function (doc) {
    var SWIPERCLASS = 'swiper', SWIPERCOUNT = 0;

    var isIpad = false, // window.navigator.userAgent.toLowerCase().indexOf('ipad') > 0,
        isTouch = Modernizr.touch,
        csstransforms = Modernizr.csstransforms,
        csstransitions = Modernizr.csstransitions,
        prefixedTransform = Modernizr.prefixed('transform')
        ;

    var transEndEventNames = {
        'WebkitTransition':'webkitTransitionEnd',
        'MozTransition':'transitionend',
        'OTransition':'oTransitionEnd',
        'msTransition':'MSTransitionEnd',
        'transition':'transitionend'
    };


    var eventNames = {
        click:'click',
        transitionEnd:transEndEventNames[ Modernizr.prefixed('transition') ],
        start:(isTouch) ? 'touchstart' : 'mousedown',
        move:(isTouch) ? 'touchmove' : 'mousemove',
        end:(isTouch) ? 'touchend' : 'mouseup'
    };

    /**
     * Show/hide navigation-items
     * @param navigation domElement
     * @param currentIndex int
     * @param maxLength int
     */
    function checkNavigation(navigation, currentIndex, maxLength) {
        var navItems = navigation.getElementsByTagName('li');
        if (currentIndex == 0) {
            navItems[1].style.display = 'none';
        } else {
            navItems[1].style.display = 'block';
        }
        if (currentIndex == maxLength - 1) {
            navItems[0].style.display = 'none';
        } else {
            navItems[0].style.display = 'block';
        }
    }

    function replaceSwiperClass(str, count) {
        return str.replace('SWIPERCLASS', SWIPERCLASS + '-' + count);
    }

    function createSelectorObj(count) {
        return {
            body:replaceSwiperClass('.SWIPERCLASS', count),
            container:replaceSwiperClass('.SWIPERCLASS ul', count),
            navigation:replaceSwiperClass('.SWIPERCLASS-navigation', count),
            navigationItem:replaceSwiperClass('.SWIPERCLASS-navigation a', count)
        }
    }

    function filterItems(body) {
        return $('li', body);
    }

    function getCuridx(body) {
        return parseInt($(body).data('curidx'));
    }

    function getNavType(navItem) {
        return $(navItem).data('swiperNavType');
    }

    function getContainer(body) {
        return $('ul', body)[0];
    }

    function setEvent(swiper, name, selector, fn) {
        $(doc).on(name, selector, fn.apply(swiper));
    }

    function moveContainer(container, currentIndex, maxLength) {
        console.debug(container);
        if (csstransforms && csstransitions) {
            //$container[0].style[Modernizr.prefixed('transform')] = 'translateX(' + (currentIndex * -100/maxLength) + '%)';
            container.style[prefixedTransform] = 'translate3d(' + (currentIndex * -100 / maxLength) + '%, 0, 0)';
        } else {
            container.style['marginLeft'] = (currentIndex * -100) + '%';
            //that.onEnd(that.items[previdx], previdx);
        }

    }


    window.ResponsiveSwiper = (function () {

        // constructor
        function ResponsiveSwiper(body, navigation) {
            SWIPERCOUNT++;
            this.swiper = SWIPERCOUNT;
            this.body = body;
            this.navigation = navigation;
            this.items = filterItems(body);
            this.maxLength = this.items.length;
            this.currentIndex = getCuridx(body);
            this.selectors = createSelectorObj(this.swiper);

            console.debug(this.currentIndex);

            $(body).addClass(SWIPERCLASS + '-' + this.swiper);
            $(navigation).addClass(SWIPERCLASS + '-' + this.swiper + '-navigation');

            checkNavigation(navigation, this.currentIndex, this.maxLength);

            moveContainer(getContainer(body), this.currentIndex, this.maxLength);

            $(doc).on(eventNames.transitionEnd, this.selectors.container, function () {
                setTimeout(function () {
                    var currentIndex = that.currentIndex;
                    that.onEnd(that.items[currentIndex], currentIndex);
                }, 200)
            });

            $(doc).on(eventNames.click, this.selectors.navigationItem, function (event) {

                event.preventDefault();

                var $that = $(this), previdx,
                    currentIndex = that.getCurrentIndex(),
                    maxLength = that.maxLength,
                    curidx = previdx = currentIndex;

                switch (getNavType(this)) {
                    case "next":
                        curidx++;
                        break;
                    case "prev":
                        curidx--;
                        break;
                }

                if (curidx < 0) {
                    currentIndex = 0;
                } else if (curidx >= maxLength) {
                    currentIndex = maxLength - 1;
                } else {
                    currentIndex = curidx;
                }

                that.setCurrentIndex(currentIndex);
                if (previdx === currentIndex) return;

                that.onBegin(that.items[previdx], previdx);

                checkNavigation(that.navigation, currentIndex, maxLength);

                moveContainer(getContainer(that.body), currentIndex, maxLength);


            });

            (function (that) {

                // if(!Modernizr.touch) return;

                var $container,

                    contentWidth = 0,
                    currentPoint = 0, x = 0, y = 0,
                    isSelected = false,
                    maxLength = that.maxLength,
                    transformValue,
                    transformPercentage = 0;


                var updateValues = function () {
                    contentWidth = $(that.body).width();
                    $container = $(that.selectors.container);
                    transformValue = $container[0].style[prefixedTransform];
                    transformPercentage = parseFloat(transformValue.substring(12, transformValue.indexOf('%')));
                };

                var extractPosition = function (evt) {
                    return isTouch ? evt.changedTouches[0] : evt;
                };

                var updateTranlate3d = function (value) {

                };

                $(doc).on(eventNames.start, that.selectors.container, function (event) {
                    var evt = event.originalEvent ? event.originalEvent : event;
                    x = extractPosition(evt).pageX;
                    y = extractPosition(evt).pageY;
                    updateValues();
                    isSelected = true;
                    $container.addClass('no-transition');
                });

                $(doc).on(eventNames.move, that.selectors.container, function (event) {
                    if (!isSelected) return;
                    var evt = event.originalEvent ? event.originalEvent : event;
                    var x2 = extractPosition(evt).pageX;
                    var y2 = extractPosition(evt).pageY;
                    var diffX = x - x2;
                    var diffY = y - y2;

                    var percentage = transformPercentage - (diffX / contentWidth * 100 / maxLength);

                    event.preventDefault();
                    // var touch = event.touches[0];
                    if (csstransforms && csstransitions) {
                        $container[0].style[prefixedTransform] = 'translate3d(' + percentage + '%, 0, 0)';
                    }
                });

                $(doc).on(eventNames.end, that.selectors.container, function (event) {
                    var percentage = 0, hundred = -100;
                    var maxPercentage = (maxLength - 1) / maxLength * hundred;

                    updateValues();

                    isSelected = false;
                    $container.removeClass('no-transition');

                    if (transformPercentage > 0) {
                        percentage = 0;
                        currentIndex = 0;
                    } else if (transformPercentage < maxPercentage) {
                        percentage = maxPercentage;
                        currentIndex = maxLength - 1;
                    } else {
                        var currentPosition = transformPercentage / ( hundred / maxLength );
                        var currentIndex = Math.round(currentPosition);
                        percentage = currentIndex / maxLength * hundred;

                    }

                    that.setCurrentIndex(currentIndex);

                    $container[0].style[prefixedTransform] = 'translate3d(' + percentage + '%, 0, 0)';
                    checkNavigation(that.navigation, currentIndex, maxLength);

                });
            })(this);
            var that = this;
        }

        var __ = ResponsiveSwiper.prototype;
        __.onBegin = function (currentItem, index) {
        };
        __.onEnd = function (currentItem, index) {
        };

        __.setCurrentIndex = function (currentIndex) {
            this.currentIndex = currentIndex;
            return this;
        };

        __.getCurrentIndex = function () {
            return this.currentIndex;
        };

        return ResponsiveSwiper;

    }());

})(document);
