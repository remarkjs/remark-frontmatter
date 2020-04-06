import remark = require('remark')

import frontmatter = require('remark-frontmatter')

remark().use(frontmatter)

remark().use(frontmatter, [])

remark().use(frontmatter, ['yaml'])

remark().use(frontmatter, ['toml'])

remark().use(frontmatter, [{type: 'yaml', marker: '---'}])

remark().use(frontmatter, [{type: 'toml', marker: '+'}])

remark().use(frontmatter, [{type: 'custom', marker: {open: '<', close: '>'}}])

remark().use(frontmatter, [{type: 'custom', fence: '+=+=+=+'}])

remark().use(frontmatter, [{type: 'json', fence: {open: '{', close: '}'}}])

remark().use(frontmatter, [{type: 'anywhere', marker: '```', anywhere: true}])
