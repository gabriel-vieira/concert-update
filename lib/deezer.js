var config = require('../config')
  , request = require('request')
  , songKick = require('./songKick')
  , controllers = require('../controllers');


function _sortHistory (dataFromDeezer) {

  var listSorted = [];
  for (song in dataFromDeezer) {

    var artistName = dataFromDeezer[song].artist.name;

    if (listSorted.indexOf(artistName)  == -1) {
        listSorted.push(artistName);
    };
  }

  return listSorted;
}

function _getHistory (urlAPI) {
  request(urlAPI, function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var result = {
        data: JSON.parse(body).data,
        next: JSON.parse(body).next,
        total: JSON.parse(body).total,
      };
      _getNextHistory(result); 
    }
  });
}

function _getNextHistory (history) {
  request(history.next, function (error, response, body) {
    if (!error && response.statusCode == 200) {

        history.data = history.data.concat(JSON.parse(body).data);
        history.next = JSON.parse(body).next;

        if(_getHistoryIndexFromUrlAPI(history.next) < history.total) {
          _getNextHistory(history);
        } else {
          var listArtistSorted = _sortHistory(history.data);
          controllers.sendHistoryDataInFormatJSON(listArtistSorted);
        }
    }
  });  
}

function _getHistoryIndexFromUrlAPI (urlAPI) {
  var result = urlAPI.substr(urlAPI.lastIndexOf("&index=")+7);
  return result;
}

module.exports.getInfosUser = function(accessToken, refreshToken, profile, done) {
  var urlToGetHistoryUser = 'http://'+ config.deezer.host + config.deezer.pathHistoryUser + accessToken;

  listSongs = _getHistory(urlToGetHistoryUser);
  songKick
  return done(null, profile);
}