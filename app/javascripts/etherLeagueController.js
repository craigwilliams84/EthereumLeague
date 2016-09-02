var app = angular.module('etherLeagueApp', ['ngRoute', 'EtherLeagueServices']);

app.config(['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider) {
  $routeProvider
  	.when('/league/:leagueId', {
        templateUrl: 'league.html',
        controller: 'leagueCtrl',
        controllerAs: 'leagueCtrl'
		});
  $locationProvider.html5Mode(false);
}]);

app.controller("etherLeagueController", [ '$scope', '$window', '$timeout', 'leagueAggregateService', 'accountsService', function($scope, $window, $timeout, leagueAggregateService, accountsService) {

		$scope.balance = "";
    $scope.setStatus = "";
		$scope.adminLeagues = [];
    
    $scope.addLeague = function(name, pointsForWin, pointsForDraw, entryFee) {
    	setStatus("Initiating transaction... (please wait)");
    	
    	leagueAggregateService.addLeague(name, pointsForWin, pointsForDraw, entryFee, function(err) {
    	
    		if(err) {
    			console.log(err);
    			setStatus("Error sending coin; see log.");
    		} else {
    			setStatus("Transaction complete!");
    			$scope.refreshAll();
    		}
  		});
	};
	
	$scope.joinLeague = function(leagueId, teamName) {
    setStatus("Initiating transaction... (please wait)");
    	
  	leagueAggregateService.getLeagueDetails(leagueId, function(err, leagueDetails) {
  		leagueAggregateService.joinLeague(leagueDetails, teamName, function(err) {   	
    		if(err) {
    			console.log(err);
    			setStatus("Error sending coin; see log.");
  			} else {
  				setStatus("Transaction complete!");
    			$scope.refreshAll();
  			}
			});
		});
	};
	
	$scope.refreshAll = function() {
		$scope.refreshBalance();
		$scope.refreshLeagues();
	};
	
	$scope.refreshBalance = function() {
  	accountsService.getBalance(function(err, result) {
    	if (err) {
    		console.log(err);
    	} else {
    		$timeout(function() {
    			$scope.balance = result;
    		});
    	}
    });
	};
	
	$scope.refreshLeagues = function() {
		leagueAggregateService.getAdminLeagueIds(function(err, leagueIds) {
			if (err) {
				console.error(err);
			} else {
				$scope.adminLeagues = [];
				leagueIds.forEach(function(id) {
  				getAndAddLeagueDetails(id, $scope.adminLeagues);
  			});
			}
		});
	};
	
	var getAndAddLeagueDetails = function(id, leagues) {
		leagueAggregateService.getLeagueDetails(id, function(err, leagueDetails) {
			$timeout(function(){
				leagues.push(leagueDetails);
			});
		});
		
	};
	
	function setStatus(status) {
		$scope.status = status;
	}

	accountsService.init(function() {
		$scope.refreshAll();
	});
}]);

function fromAscii(str, padding) {
    var hex = '0x';
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }
    return hex + '0'.repeat(padding*2 - hex.length + 2);
}

function toAscii(hex) {
    var str = '',
        i = 0,
        l = hex.length;
    if (hex.substr(0, 2) === '0x') {
        i = 2;
    }
    for (; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        if (code === 0) continue; // this is added
        str += String.fromCharCode(code);
    }
    return str;
}
