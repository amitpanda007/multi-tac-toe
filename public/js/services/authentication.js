myApp.factory('Authentication', function(
	$location, $firebaseAuth, $firebaseArray, $firebaseObject, $rootScope, FIREBASE_URL) {

	var ref = new Firebase(FIREBASE_URL);
	var loginRef = $firebaseAuth(ref);


	loginRef.$onAuth(function(authData) {
		if(authData){
			var userRef = new Firebase(FIREBASE_URL + 'users/' + authData.uid);
			var user = $firebaseObject(userRef);
			$rootScope.currentUser = user;
		}else{
			$rootScope.currentUser = '';
		}
	});

	var myObject = {

		login : function(user){
			return loginRef.$authWithPassword({
				email: user.email,
				password: user.password
			});
		},

		register : function(user){
			return loginRef.$createUser({
				email: user.email,
				password: user.password
			}).then(function(userData){
				var ref = new Firebase(FIREBASE_URL + 'users/');
				var fireRef = $firebaseArray(ref);

				var userObject = {
					firstname: user.firstname,
					lastname: user.lastname,
					email: user.email,
					userid: userData.uid
				}

				ref.child(userData.uid).set(userObject);
				$location.path('/todos');
				console.log('Data Enterted into Firebase Successfully');
			});
		},

		logout : function(user) {
			return loginRef.$unauth();
		}

	}

	return myObject;
});