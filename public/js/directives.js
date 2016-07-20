'use strict';

/* Directives */

angular.module('Game.directives', [])
  .directive('ngHoverHand', function() {
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, elem, attrs) {
      $(elem).mouseleave(function(event) {
        $('.front').removeClass('front');
      });
    }
  };
})

.directive('ngHoverCard', function() {
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, elem, attrs) {
      $(elem).mousemove(function(event) {
        if (event.pageX - elem.offset().left > scope.spacing(scope.you().hand.length)) {
          elem.removeClass('front');
          elem.next().addClass('front');
        }
      });
      $(elem).mouseleave(function() {
        elem.removeClass('front');
      });
      $(elem).mouseenter(function() {
        $('.front').removeClass('front');
        $(elem).addClass('front');
      });
    }
  };
});