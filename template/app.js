
var mainApp = angular.module("mainApp", ['ngRoute', 'firebase']);
mainApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.

    when('/reception', {
        templateUrl: 'reception.htm',
        controller: 'SampleCtrl'
    }).

    when('/ceremony', {
        templateUrl: 'ceremony.htm',
        controller: 'SampleCtrl'
    }).

    otherwise({
        redirectTo: '/reception'
    });
}]);

// mainApp.controller('AddStudentController', function($scope) {
//     $scope.message = "This page will be used to display add student form";
// });
//
// mainApp.controller('ViewStudentsController', function($scope) {
//     $scope.message = "This page will be used to display all the students";
// });
//var app = angular.module("sampleApp", ["firebase"]);

mainApp.controller("SampleCtrl", function($scope, $firebaseArray) {
    var ref = new Firebase("https://weddingplanner-5a174.firebaseio.com/messages");
    // create a synchronized array
    $scope.events = $firebaseArray(ref);
    // add new items to the array
    // the message is automatically added to our Firebase database!

    $scope.addEvent = function() {
        $scope.events.$add({
            text: $scope.text,
            title: $scope.title,
            template: $scope.template,
            cost: $scope.cost,
        });
    };

    // click on `index.html` above to see $remove() and $save() in action
})
.directive("profile", function() {
    return {
        template: '<ng-include src="getTemplateUrl()"/>',
        //templateUrl: unfortunately has no access to $scope.user.type
        scope: {
            event: '=data'
        },
        restrict: 'E',
        controller: function($scope) {
            //function used on the ng-include to resolve the template
            $scope.getTemplateUrl = function() {
                //basic handling. It could be delegated to different Services
                if ($scope.event.template == "Reception")
                    return "reception.tpl.html";
                if ($scope.event.template == "Ceremony")
                    return "ceremony.tpl.html";
            }
        }
    };
})
;