# headcrab

#### Latch on; devour.

**headcrab** is a web scraping library that aims to bring a structured, _ethical_ and reusable approach to extracting data from webpages.

# Installation

Headcrab can be installed using NPM.

```sh
$ npm install --save headcrab
```

<!--
If you want to use the CLI, you should save it globally.

```sh
$ npm install -g headcrab
```
-->

# Usage

## API

First include it in your code.

```js
var headcrab = require("headcrab");
```

Every method in Headcrab is bound to a _transformer_. A Headcrab transformer consists of a CSS selector, a transform function and some useful options. It accepts HTML, parses it using [cheerio][Cheerio] and then applies the transform to every instance of the selector found.

That's a bit wordy, it's simpler in code. The following will find every post on [Hacker News][HackerNews] and transform it into an object with url and title keys.

```js
var Hacker = headcrab({
	selector: "tr .title a",
	transform: function(link){
		return {
			url: link.attr("href"),
			title: link.html().trim()
		}
	}
});
```

Now that you have a transformer, you have a bunch of options. Most of the methods will be detailed later, but for now here's a simple scrape:

```js
Hacker.scrape("http://news.ycombinator.com", function(err, posts){
	console.log(posts);
	// posts is an array of transform results
	// => [
	// 	      {
	//		      url: "http://www.pluminjs.com/",
	//			  title: "Create and manipulate fonts using Javascript"
	//	      },
	// 		  ...
	//	  ]
});
```

By separating the transformer from the URL, we can use it for every Hacker News list page. We can also parse HTML directly.

```js
var posts = Hacker.parse("a html string");
```

### Options

- `selector` - String. A CSS selector. Defaults to "*".
- `transform` - Function to use on every selector match. Should return the transformed value - eg an object of extracted data. Is passed element, index, options hash and cheerio selections. Defaults to a no-op, selection objects will be returned as they are.
- `limit` - Integer. Maximum number of selections. Defaults to all.
- `keepFalsy` - Boolean. If the transform function returns false, should it be kept? Defaults to false.

The following delegate to other libraries.

- `query` - Object. Request options hash. 'uri' will be overwritten. See https://github.com/request/request#requestoptions-callback
- `parsing` - Object. htmlparser2/cheerio options hash. See https://github.com/fb55/htmlparser2/wiki/Parser-options

If your transform involves any unique helper functions that don't belong anywhere else, I think it's a good convention to add them straight to the options hash. It's a nice way to kep it all together, and means helpers can be can be replaced by `extend`ing the transformer. 

```js
var headcrab = require("headcrab");
var transformer = module.exports = headcrab({
	selector: "a",
	transform: function(el, idx, opts){
		return opts.doSomething(el.attr("href"));
	},
	doSomething: function(){
		// return something
	}
});
```

And extending...

```js
var extended = transformer.extend({
	doSomething: function(){
		// return something else
	}
});
```

### Methods

#### #scrape(url[s], [options], callback)



### For single use scraping

Although creating multi-use transformers is recommended, you can use headcrab for simple operations using
`headcrab(url, opts, cb)`. For example:

```js
headcrab("http://example.com", {
	selector: "h3"
}, function(err, data){
	fs.writeFile("example.json", JSON.stringify(data), function(){
		console.log("Saved useless document");
	});
});
```

## CLI

Headcrab also comes bundled with a CLI.

We emphasise the benefits of creating multi-use transformers. If you export a transformer from a file you can use it from the CLI, and stream out the results and JSON. For example a transformer like this...

```js
// example-transformer.js
module.exports = {
	selector: "ul.articles li",
	transform: function(el){
		return {
			title: el.find("h3").html(),
			description: el.find("span.deck").html(),
			author: el.find(".byline").text().trim()
		}
	}
}
```

...can be used like this...

```sh
$ headcrab http://example.com/articles -u ./example-transformer.js > ./data/articles.json
```

...to save some JSON like this.

```json
// data/articles.json
{
	"results": [
		{
			"title": "This is a title",
			"description": "This is the <em>description</em>",
			"author": "Richard Foster"
		}
	]
}
```

[Cheerio]: https://github.com/cheeriojs/cheerio
[HackerNews]: https://news.ycombinator.com/