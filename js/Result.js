define('Result', ['logging', 'jquery', 'jsb', 'hateoas-client-js'], function(logging, $, jsb, hateoasClient) {
	"use strict";

	var Result = function(domElement, options) {
		var that = this;
		this.domElement = $(domElement);


		logging.applyLogging(this, 'Result');


		jsb.whenFired('NavigationBar::SUBMIT_REQUEST', function(values) {
            that.domElement.find('.status').text('Requesting ...');
            that.domElement.find('.content').hide();
			that.logDebug('Result', values);

            that.domElement.find('.links-tbody').empty();


            var ajaxOptions = {
                xhrFields: {
                    withCredentials: true
                },
                processData: true
            };

            if (values.body) {
                try
                {
                    JSON.parse(values.body);
                    ajaxOptions.contentType = "application/json; charset=UTF-8";
                    ajaxOptions.processData = false;
                } catch (error)
                {
                    ajaxOptions.processData = true;
                }
            }

			that.agent = new hateoasClient.HttpAgent(values.url, values.headers, {
                ajaxOptions: ajaxOptions
            });
			that.agent.call(function(response) {
				that.logDebug('response', response);
				that.logDebug('links', response.getLinks());
				that.logDebug('value', response.getValue());
                var statusText = response.isOk() ? 'OK' : "NOT OK";
                that.domElement.find('.status').text(statusText + (response && (' (' + response.getStatusCode() + ')')));
                that.domElement.find('.content').fadeIn('fast');

				var links = response.getLinks();

				for (var rel in links) {
					if (links.hasOwnProperty(rel)) {
						links[rel].forEach(function(rawLink) {
                            console.log(rawLink.getBaseUrl(), 'LINK', rawLink.getUrl());
							var linkRel = rel;
							var tr = $('<tr><td class="rel"></td><td class="title"></td><td class="get-actions"></td><td class="post-actions"></td><td><div class="btn-group-vertical other-actions"></div></td><td class="docs"></td></tr>');

                            tr.find('.rel').text(that.getRelativeUrlWithDotsPrefix(rawLink.getRel(), rawLink.getBaseUrl()));
                            tr.find('.title').text(rawLink.getTitle());

                            if (rawLink.getRel().substr(0, 4) == 'http') {
                                var docsLink = $('<a class="btn btn-default" href="" />');
                                docsLink.attr('href', rawLink.getRel());
                                docsLink.html('<span class="glyphicon glyphicon-book"></span>');
                                tr.find('.docs').append(docsLink);
                            }

                            jQuery.ajax({
								url: rawLink.url,
								crossDomain: true,
								dataType: 'plain',
								method: 'OPTIONS'
							}).complete(function(response) {
								that.logDebug('res', arguments);
                                var allowHeader = (response.getResponseHeader('Allow') || '').toLowerCase();
                                var allowedMethods = ['get', 'post', 'delete', 'patch', 'put', 'head', 'options'];
                                if (allowHeader) {
                                    allowedMethods = allowHeader.split(',');
                                }
                                allowedMethods.forEach(function(method) {
                                    var button = $('<button class="btn btn-default text-uppercase"></button>');
                                    button.attr('title', method + ': ' + that.getRelativeUrlWithDotsPrefix(rawLink.getUrl(), rawLink.getBaseUrl()));
                                    if (method == 'delete') {
                                        button.addClass('btn-danger');
                                    }
                                    if (method == 'options' || method == 'head') {
                                        button.addClass('btn-info');
                                    }
                                    if (method == 'get') {
                                        button.addClass('btn-primary');
                                    }
                                    button.text(method);
                                    button.on('click', function(event) {
                                        event.preventDefault();
                                        jsb.fireEvent('NavigationBar::TRIGGER_REQUEST', {
                                            "method": method,
                                            "url": rawLink.url
                                        });
                                    });
                                    if (method == 'get') {
                                        button.addClass('btn-sm');
                                        tr.find('.get-actions').append(button);
                                    } else if (method == 'post') {
                                        button.addClass('btn-sm');
                                            tr.find('.post-actions').append(button);
                                    } else {
                                        button.addClass('btn-xs');
                                        tr.find('.other-actions').append(button);
                                    }
                                });
                                that.domElement.find('.links-tbody').append(tr);
							});

						});
					}
				}

				that.domElement.find('.value').text(JSON.stringify(response.getValue(), null, '  '));
                that.domElement.find('.response-headers').text(JSON.stringify(response.getAllHeaders(), null, 2));
			}, values.method.toUpperCase(), values.body);
		});

	};

    Result.prototype.getRelativeUrlWithDotsPrefix = function(absoluteUrl, urlBasePath) {
        if (absoluteUrl.substr(0, urlBasePath.length) == urlBasePath)
        {
            return '…' + absoluteUrl.substr(urlBasePath.length);
        }
        return absoluteUrl;
    };

	return Result;
});