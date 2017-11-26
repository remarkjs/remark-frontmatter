'use strict';

var helpers = require('./helpers');

module.exports = create;

function create(matter) {
  var name = matter.type + 'FrontMatter';
  var openingFence = helpers.getFence(matter, 'open');
  var closingFence = helpers.getFence(matter, 'close');
  var newline = '\n';

  frontmatter.displayName = name;
  frontmatter.onlyAtStart = true;

  return [name, frontmatter];

  function frontmatter(eat, value, silent) {
    var subvalue;
    var content;
    var index;
    var length;
    var character;
    var queue;
    var i;
    var len;
    var isClosingSequence;

    for (i = 0, len = openingFence.length; i < len; i++) {
      if (
        value.charAt(i) !== openingFence.charAt(i) &&
        value.charAt(len) !== newline
      ) {
        return;
      }
    }

    subvalue = openingFence + newline;
    content = '';
    queue = '';
    index = openingFence.length;
    length = value.length;

    while (++index < length) {
      character = value.charAt(index);
      isClosingSequence = true;

      for (i = 0, len = closingFence.length; i < len; i++) {
        isClosingSequence = isClosingSequence &&
          value.charAt(index + i) === closingFence.charAt(i);
      }

      if (
        (queue || !content) &&
        isClosingSequence
      ) {
        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true;
        }

        subvalue += queue + closingFence;

        return eat(subvalue)({type: matter.type, value: content});
      }

      if (character === newline) {
        queue += character;
      } else {
        subvalue += queue + character;
        content += queue + character;
        queue = '';
      }
    }
  }
}
