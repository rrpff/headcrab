require("chai").should();

var headcrab = require("../");

describe("#parse", function(){
	var t = headcrab({ selector: "a" }),
		html = "<p><a href=''></a><a href=''></a><a href=''></a>",
		otherHtml = "<a href=''>test</a>";

	it("should return an array of matches", function(){
		t.parse(html).should.be.an("array");	
	});
	
	it("should find all selector matches in a HTML string", function(){
		t.parse(html).length.should.equal(3);
	});

	it("should accept a string or an array of strings", function(){
		t.parse(html).should.be.an("array");
		t.parse([html, otherHtml]).should.be.an("array");
	});
});