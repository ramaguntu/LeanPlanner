'use strict';
/**
 * @ngdoc function
 * @name leanPlannerApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */
angular.module('leanPlannerApp')
  .controller('LoginCtrl', function ($scope, Ref, $firebaseObject, $location) {
    // synchronize a read-only, synchronized array of messages, limit to most recent 10
    $scope.teams = $firebaseObject(Ref.child('Teams'));

    $scope.showHomePage = function() {
      $location.path( $scope.selectedTeam +"/" + $scope.selectedMember);
    };

    console.log($scope.teams);

  });
