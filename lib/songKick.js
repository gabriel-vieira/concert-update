"use strict";

var request = require('request'),
    config = require('../config'),
    controllers = require('../controllers');

let dataToReturn = [];

let _getConcerts = function (artist) {

  return new Promise((resolve, reject) => {
    request(artist.urlSongkick, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if(typeof JSON.parse(body).resultsPage.results.event !== 'undefined') {
          resolve(JSON.parse(body).resultsPage.results.event);
        }
      }
    });
  })
};

let _sendData = function (data) {
  _pushToResult(data);
  controllers.sendHistoryDataInFormatJSON(dataToReturn);
}

let _pushToResult = function (data) {
  let artist = {};
  artist.concertName = data[0].displayName;
  artist.name =
  dataToReturn.push(data[0].displayName)
}

module.exports.sortList = function(list) {

    for ( var item in list) {

      let artist = {};

      var urlToGetConcertHistory = 'http://api.songkick.com/api/3.0/search/artists.json?query='+ list[item] +'&apikey=' + config.songKick.apiKey;
      var promise = new Promise(function(resolve, reject) {
        request(urlToGetConcertHistory, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if( typeof JSON.parse(body).resultsPage.results.artist !== 'undefined' ) {
              var id = JSON.parse(body).resultsPage.results.artist[0].id;


              artist.name = JSON.parse(body).resultsPage.results.artist[0].displayName;
              artist.urlSongkick = 'http://api.songkick.com/api/3.0/artists/'+ id +'/calendar.json?apikey=' + config.songKick.apiKey;

              resolve(artist);
            }
          }
        });
      });

      promise
      .then(_getConcerts)
      .then(_sendData);
    }
};
