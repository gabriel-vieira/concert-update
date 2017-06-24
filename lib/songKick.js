"use strict";

const config = require('../config'),
      request = require('request');

module.exports.getConcerts = function() {

	let url = config.deezer.host + accessToken;
	request(url, function (error, response, body) {
	    if (!error && response.statusCode == 200) { 
			success(response.body);
	    } else {
	    	failure(error);
	    };
	});
};