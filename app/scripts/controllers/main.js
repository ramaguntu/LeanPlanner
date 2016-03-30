'use strict';

/**
 * @ngdoc function
 * @name leanPlannerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the leanPlannerApp
 */
angular.module('leanPlannerApp')
  .controller('MainCtrl', function ($scope, $rootScope, Ref, $firebaseArray, $firebaseObject, $location, $routeParams, lodash,$mdDialog, $mdMedia) {

    $scope.team = $routeParams.team;
    $scope.memberId = Number($routeParams.memberId);
    $scope.selectedIndex=0;
    $scope.userStories = $firebaseObject(Ref.child('Teams').child($scope.team).child('UserStories'));
    $scope.members = $firebaseObject(Ref.child('Teams').child($scope.team).child('Members'));
    $scope.quarters = $firebaseObject(Ref.child('Teams').child($scope.team).child('Quarters'));


    $scope.members.forEach(function (member) {
      if (member.id === memberId) {
        $rootScope.memberDetails = $scope.memberDetails = member;
      }
    });

    $scope.showSprintDetails = function (quarterId, sprintId) {
      $scope.sprintDetails = $firebaseObject(Ref.child('Teams').child($scope.team).child('Quarters').child(quarterId).child('sprints').child(sprintId));
      $scope.selectedIndex=1;

      $scope.sprintUserStories = [];
      $scope.sprintDetails.$loaded().then(function(res) {
        lodash.each($scope.sprintDetails.stories, function(userStoryId) {
          $scope.sprintUserStories.push($scope.userStories[userStoryId]);
        });
      });
    };

    $scope.getSprintStoryPoints = function (sprintUserStories) {
      var totalPoints = 0;
      lodash.each(sprintUserStories, function(userStory) {
        if(userStory.actualVote) {
          totalPoints += Number(userStory.actualVote);
        }
      });
      return totalPoints;
    };


    $scope.showStoryDetails = function (storyId) {
      $scope.userStory = $firebaseObject(Ref.child('Teams').child($scope.team).child('UserStories').child(storyId));
      $scope.selectedIndex=3;
    };

    $scope.getStoryTeamAveragePoints = function () {

      if(!$scope.userStory) {
        return;
      }

      var storyMemberVotes = $scope.userStory.storyMemberVotes;
      var totalPoints = 0;

      lodash.forOwn(storyMemberVotes, function(vote, memberId) {
        totalPoints += Number(vote);
      });

      return totalPoints/lodash.size(storyMemberVotes);
    };

    $scope.getSprintTeamAverageVotes = function () {

      if(!$scope.sprintDetails) {
        return;
      }

      var sprintMemberVotes = $scope.sprintDetails.sprintMemberVotes;
      var totalPoints = 0;

      lodash.forOwn(sprintMemberVotes, function(vote, memberId) {
        totalPoints += Number(vote);
      });

      return totalPoints/lodash.size(sprintMemberVotes);
    };

    $scope.isVoted = function (memberVote, storyPoints) {
      if(!memberVote) {
        return;
      }

      return (Number(memberVote) === Number(storyPoints));
    };

    $scope.updateSprintConfidence = function (sprintVote) {
      $scope.sprintDetails.sprintMemberVotes = $scope.sprintDetails.sprintMemberVotes || {};
      $scope.sprintDetails.sprintMemberVotes[$scope.memberId] = sprintVote;
      $scope.sprintDetails.confidence = $scope.getSprintTeamAverageVotes();
      $scope.syncSprintDetails();
    };

    $scope.updateStoryPoints = function (storyPoints) {
      $scope.userStory.storyMemberVotes = $scope.userStory.storyMemberVotes || {};
      $scope.userStory.storyMemberVotes[$scope.memberId] = storyPoints;
      $scope.syncUserStory();
    };

    $scope.updateStoryActualVote = function (actualVote) {
      $scope.userStory.actualVote = actualVote;
      $scope.syncUserStory();
    };

    $scope.getMemberName = function (memberId) {

      var memberName = '';
      lodash.forOwn($scope.members, function(memberDetails, id) {
        if (id === memberId) {
          memberName = memberDetails.name;
        }
      });
      return memberName;
    };
    $scope.syncUserStory = function () {
      $scope.userStory.$save();
    };

    $scope.syncSprintDetails = function () {
      $scope.sprintDetails.$save();
    };

    $scope.showAddUserStoryModal = function(ev) {
      $mdDialog.show({
          controller: function($scope, $mdDialog) {
            $scope.hide = function() {
              $mdDialog.hide();
            };
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            $scope.answer = function(answer) {
              $mdDialog.hide(answer);
            };
          },
          templateUrl: 'app/views/add-user-story-tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true
        })
        .then(function(userStory) {

          var storyId = "US" + getRandomIntInclusive(1000, 9999),
            newUserStory = {
              "bowerized": false,
              "dependencies": 0,
              "description": userStory.description || "",
              "dod": false,
              "drs": false,
              "id": storyId,
              "integrationTests": false,
              "name": userStory.title,
              "points": "",
              "solarflare": false,
              "sprint": $scope.sprintDetails.name,
              "storyMemberVotes": {
              },
              "viewer": false,
              "vote": null
            };

          $scope.userStories[storyId] = newUserStory;

          $scope.userStories.$save();
          $scope.sprintDetails.stories = $scope.sprintDetails.stories || [];
          $scope.sprintDetails.stories.push(storyId);
          $scope.syncSprintDetails();
          $scope.sprintUserStories.push(newUserStory)
        }, function() {

        });
    };

    $scope.showAddSprintModal = function(ev, quarterId) {
      $mdDialog.show({
          controller: function($scope, $mdDialog) {
            $scope.hide = function() {
              $mdDialog.hide();
            };
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            $scope.answer = function(sprintTitle) {
              $mdDialog.hide(sprintTitle);
            };
          },
          templateUrl: 'app/views/add-sprint-tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true
        })
        .then(function(sprintTitle) {

           var newSprint = {
              "confidence": "",
              "name": sprintTitle,
              "sprintMemberVotes": {
              },
              "stories" : []
            };

          var sprints = $firebaseObject(Ref.child('Teams').child($scope.team).child('Quarters').child(quarterId).child('sprints'));

          sprints.$loaded().then(function(res) {
            sprints[sprintTitle] = newSprint;
            sprints.$save();
          });

        }, function() {

        });
    };

    function getRandomIntInclusive(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  });
