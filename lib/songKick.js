var request = require('request')
    , config = require('../config')
    , controllers = require('../controllers');

function _getConcertsArtist (urlAPI) {
  request(urlAPI, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        if(typeof JSON.parse(body).resultsPage.results.event !== 'undefined') {
          var result = JSON.parse(body).resultsPage.results.event;
          controllers.sendHistoryDataInFormatJSON(result);
        }
    }
  });   
}

function _getIdArtistFromApi (urlAPI) {
  request(urlAPI, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        if( typeof JSON.parse(body).resultsPage.results.artist !== 'undefined' ) {
          var idArtist = JSON.parse(body).resultsPage.results.artist[0].id;
          _getConcertsArtist('http://api.songkick.com/api/3.0/artists/'+ idArtist +'/calendar.json?apikey=6swWmYaRna026ddt');
        }
    }
  });  
}

module.exports.sortList = function(list) {
    for ( artist in list) {
      var urlToGetConcertHistory = 'http://api.songkick.com/api/3.0/search/artists.json?query='+ list[artist] +'&apikey=' + config.songKick.apiKey;
      setTimeout(_getIdArtistFromApi(urlToGetConcertHistory), 3000);
    }
};