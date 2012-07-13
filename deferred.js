/**
 * Create a deferred object.
 *
 * The default events are 'done', 'fail' and 'always'.
 *
 * Once an instance has been resolved or rejected, it can't be resolved or rejected again.
 * However, adding a 'fail' callback to a rejected object will result in the function being called immediately with the expected arguments.
 * The same goes for 'done' with a resolved object and 'always' for either.
 *
 * Returning any kind of value (null included) from a callback will cause that value to be passed as the first argument to subsequent callbacks.
 *
 * @example
 * // To add an event callback, pass the function to the event method:
 * deferredObject[eventName](callbackFunction);
 * // An array of callback functions can also be passed.
 *
 * @example
 * // To resolve or reject a deferred object, call resolveWith or rejectWith:
 * deferredObject.resolveWith(thisArg[, arg1[, arg2..]]);
 *
 * @fileOverview
 * @author Matthew Caruana Galizia
 */

'use strict';

/*jshint node:true */

var


/**
 * Pending state.
 *
 * @private
 * @constant
 * @type number
 */
PENDING = 1,


/**
 * Resolved state.
 *
 * @private
 * @constant
 * @type number
 */
RESOLVED = 2,


/**
 * Rejected state.
 *
 * @private
 * @constant
 * @type number
 */
REJECTED = 3,


/**
 * Alias for Array#slice.
 *
 * @private
 * @type function
 */
slice = Array.prototype.slice,


/**
 * Call all the functions in a list.
 *
 * @private
 * @param {function|function[]} list List of callbacks
 * @param {Object} context Object for 'this' inside callbacks
 * @param {Array} args Arguments array
 */
call = function(list, context, args) {
	var i, l, newArg;

	if (typeof list === 'function') {
		newArg = list.apply(context, args);

		if (typeof newArg !== 'undefined') {
			args[0] = newArg;
		}

	} else if (Array.isArray(list)) {
		for (i = 0, l = list.length; i < l; i++) {
			call(list[i], context, args);
		}
	}
};


/**
 * Deferred object constructor.
 *
 * @constructor
 */
function Deferred() {
	this.state   = PENDING;
	this.context = null;
	this.args    = null;
	this.events  = {
		done: [],
		fail: [],
		always: []
	};
}


/**
 * Register a callback that will be fired when the process is resolved.
 *
 * @param {function|function[]} cb
 * @returns {Deferred}
 */
Deferred.prototype.done = function(cb) {

	// Fire the event straight away if resolved
	if (this.state === RESOLVED) {
		call(cb, this.context, this.args);
	} else if (this.state === PENDING) {
		this.events.done.push(cb);
	}

	return this;
};


/**
 * Register a callback that will be fired when the process fails.
 *
 * @param {function|function[]|Deferred} cb
 * @returns {Deferred}
 */
Deferred.prototype.fail = function(cb) {

	// Fire the event straight away if rejected
	if (this.state === REJECTED) {
		call(cb, this.context, this.args);
	} else if (this.state === PENDING) {
		this.events.fail.push(cb);
	}

	return this;
};


/**
 * Register a callback that will be fired whatever the result.
 *
 * @param {function|function[]} cb
 * @returns {Deferred}
 */
Deferred.prototype.always = function(cb) {

	// Fire the event straight away if not pending
	if (this.state !== PENDING) {
		call(cb, this.context, this.args);
	} else {
		this.events.always.push(cb);
	}

	return this;
};


/**
 * Resolve the deferred object and fire all the done and always callbacks, in that order.
 * All arguments are passed to the callbacks.
 *
 * @param {...*} args Variable number of arguments
 * @returns {Deferred}
 */
Deferred.prototype.resolve = function() {
	var done, always;

	if (this.state === PENDING) {
		this.state = RESOLVED;
		this.args  = arguments;

		done   = this.events.done;
		always = this.events.always;

		// Purge all callbacks
		this.events = null;

		call(done, this.context, this.args);
		call(always, this.context, this.args);
	}

	return this;
};


/**
 * Alias for Deferred#resolve, but with the first argument used as the callback context (this).
 *
 * @param {Object} context Context for the callbacks
 * @param {...*} args Variable number of arguments
 * @returns {Deferred}
 */
Deferred.prototype.resolveWith = function(context) {
	if (this.state === PENDING) {
		this.context = context;
		this.resolve.apply(this, slice.call(arguments, 1));
	}

	return this;
};


/**
 * Register a callback that will be fired when the process is rejected.
 * All arguments are passed to the callbacks.
 *
 * @param {...*} args Variable number of arguments
 * @returns {Deferred}
 */
Deferred.prototype.rejectWith = function() {
	var fail, always;

	if (this.state === PENDING) {
		this.state = REJECTED;
		this.args  = arguments;

		fail   = this.events.fail;
		always = this.events.always;

		// Purge all callbacks
		this.events = null;

		call(fail, this.context, this.args);
		call(always, this.context, this.args);
	}

	return this;
};


/**
 * Alias for Deferred#reject, but with the first argument used as the callback context (this).
 *
 * @param {Object} context Context for the callbacks
 * @param {...*} args Variable number of arguments
 * @returns {Deferred}
 */
Deferred.prototype.reject = function(context) {
	if (this.state === PENDING) {
		this.context = context;
		this.reject.apply(this, slice.call(arguments, 1));
	}

	return this;
};


/**
 * Pending state constant.
 *
 * @constant
 * @type number
 */
Deferred.PENDING = PENDING;


/**
 * Resolved state constant.
 *
 * @constant
 * @type number
 */
Deferred.RESOLVED = RESOLVED;


/**
 * Rejected state constant.
 *
 * @constant
 * @type number
 */
Deferred.REJECTED = REJECTED;

module.exports = Deferred;
