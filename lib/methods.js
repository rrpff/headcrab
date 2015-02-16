var request = require("request");
var utils = require("./utils");

// Transform HTML string using defined transform.
exports.parse = function(html){
	return this.transform(html);
}

// Transform an array of HTML strings
exports.parseAll = function(arr){
	return arr.map(function(html){
		return this.transform(html);
	}.bind(this));
}

// Scrape an URL using defined transform.
exports.scrape = function(url, cb){
	// Use query hash if provided, apply url.
	var query = utils.extend({}, this.options.query, { uri: url });

	// Get html from response body and apply transform
	request(query, function(err, res, body){
		var data = this.transform(body);
		cb(err, data);
	}.bind(this));
}

// Scrape and transform an array of URLs
exports.scrapeAll = function(urls, cb){
	var finished = 0,
		res = {};

	// Scrape each URL in parallel
	urls.forEach(function(url, idx){
		this.scrape(url, function(err, data){
			if(err) return cb(err);

			// Add data to the result, one more finished.
			res[url] = data;
			finished++;

			// If all URLs are done, send back all the data
			if(finished === urls.length)
				cb(null, res);
		});
	}.bind(this));
}