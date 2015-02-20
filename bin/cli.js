#!/usr/bin/env node

var headcrab = require("../"),
	Path = require("path"),
	fs = require("fs"),
	chalk = require("chalk"),
	argv = require("yargs")
		// CLI options
		.alias("s", "selector")
		.alias("u", "use")
		.alias("o", "output")
		.alias("p", "pretty")
		// Scraper options
		.alias("i", "interval")
		.alias("m", "merge")
		.alias("l", "limit")
		.argv;

var URLs = argv._;

if(URLs.length < 1){
	console.log(chalk.red("At least one URL is required."));
	process.exit(1);
}

// If a transformer path is supplied, use that.
if(argv.use){
	var fpath = Path.join(process.cwd(), argv.use),
		transformer = require(fpath	);

	// Wrap it in headcrab if it's not already wrapped.
	if(!(transformer instanceof headcrab.Transformer))
		transformer = headcrab(transformer);

// If using a selector, pull the HTML from each match.
} else if(argv.selector) {
	var transformer = headcrab({
		selector: argv.selector,
		transform: function(el){
			return el.html();
		}
	});

// Error if neither are defined.
} else {
	console.log(chalk.red("Either a selector or a transformer must be defined."));
	process.exit(1);
}

// Set options on the transformer
var OPTIONS = ["interval", "merge", "limit"].reduce(function(opts, arg){
	if(argv[arg]) opts[arg] = argv[arg];
	return opts;
}, {});

// Use the transformer
transformer.scrape(URLs, OPTIONS, function(err, data){
	// Make some pretty JSON
	var json = argv.pretty ? JSON.stringify(data, null, parseInt(argv.pretty) || 4) : JSON.stringify(data),
		records = data.length;

	// Use output path if set
	if(argv.output){
		var opath = Path.join(process.cwd(), argv.output);
		var stream = fs.createWriteStream(opath);
		stream.write(json);
		stream.end();

		stream.on("finish", function(){
			console.log(chalk.green(opath + " has been saved with " + records + " records."));
		})
		.on("error", function(err){
			console.log(chalk.red(err));
		});
	// Otherwise log
	} else {
		process.stdout.write(json);
	}
});