var cheerio = require("cheerio"),
	utils = require("./utils");

// Transform HTML into useful data.
var transform = module.exports = function(options, html){

	// Normalize whitespace by default, use cheerio options
	options.cheerio = utils.extend(
		{ normalizeWhitespace: true },
		options.cheerio
	);

	// Create virtual DOM
	var $ = cheerio.load(html, options.cheerio);

	// Get all matches
	var $selections = $(options.selector);

	// Limit selections if limit is set
	if(options.limit) $selections = $selections.slice(0, options.limit);

	// If there's no transform defined, we can skip the rest.
	if(!options.transform) return $selections;

	// Transform selected elements.
	var data = [];
	$selections.each(function(idx){
		var item = options.transform.apply(this, [$(this), idx, options, $selections]);
		if(item || !item && options.keepFalsy) data.push(item);
	});

	// Sorting delegates to Array#sort
	if(options.sort) data.sort(options.sort);

	return data;

}