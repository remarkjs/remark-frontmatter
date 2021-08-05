import fs from 'fs'
import path from 'path'
import test from 'tape'
import {readSync} from 'to-vfile'
import {unified} from 'unified'
import {remark} from 'remark'
import {isHidden} from 'is-hidden'
import remarkFrontmatter from '../index.js'

var join = path.join
var read = fs.readFileSync
var write = fs.writeFileSync
var dir = fs.readdirSync

test('remarkFrontmatter', function (t) {
  t.doesNotThrow(function () {
    remark().use(remarkFrontmatter).freeze()
  }, 'should not throw if not passed options')

  t.doesNotThrow(function () {
    unified().use(remarkFrontmatter).freeze()
  }, 'should not throw if without parser or compiler')

  t.throws(
    function () {
      unified().use(remarkFrontmatter, [1]).freeze()
    },
    /^Error: Expected matter to be an object, not `1`/,
    'should throw if not given a preset or a matter'
  )

  t.throws(
    function () {
      unified().use(remarkFrontmatter, ['jsonml']).freeze()
    },
    /^Error: Missing matter definition for `jsonml`/,
    'should throw if given an unknown preset'
  )

  t.throws(
    function () {
      unified()
        .use(remarkFrontmatter, [{marker: '*'}])
        .freeze()
    },
    /^Error: Missing `type` in matter `{"marker":"\*"}`/,
    'should throw if given a matter without `type`'
  )

  t.throws(
    function () {
      unified()
        .use(remarkFrontmatter, [{type: 'jsonml'}])
        .freeze()
    },
    /^Error: Missing `marker` or `fence` in matter `{"type":"jsonml"}`/,
    'should throw if given a matter without `marker`'
  )

  t.end()
})

test('fixtures', function (t) {
  var base = join('test', 'fixtures')
  var entries = dir(base).filter((d) => !isHidden(d))

  t.plan(entries.length)

  entries.forEach(each)

  function each(fixture) {
    t.test(fixture, function (st) {
      var input = readSync(join(base, fixture, 'input.md'))
      var treePath = join(base, fixture, 'tree.json')
      var outputPath = join(base, fixture, 'output.md')
      var output
      var actual
      var expected
      var config
      var proc

      try {
        config = JSON.parse(read(join(base, fixture, 'config.json')))
      } catch (_) {}

      proc = remark().use(remarkFrontmatter, config)
      actual = JSON.parse(JSON.stringify(proc.parse(input)))

      try {
        output = read(outputPath, 'utf8')
      } catch (_) {
        output = String(input)
      }

      try {
        expected = JSON.parse(read(treePath))
      } catch (_) {
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
