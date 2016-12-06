// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ui.rCalendar', 'angular.filter'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .config(function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
  })
  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'HomePageCtrl'
      })

    .state('app.homePage', {
      url: '/homePage',
      views: {
        'menuContent': {
          templateUrl: 'templates/homePage.html',
          controller: 'HomePageCtrl'
        }
      }
    })

    .state('app.calendar', {
      url: '/calendar',
      views: {
        'menuContent': {
          templateUrl: 'templates/caldendar.html',
          controller: 'CalendarCtrl'
        }
      }
    })

    .state('app.listCalendar', {
      url: '/listCalendar',
      views: {
        'menuContent': {
          templateUrl: 'templates/listCalendar.html',
          controller: 'CalendarCtrl'
        }
      }
    })

    .state('app.medications', {
      url: '/medications',
      views: {
        'menuContent': {
          templateUrl: 'templates/medications.html',
          controller: 'MedicationCtrl'
        }
      }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/homePage');
  });
