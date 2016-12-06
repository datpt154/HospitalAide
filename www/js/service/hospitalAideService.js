angular.module('starter')
  .service('hospitalAideService', function ($http, $localstorage) {
    this.loadMedicationsObject = function (objetJson) {
      var result = [];
      var isHttps = objetJson.toString() == '[object Object]';
      var list = isHttps ? objetJson.entry : objetJson.Bundle.entry;

      for (i = 0; i < list.length; i++) {
        var medicationReference;
        var doseQuantity;
        var dosageInstruction;
        var dateWritten;
        var prescriber;

        if (isHttps) {
          doseQuantity = list[i].resource.dosageInstruction[0].doseQuantity.value
            + " " + list[i].resource.dosageInstruction[0].doseQuantity.unit;
          medicationReference = list[i].resource.medicationReference.display;
          dosageInstruction = list[i].resource.dosageInstruction[0].text;
          if (list[i].resource.dateWritten !== undefined) {
            dateWritten = list[i].resource.dateWritten;
          }
          prescriber = list[i].resource.prescriber.display;
        }
        else {
          doseQuantity = list[i].resource.MedicationOrder.dosageInstruction.doseQuantity.value._value
            + " " + list[i].resource.MedicationOrder.dosageInstruction.doseQuantity.unit._value;
          medicationReference = list[i].resource.MedicationOrder.medicationReference.display._value;
          dosageInstruction = list[i].resource.MedicationOrder.dosageInstruction.text._value;
          if (list[i].resource.MedicationOrder.dateWritten !== undefined) {
            dateWritten = list[i].resource.MedicationOrder.dateWritten._value;
          }
          prescriber = list[i].resource.MedicationOrder.prescriber.display._value;
        }

        result.push({
          medicationReference: medicationReference,
          doseQuantity: doseQuantity,
          dosageInstruction: dosageInstruction,
          dateWritten: dateWritten,
          prescriber: prescriber
        });

      }

      return result;
    };

    this.getMidWifeCalendars = function () {
      var calendarUrl = 'http://52.8.62.1:8088/PatientCalendar?pid=123';
      return $http.get($localstorage.get('calendarData', calendarUrl))
        .then(function (data) {
          return data;
        });
    };

    this.getMedicationOrders = function () {
      //var medicationUrl = 'http://52.8.62.1:8088/MedicationOrder?pid=123';
      var medicationUrl = 'https://open-ic.epic.com/FHIR/api/FHIR/DSTU2/MedicationOrder?patient=Tbt3KuCY0B5PSrJvCu2j-PlK.aiHsu2xUjUM8bWpetXoB';
      return $http.get($localstorage.get('medicationData', medicationUrl))
        .then(function (data) {
          return data;
        });
    };

  });

angular.module('starter')
  .factory('$localstorage', ['$window', function ($window) {
    return {
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    }
  }]);
