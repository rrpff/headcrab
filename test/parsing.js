require("chai").should();

var headcrab = require("../");

describe("parsing methods", function(){

	it("should find all selector matches within a HTML string", function(){
		var html = "<p><a href=''></a><a href=''></a><a href=''></a>";
		var t = new headcrab({
			selector: "a"
		});

		t.parse(html).length.should.equal(3);
	});

});