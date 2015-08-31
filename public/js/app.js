var myApp = angular.module('myApp', ['ngRoute', 'firebase', 'appController', 'ngSanitize'])
            .constant('FIREBASE_URL','https://pandatodo.firebaseio.com/');

var appController = angular.module('appController', ['firebase']);


myApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/login', {
            templateUrl : 'views/login.html',
            controller  : 'registerController'
        })
        .when('/register', {
            templateUrl : 'views/register.html',
            controller  : 'registerController'
        })
        .when('/todos', {
            templateUrl : 'views/todos.html',
            controller  : 'todoController'
        })
        .when('/game', {
            templateUrl : 'views/game.html',
            controller  : 'gameController'
        })
        .otherwise({
            redirectTo : '/login'
        });
}]);