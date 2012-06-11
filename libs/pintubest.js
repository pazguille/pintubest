var sys = require("util"),
	fs = require("fs"),
	eventEmitter = require("events").EventEmitter,
	https = require("https"),	
	Pintubest = (function () {
		var that = new eventEmitter,
			max_results = 12,
			makeRequest = function (options) {
				var that = this,
					data = "",
					req = https.request(options);

				req.on("response", function (response) {
					response.setEncoding("utf8");
					response.on("data", function (chunk) {
						data+=chunk;
					});
					response.on("end", function () {
						that.emit("requestend", JSON.parse(data));
					});
					response.on("error", function (e) {
						that.emit("requesterror", e);
					});
				});
				req.end();
			};

		that.max_results = max_results;
		that.hottest =  function () {
			// Aplicar posibles filtros
			// today
			// this_week
			// this_month
			// all_time

			// top_rated
			// top_favorites
			// most_viewed
			// most_popular
			// most_discussed
			// most_responded
			var that = new eventEmitter,
				collection = [],
				start = 1,
				options = function () {
					return {
						host: "gdata.youtube.com",
						path: "/feeds/api/standardfeeds/most_popular?v=2&time=today&alt=json&format=5&max-results=" + max_results + "&start-index=" + (max_results * start - max_results + 1),
						method: "GET"
					}
				};

			that.next = function (page) {
				start = page;
				makeRequest.call(that, options());
			};

			that.reset = function () {
				collection = [];
				start = 1;
				makeRequest.call(that, options());
			};

			that.collection = function (id) {
				return collection[id];
			},

			that.on("requestend", function (data) {
				collection[start-1] = data.feed.entry;
				that.emit("render");
			});

			makeRequest.call(that, options());

			return that;
		};

		that.search =  function () {
			var that = new eventEmitter,
				collection = [],
				options = function (query, page) {
					return {
						host: "gdata.youtube.com",
						path: "/feeds/api/videos?v=2&alt=json&format=5&orderby=relevance&q=" + query + "&max-results=" + max_results + "&start-index=" + (max_results * page - max_results + 1),
						method: "GET"
					}
				};

			that.run = function (conf) {
				var page = conf.page;

				makeRequest.call(that, options(conf.query, page));

				that.on("requestend", function (data) {
					collection[page-1] = data.feed.entry
					that.emit("render");
				});
				
			};

			that.collection = function (id) {
				return collection[id];
			};

			return that;
		};

		return that;
	}());

exports.Pintubest = Pintubest;