import fs from 'fs'
import path from 'path'
import test from 'tape'
import {readSync} from 'to-vfile'
import {unified} from 'unified'
import {remark} from 'remark'
import {isHidden} from 'is-hidden'
import remarkFrontmatter from '../index.js'

const join = path.join
const read = fs.readFileSync
const write = fs.writeFileSync
const dir = fs.readdirSync

test('remarkFrontmatter', (t) => {
  t.doesNotThrow(() => {
    remark().use(remarkFrontmatter).freeze()
  }, 'should not throw if not passed options')

  t.doesNotThrow(() => {
    unified().use(remarkFrontmatter).freeze()
  }, 'should not throw if without parser or compiler')

  t.throws(
    () => {
      unified().use(remarkFrontmatter, [1]).freeze()
    },
    /^Error: Expected matter to be an object, not `1`/,
    'should throw if not given a preset or a matter'
  )

  t.throws(
    () => {
      unified().use(remarkFrontmatter, ['jsonml']).freeze()
    },
    /^Error: Missing matter definition for `jsonml`/,
    'should throw if given an unknown preset'
  )

  t.throws(
    () => {
      unified()
        .use(remarkFrontmatter, [{marker: '*'}])
        .freeze()
    },
    /^Error: Missing `type` in matter `{"marker":"\*"}`/,
    'should throw if given a matter without `type`'
  )

  t.throws(
    () => {
      unified()
        .use(remarkFrontmatter, [{type: 'jsonml'}])
        .freeze()
    },
    /^Error: Missing `marker` or `fence` in matter `{"type":"jsonml"}`/,
    'should throw if given a matter without `marker`'
  )

  t.end()
})

test('fixtures', (t) => {
  const base = join('test', 'fixtures')
  const entries = dir(base).filter((d) => !isHidden(d))
  let index = -1

  t.plan(entries.length)

  while (++index < entries.length) {
    const fixture = entries[index]
    t.test(fixture, (st) => {
      const input = readSync(join(base, fixture, 'input.md'))
      const treePath = join(base, fixture, 'tree.json')
      const outputPath = join(base, fixture, 'output.md')
      let output
      let expected
      let config

      try {
        config = JSON.parse(read(join(base, fixture, 'config.json')))
      } catch {}

      const proc = remark().use(remarkFrontmatter, config)
      const actual = JSON.parse(JSON.stringify(proc.parse(input)))

      try {
        output = read(outputPath, 'utf8')
      } catch {
        output = String(input)
      }

      try {
        expected = JSON.parse(read(treePath))
      } catch {
        // New fixture.
        write(treePath, JSON.stringify(actual, 0, 2) + '\n')
        expected = actual
      }

      st.deepEqual(actual, expected, 'tree')
      st.equal(String(proc.processSync(input)), output, 'process')
      st.end()
    })
  }
})
