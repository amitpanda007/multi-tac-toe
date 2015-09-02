myApp.controller('gameController', function(
	$scope , $rootScope, $location, $firebaseAuth, $firebaseArray, $firebaseObject, $timeout, FIREBASE_URL) {

	var refAuth = new Firebase(FIREBASE_URL);
	var fireAuth = $firebaseAuth(refAuth);

	var ref = new Firebase(FIREBASE_URL + 'games/');
	var games = $firebaseArray(ref);

	var refMultiplayerX = new Firebase(FIREBASE_URL + 'games/multiplayersessions/' +
									$scope.multiplayerFirebase + '/countX/');
	var refMultiplayerY = new Firebase(FIREBASE_URL + 'games/multiplayersessions/' +
									$scope.multiplayerFirebase + '/countY/');

	var incomingRef = new Firebase(FIREBASE_URL + 'games/incomingconnection/');
	var connection = $firebaseArray(incomingRef);

	var multiplayerRef = new Firebase(FIREBASE_URL + 'games/multiplayersessions/');
	var multiplayer = $firebaseArray(multiplayerRef);

	var multiGameLayout = new Firebase(FIREBASE_URL + 'games/multiplayersessions/'
										+ $scope.multiplayerFirebase + '/');
	var multiGameObj = $firebaseObject(multiGameLayout);
	
	var userRef = new Firebase(FIREBASE_URL + 'games/onlinegame/');
	var users = $firebaseArray(userRef);
	
	$scope.countX = [];
	$scope.countY = [];
	$scope.turnTime = 10;
	$scope.gameFinish = false;

	fireAuth.$onAuth(function(authData) {
		if(authData){

		}else {
			$location.path('/login');
		}
	});

	//Firebase Watcher for player status (online,offline,busy) changes 
	users.$watch(function(event) {
		users.$loaded().then(function(data) {
			$scope.users = data;
			$scope.playerOnlineCount($scope.users); // Function call to online player count 
		});
	});

	//online player count function
	$scope.playerOnlineCount = function(users) {
		var usersLength = users.length;
		angular.forEach(users, function(value,key) {
			if(users.status == 'busy' || users.status == 'offline') {
				usersLength--;
			}
		});
		$scope.playersOnline = usersLength-8;
	}
	
	//Firebase Watcher for player information changes 
	connection.$watch(function(event) {
		if (event.key == $scope.fullname) {
			$scope.incomingConnect     = connection.$getRecord($scope.fullname).connectionFrom;
			$scope.sendingConnect      = connection.$getRecord($scope.fullname).connectingTo;
			$scope.multiplayerFirebase = connection.$getRecord($scope.fullname).currentlyPlaying;
			$scope.playMode            = connection.$getRecord($scope.fullname).playMode;
			$scope.startingGame        = connection.$getRecord($scope.fullname).connecting;
			$scope.swapReq             = connection.$getRecord($scope.fullname).swapRequest;
			$scope.rejected            = connection.$getRecord($scope.fullname).rejectStatus;
			if ($scope.incomingConnect != '' || $scope.sendingConnect != '') {
				$scope.multiplayerRequest = true;
			}else if ($scope.incomingConnect == '' && $scope.sendingConnect == ''){
				$scope.multiplayerRequest = false;
			}

			var refMultiplayerX = new Firebase(FIREBASE_URL + 'games/multiplayersessions/' +
									$scope.multiplayerFirebase + '/countX/');
			var refMultiplayerY = new Firebase(FIREBASE_URL + 'games/multiplayersessions/' +
									$scope.multiplayerFirebase + '/countY/');
		}
	});

	//Firebase Watcher for multiplayer session changes 
	multiplayer.$watch(function(event) {	
		var multiGameLayout = new Firebase(FIREBASE_URL + 'games/multiplayersessions/'
										+ $scope.multiplayerFirebase + '/');
		var multiGameLayoutX = new Firebase(FIREBASE_URL + 'games/multiplayersessions/'
										+ $scope.multiplayerFirebase + '/countX/');
		var multiGameLayoutY = new Firebase(FIREBASE_URL + 'games/multiplayersessions/'
										+ $scope.multiplayerFirebase + '/countY/');

		var multiGameObj = $firebaseObject(multiGameLayout);
		var multiGameArrX = $firebaseArray(multiGameLayoutX);
		var multiGameArrY = $firebaseArray(multiGameLayoutY);

		multiGameArrX.$loaded().then(function(data) {
			$scope.countX = multiGameArrX.length;
		});
		multiGameArrY.$loaded().then(function(data) {
			$scope.countY = multiGameArrY.length;
		});		

		//This binds to the multiplayer session and keeps a local copy
		if (multiGameObj.$id == $scope.multiplayerFirebase) {
			multiGameObj.$bindTo($scope, "pleyerMovement").then(function() {
				$scope.one    = $scope.pleyerMovement.one;
				$scope.two    = $scope.pleyerMovement.two;
				$scope.three  = $scope.pleyerMovement.three;
				$scope.four   = $scope.pleyerMovement.four;
				$scope.five   = $scope.pleyerMovement.five;
				$scope.six    = $scope.pleyerMovement.six;
				$scope.seven  = $scope.pleyerMovement.seven;
				$scope.eight  = $scope.pleyerMovement.eight;
				$scope.nine   = $scope.pleyerMovement.nine;
				$scope.winner = $scope.pleyerMovement.Winner;
				$scope.xwin   = $scope.pleyerMovement.Xwin;
				$scope.owin   = $scope.pleyerMovement.Owin;
				$scope.draw   = $scope.pleyerMovement.Draw;
				$scope.timer  = $scope.pleyerMovement.turnTime;
				$scope.playerTurn = $scope.pleyerMovement.turn;
				$scope.gameFinish = $scope.pleyerMovement.GameFinish;
				$scope.multiplayerBegin = $scope.pleyerMovement.multiplayerBegin;

				$scope.getWinnerName($scope.xwin,$scope.owin);//Get The Winner Information
				$scope.win();//Game Winner Function call
			});
		}//Getting Record From Firebase		
	});
	
	//Player choice function to let player choose between X & O and saves the information to Firebase
	$scope.playerChoice = function(choice) {
		var multiGameLayout = new Firebase(FIREBASE_URL + 'games/multiplayersessions/'
										+ $scope.multiplayerFirebase + '/');
		var incomingRefX = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
												+ $scope.fullname + '/');
		var incomingRefO = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
												+ $scope.incomingConnect + '/');

		if(choice == 'X') {
			incomingRefX.child('playMode').set('X');
			incomingRefO.child('playMode').set('O');
			multiGameLayout.child("multiplayerBegin").set(true);
		}else if(choice == 'O'){
			incomingRefX.child('playMode').set('O');
			incomingRefO.child('playMode').set('X');
			multiGameLayout.child("multiplayerBegin").set(true);
		}else {
			$scope.playerElementSelected = false;
			multiGameLayout.child("multiplayerBegin").set(false);
			}
		}

	//This function decides the tic tac toe core functions & decides the player movement 
	//and pushes those changes to firebase as wellaskeepinga local copy of data
	$scope.boxClick = function(boxnumber) {
		var multiGameLayout = new Firebase(FIREBASE_URL + 'games/multiplayersessions/'
										+ $scope.multiplayerFirebase + '/');
		var refMultiplayerX = new Firebase(FIREBASE_URL + 'games/multiplayersessions/' +
									$scope.multiplayerFirebase + '/countX/');
		var refMultiplayerY = new Firebase(FIREBASE_URL + 'games/multiplayersessions/' +
									$scope.multiplayerFirebase + '/countY/');
		var multiGameObj = $firebaseObject(multiGameLayout);
		var multiGameArrX = $firebaseArray(refMultiplayerX);
		var multiGameArrY = $firebaseArray(refMultiplayerY);

		if(!$scope.gameFinish) {
			if(boxnumber === 1) {
				if($scope.one != "X" && $scope.one != "O") {
					if($scope.countX < $scope.countY){
						if($scope.playMode == 'O') {
							multiGameLayout.child("one").set("O");
							multiGameArrX.$add({X : '1'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}else{
						if($scope.playMode == 'X') {
							multiGameLayout.child("one").set("X");
							multiGameArrY.$add({X : '0'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}
				}
			}else if(boxnumber === 2) {
				if($scope.two != "X" && $scope.two != "O") {
					if($scope.countX < $scope.countY){
						if($scope.playMode == 'O') {
							multiGameLayout.child("two").set("O");
							multiGameArrX.$add({X : '1'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}else{
						if($scope.playMode == 'X') {
							multiGameLayout.child("two").set("X");
							multiGameArrY.$add({X : '0'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}
				}
			}else if(boxnumber === 3) {
				if($scope.three != "X" && $scope.three != "O") {
					if($scope.countX < $scope.countY){
						if($scope.playMode == 'O') {
							multiGameLayout.child("three").set("O");
							multiGameArrX.$add({X : '1'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}else{
						if($scope.playMode == 'X') {
							multiGameLayout.child("three").set("X");
							multiGameArrY.$add({X : '0'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}
				}
			}else if(boxnumber === 4) {
				if($scope.four != "X" && $scope.four != "O") {
					if($scope.countX < $scope.countY){
						if($scope.playMode == 'O') {
							multiGameLayout.child("four").set("O");
							multiGameArrX.$add({X : '1'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}else{
						if($scope.playMode == 'X') {
							multiGameLayout.child("four").set("X");
							multiGameArrY.$add({X : '0'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}
				}
			}else if(boxnumber === 5) {
				if($scope.five != "X" && $scope.five != "O") {
					if($scope.countX < $scope.countY){
						if($scope.playMode == 'O') {
							multiGameLayout.child("five").set("O");
							multiGameArrX.$add({X : '1'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}else{
						if($scope.playMode == 'X') {
							multiGameLayout.child("five").set("X");
							multiGameArrY.$add({X : '0'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}
				}
			}else if(boxnumber === 6) {
				if($scope.six != "X" && $scope.six != "O") {
					if($scope.countX < $scope.countY){
						if($scope.playMode == 'O') {
							multiGameLayout.child("six").set("O");
							multiGameArrX.$add({X : '1'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}else{
						if($scope.playMode == 'X') {
							multiGameLayout.child("six").set("X");
							multiGameArrY.$add({X : '0'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}
				}
			}else if(boxnumber === 7) {
				if($scope.seven != "X" && $scope.seven != "O") {
					if($scope.countX < $scope.countY){
						if($scope.playMode == 'O') {
							multiGameLayout.child("seven").set("O");
							multiGameArrX.$add({X : '1'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}else{
						if($scope.playMode == 'X') {
							multiGameLayout.child("seven").set("X");
							multiGameArrY.$add({X : '0'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}
				}
			}else if(boxnumber === 8) {
				if($scope.eight != "X" && $scope.eight != "O") {
					if($scope.countX < $scope.countY){
						if($scope.playMode == 'O') {
							multiGameLayout.child("eight").set("O");
							multiGameArrX.$add({X : '1'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}else{
						if($scope.playMode == 'X') {
							multiGameLayout.child("eight").set("X");
							multiGameArrY.$add({X : '0'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}
				}
			}else if(boxnumber === 9) {
				if($scope.nine != "X" && $scope.nine != "O") {
					if($scope.countX < $scope.countY){
						if($scope.playMode == 'O') {
							multiGameLayout.child("nine").set("O");
							multiGameArrX.$add({X : '1'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}else{
						if($scope.playMode == 'X') {
							multiGameLayout.child("nine").set("X");
							multiGameArrY.$add({X : '0'});
							$scope.turnUser();
							$scope.turnTimer(11);
						}
					}
				}
			}
		}
	}// boxClick Function

	//Resets multiplayer game session
	$scope.resetGame = function() {
		multiplayerRef.child($scope.multiplayerFirebase)
		.set(
			{one : '',
			 two : '',
			 three : '',
			 four : '',
			 five : '',
			 six : '',
			 seven : '',
			 eight : '',
			 nine : '',
			 countX : '',
			 countY : '',
			 Winner : '',
			 turnTime : 0,
			 turn : '',
			 Xwin : false,
			 Owin : false,
			 Draw : false,
			 GameFinish : false,
			 multiplayerBegin : true});

	}// resetGame Function

	//game winning decider function . pushes down the winner data to firebase
	$scope.win = function() {
		var multiGameLayout = new Firebase(FIREBASE_URL + 'games/multiplayersessions/'
										+ $scope.multiplayerFirebase + '/');

		if ($scope.one == "X" && $scope.two == "X" && $scope.three == "X"   ||
			$scope.four == "X" && $scope.five == "X" && $scope.six == "X"   ||
			$scope.seven == "X" && $scope.eight == "X" && $scope.nine == "X"||
			$scope.one == "X" && $scope.four == "X" && $scope.seven == "X"  ||
			$scope.two == "X" && $scope.five == "X" && $scope.eight == "X"  ||
			$scope.three == "X" && $scope.six == "X" && $scope.nine == "X"  ||
			$scope.one == "X" && $scope.five == "X" && $scope.nine == "X"   ||
			$scope.three == "X" && $scope.five == "X" && $scope.seven == "X") {
			multiGameLayout.child('Xwin').set(true);
			multiGameLayout.child('GameFinish').set(true);

			if($scope.one == "X" && $scope.two == "X" && $scope.three == "X") {
				$scope.oneWinner   = 'winner';
				$scope.twoWinner   = 'winner';
				$scope.threeWinner = 'winner';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'loser';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'loser';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'loser';
			}else if($scope.four == "X" && $scope.five == "X" && $scope.six == "X") {
				$scope.oneWinner   = 'loser';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'loser';
				$scope.fourWinner  = 'winner';
				$scope.fiveWinner  = 'winner';
				$scope.sixWinner   = 'winner';
				$scope.sevenWinner = 'loser';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'loser';
			}else if($scope.seven == "X" && $scope.eight == "X" && $scope.nine == "X") {
				$scope.oneWinner   = 'loser';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'loser';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'loser';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'winner';
				$scope.eightWinner = 'winner';
				$scope.nineWinner  = 'winner';
			}else if($scope.one == "X" && $scope.four == "X" && $scope.seven == "X") {
				$scope.oneWinner   = 'winner';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'loser';
				$scope.fourWinner  = 'winner';
				$scope.fiveWinner  = 'loser';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'winner';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'loser';
			}else if($scope.two == "X" && $scope.five == "X" && $scope.eight == "X") {
				$scope.oneWinner   = 'loser';
				$scope.twoWinner   = 'winner';
				$scope.threeWinner = 'loser';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'winner';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'loser';
				$scope.eightWinner = 'winner';
				$scope.nineWinner  = 'loser';
			}else if($scope.three == "X" && $scope.six == "X" && $scope.nine == "X") {
				$scope.oneWinner   = 'loser';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'winner';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'loser';
				$scope.sixWinner   = 'winner';
				$scope.sevenWinner = 'loser';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'winner';
			}else if($scope.one == "X" && $scope.five == "X" && $scope.nine == "X") {
				$scope.oneWinner   = 'winner';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'loser';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'winner';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'loser';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'winner';
			}else if($scope.three == "X" && $scope.five == "X" && $scope.seven == "X") {
				$scope.oneWinner   = 'loser';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'winner';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'winner';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'winner';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'loser';
			}
		}else if ($scope.one == "O" && $scope.two == "O" && $scope.three == "O"   ||
			$scope.four == "O" && $scope.five == "O" && $scope.six == "O"   ||
			$scope.seven == "O" && $scope.eight == "O" && $scope.nine == "O"||
			$scope.one == "O" && $scope.four == "O" && $scope.seven == "O"  ||
			$scope.two == "O" && $scope.five == "O" && $scope.eight == "O"  ||
			$scope.three == "O" && $scope.six == "O" && $scope.nine == "O"  ||
			$scope.one == "O" && $scope.five == "O" && $scope.nine == "O"   ||
			$scope.three == "O" && $scope.five == "O" && $scope.seven == "O") {
			multiGameLayout.child('Owin').set(true);
			multiGameLayout.child('GameFinish').set(true);

			if($scope.one == "O" && $scope.two == "O" && $scope.three == "O") {
				$scope.oneWinner   = 'winner';
				$scope.twoWinner   = 'winner';
				$scope.threeWinner = 'winner';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'loser';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'loser';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'loser';
			}else if($scope.four == "O" && $scope.five == "O" && $scope.six == "O") {
				$scope.oneWinner   = 'loser';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'loser';
				$scope.fourWinner  = 'winner';
				$scope.fiveWinner  = 'winner';
				$scope.sixWinner   = 'winner';
				$scope.sevenWinner = 'loser';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'loser';
			}else if($scope.seven == "O" && $scope.eight == "O" && $scope.nine == "O") {
				$scope.oneWinner   = 'loser';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'loser';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'loser';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'winner';
				$scope.eightWinner = 'winner';
				$scope.nineWinner  = 'winner';
			}else if($scope.one == "O" && $scope.four == "O" && $scope.seven == "O") {
				$scope.oneWinner   = 'winner';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'loser';
				$scope.fourWinner  = 'winner';
				$scope.fiveWinner  = 'loser';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'winner';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'loser';
			}else if($scope.two == "O" && $scope.five == "O" && $scope.eight == "O") {
				$scope.oneWinner   = 'loser';
				$scope.twoWinner   = 'winner';
				$scope.threeWinner = 'loser';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'winner';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'loser';
				$scope.eightWinner = 'winner';
				$scope.nineWinner  = 'loser';
			}else if($scope.three == "O" && $scope.six == "O" && $scope.nine == "O") {
				$scope.oneWinner   = 'loser';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'winner';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'loser';
				$scope.sixWinner   = 'winner';
				$scope.sevenWinner = 'loser';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'winner';
			}else if($scope.one == "O" && $scope.five == "O" && $scope.nine == "O") {
				$scope.oneWinner   = 'winner';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'loser';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'winner';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'loser';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'winner';
			}else if($scope.three == "O" && $scope.five == "O" && $scope.seven == "O") {
				$scope.oneWinner   = 'loser';
				$scope.twoWinner   = 'loser';
				$scope.threeWinner = 'winner';
				$scope.fourWinner  = 'loser';
				$scope.fiveWinner  = 'winner';
				$scope.sixWinner   = 'loser';
				$scope.sevenWinner = 'winner';
				$scope.eightWinner = 'loser';
				$scope.nineWinner  = 'loser';
			}
		}else if ($scope.countY === 5 && $scope.countX === 4 && $scope.gameFinish == false &&
			$scope.xwin == false && $scope.owin == false) {

			multiGameLayout.child('Draw').set(true);
			multiGameLayout.child('GameFinish').set(true);
			if(true) {
				$scope.oneWinner   = 'tie';
				$scope.twoWinner   = 'tie';
				$scope.threeWinner = 'tie';
				$scope.fourWinner  = 'tie';
				$scope.fiveWinner  = 'tie';
				$scope.sixWinner   = 'tie';
				$scope.sevenWinner = 'tie';
				$scope.eightWinner = 'tie';
				$scope.nineWinner  = 'tie';
			}

		}
	}

	//Game select function. let user select from multiple available games
	$scope.gameSelect = function() {
		$scope.fullname = $rootScope.currentUser.firstname + " " +
					  $rootScope.currentUser.lastname;
		if($scope.fullname != 'undefined undefined'){
			incomingRef.child($scope.fullname).set(
				{connectingTo : '',connectionFrom : '',currentlyPlaying : ''});
			userRef.child($scope.fullname).set({status : 'online', name : $scope.fullname});
			$scope.tictactoe = true;
			$scope.multiplayerBegin = false;
		}
	}//Opens Game-Page after selections

	//let user go backto the list of games available
	$scope.allGame = function() {
		userRef.child($scope.fullname).set({status : 'offline', name : $scope.fullname});
		incomingRef.child($scope.fullname).set(
			{connectingTo : '',connectionFrom : '',currentlyPlaying : ''});
		incomingRef.child($scope.incomingConnect).set(
			{connectionFrom : '',connectingTo : '',currentlyPlaying : ''});
		$scope.tictactoe = false;
		$scope.gameFinish = false;
	}// Takes user to All Games Page 

	//creates a multiplayer session in FIrebase
	$scope.startMultiplayer = function(targetUser) {
		userRef.child($scope.fullname).set({status : 'busy', name : $scope.fullname});

		incomingRef.child($scope.fullname).set(
			{connectingTo : targetUser,connectionFrom : '',currentlyPlaying : '',rejectStatus : false});
		incomingRef.child(targetUser).set(
			{connectionFrom : $scope.fullname,connectingTo : '',currentlyPlaying : '',rejectStatus : false});

		$scope.userConnectingTo = targetUser;
	}

	//this let user accept an incoming game request and creates a multiplayer game session
	$scope.acceptGameRequest = function() {
		$scope.playerElementSelected = true;
		$scope.multiplayerFirebase = $scope.fullname + ' vs ' + $scope.incomingConnect;
		multiplayerRef.child($scope.multiplayerFirebase)
		.set(
			{one    : '',
			 two    : '',
			 three  : '',
			 four   : '',
			 five   : '',
			 six    : '',
			 seven  : '',
			 eight  : '',
			 nine   : '',
			 countX : '',
			 countY : '',
			 Winner : '',
			 turnTime : 0,
			 turn : '',
			 Xwin   : false,
			 Owin   : false,
			 Draw   : false,
			 GameFinish : false,
			 multiplayerBegin : false});

		userRef.child($scope.fullname).set({status : 'busy',name : $scope.fullname});

		incomingRef.child($scope.fullname).set(
			{connectingTo : '',connectionFrom : $scope.incomingConnect,
			currentlyPlaying : $scope.multiplayerFirebase,swapRequest : false,rejectStatus : false});
		incomingRef.child($scope.incomingConnect).set(
			{connectionFrom : '',connectingTo : $scope.fullname,
			connecting : true,currentlyPlaying : $scope.multiplayerFirebase,swapRequest : false,rejectStatus : false});
	}

	//rejects an incomingplayer request formultiplayer game
	$scope.rejectGameRequest = function() {
		var rejectX = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
												+ $scope.incomingConnect + '/');
		$scope.multiplayerRequest = false;
		rejectX.child('rejectStatus').set(true);

		$timeout(function() {
			incomingRef.child($scope.fullname).set(
				{connectingTo : '',connectionFrom : '',currentlyPlaying : '',rejectStatus : false});
			incomingRef.child($scope.incomingConnect).set(
				{connectingTo : '',connectionFrom : '',currentlyPlaying : '',rejectStatus : false});
			userRef.child($scope.incomingConnect).set({status : 'online', name : $scope.incomingConnect});
		},2000);		
	}

	//gets winner name and setsit to firebase
	$scope.getWinnerName = function(xwin,owin) {
		var multiGameLayout = new Firebase(FIREBASE_URL + 'games/multiplayersessions/'
										+ $scope.multiplayerFirebase + '/');
		if(xwin == true) {
			if($scope.playMode == 'X') {
				multiGameLayout.child('Winner').set($scope.fullname);
			}
		}
		if(owin == true) {
			if($scope.playMode == 'O') {
				multiGameLayout.child('Winner').set($scope.fullname);
			}
		}
	}

	//sets the users name who has the current turn into firebase
	$scope.turnUser = function() {
		var multiGameLayout = new Firebase(FIREBASE_URL + 'games/multiplayersessions/'
										+ $scope.multiplayerFirebase + '/');
		multiGameLayout.child('turn').set($scope.incomingConnect || $scope.sendingConnect);
	}

	//counts turn time from 10 secs to 0 and saves the data into firebase 
	$scope.turnTimer = function(resetTurnTime) {
		var multiGameLayout = new Firebase(FIREBASE_URL + 'games/multiplayersessions/'
											+ $scope.multiplayerFirebase + '/');
		if($scope.gameFinish == false) {
			$scope.turnTime = resetTurnTime;
			var stopped = $timeout(function() {			
				$scope.turnTime--;
				multiGameLayout.child('turnTime').set($scope.turnTime);
				if($scope.turnTime > 0 && $scope.playerTurn == ($scope.incomingConnect || $scope.sendingConnect)) {
					$scope.turnTimer($scope.turnTime);
				}else {
					$scope.turnTime = 11;
				}
			}, 1000);
		}else {
			multiGameLayout.child('turnTime').set(0);
		}
	}

	//let user with O to swap X with his opponent
	$scope.swapRequest = function() {
		if($scope.incomingConnect) {
			var swapX = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
													+ $scope.incomingConnect + '/');
			var swapO = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
													+ $scope.fullname + '/');
			swapX.child('swapRequest').set(true);
			swapO.child('swapRequest').set(true);	
		}else if($scope.sendingConnect) {
			var swapX = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
													+ $scope.sendingConnect + '/');
			var swapO = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
													+ $scope.fullname + '/');
			swapX.child('swapRequest').set(true);
			swapO.child('swapRequest').set(true);
		}
	}

	//function handles opponent's confirm or deny of swap request
	$scope.swapConfirm = function(confirmToken) {
		if(confirmToken) {
			if($scope.incomingConnect) {
				var swapX = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
													+ $scope.incomingConnect + '/');
				var swapO = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
													+ $scope.fullname + '/');
				swapX.child('playMode').set('X');
				swapO.child('playMode').set('O');
				swapX.child('swapRequest').set(false);
				swapO.child('swapRequest').set(false);
			}else if($scope.sendingConnect) {
				var swapX = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
													+ $scope.sendingConnect + '/');
				var swapO = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
													+ $scope.fullname + '/');
				swapX.child('playMode').set('X');
				swapO.child('playMode').set('O');
				swapX.child('swapRequest').set(false);
				swapO.child('swapRequest').set(false);
			}
		}else {
			if($scope.incomingConnect) {
					var swapX = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
														+ $scope.incomingConnect + '/');
					var swapO = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
														+ $scope.fullname + '/');

					swapX.child('rejectStatus').set(true);
					swapO.child('swapRequest').set(false);
					$timeout(function() {
						swapX.child('rejectStatus').set(false);
						swapX.child('swapRequest').set(false);
					},2000);
			}else if($scope.sendingConnect) {
					var swapX = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
														+ $scope.sendingConnect + '/');
					var swapO = new Firebase(FIREBASE_URL + 'games/incomingconnection/'
														+ $scope.fullname + '/');
					swapX.child('rejectStatus').set(true);
					swapO.child('swapRequest').set(false);
					$timeout(function() {
						swapX.child('rejectStatus').set(false);
						swapX.child('swapRequest').set(false);
					},2000);
			}
		}

	}

});