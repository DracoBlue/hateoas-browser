# logging.js

Easy lib to trace function calls and write log messages into the `console` object. Requires require.js.

Latest Release: [![GitHub version](https://badge.fury.io/gh/DracoBlue%2Flogging-js.png)](https://github.com/DracoBlue/logging-js/releases)

logging.js is copyright 2014 by DracoBlue <http://dracoblue.net>

## Installation

Copy the `logging.js` into your project or require it with bower:

``` console
$ bower install logging.js
```

## Usage

This is a simple example, how `logging.js` works.

``` javascript
require(['logging'], function(logging) {
    "use strict";

    var Example = function() {
        logging.applyLogging(this, 'Example', ['hideMe']);
    };

    Example.prototype.callOne = function() {
    };

    Example.prototype.callTwo = function() {
        this.logDebug('Hai!');
        this.logError('Oh noes!');
    };

    Example.prototype.hideMe = function() {
    };

    var example = new Example();
    example.callOne('hai'); // => TRACE [Example.callOne] hai
    example.hideMe(); // nothing happens
    example.callTwo(); // => TRACE [Example.callTwo]
                       // => DEBUG [Example] Hai!
                       // => ERROR [Example] Oh noes!
});
```

## `logging.applyLogging(target, loggingPrefix[, disableTracing=false])`

Will enable `this.logDebug`, `this.logInfo`, `this.logWarn`, `this.logError` and `this.logTrace`, for the given target.

Additionally all functions on `target` will be wrapped with a `logTrace` call. Thus you can easily follow the call
flow in the `console` of your browser.

## `logging.applyLogging(target, loggingPrefix, fromTracingExcludedMethods)`

Works like the previous method, but if you pass in an array of function names, which you do not want to trace - those
will be excluded from tracing.

## Changelog

* 1.0.1 (2014/08/31)
  - tracing now with `Example.callTwo` instead of `Example` `callTwo` (for easier filtering)
  - fixed a bug with `fromTracingExcludedMethods`
  - added documentation for the `applyLogging` method
  - wrapped the documentation example into a require js definition
* 1.0.0 (2014/08/31)
  - initial release

## License

logging.js is licensed under the terms of MIT.