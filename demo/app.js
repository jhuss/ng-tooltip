var app = angular.module('mytooltip', [
    'ngTooltip'
]);

app.controller('MainCtrl', function($scope) {
    $scope.list = [
        { name: "Item1", detail: "content of item 1" },
        { name: "Item2", detail: "content of item 2" },
        { name: "Item3", detail: "content of item 3" }
    ];
});
