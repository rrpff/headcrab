var request = require("request");
var utils = require("./utils");

// Transform HTML string using defined transform.
exports.parse = function(content){
	// If a string is passed, transform
	if(typeof content === "string")
		return this.transform(content);

	// Otherwise assume it's an array and transform each.
	else return content.map(function(html){
		return this.transform(html);
	}.bind(this));
}

// Transform an array of HTML strings
exports.parseAll = function(arr){
	return arr.map(function(html){
		return this.transform(html);
	}.bind(this));
}

exports.scrape = function(urls, opts, cb){
	// Ensure URLs is an array
	if(typeof urls === "string") urls = [urls];

	// If there are two args, assume arr and callback.
	if(arguments.length === 2){
		cb = arguments[1];
		opts = {};
	}

	// Scrape a single url
	var scrape = function(url, done){
		var query = utils.extend({}, this.options.query, {uri: url});
		request(query, function(err, res, body){
			var data = this.transform(body);
			done(err, data);
		}.bind(this));
	}

	// If there's only one URL, scrape it and we're done
	if(urls.length === 1) return scrape.call(this, urls[0], cb);

	// Store results
	var res = [];

	// Use the head if limit is defined
	if(opts.limit) urls = urls.splice(0, opts.limit);

	// Otherwise we should run them sequentially.
	var next = function(){
		// Scrape each URL
		var url = urls.shift();
		scrape.call(this, url, function(err, data){

			// Add data to the results
			res.push(data);

			// Call each function if defined
			if(opts.each) opts.each.call(this, data, url, res.length - 1);

			// If there are URLs left, call the next
			if(urls.length > 0) {
				// Use a timeout if interval is defined.
				if(opts.interval) setTimeout(next, opts.interval);
				else next();

			// Otherwise, we're ready to return data
			} else {
				// If join is set, flatten the results array a layer.
				if(opts.merge){
					res = utils.flatten(res);
					// While we're at it, do another sort as well.
					if(opts.sort) res.sort(opts.sort);
				}

				// Send the results back
				cb(null, res);
			}

		});
	}.bind(this);

	// Start scraping
	next();
}

// Scrape each route, using {templates}
// compiled from objects in arr. If there is no route,
// the elements in arr are assumed to be URLs.
exports.each = function(arr, opts, cb){
	// Skip the opts if there are two args.
	if(arguments.length === 2){
		cb = arguments[1];
		opts = {};
	}

	// Apply each object to route, and get URLs
	var urls = arr.map(function(obj){
		// Use 'param' key in template if not an object.
		var data = typeof obj !== "object"
			? {param: obj}
			: utils.template(opts.route, obj);

		return utils.template(opts.route, obj);
	});
	
	// Scrape them all
	this.scrape(urls, opts, cb);
}

// Walk through pages
exports.walk = function(opts, cb){
	var start = opts.start || 1,
		pages = opts.pages || 5,
		end = start + pages - 1;

	var arr = [];
	for(var i = start; i <= end; i++)
		arr.push(i);

	return this.each(arr, opts, cb);
}