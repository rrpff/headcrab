var cheerio = require("cheerio");

// Transform HTML into useful data.
var transform = module.exports = function(options, html){

	// Create virtual DOM
	var $ = cheerio.load(html, {
		normalizeWhitespace: true
	});

	// Get all matches
	var $selections = $(options.selector);

	// Limit selections if limit is set
	if(options.limit) $selections = $selections.slice(0, limit);

	// If there's no transform defined, we can skip the rest.
	if(!options.transform) return $selections.get();

	// Transform selected elements.
	var data = [];
	$selections.map(function(idx){
		var item = options.transform.apply(this, [$(this), idx, options, $selections]);
		if(item || !item && options.keepFalsy) data.push(item);
	});

	// Sorting delegates to Array#sort
	if(options.sort) data.sort(options.sort);

	return data;

}