var request = require('request')
    , config = require('../config')
    , controllers = require('../controllers');

function _getConcerts (urlAPI) {
  request(urlAPI, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        if(typeof JSON.parse(body).resultsPage.results.event !== 'undefined') {
          var result = JSON.parse(body).resultsPage.results.event;
          controllers.sendHistoryDataInFormatJSON(result);
        }
    }
  });   
}

function _getIdArtist (urlAPI) {
  request(urlAPI, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        if( typeof JSON.parse(body).resultsPage.results.artist !== 'undefined' ) {
          var id = JSON.parse(body).resultsPage.results.artist[0].id;
          _getConcerts('http://api.songkick.com/api/3.0/artists/'+ id +'/calendar.json?apikey=' + config.songKick.apiKey);
        }
    }
  });  
}

module.exports.sortList = function(list) {
    for ( artist in list) {
      var urlToGetConcertHistory = 'http://api.songkick.com/api/3.0/search/artists.json?query='+ list[artist] +'&apikey=' + config.songKick.apiKey;
      setTimeout(_getIdArtist(urlToGetConcertHistory), 3000);
    }
};