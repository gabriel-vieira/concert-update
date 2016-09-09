"use strict";

const config = require('../config'),
      request = require('request'),
      songKick = require('./songKick');


function _sortHistory (songsListened) {
   let listSorted = [];
   let artistName = songsListened.artist.name;

    if (listSorted.indexOf(artistName)  == -1) {
        listSorted.push(artistName);
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

let _getNextHistory = function (history) {

  request(history.next, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        history.data = history.data.concat(JSON.parse(body).data);
        history.next = JSON.parse(body).next;

        if(typeof history.next !== 'undefined') {
          _getNextHistory(history);
        } else {
          let songsSorted = history.data.map(_sortHistory);
          songKick.sortList(songsSorted);
        }
    }
  });
}

module.exports.getInfosUser = function(accessToken, refreshToken, profile, done) {
  var urlToGetHistoryUser = config.deezer.host + config.deezer.pathHistoryUser + accessToken;

  _getHistory(urlToGetHistoryUser);
  return done(null, profile);
};
