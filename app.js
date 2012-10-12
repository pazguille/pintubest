/**
 * Module dependencies.
 */
var sys = require("util"),
	express = require("express"),
	gzippo = require("gzippo"),
	pintubest = require("./libs/pintubest").Pintubest,
	port = process.argv[2] || 80,
	app = module.exports = express.createServer(),
	best = pintubest.hottest();

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
	res.render("index", {"video": best.collection(0), "page": 1});
});

// Search
app.get("/search", function (req, res, next) {
	if (req.query.q) {
		res.redirect("/" + req.query.q.split(" ").join("+"), 301);
		return;
	}
});

// Video View
/*app.get("/video/:id", function (req, res, next) {
	res.render("video", {"video": {
		"id": req.params.id,
		"title": req.params.title
		"img": req.params.img
	});
});*/

// Best pagination
app.get("/page/:page?", function (req, res, next) {

	var page = parseInt(req.params.page),
		id = page-1;

	if (page <= 1 || isNaN(page) || page === 1) {
		res.redirect("/", 301);
	}

	if (best.collection(id)) {
		res.render("index", {"video": best.collection(id), "page": page});

	} else {
		best.next(page);
		best.on("render", function () {
			if (best.collection(id)) {
				res.render("index", {"video": best.collection(id), "page": page});
			} else {
				res.redirect("/", 301);
			}
		});
	}
});

app.get("/:query/:page?/:number?", function (req, res, next) {

	if (req.params.page !== "page" && req.params.page !== undefined && isNaN(req.params.number)) {
		next();
		return;
	}

	var query = req.params.query.split("+").join(" "),
		page = parseInt(req.params.number) || 1,
		id = page - 1,
		search = pintubest.search();

	search.run({
		"query": escape(query),
		"page": page
	});

	search.on("render", function () {
		res.render("index", {"video": search.collection(id), "searchPage": page, "query": query});
	});

});


// 5 min 300000
// 24 hs 86400000

setInterval(function () {
	console.log("Restarting!");
	best.reset();
}, 86400000);

app.listen(port);
console.log("Express server listening on port %d", app.address().port);