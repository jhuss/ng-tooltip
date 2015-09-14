/**
 * ng-tooltip
 * Autor: Jesus Jerez <jerezmoreno@gmail.com>
 * License: MIT
 */

'use strict';

var module = angular.module('ngTooltip', []);

module.provider('$ngTooltip', ngTooltipProvider);
module.directive('ngTooltip', [
    '$ngTooltip',
    '$rootScope',
    '$document',
    '$compile',
    '$parse',
    '$templateCache',
    '$http',
    '$timeout',
    '$q',
    function (
        $ngTooltip,
        $rootScope,
        $document,
        $compile,
        $parse,
        $templateCache,
        $http,
        $timeout,
        $q
    ) {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element, attrs) {
                var $container;
                var $tooltip;
                var unregisterTooltip;
                var hider;
                var displayer;
                var removeEventListeners;

                var defaults = $ngTooltip.getDefaultOptions();
                var options = {
                    container: attrs.ngTooltipContainer || defaults.container,
                    template: attrs.ngTooltipTemplate || defaults.template,
                    identifier: attrs.ngTooltipIdentifier || defaults.identifier,
                    trigger: attrs.ngTooltipTrigger || defaults.trigger,
                    followPointer: toBoolean(attrs.ngTooltipFollowPointer) || defaults.followPointer,
                    delay: attrs.ngTooltipDelay || defaults.delay,
                    timeout: attrs.ngTooltipTimeout || defaults.timeout,
                    onClose: attrs.ngTooltipOnClose || defaults.onClose,
                    onOpen: attrs.ngTooltipOnOpen || defaults.onOpen
                };

                // check if container exist
                $container = $document.find('#' + options.container);
                if (!$container.length) {
                    var body = $document.find('body');
                    $container = angular.element('<div>');
                    $container.attr('id', options.container);
                    body.append($container);
                }

                // tooltip container
                $container.css({
                    position: 'absolute'
                });
                $tooltip = angular.element($container);

                // tooltip following mouse pointer
                element.mousemove(function(event) {
                    if (options.followPointer === true) {
                        $tooltip.css({
                            left:  event.pageX,
                            top:   event.pageY
                        });
                    }
                });

                // element trigger of tooltip
                element.on(options.trigger, show);

                //remove event handler
                unregisterTooltip = function() {
                    element.off(options.trigger, show);
                };

                // Clean up after yourself
                scope.$on('$destroy', function() {
                    $tooltip.remove();
                    unregisterTooltip();
                });


                // option boolean
                function toBoolean(value) {
                    if (value && value.length !== 0) {
                        var v = ("" + value).toLowerCase();
                        value = (v == 'true');
                    } else {
                        value = false;
                    }
                    return value;
                }

                // event for tooltip
                function addEventListeners() {
                    function cancel() {
                        hider.cancel();
                    }

                    function hide() {
                        hider.hide(options.timeout);
                    }

                    element
                        .on('mouseout', hide)
                        .on('mouseover', cancel)
                    ;

                    $tooltip
                        .on('mouseout', hide)
                        .on('mouseover', cancel)
                    ;

                    removeEventListeners = function() {
                        element
                            .off('mouseout', hide)
                            .off('mouseover', cancel)
                        ;

                        $tooltip
                            .off('mouseout', hide)
                            .off('mouseover', cancel)
                        ;
                    }
                }

                // load template
                function loadTemplate(template) {
                    if (!template) {
                        return '';
                    }
                    return $templateCache.get(template) || $http.get(template, { cache : true });
                }

                // show
                function show(event) {
                    hider.cancel();
                    displayer.display(options.delay, event);
                }

                // hider & displayer
                hider = {
                    item: undefined,

                    hide: function(timeDelay) {
                        if(timeDelay !== "-1") {
                            if (!angular.isDefined(timeDelay)) {
                                timeDelay = 0;
                            }
                        }

                        hider.item = $timeout(function() {
                            $tooltip.isOpen = false;
                            displayer.cancel();
                            $tooltip.css('display', 'none');
                            removeEventListeners();

                            // Call the close callback
                            options.onClose(scope);

                        }, timeDelay * 1000);
                    },

                    cancel: function() {
                        $timeout.cancel(hider.item);
                    }
                };

                displayer = {
                    item: undefined,

                    display: function(timeDelay, event) {
                        if ($parse(attrs.ngTooltip)(scope) === false) {
                            return;
                        }

                        $timeout.cancel(displayer.item);

                        if (!angular.isDefined(timeDelay)) {
                            timeDelay = 0;
                        }

                        displayer.item = $timeout(function() {
                            if (true === $tooltip.isOpen) {
                                return;
                            }

                            $q.when(loadTemplate(options.template))
                                .then(function(template) {

                                    if (angular.isObject(template)) {
                                        template = angular.isString(template.data) ?
                                            template.data : ''
                                        ;
                                    }

                                    //tooltip
                                    $tooltip.html( template );
                                    $compile($tooltip)(scope);
                                });

                            $tooltip.isOpen = true;
                            $tooltip.css('display', 'block');
                            $tooltip.css({
                                left:  event.pageX,
                                top:   event.pageY
                            });

                            addEventListeners();

                            // Call the open callback
                            options.onOpen(scope);

                        }, timeDelay * 1000);
                    },

                    cancel: function() {
                        $timeout.cancel(displayer.item);
                    }
                };
            }
        }
    }
]);

/**
 * @ngdoc provider
 * @name $ngTooltip
 */
function ngTooltipProvider() {
    var defaultOptions = {
        container: 'tooltip-container',
        template: '',
        identifier: 'ng-tooltip',
        trigger: 'mouseenter',
        followPointer: 'false',
        delay: 0.5,
        timeout: 0,
        onClose: angular.noop,
        onOpen: angular.noop
    };

    this.setDefaultOptions = function(newDefaultOptions) {
        angular.extend(defaultOptions, newDefaultOptions);
    };

    this.$get = function () {
        return {
            getDefaultOptions: function () {
                return defaultOptions;
            }
        };
    };
}
