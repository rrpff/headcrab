var transform = require("./lib/transform"),
	methods = require("./lib/methods"),
	utils = require("./lib/utils");

// When used as a function, headcrab is a dead simple scraper.
// When used as a constructor, it's shorthand for headcrab.Transform
var headcrab = module.exports = function(){
	var args = Array.prototype.slice.call(arguments);
	// Used as a function
	if(typeof args[0] === "string")
		return new headcrab.Transform(args[1]).call(args[0], args[2]);
	// Used as a constructor;
	else return new headcrab.Transform(args[0]);
}

// Defaults are stored here so they
// can be changed before any transform.
headcrab.defaults = {
	selector: "*",
	query: {},
	helpers: {}
}

// Create a new transformer, set options for transforming HTML.
headcrab.Transform = function(options){
	this.options = utils.extend(headcrab.defaults, options);
	this.transform = transform.bind(this, options);
}

// Import all methods
utils.extend(headcrab.Transform.prototype, methods);

var urls = [
	"http://www.giantbomb.com/help",
	"https://github.com/zuren/",
	"http://twitter.com/zurenar"
];

var spammer = new headcrab({
	selector: "a",
	transform: function(el){
		var href = el.attr("href");
		if(!/@/.test(href)) return false;
		else return href.replace("mailto://", "");
	}
});

spammer.scrapeAll(urls, function(err, data){
	console.log(data);
});

// headcrab.Transform.prototype.walk = function(route, transform, options, cb){
// 	var url = [];
// 	var nextUrl = function(){
// 		var params[0];
// 	}
// }

// var t = new headcrab.Transform({
// 	selector: "h1",
// 	transform: function(el){
// 		return {
// 			title
// 		}
// 	}
// });

// t.walk("http://giantbomb.com/video/{id}", {
// 	params: {
// 		id: 
// 	},
// 	each: function(params){

// 	},
// 	limit: function(){

// 	}
// }, function(err, data){

// });