"use strict";

const config = require('../config'),
      request = require('request');

module.exports.getHistorySongs = function(accessToken) {

  return new Promise(function (resolve, reject) {
    let url = config.deezer.host + accessToken;
  	request(url, function (error, response, body) {
  	    if (!error && response.statusCode == 200) {
  			   resolve(response.body);
  	    } else {
  	       failure(error);
  	    };
  	});
  });

};
