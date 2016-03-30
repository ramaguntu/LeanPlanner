'use strict';

/**
 * @ngdoc overview
 * @name leanPlannerApp
 * @description
 * # leanPlannerApp
 *
 * Main module of the application.
 */
angular.module('leanPlannerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'firebase',
    'firebase.ref',
    'ngMaterial',
    'ngLodash'
  ]).config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('light-green')
      .accentPalette('light-green');
  });
