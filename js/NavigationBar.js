define('NavigationBar', ['logging', 'jquery', 'jsb'], function(logging, $, jsb) {
	"use strict";

	var NavigationBar = function(domElement, options) {
		var that = this;
		this.domElement = $(domElement);

		logging.applyLogging(this, 'NavigationBar');

        that.writeQueryStringIntoFields();

        that.domElement.find('select[name=method]').on('change', function() {
            if (that.isMethodsWithoutBody(that.domElement.find('select[name=method]').val()))
            {
                that.domElement.find('.body-area').hide();
            }
            else
            {
                that.domElement.find('.body-area').show();
            }
        });

        that.domElement.on('submit', function(event) {
            if (window.history)
            {
                window.history.pushState(null, null, window.document.location.pathname + '?' + that.domElement.serialize());
                that.submitRequest();
                event.preventDefault();
            }
        });

        window.addEventListener("popstate", function(e) {
            that.writeQueryStringIntoFields();

            if (that.isMethodWithoutBody(that.domElement.find('select[name=method]').val())) {
                that.domElement.find('.body-area').hide();
                that.submitRequest();
            }
            else {
                that.domElement.find('.body-area').show();
                that.domElement.find('textarea[name=body]').focus();
                $('html, body').scrollTop(0);
            }
        });

        jsb.whenFired('NavigationBar::TRIGGER_REQUEST', function(values) {
            that.domElement.find('select[name=method]').val(values.method);
            that.domElement.find('input[name=q]').val(values.url);
            that.domElement.find('textarea[name=body]').val('');

            if (that.isMethodWithoutBody(values.method)) {
                that.domElement.find('.body-area').hide();
                that.domElement.submit();
            }
            else {
                that.domElement.find('.body-area').show();
                that.domElement.find('textarea[name=body]').focus();
                $('html, body').scrollTop(0);
            }
        });

        if (this.getUrl())
        {
            that.domElement.find('textarea[name=headers]').val(JSON.stringify(this.parseHeadersStringToObject(that.domElement.find('textarea[name=headers]').val()), null, 2));
            that.submitRequest();
        }
    };

    NavigationBar.prototype.isMethodWithoutBody = function(method) {
        var methodsWithoutBody = ["get", "head", "options", "delete"];

        return methodsWithoutBody.indexOf(method) == -1 ? false : true;

    };

    NavigationBar.prototype.writeQueryStringIntoFields = function() {
        var that = this;
        that.domElement.find('select[name=method]').val(this.getQueryParameter('method', this.domElement.find('select[name=method]').val()));
        that.domElement.find('input[name=q]').val(this.getQueryParameter('q', this.domElement.find('input[name=q]').val()));
        that.domElement.find('textarea[name=body]').val(this.getQueryParameter('body', this.domElement.find('textarea[name=body]').val()));
        that.domElement.find('textarea[name=headers]').val(this.getQueryParameter('headers', this.domElement.find('textarea[name=headers]').val()));


        if (this.isMethodWithoutBody(that.domElement.find('select[name=method]').val()))
        {
            that.domElement.find('.body-area').hide();
        }
        else
        {
            that.domElement.find('.body-area').show();
        }
    };

    NavigationBar.prototype.getUrl = function()
    {
        return this.domElement.find('input[name=q]').val();
    };

    NavigationBar.prototype.submitRequest = function()
    {
        var that = this;

        jsb.fireEvent('NavigationBar::SUBMIT_REQUEST', {
            "method": that.domElement.find('select[name=method]').val(),
            "url": that.domElement.find('input[name=q]').val(),
            "body": that.domElement.find('textarea[name=body]').val(),
            "headers": this.parseHeadersStringToObject(that.domElement.find('textarea[name=headers]').val())
        });
    };

    NavigationBar.prototype.getQueryParameter = function(name, defaultValue)
    {
        var query = window.location.search.substring(1);

        var vars = query.replace(/\+/g, ' ').split("&");

        for (var i=0; i<vars.length; i++) {
            var pair = vars[i].split("=");
            if(decodeURIComponent(pair[0]) == name) {
                pair.shift();
                return decodeURIComponent(pair.join("="));
            }
        }

        return (defaultValue || '');
    };

    NavigationBar.prototype.parseHeadersStringToObject = function(headersString)
    {
        try {
            return JSON.parse(headersString);
        } catch (error) {
        }

        var headers = {};
        var extractHeadersRegExp = /^([^:]+):\s+(.+)$/mg;
        var match;

        while ((match = extractHeadersRegExp.exec(headersString)) !== null) {
            headers[match[1].trim()] = match[2].trim();
        }

        return headers;
    }

	return NavigationBar;
});