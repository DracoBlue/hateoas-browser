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

			that.agent = new hateoasClient.HttpAgent(values.url, {}, {
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
							var linkRel = rel;
							var tr = $('<tr><td class="rel"></td><td class="href"></td><td class="title"></td><td><div class="btn-group-vertical actions" role="group"></div></td></tr>');
							tr.find('.rel').text(rawLink.getRel());
							tr.find('.href').text(rawLink.getUrl());
                            tr.find('.title').text(rawLink.getTitle());
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
                                    var button = $('<button class="btn btn-default btn-xs text-uppercase"></button>');
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
                                    tr.find('.actions').append(button);
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

	return Result;
});