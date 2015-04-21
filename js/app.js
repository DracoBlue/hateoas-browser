define('app', ['logging', 'jquery', 'bootstrap', 'jsb'], function(logging, jquery, bootstrap, jsb) {
	"use strict";

	var App = function() {
		logging.applyLogging(this, 'App');
		this.logDebug('initialited');
		jsb.applyBehaviour(document.body);
	};

	return new App();
});