var mainApp = angular.module("mainApp", ['ngRoute', 'firebase']);

mainApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eventList', {
        templateUrl: 'template/eventList.tpl.html',
        controller: 'EventEdit'
    }).when('/eventDetail/:eventId', {
        templateUrl: 'template/eventDetail.tpl.html', //can replace with html pages
        controller: 'EventDetailCtrl'
    }).when('/eventAdd', {
        templateUrl: 'template/eventAdd.tpl.html',
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
                    return "template/event/reception.tpl.html";
                if ($scope.event.template == "ceremony")
                    return "template/event/ceremony.tpl.html";
                return "template/event/ceremony.tpl.html";
            }
        }
    };
});