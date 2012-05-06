// Video con el id
// media$content[0].url
// $("<iframe width=\"480\" height=\"360\" src=\"http://www.youtube.com/v/oO8btmDxB14?version=3&f=videos&app=youtube_gdata\">").appendTo("body");

// Demo:
// http://gdata.youtube.com/demo/index.html

// Offset: max-results=1
// Page: start-index=2



// Betest: http://gdata.youtube.com/feeds/api/standardfeeds/most_viewed?time=this_week&alt=json&format=5&max-results=1

// Search: http://gdata.youtube.com/feeds/api/videos?alt=json&format=5&q=ps3
/*
<iframe width="560" height="315" src="http://www.youtube.com/embed/gZbbdVuPlB4" frameborder="0" allowfullscreen></iframe>
*/

/*
* Models
*/

var Video = Backbone.Model.extend({});

/*
* Collections
*/
var VideosCollection = Backbone.Collection.extend({
	"model": Video,

	"sync": function (method, model, options) {
		options.dataType = "jsonp";
		return Backbone.sync(method, model, options);
	},

	"parse": function (response) {
		return response.feed.entry;
	},

	"url": "http://gdata.youtube.com/feeds/api/standardfeeds/most_viewed?time=this_week&alt=json&format=5"
});

/*
* Views
*/
var PinView = Backbone.View.extend({
	"tagName": "li",

	"template": _.template($("#tpl-pin").html()),

	"render": function () {
		var pin = this.model.toJSON();

		$(this.el).html(this.template(pin));

		return this;
	}
});

var AppView = Backbone.View.extend({
	"el": "#hottest",

	"initialize": function () {
		this.page = 1;
		this.limit = 50;
		this.collection = new PinsCollection();
		
		this.$el
			.prepend(this.$list);

		this.$el.removeClass("ch-hide");

		this.reset();

		this.fetch();
	},

	"events": {
		"scroll": "more",
		"click .repin": "repin"
	},

	"$list": $("<ul class=\"ch-slats ch-hide\">"),

	"$loading": $(".ch-loading"),

	"render": function () {
		var that = this;

		_.each(this.collection.models, function (pin) {
			var pin = new PinView({"model": pin});
			that.$list.append(pin.render().el);
		}, this);

		this.$list.removeClass("ch-hide");

		that.trigger("end");

		return this;
	},

	"fetch":  function () {
		var that  = this;

		this.$loading.removeClass("ch-hide");

		this.collection.fetch({
			"data": {
				"limit": this.limit,
				"page": that.page
			},
			"success": function () {
				that.$loading.addClass("ch-hide");
				that.render();
			}
		});
	},

	"more": function () {
		var height = this.$list.height() - this.$el.height();
		var bottom = this.el.scrollTop;
		if (height === bottom) {
			this.page += 1;
			this.fetch();
		};

		return;
	},

	"repin": function (event) {		
		chrome.tabs.create({url: event.target.href});
		window.close();

		return false;
	},

	"reset": function () {
		this.page = 1;
		this.collection.reset();
		this.$list.html("");
	}

});
var hottest;
setTimeout(function () {
	hottest = new AppView();
}, 1000);