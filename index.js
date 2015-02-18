var transform = require("./lib/transform"),
	methods = require("./lib/methods"),
	utils = require("./lib/utils");

var headcrab = module.exports = function(){
	var args = Array.prototype.slice.call(arguments);
	// Used as a function
	// args are (URL, [options], callback)
	if(typeof arguments[0] === "string"){
		// Remove and keep options object from args if present
		var opts = args.length === 3 ? args.splice(1, 1)[0] : {};
		return new headcrab.Transformer(opts).scrape(args[0], args[1]);
	}
	// Used as a constructor delegating to headcrab#Transformer.
	// arg is an options hash.
	else return new headcrab.Transformer(args[0]);
}

// Defaults are stored here so they
// can be changed manually.
headcrab.defaults = {
	selector: "body",
	query: {},
	transform: function(el){
		return el;
	}
}

// Create a new transformer, set options for transforming HTML.
headcrab.Transformer = function(options){
	this.options = utils.extend({}, headcrab.defaults, options);
	this.transform = transform.bind(this, this.options);
}

// Extend a transformer, mixing in new options and returning a new instance.
headcrab.Transformer.prototype.extend = function(options){
	var extended = utils.extend({}, this.options, options);
	return new headcrab.Transformer(extended);
}

// Import all methods
utils.extend(headcrab.Transformer.prototype, methods);