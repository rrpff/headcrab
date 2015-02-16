var t = new headcrab.Transform({
	selector: ".test a",
	transform: function(){
		return $(this).text();
	}
});

// Scrape an URL
t.scrape("http://www.google.com").then(function(data){
	console.log(data);
});

// Transform HTML
var html = "<span class='test'><a href='#!'>Test</a></span>";
var data = t.parse(html);

// Use the transformed data
var walker = t.walk("http://www.buzzfeed.com/articles?p={{page}}", {
	each: function(params, idx){
		params.page += 1;
	},
	until: function(params){
		return params.page > 10;
	}
});

// Walk over each item, use item params as keys
t.each("{{url}}");

// Walk over each item. If the transform returns a string, it's used as an url.
t.each();

// 
t.parallel("{{url}}");