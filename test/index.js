'use strict';

var fs = require('fs');
var path = require('path');
var test = require('tape');
var vfile = require('to-vfile');
var unified = require('unified');
var remark = require('remark');
var not = require('not');
var hidden = require('is-hidden');
var frontmatter = require('..');

var join = path.join;
var read = fs.readFileSync;
var write = fs.writeFileSync;
var dir = fs.readdirSync;

test('frontmatter()', function (t) {
  t.equal(typeof frontmatter, 'function', 'should be a function');

  t.doesNotThrow(
    function () {
      remark().use(frontmatter).freeze();
    },
    'should not throw if not passed options'
  );

  t.doesNotThrow(
    function () {
      unified().use(frontmatter).freeze();
    },
    'should not throw if without parser or compiler'
  );

  t.throws(
    function () {
      unified().use(frontmatter, [1]).freeze();
    },
    /^Error: Expected matter to be an object, not `1`/,
    'should throw if not given a preset or a matter'
  );

  t.throws(
    function () {
      unified().use(frontmatter, ['jsonml']).freeze();
    },
    /^Error: Missing matter definition for `jsonml`/,
    'should throw if given an unknown preset'
  );

  t.throws(
    function () {
      unified().use(frontmatter, [{marker: '*'}]).freeze();
    },
    /^Error: Missing `type` in matter `{"marker":"\*"}`/,
    'should throw if given a matter without `type`'
  );

  t.throws(
    function () {
      unified().use(frontmatter, [{type: 'jsonml'}]).freeze();
    },
    /^Error: Missing `marker` in matter `{"type":"jsonml"}`/,
    'should throw if given a matter without `marker`'
  );

  t.end();
});

test('fixtures', function (t) {
  var base = join(__dirname, 'fixtures');
  var entries = dir(base).filter(not(hidden));

  t.plan(entries.length);

  entries.forEach(each);

  function each(fixture) {
    t.test(fixture, function (st) {
      var input = vfile.readSync(join(base, fixture, 'input.md'));
      var treePath = join(base, fixture, 'tree.json');
      var outputPath = join(base, fixture, 'output.md');
      var output;
      var actual;
      var expected;
      var config;
      var proc;

      try {
        config = JSON.parse(read(join(base, fixture, 'config.json')));
      } catch (err) {}

      proc = remark().use(frontmatter, config);
      actual = proc.parse(input);

      try {
        output = read(outputPath, 'utf8');
      } catch (err) {
        output = String(input);
      }

      try {
        expected = JSON.parse(read(treePath));
      } catch (err) {
        /* New fixture. */
        write(treePath, JSON.stringify(actual, 0, 2) + '\n');
        expected = actual;
      }

      st.deepEqual(actual, expected, 'tree');
      st.equal(String(proc.processSync(input)), output, 'process');
      st.end();
    });
  }
});
