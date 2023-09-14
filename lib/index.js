/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('micromark-extension-frontmatter').Options} Options
 * @typedef {import('unified').Processor<Root>} Processor
 */

import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown
} from 'mdast-util-frontmatter'
import {frontmatter} from 'micromark-extension-frontmatter'

/** @type {Options} */
const emptyOptions = 'yaml'

/**
 * Add support for frontmatter.
 *
 * @param {Options | null | undefined} [options='yaml']
 *   Configuration (default: `'yaml'`).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkFrontmatter(options) {
  // @ts-expect-error: TS is wrong about `this`.
  // eslint-disable-next-line unicorn/no-this-assignment
  const self = /** @type {Processor} */ (this)
  const settings = options || emptyOptions
  const data = self.data()

  add('micromarkExtensions', frontmatter(settings))
  add('fromMarkdownExtensions', frontmatterFromMarkdown(settings))
  add('toMarkdownExtensions', frontmatterToMarkdown(settings))

  /**
   * @param {string} field
   * @param {unknown} value
   */
  function add(field, value) {
    // Other extensions
    // @ts-expect-error: to do: remove when remark is released.
    let list = /** @type {Array<unknown>} */ (data[field])
    if (!list) {
      list = []
      // @ts-expect-error: to do: remove when remark is released.
      data[field] = list
    }

    list.push(value)
  }
}
