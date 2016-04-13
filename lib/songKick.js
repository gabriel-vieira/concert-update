var express = require('express');

var app = express();

module.exports.sortList = function(list) {
	var urlToGetConcertHistory = 'http://api.songkick.com/api/3.0/search/artists.json?query=U2&apikey=6swWmYaRna026ddt'
	console.log('list', list);
};


// module.exports.getInfosUser = function(accessToken, refreshToken, profile, done) {
//   var urlToGetHistoryUser = 'http://'+ config.deezer.host + config.deezer.pathHistoryUser + accessToken;

//   listSongs = _getHistory(urlToGetHistoryUser);
//   songKick
//   return done(null, profile);
// }