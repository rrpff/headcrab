require("chai").should();

var transform = require("../lib/transform");

describe("transform functions", function(){

	var t = transform.bind(this, { selector: "*" });

	it("should return an array of cheerio objects if a transform function is omitted", function(){
		var matches = t("<span></span>");
		matches.length.should.equal(1);
		matches[0].type.should.equal("tag");
		matches[0].name.should.equal("span");
	});

});