import syntax from 'micromark-extension-frontmatter'
import fromMarkdown from 'mdast-util-frontmatter/from-markdown.js'
import toMarkdown from 'mdast-util-frontmatter/to-markdown.js'

export default function remarkFrontmatter(options) {
  var data = this.data()
  add('micromarkExtensions', syntax(options))
  add('fromMarkdownExtensions', fromMarkdown(options))
  add('toMarkdownExtensions', toMarkdown(options))
  function add(field, value) {
    /* istanbul ignore if - other extensions. */
    if (data[field]) data[field].push(value)
    else data[field] = [value]
  }
}
