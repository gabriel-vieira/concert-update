"use strict";

var request = require('request'),
    config = require('../config'),
    controllers = require('../controllers');

let _getConcerts = function (urlAPI) {
  return new Promise((resolve, reject) => {
    request(urlAPI, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if(typeof JSON.parse(body).resultsPage.results.event !== 'undefined') {
          resolve(JSON.parse(body).resultsPage.results.event);
        }
      }
    });
  })
};


module.exports.sortList = function(list) {
    for ( var artist in list) {
      var urlToGetConcertHistory = 'http://api.songkick.com/api/3.0/search/artists.json?query='+ list[artist] +'&apikey=' + config.songKick.apiKey;
      var result;
      var promise = new Promise(function(resolve, reject) {
        request(urlToGetConcertHistory, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if( typeof JSON.parse(body).resultsPage.results.artist !== 'undefined' ) {
              var id = JSON.parse(body).resultsPage.results.artist[0].id;
              var result = 'http://api.songkick.com/api/3.0/artists/'+ id +'/calendar.json?apikey=' + config.songKick.apiKey;
              resolve(result);
            }
          }
        });
      });

      promise.then(_getConcerts( val ))
              .then(function( val ) {
        controllers.sendHistoryDataInFormatJSON(val);
      });
    }
};
