/* Controllers */

var appControllers = angular.module('appControllers', []);

appControllers.controller('MainAppCtrl',
  ['$scope', 'AuthService', 'Oplog',
  function($scope, AuthService, Oplog) {
    'use strict';
    //check if loggedin
    AuthService.verify();

    //subscribe to collections via oplog
  Oplog.subscribe( 'category', {}, 'Category' );

    $scope.credentials = {
      "login": '',
      "password": ''
    };

    //sign in
    $scope.signin = function ( credentials ) {
      AuthService.signin( {
        'login': credentials.login,
        'password': credentials.password
      } );
    };
    //sign out
    $scope.signout = function () {
      AuthService.signout();
    };

}]).
controller('indexCtrl',
  ['$scope', 'Oplog',
  function( $scope, Oplog ) {
    'use strict';
    $scope.query = "";
    $scope.orderProp = "name";

    $scope.alterSub = function (query) {
      Oplog.alter('category', 'Category', {"name": query});
    };

    // $scope.$watch('query', function () {
    //   Oplog.alter('category', 'Category', {"name": $scope.query});
    // });

    $scope.rmSub = function () {
      Oplog.unsubscribe('category', 'Category');
    };

}]).
controller('signupCtrl',
  ['$scope', '$location',
  function( $scope, $location ) {
    'use strict';
    $scope.signupFailed = false;
    $scope.account = {
      "login": "",
      "password": ""
    };
    //sign up
    $scope.signup = function ( account ) {
    };

}]);
