'use strict';

/* Services */

var appServices = angular.module('appServices', ['ngResource']);

appServices.factory('AuthService',
  [ '$rootScope', '$http',
  function( $rootScope, $http ) {
  return {
      'signin': function ( credentials ) {
        console.log('sigin');
        return $http.post('api/login/',
          { 'login': credentials.login, 'password': credentials.password } ).
          success(function(data, status, headers, config) {
            console.log(data);
            $rootScope.currentUser = data;
          }).
          error(function(data, status, headers, config) {
            console.log('err');
          });
      },
      'signout': function () {
        return $http.get('api/logout').
          success(function(data, status, headers, config) {
            if( !data.auth ){
              $rootScope.currentUser = null;
            }
          }).
          error(function(data, status, headers, config) {
          });
      },
      'verify': function ( ) {
        return $http.get('api/verify').
          success(function(data, status, headers, config) {
            if( data.auth ){
              $rootScope.currentUser = data;
            } else {
              $rootScope.currentUser = null;
            }
          }).
          error(function(data, status, headers, config) {
          });
      }
    };
}]).
factory('socket',
  ['$rootScope',
  function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.$apply(socket, args);
            }
          });
        })
      }
    };
}]);
