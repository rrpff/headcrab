# headcrab

#### Latch on; devour.

**Headcrab** is a web scraping library that aims to bring a modular approach to extracting structured data from webpages. It provides simple but useful features, such as reusable templates (called transformers), rate limiting, routing and auto paginating that take a lot of the boilerplate and hassle out of scraping.

I'm aiming to cover a lots of common patterns, so if you have any feature suggestions please do get in touch with me by filing an issue or by email.

> Be respectful when scraping. Rate limit your requests (just use the `interval` option) and cache your data. If you're going to be scraping heavily, contact the site owner or an admin first. Don't scrape if an API is available, and don't be evil.

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

Every method in Headcrab is bound to a _transformer_. A Headcrab transformer consists of a CSS selector, a transform function and some useful options. It accepts HTML, parses it using [cheerio][Cheerio] and then applies the transform to every selected element.

That's a bit wordy, it's simpler in code. Say we wanted to grab every post on the [Hacker News][HackerNews] front page, transform each into an object with `url` and `title` keys, and return a single array.

First make a 'Hacker' transformer.

```js
var Hacker = headcrab({
	// Find every post title
	selector: "tr .title a",
	// transform is called with every post title element.
	transform: function(link){
		// link is the 'a' object. Use cheerio methods.
		return {
			url: link.attr("href"),
			title: link.html().trim()
		}
	}
});
```

Now that you have a transformer, you have a bunch of options. The methods will be detailed later, but for now here's a simple scrape:

```js
// Scrape the front page
Hacker.scrape("http://news.ycombinator.com", function(err, posts){
	console.log(posts);
	// posts is an array of transform results
	// => [{ url: "http://www.pluminjs.com/", title: "Create and manipulate fonts using Javascript" }, ...]
});
```

By separating the transformer from the URL, we can reuse it for every Hacker News list page.

## Transformer Methods

For all method examples assume the following transformer.

```js
// Gets the textual content of every h1
var transformer = headcrab({
	selector: "h1",
	transform: function(){
		return $(this).text();
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
transformer.scrape(["http://example.com", "http://something.else"], function(err, data){
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
	console.log(data); // => ["Example Domain", "Something else", ...]
});
```

#### Scrape Options

- `interval` - **Integer**. Time in milliseconds to wait between each request. Requests are processed sequentially, and the timeout is set after each request is complete. Defaults to none.
- `each(data, url, idx)` - **Function**. Function to be called after each page is scraped. Passed the data for that page, the page url and index. Defaults to `null`.
- `merge` - **Boolean**. When multiple URLs are passed, the result will be an array of all those results. This flattens this array a layer, so all the results are together. It will do another `sort` as well if it's defined on the transformer. Defaults to `false`.
- `limit` - **Integer**. Number of URLs in array to scrape, starting from the first. Useful when URLs are entered procedurally. Defaults to all.

### #parse(html)

Parse a HTML string, or array of HTML strings, using the transformer.

```js
var title = transformer.parse("<h1>Title</h1> Article body...");
// => ["Title"]

var titles = transformer.parse([
	"<h1>Article #1</h1>",
	"<h1>Article #2</h1>",
	"<h1>Article #3</h1>",
]);
// => [["Article #1"], ["Article #2"], ["Article #3"]]
```

### #each(arr, options, callback)

Scrape multiple pages using a basic route and data from an array.

```js
// Game is a transformer. It'll transform
// a Giant Bomb page into a hash of data.
var Game = headcrab({
	selector: "h1 a.wiki-title",
	transform: function(el){
		return {
			url: "http://giantbomb.com" + el.attr("href"),
			title: el.text()
		}
	}
});

// Visit each game page and transform.
Game.each([{id: 2980}, {id: 24079}, {id: 20238}], {
	route: "http://giantbomb.com/this-is-just-vanity/3030-{id}",
	interval: 30000,
	merge: true
}, function(err, games){
	// games is an array of game data.
	console.log(games);
});
```

For cases when your array doesn't contain objects, use a 'param' template key in your route to include the value.

```js
UserTransformer.each([123, 124, 125], {
	// Simple routing template. Include id.
	route: "http://example.com/users?id={param}",
	interval: 30000,
	merge: true
}, function(err, users){
	console.log(users);
});
```

#### Each options

All of the options in [`#scrape`](#scrape-options), plus:

- `route` - **String**. A string including keys from objects in the array. If array elements are not objects use 'param' as a template key. **Required.**

### #walk(options, callback)

Walk through pages of a website using a simple route. The following (using the 'Hacker' transformer defined above) will scrape pages 1, 2 and 3 of Hacker News and return the results as a single array.

```js
Hacker.walk({
	route: "https://news.ycombinator.com/news?p={param}",
	pages: 3,
	merge: true
}, function(err, data){
	// Data is an array of post objects.
});
```

#### Walk options

All of the options in [`#scrape`](#scrape-options) and [`#each`](#each-options), plus:

- `start` - **Integer**. Page number to start at. Defaults to `1`.
- `pages` - **Integer**. Number of pages to include. Defaults to `5`.

### #extend(options)

Extend a transformer, replacing some of its options and adding new ones.

```js
// Selects all headers, instead of just h1.
var extended = transformer.extend({
	selector: "h1, h2, h3, h4, h5, h6",
	transform: function(el){
		return {
			level: parseInt(el[0].name.replace("h"), 10),
			content: el.html()
		}
	}
});

var titles = extended.parse("<h1>headcrab></h1><h3>#extend(options)</h3>");
console.log(titles);
// => [{level: 1, content: "headcrab"}, {level: 3, content: "#extend(options)"}];
```

## Transformer Options

A Headcrab transformer is nothing but its options. A basic example looks like this:

```js
// Grabs titles
var Titles = headcrab({
	selectors: "h1, h2, h3",
	transform: function(el, idx){
		return {
			priority: el.tagName.replace("h"),
			text: el.html()
		}
	}
});
```

- `selector` - **String**. A CSS3/CSSSelect selector. Defaults to `"body"`. See https://github.com/fb55/css-select for a list.
- `transform(el, idx, options, $)` - **Function** to use on every selector match. Should return the transformed value - eg an object of extracted data. Is passed the cheerio element, index, Transformer options hash and cheerio object containing all selections. Defaults to a no-op, selection objects will be returned as they are.
- `limit` - **Integer**. Maximum number of selections. Defaults to all.
- `keepFalsy` - **Boolean**. If the transform function returns a falsy value, should it be kept? Defaults to `false`.
- `sort(a, b)` - **Function**. A sorting function which delegates to Array#sort. Will be passed two transformed results. Defaults to order processed.

The following delegate to other libraries.

- `query` - **Object**. Request options hash. 'url' will be overwritten. See https://github.com/request/request#requestoptions-callback
- `parsing` - **Object**. htmlparser2/cheerio options hash. See https://github.com/fb55/htmlparser2/wiki/Parser-options

### May I suggest...

If your transform involves any unique helper functions that don't belong anywhere else, I think it's a good convention to add them straight to the options hash. It's a nice way to keep it all together, and means helpers can be can be replaced by `extend`ing the transformer. 

```js
// transforms/links.js
var headcrab = require("headcrab");
module.exports = headcrab({
	selector: "a",
	transform: function(el, idx, options){
		return options.coolLinks(el.attr("href"));
	},
	coolLinks: function(link){
		// return a cooler link
	}
});
```

## For single use scraping

Although creating multi-use transformers is recommended, you can use headcrab for simple operations using
`headcrab(url, options, callback)`. For example:

```js
headcrab("http://example.com", {
	selector: "h1",
	limit: 1,
	transform: function(el){
		return el.text()
	}
}, function(err, headers){
	console.log(headers[0]);
	// => "Example Domain"
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