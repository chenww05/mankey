/**
 * Created by weiweich on 8/18/16.
 */
angular.module("mainApp", ['firebase'])

    .controller("Controller", function($scope, $firebaseArray){
        var ref = new Firebase("https://weddingplanner-5a174.firebaseio.com/messages");
        // create a synchronized array
        $scope.events = $firebaseArray(ref);
    })

    .directive("profile", function() {
        return {
            template: '<ng-include src="getTemplateUrl()"/>',
            //templateUrl: unfortunately has no access to $scope.user.type
            scope: {
                event: '=data'//what does this mean?
            },
            restrict: 'E',
            controller: function($scope) {
                //function used on the ng-include to resolve the template
                $scope.getTemplateUrl = function() {
                    //basic handling. It could be delegated to different Services
                    if ($scope.event.template == "reception")
                        return "reception.tpl.html";
                    if ($scope.event.template == "ceremony")
                        return "ceremony.tpl.html";
                    return "ceremony.tpl.html";
                }
            }
        };
    });