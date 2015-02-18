require("chai").should();

var headcrab = require("../");

describe("parsing methods", function(){

	describe("#parse", function(){
		var html = "<p><a href=''></a><a href=''></a><a href=''></a>",
			t = headcrab({ selector: "a" });

		it("should return an array of matches", function(){
			t.parse(html).should.be.an("array");	
		});
		
		it("should find all selector matches in a HTML string", function(){
			t.parse(html).length.should.equal(3);
		});
	});

});