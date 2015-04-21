requirejs({
	"baseUrl": "./js/",
	"noGlobal": true,
	"urlArgs": "cb=" + (new Date()).getTime(),
	"paths": {
		"logging": "./../bower_components/logging.js/logging",
		"jquery": "./../bower_components/jquery/dist/jquery.min",
		"bootstrap": "./../bower_components/bootstrap/dist/js/bootstrap.min",
		"hateoas-client-js": "./../bower_components/hateoas-client/hateoas-client",
		"jsb": "./../bower_components/jsb/jsb"
	},
	"shim": {
		"bootstrap": {
			"deps": ["jquery"]
		}
	},
	"include": [
		'app'
	]
})
