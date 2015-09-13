var app = angular.module('mytooltip', []);

app.controller('MainCtrl', function($scope) {
    $scope.list = [
        { name: "Item1", detail: "content of item 1" },
        { name: "Item2", detail: "content of item 2" },
        { name: "Item3", detail: "content of item 3" }
    ];

    $scope.domElement = function( item, index ) {
        $scope.detailItem = item;
        angular.element('#detail').append( angular.element('#detailCont') );
    };
});
