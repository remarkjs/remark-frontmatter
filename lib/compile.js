'use strict';

var helpers = require('./helpers');

module.exports = create;

function create(matter) {
  var type = matter.type;
  var openingFence = helpers.getFence(matter, 'open');
  var closingFence = helpers.getFence(matter, 'close');

  frontmatter.displayName = type + 'FrontMatter';

  return [type, frontmatter];

  function frontmatter(node) {
    return openingFence + (node.value ? '\n' + node.value : '') + '\n' + closingFence;
  }
}
