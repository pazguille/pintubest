/**
 * Module dependencies.
 */
var sys = require("util"),
	express = require("express"),
	gzippo = require("gzippo"),
	pintubest = require("./libs/pintubest").Pintubest,
	port = process.argv[2] || 80,
	app = module.exports = express.createServer(),
	hottest = pintubest.hottest();

/**
 * App configuration.
 */
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(gzippo.staticGzip(__dirname + '/public'));
});

app.configure("development", function () {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure("production", function () {
	app.use(express.errorHandler()); 
});

/**
 * Routes.
 */
// Index
app.get("/", function (req, res, next) {
	res.render("index", {"video": hottest.collection(0), "page": 1});
});

// Hottest pagination
app.get("/page/:page?", function (req, res, next) {
	var page = parseInt(req.params.page),
		id = page-1;

	if (page <= 1 || isNaN(page)) {
		res.redirect("/", 301);
	}

	if (hottest.collection(id)) {
		res.render("index", {"video": hottest.collection(id), "page": page});

	} else {
		hottest.next(page);
		hottest.on("render", function () {
			res.render("index", {"video": hottest.collection(id), "page": page});
		});
	}
});

// Search
app.get("/best/:query?", function (req, res, next) {
	
	if (req.query.q) {
		res.redirect("/best/" + req.query.q.split(" ").join("+"), 301);
	}

	var query = (req.params.query !== undefined) ? req.params.query.split("+").join(" ") : undefined,
		page = parseInt(req.query.page) || 1,
		id = page - 1,
		search = pintubest.search();

	if (query === undefined) {
		res.redirect("/", 301);
	}

	search.run({
		"query": escape(query),
		"page": page
	});

	search.on("render", function () {
		res.render("index", {"video": search.collection(id), "searchPage": 1, "query": query});
	});
});


// 5 min 300000
// 24 hs 86400000

setInterval(function () {
	console.log("Restarting!");
	hottest.reset();
}, 86400000);

app.listen(port);
console.log("Express server listening on port %d", app.address().port);