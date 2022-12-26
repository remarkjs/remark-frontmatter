# remark-frontmatter

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**remark**][remark] plugin to support frontmatter (YAML, TOML, and more).

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(remarkFrontmatter[, options])`](#unifieduseremarkfrontmatter-options)
*   [Examples](#examples)
    *   [Example: custom marker](#example-custom-marker)
    *   [Example: custom fence](#example-custom-fence)
    *   [Example: frontmatter as metadata](#example-frontmatter-as-metadata)
    *   [Example: frontmatter in MDX](#example-frontmatter-in-mdx)
*   [Syntax](#syntax)
*   [Syntax tree](#syntax-tree)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([remark][]) plugin to add support for YAML, TOML,
and other frontmatter.
You can use this to add support for parsing and serializing this syntax
extension.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**remark** adds support for markdown to unified.
**mdast** is the markdown AST that remark uses.
**micromark** is the markdown parser we use.
This is a remark plugin that adds support for the frontmatter syntax and AST to
remark.

## When should I use this?

Frontmatter is a metadata format in front of content.
It’s typically written in YAML and is often used with markdown.
This mechanism works well when you want authors, that have some markup
experience, to configure where or how the content is displayed or supply
metadata about content.
Frontmatter does not work everywhere so it makes markdown less portable.
A good example use case is markdown being rendered by (static) site generators.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install remark-frontmatter
```

In Deno with [`esm.sh`][esmsh]:

```js
import remarkFrontmatter from 'https://esm.sh/remark-frontmatter@4'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import remarkFrontmatter from 'https://esm.sh/remark-frontmatter@4?bundle'
</script>
```

## Use

Say we have the following file, `example.md`:

```markdown
+++
title = "New Website"
+++

# Other markdown
```

And our module, `example.js`, looks as follows:

```js
import {read} from 'to-vfile'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkStringify from 'remark-stringify'

const file = await unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(remarkFrontmatter, ['yaml', 'toml'])
  .use(() => (tree) => {
    console.dir(tree)
  })
  .process(await read('example.md'))

console.log(String(file))
```

Now, running `node example` yields:

```js
{
  type: 'root',
  children: [
    {type: 'toml', value: 'title = "New Website"', position: [Object]},
    {type: 'heading', depth: 1, children: [Array], position: [Object]}
  ],
  position: {
    start: {line: 1, column: 1, offset: 0},
    end: {line: 6, column: 1, offset: 48}
  }
}
```

```markdown
+++
title = "New Website"
+++

# Other markdown
```

## API

This package exports no identifiers.
The default export is `remarkFrontmatter`.

### `unified().use(remarkFrontmatter[, options])`

Configures remark so that it can parse and serialize frontmatter (YAML, TOML,
and more).
Doesn’t parse the data inside them: [create your own plugin][create-plugin] to
do that.

##### `options`

One `preset` or `Matter`, or an array of them, defining all the supported
frontmatters (default: `'yaml'`).

##### `preset`

Either `'yaml'` or `'toml'`:

*   `'yaml'` — `Matter` defined as `{type: 'yaml', marker: '-'}`
*   `'toml'` — `Matter` defined as `{type: 'toml', marker: '+'}`

##### `Matter`

An object with a `type` and either a `marker` or a `fence`:

*   `type` (`string`)
    — Type to tokenize as
*   `marker` (`string` or `{open: string, close: string}`)
    — Character used to construct fences.
    By providing an object with `open` and `close` different characters can be
    used for opening and closing fences.
    For example the character `'-'` will result in `'---'` being used as the
    fence
*   `fence` (`string` or `{open: string, close: string}`)
    — String used as the complete fence.
    By providing an object with `open` and `close` different values can be used
    for opening and closing fences.
    This can be used too if fences contain different characters or lengths other
    than 3
*   `anywhere` (`boolean`, default: `false`)
    – if `true`, matter can be found anywhere in the document.
    If `false` (default), only matter at the start of the document is recognized

## Examples

### Example: custom marker

A custom frontmatter with different open and close markers, repeated 3 times,
that looks like this:

```text
<<<
data
>>>

# hi
```

…can be supported with:

```js
// …
.use(remarkFrontmatter, {type: 'custom', marker: {open: '<', close: '>'}})
// …
```

### Example: custom fence

A custom frontmatter with custom fences that are not repeated like this:

```text
{
  "key": "value"
}

# hi
```

…can be supported with:

```js
// …
.use(remarkFrontmatter, {type: 'json', fence: {open: '{', close: '}'}})
// …
```

### Example: frontmatter as metadata

This plugin handles the syntax of frontmatter in markdown.
It does not *parse* that frontmatter as say YAML or TOML and expose it
somewhere.

In unified, there is a place for metadata about files:
[`file.data`][file-data].
For frontmatter specifically, it’s customary to expose it at `file.data.matter`.

We can make a plugin that does this.
This example uses the utility [`vfile-matter`][vfile-matter], which is specific
to YAML.
To support other data languages, look at this utility for inspiration.

```js
import {matter} from 'vfile-matter'

/**
 * Plugin to parse YAML frontmatter and expose it at `file.data.matter`.
 *
 * @type {import('unified').Plugin<Array<void>>}
 */
export default function myUnifiedPluginHandlingYamlMatter() {
  return function (_, file) {
    matter(file)
  }
}
```

This plugin can be used as follows:

```js
import {read} from 'to-vfile'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkStringify from 'remark-stringify'
import myUnifiedPluginHandlingYamlMatter from './my-unified-plugin-handling-yaml-matter.js'

const file = await unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(remarkFrontmatter)
  .use(myUnifiedPluginHandlingYamlMatter)
  .process(await read('example.md'))

console.log(file.data.matter) // Logs an object.
```

### Example: frontmatter in MDX

MDX has the ability to export data from it, where markdown does not.
When authoring MDX, you can write `export` statements and expose arbitrary data
through them.
It is also possible to write frontmatter, and let a plugin turn those into
export statements.

To automatically turn frontmatter into export statements, use
[`remark-mdx-frontmatter`][remark-mdx-frontmatter]
This plugin can be used as follows:

```js
import {read, write} from 'to-vfile'
import {compile} from '@mdx-js/mdx'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

const file = compile(await read('input.mdx'), {
  remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, {name: 'matter'}]]
})
file.path = 'output.js'
await write(file)

const mod = await import('./output.js')
console.log(mod.matter) // Logs an object.
```

## Syntax

This plugin applies a micromark extensions to parse the syntax.
See its readme for how it works:

*   [`micromark-extension-frontmatter`](https://github.com/micromark/micromark-extension-frontmatter)

The syntax supported depends on the given configuration.

## Syntax tree

This plugin applies one mdast utility to build and serialize the AST.
See its readme for how it works:

*   [`mdast-util-frontmatter`](https://github.com/syntax-tree/mdast-util-frontmatter)

The node types supported in the tree depend on the given configuration.

## Types

This package is fully typed with [TypeScript][].
The YAML node type is supported in `@types/mdast` by default.
To add other node types, register them by adding them to
`FrontmatterContentMap`:

```ts
import type {Literal} from 'mdast'

interface TOML extends Literal {
  type: 'toml'
}

declare module 'mdast' {
  interface FrontmatterContentMap {
    // Allow using toml nodes defined by `remark-frontmatter`.
    toml: TOML
  }
}
```

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

This plugin works with unified version 6+ and remark version 13+.

## Security

Use of `remark-frontmatter` does not involve [**rehype**][rehype]
([**hast**][hast]) or user content so there are no openings for
[cross-site scripting (XSS)][xss] attacks.

## Related

*   [`remark-yaml-config`](https://github.com/remarkjs/remark-yaml-config)
    — configure remark from YAML configuration
*   [`remark-gfm`](https://github.com/remarkjs/remark-gfm)
    — support GFM (autolink literals, footnotes, strikethrough, tables,
    tasklists)
*   [`remark-mdx`](https://github.com/mdx-js/mdx/tree/main/packages/remark-mdx)
    — support MDX (JSX, expressions, ESM)
*   [`remark-directive`](https://github.com/remarkjs/remark-directive)
    — support directives
*   [`remark-math`](https://github.com/remarkjs/remark-math)
    — support math

## Contribute

See [`contributing.md`][contributing] in [`remarkjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/remarkjs/remark-frontmatter/workflows/main/badge.svg

[build]: https://github.com/remarkjs/remark-frontmatter/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark-frontmatter.svg

[coverage]: https://codecov.io/github/remarkjs/remark-frontmatter

[downloads-badge]: https://img.shields.io/npm/dm/remark-frontmatter.svg

[downloads]: https://www.npmjs.com/package/remark-frontmatter

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark-frontmatter.svg

[size]: https://bundlephobia.com/result?p=remark-frontmatter

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[npm]: https://docs.npmjs.com/cli/install

[esmsh]: https://esm.sh

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/remarkjs/.github/blob/HEAD/support.md

[coc]: https://github.com/remarkjs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[unified]: https://github.com/unifiedjs/unified

[remark]: https://github.com/remarkjs/remark

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[typescript]: https://www.typescriptlang.org

[rehype]: https://github.com/rehypejs/rehype

[hast]: https://github.com/syntax-tree/hast

[create-plugin]: https://unifiedjs.com/learn/guide/create-a-plugin/

[file-data]: https://github.com/vfile/vfile#filedata

[vfile-matter]: https://github.com/vfile/vfile-matter

[remark-mdx-frontmatter]: https://github.com/remcohaszing/remark-mdx-frontmatter
