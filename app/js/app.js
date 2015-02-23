/* App Module */

var App = angular.module('App', [
  'ngRoute',
  'appControllers',
  'appFilters',
  'appServices',
  'appOplogServices'
]);

App.config(['$routeProvider',
  function($routeProvider) {
    'use strict';
    $routeProvider.
      when('/index', {
        templateUrl: 'partials/index.html',
        controller: 'indexCtrl'
      }).
      when('/signup', {
        templateUrl: 'partials/signup.html',
        controller: 'signupCtrl'
      }).
      otherwise({
        redirectTo: '/index'
      });
  }]);
