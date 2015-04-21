define('logging', [], function()
{
    "use strict";

    /* We need a indexOf Pollyfill */
    [].indexOf||(Array.prototype.indexOf=function(a,b,c){for(c=this.length,b=(c+~~b)%c;b<c&&(!(b in this)||this[b]!==a);b++);return b^c?b:-1;});

    /* We need a console Pollyfill (defaults to no action!) */
    if (typeof(console) === "undefined")
    {
        var empty_function = function()
        {
        };

        console = {};
        console.log = empty_function;
        console.error = empty_function;
        console.info = empty_function;
        console.debug = empty_function;
        console.trace = empty_function;
    }
    else
    {
        /* If we are on an old IE, we cannot output the values with console.METHOD.apply */
        if (typeof console.log === 'object')
        {
            console.trace = function()
            {
                console.log(arguments);
            };
        }
        else
        {
            console.trace = function()
            {
                console.log.apply(this, arguments);
            };
        }
    }

    var logWithPrefix = function(prefix, method, parameters)
    {
        parameters = parameters || [];
        parameters = Array.prototype.slice.apply(parameters);

        parameters.unshift('[' + prefix + ']');

        if (typeof console[method] === "function")
        {
            console[method].apply(console, parameters);
        }
        else
        {
            /* If we are on an old IE, we cannot output the values with console.METHOD.apply */
            console[method](parameters);
        }
    };

    var logging = {};

    logging.logTrace = function()
    {
        if (logging.level >= logging.LEVEL_TRACE)
        {
            logWithPrefix(this.loggingPrefix, 'trace', arguments);
        }
    };

    logging.logDebug = function()
    {
        if (logging.level >= logging.LEVEL_DEBUG)
        {
            logWithPrefix(this.loggingPrefix, 'log', arguments);
        }
    };

    logging.logInfo = function()
    {
        if (logging.level >= logging.LEVEL_INFO)
        {
            logWithPrefix(this.loggingPrefix, 'info', arguments);
        }
    };

    logging.logWarn = function()
    {
        if (logging.level >= logging.LEVEL_WARN)
        {
            logWithPrefix(this.loggingPrefix, 'info', arguments);
        }
    };

    logging.logError = function()
    {
        if (logging.level >= logging.LEVEL_ERROR)
        {
            logWithPrefix(this.loggingPrefix, 'error', arguments);
        }
    };

    logging.applyLogging = function(target, loggingPrefix, fromTracingExcludedMethods)
    {
        var methods = ['logDebug', 'logTrace', 'logError', 'logInfo', 'LogWarn'];
        var methods_length = methods.length;
        var disableTracing = false;

        if (typeof fromTracingExcludedMethods !== "undefined" && fromTracingExcludedMethods === false)
        {
            disableTracing = true;
        }

        fromTracingExcludedMethods = fromTracingExcludedMethods || ['logDebug', 'logTrace', 'logError', 'logInfo', 'LogWarn'];

        target.loggingPrefix = loggingPrefix;

        if (!disableTracing)
        {
            for (var key in target)
            {
                if (typeof target[key] === 'function')
                {
                    if (fromTracingExcludedMethods.indexOf(key) < 0)
                    {
                        (function(functionName) {
                            var originalFunction = target[functionName];
                            target[functionName] = function() {
                                logWithPrefix(target.loggingPrefix + '.' + functionName, 'trace', arguments);
                                return originalFunction.apply(target, arguments);
                            };
                        })(key);
                    }
                }
            }
        }

        for (var i = 0; i < methods_length; i++)
        {
            target[methods[i]] = target[methods[i]] || logging[methods[i]];
        }
    };

    logging.setLevel = function(level)
    {
        logging.level = level;
    };

    logging.LEVEL_ALL = 127;
    logging.LEVEL_TRACE = 6;
    logging.LEVEL_LOG = 5;
    logging.LEVEL_DEBUG = 5;
    logging.LEVEL_INFO = 4;
    logging.LEVEL_WARN = 3;
    logging.LEVEL_ERROR = 2;
    logging.LEVEL_FATAL = 1;
    logging.LEVEL_OFF = 0;

    logging.level = logging.LEVEL_ALL;

    return logging;
});
