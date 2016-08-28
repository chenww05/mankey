var config = {
    apiKey: "AIzaSyBTjgkKhvRuE5oPjiKKDvmMFrn2zvPBcJ8",
    authDomain: "weddingplanner-5a174.firebaseapp.com",
    databaseURL: "https://weddingplanner-5a174.firebaseio.com",
    storageBucket: "weddingplanner-5a174.appspot.com",
};
firebase.initializeApp(config);

var mainApp = angular.module("mainApp", ['ngRoute', 'firebase']);

mainApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eventList', {
        templateUrl: 'template/eventList.tpl.html',
        controller: 'EventEdit'
    }).when('/eventDetail/:eventId', {
        templateUrl: 'template/eventDetail.tpl.html',
        controller: 'EventDetailCtrl'
    }).when('/eventAdd/:flowId', {
        templateUrl: 'template/eventAdd.tpl.html',
        controller: 'EventAdd'
    }).when('/flowAdd', {
        templateUrl: 'template/flowAdd.tpl.html',
        controller: 'EventEdit'
    }).when('/flowList', {
        templateUrl: 'template/flowList.tpl.html',
        controller: 'EventEdit'
    }).when('/flowDetail/:flowId', {
        templateUrl: 'template/flowDetail.tpl.html',
        controller: 'FlowDetailCtrl'
    }).otherwise({
        redirectTo: '/eventAdd'
    });
}]);

mainApp.controller("EventEdit", function ($scope, $firebaseArray) {

    // TODO only user as owner
    var eventRef = new Firebase("https://weddingplanner-5a174.firebaseio.com/events");
    // create a synchronized array
    $scope.events = $firebaseArray(eventRef);
    var userData = firebase.auth().currentUser;


    // TODO only user as owner
    var flowRef = new Firebase("https://weddingplanner-5a174.firebaseio.com/flows");
    // create a synchronized array
    $scope.flows = $firebaseArray(flowRef);

    $scope.addEvent = function () {
        $scope.events.$add({
            event_text: $scope.event_text,
            event_title: $scope.event_title,
            event_template: $scope.event_template,
            event_cost: $scope.event_cost,
            event_owner: userData.uid
        });
    };
    $scope.addFlow = function() {
        $scope.flows.$add({
            flow_title: $scope.flow_title,
            flow_text: $scope.flow_text,
            flow_template: $scope.flow_template,
            flow_cost: $scope.flow_cost,
            flow_owner: userData.uid
        })
    };
});

mainApp.controller("EventAdd", function ($scope, $firebaseArray, $firebaseObject, $routeParams) {

    var flowRef = new Firebase("https://weddingplanner-5a174.firebaseio.com/flows");
    var eventRef = new Firebase("https://weddingplanner-5a174.firebaseio.com/events");

    // create a synchronized array
    $scope.flow = $firebaseArray(flowRef.child($routeParams.flowId).child('flow_events'));
    $scope.events = $firebaseArray(eventRef);
    var userData = firebase.auth().currentUser;

    $scope.addEvent = function () {
        $scope.events.$add({
            event_text: $scope.event_text,
            event_title: $scope.event_title,
            event_template: $scope.event_template,
            event_cost: $scope.event_cost,
            event_flow_id: $routeParams.flowId,
            event_owner: userData.uid
            //owner: 1
        }).then(function(ref) {
            // list.$indexFor(ref.key()); // returns location in the array
            $scope.flow.$add({
                flow_event: ref.key()
            })

        });


    };
});

mainApp.controller("EventDetailCtrl", function ($scope, $firebaseObject, $routeParams) {
    var ref = new Firebase("https://weddingplanner-5a174.firebaseio.com/events");
    // create a synchronized array
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
                if ($scope.event.event_template == "reception")
                    return "template/event/reception.tpl.html";
                if ($scope.event.event_template == "ceremony")
                    return "template/event/ceremony.tpl.html";
                return "template/event/ceremony.tpl.html";
            }
        }
    };
});

mainApp.controller("FlowDetailCtrl", function ($scope, $firebaseObject, $routeParams) {
    var flowRef = new Firebase("https://weddingplanner-5a174.firebaseio.com/flows");
    // create a synchronized array
    $scope.flow = $firebaseObject(flowRef.child($routeParams.flowId));//This is ok.
})
.directive("flow", function () {
    return {
        template: '<ng-include src="getTemplateUrl()"/>',
        //templateUrl: unfortunately has no access to $scope.user.type
        scope: {
            flow: '=data' //what does this mean?
        },
        restrict: 'EA',
        controller: function ($scope) {
            $scope.getTemplateUrl = function () {
                //basic handling. It could be delegated to different Services
                if ($scope.flow.flow_template == "wedding")
                    return "template/flow/wedding.tpl.html";
                return "template/flow/other.tpl.html";
            }
        }
    };
});