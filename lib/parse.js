'use strict';

module.exports = create;

function create(matter) {
  var name = matter.type + 'FrontMatter';
  var marker = matter.marker;
  var fence = marker + marker + marker;
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

    if (
      value.charAt(0) !== marker ||
      value.charAt(1) !== marker ||
      value.charAt(2) !== marker ||
      value.charAt(3) !== newline
    ) {
      return;
    }

    subvalue = fence + newline;
    content = '';
    queue = '';
    index = 3;
    length = value.length;

    while (++index < length) {
      character = value.charAt(index);

      if (
        character === marker &&
        (queue || !content) &&
        value.charAt(index + 1) === marker &&
        value.charAt(index + 2) === marker
      ) {
        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true;
        }

        subvalue += queue + fence;

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
