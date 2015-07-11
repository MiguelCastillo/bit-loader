var _only;
var _loggers = {};


/**
 * @class
 * Logger instance with a name
 *
 * @param {string} name - Name of the logger
 */
function Logger(name, options) {
  options = options || {};
  this._enabled  = false;
  this.name      = name;

  this._stream = configureStream(options);
  this._serializer = configureSerializer(options);

  // Cache it so that we can find it.
  _loggers[name] = this;
}


/**
 * Helper factory method to create named loggers
 *
 * @returns {Logger} New logger instance
 */
Logger.prototype.create = function(name, options) {
  if (_loggers[name]) {
    return _loggers[name];
  }

  return new Logger(name, options);
};


/**
 * Method to find a logger instance by name.
 *
 * @param {string} name - Name of the logger to find
 *
 * @returns {Logger}
 */
Logger.prototype.find = function(name) {
  return _loggers[name];
};


/**
 * Method to replace the current stream with a new one.
 *
 * @param {Stream} stream - Stream to write data to
 *
 * @returns {Stream} stream passed in
 */
Logger.prototype.pipe = function(stream) {
  if (stream !== this._stream) {
    this._stream = stream;
  }

  return stream;
};


/**
 * Method that returns the correct stream to log to.
 *
 * @param {Stream} stream - If provider, then stream is set as the stream
 *  for the logger instance. Otherwise, the current stream is returned.
 *
 * @returns {Stream}
 */
Logger.prototype.stream = function(stream) {
  if (arguments.length === 1) {
    this._stream = stream;
    return stream;
  }

  return this._stream || _global._stream;
};


/**
 * Method that returns the correct serializer for transforming
 * before it is logged.
 *
 * @returns {function} Serializer function to process log data
 */
Logger.prototype.serialize = function(data) {
 return (this._serializer || _global.serializer)(data);
};


/**
 * Method to log a message.
 *
 * Verifies that logger is enabled. If it is enabled, then the message(s) are
 * logged. Otherwise ignored.
 */
Logger.prototype.log = function() {
  if (this.isEnabled()) {
    var data = logPayload(this.name, "log", arguments);
    this.stream().write(this.serialize(data));
  }

  return this;
};


/**
 * Method to log errors.
 *
 * Verifies that the logger is enabled. If it is enabled, then the error(s)
 * are logged.  Otherwise ignored.
 */
Logger.prototype.error = function() {
  if (this.isEnabled()) {
    var data = logPayload(this.name, "error", arguments);
    this.stream().write(this.serialize(data));
  }

  return this;
};


/**
 * Method to log warnings.
 *
 * Verifies that the logger is enabled. If it is enabled, then the warnings(s)
 * are logged.  Otherwise ignored.
 */
Logger.prototype.warn = function() {
  if (this.isEnabled()) {
    var data = logPayload(this.name, "warn", arguments);
    this.stream().write(this.serialize(data));
  }

  return this;
};


/**
 * Method to log informational message.
 *
 * Verifies that the logger is enabled. If it is enabled, then the info(s)
 * are logged.  Otherwise ignored.
 */
Logger.prototype.info = function() {
  if (this.isEnabled()) {
    var data = logPayload(this.name, "info", arguments);
    this.stream().write(this.serialize(data));
  }

  return this;
};


/**
 * Checks if the logger can write messages.
 *
 * @returns {boolean}
 */
Logger.prototype.isEnabled = function() {
  return (_global._enabled || this._enabled) && (!_only || _only === this.name);
};


/**
 * Method to enable the logger intance. If loggers have been disabled
 * globally then this flag will not have an immediate effect, until
 * loggers are globally enabled.
 */
Logger.prototype.enable = function() {
  this._enabled = true;
  return this;
};


/**
 * Method to disable the logger instance. Like {@link Logger#enable},
 * this setting does not have an immediate effect if loggers are globally
 * disabled.
 */
Logger.prototype.disable = function() {
  this._enabled = false;
  return this;
};


/**
 * Method to make sure only this logger logs messages. If another logger is
 * set to only, then the request is silently ignored.
 */
Logger.prototype.only = function() {
  if (!_only) {
    _only = this.name;
  }
  return this;
};


/**
 * Method to remove the logger from the `only` state to allow other loggers
 * set themselves as only.
 */
Logger.prototype.all = function() {
  _only = null;
  return this;
};


/**
 * Disables loggers globally.
 */
Logger.prototype.disableAll = function() {
  _global._enabled = false;
  return this;
};


/**
 * Enables loggers globally.
 */
Logger.prototype.enableAll = function() {
  _global._enabled = true;
  return this;
};


/**
 * Function that create a JSON structure to be logged
 *
 * @param {string} name - Name of the logger
 * @param {string} type - Type of logger. E.g. log, warn, error
 * @param {object} data - application data to be logged
 *
 * @returns {{date: Date, type: string, name: string, data: object}}
 *  Meta data to be logged
 */
function logPayload(name, type, data) {
  return {
    date: getDate(),
    type: type,
    name: name,
    data: data
  };
}


/**
 * Noop function
 */
function noop(data) {
  return data;
}


/**
 * Returns a valid console interface with three methods:
 *
 * @returns {{write: function}}
 */
function getConsoleStream() {
  var result;
  if (typeof(console) !== "undefined") {
    result = console;
  }

  return result && {
    write: function(data) {
      result.log(data);
    },
    pipe: function(stream) {
      return stream;
    }
  };
}


/**
 * Gets defaul process.stdout when running in node.
 */
function getProcessStream() {
  var result;
  if (typeof(process) !== "undefined" && process.stdout) {
    result = process.stdout;
  }

  return result;
}


/**
 * Get a noop stream
 */
function getNoopStream() {
  return {
    write: noop
  };
}


/**
 * Method that fills in the target object to make sure we have a valid target
 * we are writing to.
 */
function configureStream(options) {
  return options && options.stream;
}


/**
 * Handler custom serializers
 */
function configureSerializer(options) {
  if (options && options.serialize) {
    return options.serialize;
  }
  else if (typeof(process) !== "undefined" && process.stdout) {
    return function(data) {
      if (typeof(data) !== "string") {
        data = JSON.stringify(data);
      }
      return data + "\n";
    };
  }
  else {
    return noop;
  }
}


/**
 * Helper method to get timestamps for logged message
 *
 * @private
 */
function getDate() {
  return (new Date()).getTime();
}


/**
 * Default logger instance available
 */
var _global = new Logger("global", {
  stream: getProcessStream() || getConsoleStream() || getNoopStream(),
  serializer: configureSerializer()
});


module.exports = Logger.prototype.default = _global;
