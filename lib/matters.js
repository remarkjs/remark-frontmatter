'use strict';

var fault = require('fault');

module.exports = matters;

var own = {}.hasOwnProperty;

var markers = {
  yaml: '-',
  toml: '+'
};

function matters(options) {
  var results = [];
  var length = options.length;
  var index = -1;

  while (++index < length) {
    results[index] = matter(options[index]);
  }

  return results;
}

function matter(option) {
  var result = option;

  if (typeof result === 'string') {
    if (!own.call(markers, result)) {
      throw fault('Missing matter definition for `%s`', result);
    }

    result = {type: result, marker: markers[result]};
  } else if (typeof result !== 'object') {
    throw fault('Expected matter to be an object, not `%j`', result);
  }

  if (!own.call(result, 'type')) {
    throw fault('Missing `type` in matter `%j`', result);
  }

  if (!own.call(result, 'marker')) {
    throw fault('Missing `marker` in matter `%j`', result);
  }

  return result;
}
