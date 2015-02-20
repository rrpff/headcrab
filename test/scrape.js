require("chai").should();

var headcrab = require("../");

describe("#scrape", function(){

	this.timeout(6000);

	var t = headcrab({
		selector: "h1",
		transform: function(el){
			return el.text();
		}
	});

	it("should accept an URL", function(done){
		t.scrape("http://example.com", function(err, data){
			data.should.be.an("array");
			data[0].should.equal("Example Domain");
			done();
		});
	});

	it("should accept an array of URLs", function(done){
		t.scrape(["http://example.com", "http://example.com"], {
			interval: 5000
		}, function(err, data){
			data.should.be.an("array");
			data[0].should.be.an("array");
			done();
		});
	});

	it("should work without any options", function(done){
		t.scrape("http://example.com", function(err, data){
			data.should.be.an("array");
			data[0].should.equal("Example Domain");
			done();
		});
	});

	describe("options", function(){
		
		describe("limit", function(){
			it("should default to all URLs", function(done){
				t.scrape("http://example.com", function(err, data){
					data.should.be.an("array");
					done();
				});
			});
			it("should limit the number of URLs to scrape", function(done){
				t.scrape(["http://example.com", "http://example.com"], {
					limit: 1
				}, function(err, data){
					data.length.should.equal(1);
					done();
				});
			});
		});

		describe("merge", function(){
			it("should default to false", function(done){
				t.scrape(["http://example.com", "http://example.com"], function(err, data){
					data.length.should.equal(2);
					data[0][0].should.equal("Example Domain");
					done();
				});
			});
			it("should merge the results from all URLs into a single array", function(done){
				t.scrape(["http://example.com", "http://example.com"], {
					merge: true
				}, function(err, data){
					data[1].should.equal(data[0]);
					done();
				});
			});
		});

		describe("interval", function(){

			this.timeout(10000);

			var start = new Date().getTime();

			it("should wait that many milliseconds between scraping each URL", function(done){
				t.scrape(["http://example.com", "http://example.com"], {
					interval: 5000
				}, function(err, data){
					var end = new Date().getTime();
					(end - start).should.be.above(5000);
					done();
				});
			});
		});

		describe("each", function(){
			it("should fire after every URL is scraped with data, url and index passed", function(){
				t.scrape("http://example.com", {
					each: function(data, url, idx){
						data.should.be.an("array");
						url.should.be.a("string");
						idx.should.be.a("number");
					}
				}, function(){});
			});
		});

	});

});