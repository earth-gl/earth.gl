
const isObject = require('./isObject');
const isFunction = require('./isFunction');
const hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
const nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

const collectNonEnumProps = function(obj, keys) {
  var nonEnumIdx = nonEnumerableProps.length;
  var constructor = obj.constructor;
  var proto = isFunction(constructor) && constructor.prototype || ObjProto;
  var prop = 'constructor';
  if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);
  while (nonEnumIdx--) {
    prop = nonEnumerableProps[nonEnumIdx];
    if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
      keys.push(prop);
    }
  }
};


const assignKeys = function (obj) {
  if (!isObject(obj)) return [];
  if (Object.keys) return Object.keys(obj);
  var keys = [];
  for (var key in obj) if (has(obj, key)) keys.push(key);
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}
/**
 * max intger length
 */
const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
const shallowProperty = function (key) {
  return function (obj) {
    return obj == null ? void 0 : obj[key];
  };
};
/**
 * 
 */
const getLength = shallowProperty('length');
/**
 * 
 */
const isArrayLike = function (collection) {
  const length = getLength(collection);
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};
/**
 * 
 * @param {*} func 
 * @param {*} context 
 * @param {*} argCount 
 */
const optimizeCb = function (func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1: return function (value) {
      return func.call(context, value);
    };
    case 3: return function (value, index, collection) {
      return func.call(context, value, index, collection);
    };
    case 4: return function (accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection);
    };
  }
  return function () {
    return func.apply(context, arguments);
  };
};
/**
 * reference:https://underscorejs.org/docs/underscore.html
 * @param {Object} obj 
 * @param {Function} iteratee 
 * @param {Object} context 
 */
const forEach = function (obj, iteratee, context) {
  iteratee = optimizeCb(iteratee, context);
  var i, length;
  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i, obj);
    }
  } else {
    var keys = assignKeys(obj);
    for (i = 0, length = keys.length; i < length; i++) {
      iteratee(obj[keys[i]], keys[i], obj);
    }
  }
  return obj;
}

module.exports = forEach;