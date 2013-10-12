angular.module('myapp', ['ui.bootstrap', 'myFilters']);

angular.module('myFilters', []).filter('RADIO', function() {
  return function(key) {
    var _configuration = [];

    for(var _key in configuration){
      _configuration.push(_key);
    }
    _configuration = _configuration.sort();

  var _index = _configuration.indexOf(key);
    if(_index === 0){
    return "'Left'";
    }else if(_index === _configuration.length-1){
      return "'Right'";
    }
    return "'Middle'";
  };
}).filter('validate', function() {
  return function(key) {
    return (angular.isDefined(configuration[key]))? false : true;
  }
}).filter('enable', function() {
  return function(key) {
    if( (key === undefined) || (key === ''))
      return false;

    return (angular.isDefined(configuration[key]))? false : true;
  }
});

angular.module('myapp').directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

function youtubeCtrl($scope, $http, $location){

	$scope.q = 'disney';
	
	$scope.searchResponse;
	$scope.videosResponse;
	$scope.nextPageToken;
	$scope.prevPageToken;

	$scope.progress = false;
	$scope.message;

	$scope.keywords = [
		'toy',
		'review',
		'doh',
		'dough',
		'egg',
		'game',
		'collector',
		'die',
		'cast',
		'launch',
		'charge',
		'carry case',
		'carrycase',
		'case',
		'playset',
		'drift',
		'turntable',
		'play set',
		'mattel',
		'collection',
		'lego',
		'saga',
		'matchbox',
		'purchase'
	];

	$scope.channels = [
		'DisneyCarToys',
		'FastFoodToyReviews',
		'DisneyCollectorBR',
		'MaterCarClub',
		'SurpriseToys',
		'Blucollection'
	];

	$scope.detailsModalWin = false;

	$scope.search = function(_pageToken){
		var scope = $scope;

		if(!scope.q){
			return false;	
		}

		scope.progress = true;
		scope.message = 'Loading..';
		scope.video = {};

		var request = gapi.client.youtube.search.list({
			part: 'snippet',
			q: scope.q,
			maxResults: 50,
			safeSearch: 'strict',
			order: 'rating',
			pageToken: _pageToken || ''
		});

		request.execute(function(_response){
			if(_response.items === undefined){
				scope.$apply(function(){
					scope.message = 'Problem in fetching results :(';
				});
				return false;
			}

			var keywords_re = new RegExp(scope.keywords.join("|"), 'gi'),
			channels_re = new RegExp(scope.channels.join("|"), 'gi');

			_response.items = _response.items.filter(function(value, key){
				if( ((value.snippet.title.match(keywords_re) === null) && (value.snippet.description.match(keywords_re) === null) )  && (value.snippet.channelTitle.match(channels_re) === null)){
					return true;
				}
				return false;
			});

			// get all the Id's for the videos
			var videoIds = "", videos = [];
			angular.forEach(_response.items, function(value, key){
				videoIds += value.id.videoId + ", ";
				videos.push(value.snippet);
			});

			scope.$apply(function(){
				scope.progress = false;
				scope.searchResponse = videos;
				scope.nextPageToken = _response.nextPageToken;
				scope.prevPageToken = _response.prevPageToken;
			});

			$scope.getDetails(videoIds);
		});    
	};

	$scope.show = function(_index){
		var item = $scope.searchResponse[_index];
		$scope.video = {
			title: item.title,
			description: item.description,
			thumbnail: item.thumbnails.medium.url,
			embedHtml: $scope.videosResponse[_index].player.embedHtml
		};
		$scope.detailsModalWin = true;
	};

	$scope.hide = function(item){
		$scope.video = {};
		$scope.detailsModalWin = false;
	};


	$scope.getDetails = function(_Ids){
		var request = gapi.client.youtube.videos.list({
				part: 'contentDetails, player',
				id: _Ids
			}),
			videos = [],
			scope = $scope;

		request.execute(function(_response){
			angular.forEach(_response.result.items, function(value, key){
				// videos[value.id] = value;
				videos.push(value);
			});

			scope.$apply(function(){
				$scope.videosResponse = videos;
			});
		});
	};

}

youtubeCtrl.$inject = ['$scope', '$http', '$location'];

// Called automatically when JavaScript client library is loaded.
function onClientLoad() {
  gapi.client.load('youtube', 'v3', function(){
     gapi.client.setApiKey(GOOGLE_API_KEY);
  });
}

