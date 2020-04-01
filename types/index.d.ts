import { Plugin } from 'unified';

declare namespace remarkFrontmatter {
  type Frontmatter = Plugin<[RemarkFrontmatterOptions?]>;

  type Preset = 'yaml' | 'toml';

  interface Fence {
    open: string;
    close: string;
  }

  interface Matter {
    /**
     * Node type to parse to in [mdast](https://github.com/syntax-tree/mdast) and compile from.
     */
    type: string;

    /**
     * Character used to construct fences.
     * By providing an object with `open` and `close`.
     * different characters can be used for opening and closing fences.
     * For example the character `'-'` will result in `'---'` being used as the
     * fence.
     */
    marker?: string | Fence;

    /**
     * String used as the complete fence.
     * By providing an object with `open` and `close` different values can be used
     * for opening and closing fences.
     * This can be used too if fences contain different characters or lengths other
     * than 3
     */
    fence?: string | Fence;

    /**
     * if `true`, matter can be found anywhere in the document.
     * If `false` (default), only matter at the start of the document is recognized
     *
     * @default false
     */
    anywhere?: boolean;
  }

  type RemarkFrontmatterOptions = (Preset | Matter)[];
}

declare const remarkFrontmatter: remarkFrontmatter.Frontmatter;

export = remarkFrontmatter;
