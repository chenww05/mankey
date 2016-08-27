var mainApp = angular.module("mainApp", ['ngRoute', 'firebase']);

mainApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eventList', {
        templateUrl: 'angular/eventList.tpl.html',
        controller: 'EventEdit'
    }).when('/eventDetail/:eventId', {
        templateUrl: 'angular/eventDetail.tpl.html', //can replace with html pages
        controller: 'EventDetailCtrl'
    }).when('/eventAdd', {
        templateUrl: 'angular/eventAdd.tpl.html',
        controller: 'EventEdit'
    }).otherwise({
        redirectTo: '/eventAdd'
    });
}]);

mainApp.controller("EventEdit", function ($scope, $firebaseArray) {

    var ref = new Firebase("https://weddingplanner-5a174.firebaseio.com/messages");
    // create a synchronized array
    $scope.events = $firebaseArray(ref);
    // add new items to the array
    // the message is automatically added to our Firebase database!

    $scope.addEvent = function () {
        $scope.events.$add({
            text: $scope.text,
            title: $scope.title,
            template: $scope.template,
            cost: $scope.cost,
        });
    };
});

mainApp.controller("EventDetailCtrl", function ($scope, $firebaseObject, $firebaseArray, $routeParams) {
    var ref = new Firebase("https://weddingplanner-5a174.firebaseio.com/messages");
    // create a synchronized array
    $scope.events = $firebaseArray(ref);
    $scope.event = $firebaseObject(ref.child($routeParams.eventId));//This is ok.

})
    .directive("profile", function () {
        return {
            template: '<ng-include src="getTemplateUrl()"/>',
            //templateUrl: unfortunately has no access to $scope.user.type
            scope: {
                event: '=data' //what does this mean?
            },
            restrict: 'EA',
            controller: function ($scope) {
                $scope.getTemplateUrl = function () {
                    //basic handling. It could be delegated to different Services
                    if ($scope.event.template == "reception")
                        return "angular/reception.tpl.html";
                    if ($scope.event.template == "ceremony")
                        return "angular/ceremony.tpl.html";
                    return "angular/ceremony.tpl.html";
                }
            }
        };
    });

mainApp.controller("Controller", function ($scope, $firebaseArray) {
    var ref = new Firebase("https://weddingplanner-5a174.firebaseio.com/messages");
    $scope.events = $firebaseArray(ref);
    $scope.addEvent = function () {
        $scope.events.$add({
            text: $scope.text,
            title: $scope.title,
            template: $scope.template,
            cost: $scope.cost,
        });
    };
})

    .directive("isolated", function () { //no overlapping direcitive name otherwise bad
        return {
            template: '<ng-include src="getTemplateUrl()"/>',
            //templateUrl: unfortunately has no access to $scope.user.type
            scope: {
                event: '=data'//what does this mean?
            },
            restrict: 'E',
            controller: function ($scope) {
                $scope.getTemplateUrl = function () {
                    //basic handling. It could be delegated to different Services
                    if ($scope.event.template == "reception")
                        return "angular/reception.tpl.html";
                    if ($scope.event.template == "ceremony")
                        return "angular/ceremony.tpl.html";
                    return "angular/ceremony.tpl.html";
                }
            }
        };
    });