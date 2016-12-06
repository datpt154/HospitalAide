angular.module('starter.controllers', [])
  .controller('HomePageCtrl', function($scope, $state, hospitalAideService, $ionicPopup, $http, $localstorage, $window) {
    $scope.goToCalendar = function() {
      $state.go('app.calendar');
    };

    $scope.gotoMedication = function() {
      $state.go('app.medications');
    };

    function getNextAppointmentDate(jsonObj) {
      var appointmentDays = [];
      var nextAppointmentDay = new Date(); //default is today
      var toDay = new Date();

      var lstActivities = jsonObj.CarePlan.activity;
      for (i = 0; i < lstActivities.length; i++) {
        // no fhir:detail <- return
        var detail = lstActivities[i].detail;
        if (detail === undefined) {
          continue;
        }
        // no fhir:scheduledTiming <- return
        var scheduledTiming = lstActivities[i].detail.scheduledTiming;
        if (scheduledTiming === undefined) {
          continue;
        }

        var appointmentDay = moment(scheduledTiming.toString(), 'YYYYMMDDHHmmss').toDate();
        // extract the upcomming days only
        if (appointmentDay < toDay) {
          continue;
        } else {
          appointmentDays.push(appointmentDay);
        }
      }

      // sort appointment date by ascending
      appointmentDays.sort(function(a, b) {
        return a - b;
      });

      nextAppointmentDay = appointmentDays[0];

      return nextAppointmentDay;
    }

    var calendarUrl = 'http://52.8.62.1:8088/PatientCalendar?pid=123';
    //var medicationUrl = 'http://52.8.62.1:8088/MedicationOrder?pid=123';
    var medicationUrl = 'https://open-ic.epic.com/FHIR/api/FHIR/DSTU2/MedicationOrder?patient=Tbt3KuCY0B5PSrJvCu2j-PlK.aiHsu2xUjUM8bWpetXoB';
    var calendarData = $localstorage.get('calendarData', calendarUrl)
    var medicationData = $localstorage.get('newmedicationData', medicationUrl)
    $scope.calendar = {
      data: calendarData
    };
    $scope.medication = {
      data: medicationData
    };
    $scope.showPopup = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<label>Calendar</label><input ng-model="calendar.data" type="text" autofocus="true"></input><br/><label>Medication</label><input ng-model="medication.data" type="text"></input>',
        title: 'Enter URL',
        scope: $scope,
        buttons: [{
          text: 'Cancel'
        }, {
          text: '<b>Save</b>',
          type: 'button-calm',
          onTap: function(e) {
            if (!$scope.calendar.data || !$scope.medication.data) {
              //don't allow the user to close unless he enters url
              e.preventDefault();
            } else {
              $localstorage.set('calendarData', $scope.calendar.data);
              $localstorage.set('medicationData', $scope.medication.data);
              $window.location.reload(true);
            }
          }
        }, ]
      });
      myPopup.then(function(res) {
        console.log('Tapped!', res);
      });

    };
  })

.controller('MedicationCtrl', function($scope, $state, $stateParams, hospitalAideService) {
  // Binding the next appointment date to hello message
  hospitalAideService.getMedicationOrders().then(function(data) {
    var x2js = new X2JS();
    // https => data.data is an Object
    // http  => data.data is a String
    var objectJson = (data.data.toString() == '[object Object]') ? data.data : x2js.xml_str2json(data.data);
    $scope.medications = hospitalAideService.loadMedicationsObject(objectJson);
  }).catch(function(e) {
    console.log(e);
  });

  $scope.toggleGroup = function(item) {
    if ($scope.isItemShown(item)) {
      $scope.shownItem = null;
    } else {
      $scope.shownItem = item;
    }
  };

  $scope.isItemShown = function(item) {
    return $scope.shownItem === item;
  };
})

.controller('CalendarCtrl', function($scope, $state, $filter, $timeout, $location, $anchorScroll, hospitalAideService, hospitalAideConstant) {
    $scope.calendar = {};

    $scope.invokeListCalendar = function() {
      $state.go('app.listCalendar');
      $timeout(function() {
        $location.hash('scrollToID');
        $anchorScroll();
      }, 500)
    };

    $scope.invokeCalendar = function() {
      $state.go('app.calendar');
    };

    /*
     * move to next page (next month or next week or next day) when users click on ">" button
     */
    $scope.nextDay = function() {
      $scope.$broadcast('changeDate', 1);
    };

    /*
     * move to previous page (next month or next week or next day) when users click on "<" button
     */
    $scope.backDay = function() {
      $scope.$broadcast('changeDate', -1);
    };

    /*
     * Load eventSource to show on calendar page from Json object
     */
    function loadEventResources(lstActivities) {
      var events = [];

      for (i = 0; i < lstActivities.length; i++) {
        var detail = lstActivities[i].detail;
        var scheduledTiming = lstActivities[i].detail.scheduledTiming;
        var startDate = moment(scheduledTiming.toString(), hospitalAideConstant.YYYYMMDDHHmmss_FORMAT);
        var scheduledPeriod = Number(detail.scheduledPeriod);

        if (isNaN(scheduledPeriod)) {
          events.push({
            title: getTitle(detail),
            startTime: startDate.toDate(),
            endTime: startDate.toDate(),
            allDay: true
          });
        } else {
          events.push({
            title: getTitle(detail),
            startTime: startDate.toDate(),
            endTime: startDate.add(scheduledPeriod, 'minutes').toDate(),
            allDay: false
          });
        }
      }

      return events;
    }

    /*
     * this is private funtion that get title to show on GUI
     */
    function getTitle(detail) {
      var location = detail.location === undefined ? "" : " | Location: " + detail.location.toString();
      var performer = detail.performer === undefined ? "" : " | With: " + detail.performer.toString();

      return detail.description.toString() + location + performer;
    }


    /*
     * Get month and year of current page
     */
    $scope.onViewTitleChanged = function(title) {
      $scope.viewTitle = title;
    };

    /*
     * when users click "M", "W", "D" button, the page will be changed base to fit to users' option
     */
    $scope.changeMode = function(mode) {
      $scope.calendar.mode = mode;
    };

    /*
     * when users click on "today button", the page will be set back to currentDate
     */
    $scope.today = function() {
      $scope.calendar.currentDate = new Date();
    };

    /*
     * Call API to get appoinments, convert it to JSON then
     *   - load into eventSource to show on Calendar view
     *   - Load into reformattedArray to show on LIST view
     */
    hospitalAideService.getMidWifeCalendars().then(function(data) {
      var x2js = new X2JS();
      var jsonObj = x2js.xml_str2json(data.data);
      // remove invalid appointments like 'missing detail, scheduledTiming tags'
      var validObjs = jsonObj.CarePlan.activity.filter(removeInvalidAppointments);

      // to show on calendar view
      $scope.calendar.eventSource = loadEventResources(validObjs);

      // to show on list view
      var currentDate = moment().startOf('day');
      var nearestDate;
      $scope.reformattedArray = validObjs.map(function(obj) {
        var dateTime = moment(obj.detail.scheduledTiming.toString(), hospitalAideConstant.YYYYMMDDHHmmss_FORMAT);
        // Add 2 attribute "dateAttr and hourAttr" to groupby on GUI and sort on each groupby
        obj.dateAttr = dateTime.format(hospitalAideConstant.DD_MM_YYYY_FORMAT);
        obj.hourAttr = dateTime.format(hospitalAideConstant.HH_mm_FORMAT);

        if (dateTime.diff(currentDate) >= 0 && dateTime.diff(nearestDate) <= 0) {
          nearestDate = dateTime;
          obj.scrollToID = "scrollToID";
        }

        return obj;
      });
    }).catch(function(e) {
      console.log(e);
    });


    $scope.orderByDateTime = function(arr) {
      var dateTime = moment(arr[0].detail.scheduledTiming.toString(), hospitalAideConstant.YYYYMMDDHHmmss_FORMAT).toDate();
      return dateTime;
    }

    function removeInvalidAppointments(element) {
      return element.detail !== undefined && element.detail.scheduledTiming !== undefined;
    }
  })
  .filter('formatDateWithoutTime', function() {
    return function(appointment) {
      return moment(appointment.detail.scheduledTiming.toString(), hospitalAideConstant.YYYYMMDDHHmmss_FORMAT).format(hospitalAideConstant.DD_MM_YYYY_FORMAT);
    }
  })
  .filter('formatHourAndLocation', function(hospitalAideConstant) {
    return function(appointment) {
      var time = moment(appointment.detail.scheduledTiming.toString(), hospitalAideConstant.YYYYMMDDHHmmss_FORMAT).format(hospitalAideConstant.HH_mm_FORMAT);
      var location = appointment.detail.location === undefined ? "" : " | at " + appointment.detail.location.toString();
      return time + location;
    }
  })
  .filter('formatPerformer', function(hospitalAideConstant) {
    return function(appointment) {
      return appointment.detail.performer === undefined ? "" : appointment.detail.performer.toString();
    }
  })
  .filter('formatDescription', function(hospitalAideConstant) {
    return function(appointment) {
      return appointment.detail.description === undefined ? "" : appointment.detail.description.toString();
    }
  });
