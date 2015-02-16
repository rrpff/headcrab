require("chai").should();

var headcrab = require("../");

describe("parsing methods", function(){

	describe("#parse", function(){
		var html = "<p><a href=''></a><a href=''></a><a href=''></a>",
			t = new headcrab({ selector: "a" });

		it("should return an array of matches", function(){
			t.parse(html).should.be.an("array");	
		});
		
		it("should find all selector matches in a HTML string", function(){
			t.parse(html).length.should.equal(3);
		});
	});

	describe("#parseAll", function(){
		it("should find all selector matches in an array of HTML strings", function(){
			var strings = ["<span>hi</span>", "<span>how</span><span>are</span>", "<span>you?</span>"],
				t = new headcrab({ selector: "span" });

			var data = t.parseAll(strings);
			data[0].length.should.equal(1);
			data[1].length.should.equal(2);
			data[2].length.should.equal(1);
		});
	});

});