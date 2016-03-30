'use strict';
/**
 * @ngdoc overview
 * @name leanPlannerApp:routes
 * @description
 * # routes.js
 *
 * Configure routes for use with Angular, and apply authentication security
 */
angular.module('leanPlannerApp')

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/:team/:memberId', {
        templateUrl: 'app/views/main.html',
        controller: 'MainCtrl'
      })

      .when('/login', {
        templateUrl: 'app/views/login.html',
        controller: 'LoginCtrl'
      })
      .otherwise({redirectTo: '/login'});
  }]);
