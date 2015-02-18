# headcrab

#### Latch on; devour.

**headcrab** is a web scraping library that aims to bring a structured and reusable approach to extracting data from webpages.

> Please be respectful when scraping. Rate limit your requests (just use the `interval` option) and cache your data. If you're going to be scraping heavily, contact the site owner or an admin first. Don't scrape if an API is available, and don't scrape for anything evil.

# Installation

Headcrab can be used in [Node][Node] or [io.js][iojs], and installed using [npm][npm/headcrab].

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
	// => [{ url: "http://www.pluminjs.com/", title: "Create and manipulate fonts using Javascript" }, ...]
});
```

By separating the transformer from the URL, we can use it for every Hacker News list page. We can also parse HTML directly.

```js
var posts = Hacker.parse("a html string");
```

## Transformer Methods

For all methods, assume the following transformer.

```js
var transformer = headcrab({
	selector: "h1",
	transform: function(el){
		return el.text();
	}
});
```

### #scrape(url[s], [options], callback)

A transformer can be used to scrape a single webpage and return an array of results.

```js
transformer.scrape("http://example.com", function(err, data){
	if(err) throw err;
	console.log(data); // => ["Example Domain"];
});
```

You can also pass an array to scrape multiple webpages.

```js
transformer.scrape(["example.com", "something.else"], function(err, data){
	console.log(data.length === 2); // true
	console.log(data); // => [["Example Domain"], ["Something else", ...]];
});
```

You can pass a hash of options as the second argument. To improve the example above, we could set `merge`, and receive a flattened array of data.

```js
transformer.scrape(["example.com", "something.else"], {
	merge: true
}, function(err, data){
	// See this flattened array.
	console.log(data); // => ["Example Domain", ...]
});
```

### Options

- `interval` - ***Integer***. Time in milliseconds to wait between each request. Requests are processed sequentially, and the timeout is set after each request is complete. Defaults to none.
- `merge` - ***Boolean***. When multiple URLs are passed, the result will be an array of all those results. This flattens it a layer. Defaults to `false`.

## Transformer Options

A Headcrab transformer is nothing but its options. A basic example looks like this:

<!--
```js
// Grabs titles
var t = headcrab({
	selectors: "h1, h2, h3",
	transform: function(el, idx){
		return {
			priority: el.tagName.replace("h"),
			text: el.html()
		}
	},
	sort: function(a, b){
		return a.priority < b.priority;
	}
});

console.log(t.parse("<h1>A</h1><h2>C</h2><h1>B</h1>"));
// => ["A", "B", "C"];
```
-->

- `selector` - **String**. A CSS3/CSSSelect selector. Defaults to `"*"`. See https://github.com/fb55/css-select for a list.
- `transform` - **Function** to use on every selector match. Should return the transformed value - eg an object of extracted data. Is passed element, index, options hash and cheerio selections. Defaults to a no-op, selection objects will be returned as they are.
- `limit` - **Integer**. Maximum number of selections. Defaults to all.
- `keepFalsy` - **Boolean**. If the transform function returns false, should it be kept? Defaults to `false`.
- `sort` - **Function**. A sorting function which delegates to Array#sort. Will be passed two transformed results. Defaults to order processed.

The following delegate to other libraries.

- `query` - **Object**. Request options hash. 'uri' will be overwritten. See https://github.com/request/request#requestoptions-callback
- `parsing` - **Object**. htmlparser2/cheerio options hash. See https://github.com/fb55/htmlparser2/wiki/Parser-options

If your transform involves any unique helper functions that don't belong anywhere else, I think it's a good convention to add them straight to the options hash. It's a nice way to kep it all together, and means helpers can be can be replaced by `extend`ing the transformer. 

```js
var headcrab = require("headcrab");
var transformer = module.exports = headcrab({
	selector: "a",
	transform: function(el, idx, opts){
		return opts.doSomething(el.attr("href"));
	},
	doSomething: function(link){
		// return something
	}
});
```

And extending...

```js
var extended = transformer.extend({
	doSomething: function(link){
		// return something else
	}
});
```

## For single use scraping

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

<!--
# CLI

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
-->

# Credits + License
It's [MIT][license] licensed so you can do what you like with it. Public attribution is nice too. Don't use it for anything evil.

Thanks to [request][request], [cheerio][Cheerio], and Half-Life.

[license]: blog/master/LICENSE
[request]: https://github.com/request/request
[Cheerio]: https://github.com/cheeriojs/cheerio
[HackerNews]: https://news.ycombinator.com/
[Node]: http://nodejs.org/
[iojs]: https://iojs.org/
[npm/headcrab]: https://www.npmjs.com/package/headcrab