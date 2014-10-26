'use strict';

/* Controllers */

var appControllers = angular.module('appControllers', []);

appControllers.controller('MainAppCtrl',
  ['$scope', 'AuthService', 'OplogClient',
  function($scope, AuthService, OplogClient) {
    //check if loggedin
    AuthService.verify();

    //subscribe to collections via oplog
  OplogClient.sub( 'category', {/*"owner": 12345*/}, 'Category' );

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
    }
    //sign out
    $scope.signout = function () {
      AuthService.signout();
    }

}]).
controller('indexCtrl',
  ['$scope',
  function( $scope ) {

}]).
controller('signupCtrl',
  ['$scope', '$location',
  function( $scope, $location ) {
    $scope.signupFailed = false;
    $scope.account = {
      "login": "",
      "password": ""
    };
    //sign up
    $scope.signup = function ( account ) {
    };

}]);
