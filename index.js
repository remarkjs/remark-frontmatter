/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('micromark-extension-frontmatter').Options} Options
 */

import {frontmatter} from 'micromark-extension-frontmatter'
import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown
} from 'mdast-util-frontmatter'

/**
 * Plugin to add support for frontmatter.
 *
 * @this {import('unified').Processor}
 * @type {import('unified').Plugin<[Options?]|void[], Root>}
 */
export default function remarkFrontmatter(options = 'yaml') {
  const data = this.data()

  add('micromarkExtensions', frontmatter(options))
  add('fromMarkdownExtensions', frontmatterFromMarkdown(options))
  add('toMarkdownExtensions', frontmatterToMarkdown(options))

  /**
   * @param {string} field
   * @param {unknown} value
   */
  function add(field, value) {
    // Other extensions
    // @ts-expect-error: to do: remove when remark is released.
    let list = /** @type {unknown[]} */ (data[field])
    if (!list) {
      list = []
      // @ts-expect-error: to do: remove when remark is released.
      data[field] = list
    }

    list.push(value)
  }
}
