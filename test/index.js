/**
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('mdast').Root} Root
 * @typedef {import('../index.js').Options} Options
 */

import fs from 'node:fs'
import path from 'node:path'
import test from 'tape'
import {readSync, writeSync} from 'to-vfile'
import {unified} from 'unified'
import {remark} from 'remark'
import {isHidden} from 'is-hidden'
import remarkFrontmatter from '../index.js'

test('remarkFrontmatter', (t) => {
  t.doesNotThrow(() => {
    remark().use(remarkFrontmatter).freeze()
  }, 'should not throw if not passed options')

  t.doesNotThrow(() => {
    unified().use(remarkFrontmatter).freeze()
  }, 'should not throw if without parser or compiler')

  t.throws(
    () => {
      // @ts-expect-error: invalid input.
      unified().use(remarkFrontmatter, [1]).freeze()
    },
    /^Error: Expected matter to be an object, not `1`/,
    'should throw if not given a preset or a matter'
  )

  t.throws(
    () => {
      // @ts-expect-error: invalid input.
      unified().use(remarkFrontmatter, ['jsonml']).freeze()
    },
    /^Error: Missing matter definition for `jsonml`/,
    'should throw if given an unknown preset'
  )

  t.throws(
    () => {
      unified()
        // @ts-expect-error: invalid input.
        .use(remarkFrontmatter, [{marker: '*'}])
        .freeze()
    },
    /^Error: Missing `type` in matter `{"marker":"\*"}`/,
    'should throw if given a matter without `type`'
  )

  t.throws(
    () => {
      unified()
        // @ts-expect-error: invalid input.
        .use(remarkFrontmatter, [{type: 'jsonml'}])
        .freeze()
    },
    /^Error: Missing `marker` or `fence` in matter `{"type":"jsonml"}`/,
    'should throw if given a matter without `marker`'
  )

  t.end()
})

test('fixtures', (t) => {
  const base = path.join('test', 'fixtures')
  const entries = fs.readdirSync(base).filter((d) => !isHidden(d))
  let index = -1

  t.plan(entries.length)

  while (++index < entries.length) {
    const fixture = entries[index]
    t.test(fixture, (st) => {
      const input = readSync(path.join(base, fixture, 'input.md'))
      const treePath = path.join(base, fixture, 'tree.json')
      const outputPath = path.join(base, fixture, 'output.md')
      /** @type {VFile} */
      let output
      /** @type {Root} */
      let expected
      /** @type {Options|undefined} */
      let config

      try {
        config = JSON.parse(
          String(readSync(path.join(base, fixture, 'config.json')))
        )
      } catch {}

      const proc = remark().use(remarkFrontmatter, config)
      const actual = proc.parse(input)

      try {
        output = readSync(outputPath)
      } catch {
        output = input
      }

      try {
        expected = JSON.parse(String(readSync(treePath)))
      } catch {
        // New fixture.
        writeSync({
          path: treePath,
          value: JSON.stringify(actual, null, 2) + '\n'
        })
        expected = actual
      }

      st.deepEqual(actual, expected, 'tree')
      st.equal(String(proc.processSync(input)), String(output), 'process')
      st.end()
    })
  }
})
