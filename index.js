import {frontmatter} from 'micromark-extension-frontmatter'
import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown
} from 'mdast-util-frontmatter'

export default function remarkFrontmatter(options) {
  var data = this.data()
  add('micromarkExtensions', frontmatter(options))
  add('fromMarkdownExtensions', frontmatterFromMarkdown(options))
  add('toMarkdownExtensions', frontmatterToMarkdown(options))
  function add(field, value) {
    /* istanbul ignore if - other extensions. */
    if (data[field]) data[field].push(value)
    else data[field] = [value]
  }
}
