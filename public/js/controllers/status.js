myApp.controller('statusController', function($scope, $location, Authentication){

	$scope.logout = function() {
		Authentication.logout();
		$location.path('/login');
	}

});