'use strict';

module.exports = create;

function create(matter) {
  var type = matter.type;
  var marker = matter.marker;
  var fence = marker + marker + marker;

  frontmatter.displayName = type + 'FrontMatter';

  return [type, frontmatter];

  function frontmatter(node) {
    return fence + (node.value ? '\n' + node.value : '') + '\n' + fence;
  }
}
