myApp.controller('todoController', function(
	$scope, $rootScope, $location, $firebaseAuth, $firebaseArray, FIREBASE_URL) {

	var ref = new Firebase(FIREBASE_URL);
	var auth = $firebaseAuth(ref);

	auth.$onAuth(function(authData) {
		if(authData){
			var todoRef = new Firebase(FIREBASE_URL + 'users/'
				+ $rootScope.currentUser.$id +'/todos/');
			var todos = $firebaseArray(todoRef);

			todos.$loaded().then(function(data) {
				$scope.todos = data;



			$scope.addTodo = function() {
				todos.$add ({
					task: $scope.todoTask,
					date: Firebase.ServerValue.TIMESTAMP
				}).then(function(ref){
					$scope.todoTask='';
				});
			}// Add task

			$scope.taskDelete = function(position) {
				todos.$remove(position);
			}
		});
		}else{
			$location.path('/login');
		}
	});

});