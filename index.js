var transform = require("./lib/transform"),
	methods = require("./lib/methods"),
	utils = require("./lib/utils");

var headcrab = module.exports = function(){
	// Used as a function
	// args are URL, options and callback
	if(typeof arguments[0] === "string")
		return new headcrab.Transformer(arguments[1])
			.scrape(arguments[0], arguments[2]);
	// Used as a constructor delegating to headcrab#Transformer.
	// arg is an options hash.
	else return new headcrab.Transformer(arguments[0]);
}

// Defaults are stored here so they
// can be changed manually.
headcrab.defaults = {
	selector: "*",
	query: {}
}

// Create a new transformer, set options for transforming HTML.
headcrab.Transformer = function(options){
	this.options = utils.extend(headcrab.defaults, options);
	this.transform = transform.bind(this, options);
}

// Extend a transformer, mixing in new
// options and returning a new instance.
headcrab.Transformer.extend = function(options){
	var extended = utils.extend(this.options, options);
	return new headcrab.Transformer(extended);
}

// Import all methods
utils.extend(headcrab.Transformer.prototype, methods);