var request = require('request')
    , config = require('../config');

function _getConcertsArtist (urlAPI, idArtist) {
  request(urlAPI, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log('JSON.parse(body)', JSON.parse(body).resultsPage.results);
    }
  });   
}


function _getInfoFromApi (urlAPI) {
  request(urlAPI, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var idArtist = JSON.parse(body).resultsPage.results.artist[0].id;
        _getConcertsArtist('http://api.songkick.com/api/3.0/artists/253846/calendar.json?apikey=6swWmYaRna026ddt', idArtist);
    }
  });  
}

// http://api.songkick.com/api/3.0/events.json?apikey=6swWmYaRna026ddt&artist_name=vampire+weekend&location=ip:94.228.36.39



module.exports.sortList = function(list) {
    var urlToGetConcertHistory = 'http://api.songkick.com/api/3.0/search/artists.json?query=radiohead&apikey=' + config.songKick.apiKey;

    _getInfoFromApi(urlToGetConcertHistory);

};


// module.exports.getInfosUser = function(accessToken, refreshToken, profile, done) {
//   var urlToGetHistoryUser = 'http://'+ config.deezer.host + config.deezer.pathHistoryUser + accessToken;

//   listSongs = _getHistory(urlToGetHistoryUser);
//   songKick
//   return done(null, profile);
// }