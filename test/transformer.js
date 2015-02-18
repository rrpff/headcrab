require("chai").should();

var headcrab = require("../"),
	cheerio = require("cheerio");

describe("headcrab.Transformer", function(){

	var t = headcrab({
		transform: function(el){
			return el.text();
		}
	});

	var spans = t.extend({
		selector: "span"
	});

	var htmlstr = "<h1>title</h1><span>1</span><span>2</span><span>3</span><span>4</span>",
		allResults = t.parse(htmlstr),
		spanResults = spans.parse(htmlstr);

	it("should be an instance of headcrab.Transformer", function(){
		(t instanceof headcrab.Transformer).should.equal(true);
	});

	describe("options", function(){

		describe("selector", function(){
			it("should default to *", function(){
				allResults.length.should.equal(5);
			});
			it("should only transform selector matches", function(){
				spanResults.length.should.equal(4);
			});
		});

		describe("limit", function(){
			var limitResults = t.extend({
				limit: 2
			}).parse(htmlstr);

			it("should default to all matches", function(){
				spanResults.length.should.equal(4);
			});
			it("should limit the number of results", function(){
				limitResults.length.should.equal(2);
			});
			it("should slice starting at the beginning", function(){
				limitResults[0].should.equal("title");
			});
		});

		describe("transform", function(){
			it("should default to a no-op, returning cheerio objects", function(){
				var notransform = headcrab();
				var obj = notransform.parse(htmlstr)[0];
				(obj instanceof cheerio).should.equal(true);
			});
			it("should transform each selector match", function(){
				var res = t.parse("<span><strong>test</strong></span>");
				res[0].should.equal("test");
				res[0].should.not.equal("<strong>test</strong>");
			});
		});

		describe("keepFalsy", function(){
			var html = "<span></span><span>test</span>";
			it("should default to false, ignoring falsy transform values", function(){
				t.parse(html).length.should.equal(1);
			});
			it("should keep falsy values if enabled", function(){
				e = t.extend({ keepFalsy: true });
				e.parse(html).length.should.equal(2);
			});
		});

	});

	describe("#extend", function(){
		it("should extend a transformer, replacing any options", function(){
			var e = t.extend({
				transform: function(){ return "thisisabadidea"; }
			});

			e.parse("<span></span>")[0].should.equal("thisisabadidea");
		});
	});

});