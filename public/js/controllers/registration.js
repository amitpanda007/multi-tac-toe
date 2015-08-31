myApp.controller('registerController', function(
	$scope, $location, $firebaseArray, FIREBASE_URL, Authentication) {

	var refUsers = new Firebase(FIREBASE_URL + 'users');
	var addUser = $firebaseArray(refUsers);

	$scope.login = function() {
		Authentication.login($scope.user)
		.then(function(authData) {
			$location.path('/todos');
		}).catch(function(error) {
			$scope.loginError = error.toString();
		});
	}//Login Function

	$scope.register = function() {
		Authentication.register($scope.user)
		.catch(function(error){
			$scope.registerError = error.toString();
		});
	}//Register Function

});