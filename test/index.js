/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('../index.js').Options} Options
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import {isHidden} from 'is-hidden'
import {remark} from 'remark'
import remarkFrontmatter from '../index.js'

test('remarkFrontmatter', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('../index.js')).sort(), [
      'default'
    ])
  })

  await t.test('should not throw if not passed options', async function () {
    assert.doesNotThrow(function () {
      remark().use(remarkFrontmatter).freeze()
    })
  })

  await t.test(
    'should throw if not given a preset or a matter',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how invalid input is handled.
        remark().use(remarkFrontmatter, [1]).freeze()
      }, /^Error: Expected matter to be an object, not `1`/)
    }
  )

  await t.test('should throw if given an unknown preset', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how invalid input is handled.
      remark().use(remarkFrontmatter, ['jsonml']).freeze()
    }, /^Error: Missing matter definition for `jsonml`/)
  })

  await t.test(
    'should throw if given a matter without `type`',
    async function () {
      assert.throws(function () {
        remark()
          // @ts-expect-error: check how invalid input is handled.
          .use(remarkFrontmatter, [{marker: '*'}])
          .freeze()
      }, /^Error: Missing `type` in matter `{"marker":"\*"}`/)
    }
  )

  await t.test(
    'should throw if given a matter without `marker`',
    async function () {
      assert.throws(function () {
        remark()
          // @ts-expect-error: check how invalid input is handled.
          .use(remarkFrontmatter, [{type: 'jsonml'}])
          .freeze()
      }, /^Error: Missing `marker` or `fence` in matter `{"type":"jsonml"}`/)
    }
  )
})

test('fixtures', async function (t) {
  const base = new URL('fixtures/', import.meta.url)
  const folders = await fs.readdir(base)

  let index = -1

  while (++index < folders.length) {
    const folder = folders[index]

    if (isHidden(folder)) continue

    await t.test(folder, async function () {
      const folderUrl = new URL(folder + '/', base)
      const inputUrl = new URL('input.md', folderUrl)
      const outputUrl = new URL('output.md', folderUrl)
      const treeUrl = new URL('tree.json', folderUrl)
      const configUrl = new URL('config.json', folderUrl)

      const input = String(await fs.readFile(inputUrl))

      /** @type {Options | undefined} */
      let config
      /** @type {Root} */
      let expected
      /** @type {string} */
      let output

      try {
        config = JSON.parse(String(await fs.readFile(configUrl)))
      } catch {}

      const proc = remark().use(remarkFrontmatter, config)
      const actual = proc.parse(input)

      try {
        output = String(await fs.readFile(outputUrl))
      } catch {
        output = input
      }

      try {
        if ('UPDATE' in process.env) {
          throw new Error('Updating…')
        }

        expected = JSON.parse(String(await fs.readFile(treeUrl)))
      } catch {
        expected = actual

        // New fixture.
        await fs.writeFile(treeUrl, JSON.stringify(actual, undefined, 2) + '\n')
      }

      assert.deepEqual(actual, expected)

      assert.equal(String(await proc.process(input)), String(output))
    })
  }
})
