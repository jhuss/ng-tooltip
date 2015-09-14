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
    '$templateCache',
    '$http',
    '$q',
    function (
        $ngTooltip,
        $rootScope,
        $document,
        $compile,
        $templateCache,
        $http,
        $q
    ) {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element, attrs) {
                var $tooltip;
                var defaults = $ngTooltip.getDefaultOptions();
                var options = {
                    container: attrs.ngTooltipContainer || defaults.container,
                    template: attrs.ngTooltipTemplate || defaults.template,
                    identifier: attrs.ngTooltipIdentifier || defaults.identifier
                };

                // load template
                function loadTemplate(template) {
                    if (!template) {
                        return '';
                    }
                    return $templateCache.get(template) || $http.get(template, { cache : true });
                }

                $tooltip = angular.element(options.container);

                element
                    .on('mouseout', hide)
                    .on('mouseover', show)
                ;

                element.mousemove(function(event) {
                    $tooltip.css({
                        left:  event.pageX,
                        top:   event.pageY
                    });
                });


                // show-hide
                function hide() {
                    console.log('hide');
                }

                function show(event) {
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
                }
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
        container: 'body',
        template: '',
        identifier: 'ng-tooltip'
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
