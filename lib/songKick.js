"use strict";

const config = require('../config'),
      request = require('request');

module.exports.getAuditoriums = function(artist) {

	request(url, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
			  success(response.body);
	    } else {
	    	failure(error);
	    };
	});

  return new Promise(function (resolve, reject) {
    let url = 'http://api.songkick.com/api/3.0/search/artists.json?query='+ item.artist.name +'&apikey=' + config.song;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
           resolve(response.body);
        } else {
           failure(error);
        };
    });
  });
};
