# markup-lang

A lightweight custom markup language parser that converts **Markup** syntax into HTML. Not Markdown — Markup.

```
npm install markup-lang
```

---

## Quick Start

### npm / bundler

```js
import { parse } from 'markup-lang';
import 'markup-lang/markup.css'; // optional default styles

document.getElementById('output').innerHTML = parse(`
# Hello, Markup

Use **bold**, //italic//, and ==highlight==.

[INFO] This is a callout box.
`);
```

### CDN (no build step)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markup-lang/markup.css">
<script src="https://cdn.jsdelivr.net/npm/markup-lang/dist/markup.umd.js"></script>

<div id="output"></div>

<script>
  document.getElementById('output').innerHTML = MarkupLang.parse(`
# Hello, Markup

Use **bold**, //italic//, and ==highlight==.
  `);
</script>
```

### Node.js (CommonJS)

```js
const { parse } = require('markup-lang');
const html = parse('# Hello **world**');
console.log(html);
```

---

## Syntax Reference

| Syntax | Output |
|---|---|
| `# Heading` | H1 |
| `## Heading` | H2 |
| `### Heading` | H3 (uppercase label) |
| `**bold**` | Bold |
| `//italic//` | Italic |
| `~~strike~~` | Strikethrough |
| `==highlight==` | Highlighted text |
| `` `code` `` | Inline code |
| `[[Ctrl+C]]` | Keyboard key |
| `4 spaces + text` | Code block |
| `> text` | Blockquote |
| `- item` | Unordered list |
| `1. item` | Ordered list |
| `[ ] item` | Unchecked task |
| `[x] item` | Checked task |
| `[INFO] text` | Info callout |
| `[SUCCESS] text` | Success callout |
| `[WARNING] text` | Warning callout |
| `[ERROR] text` | Error callout |
| `\| Col \| Col \|` | Table (first row = header) |
| `![caption](url)` | Image with caption |
| `[text](url)` | Link |
| `[? Title` ↵ `body` ↵ `?]` | Collapsible section |
| `---` | Horizontal divider |
| `[^id]` | Footnote reference |
| `[^id]: text` | Footnote definition |

---

## API

### `parse(raw: string): string`

Parses a full Markup document and returns an HTML string.

```js
import { parse } from 'markup-lang';

const html = parse(`
# My Document

Some **bold** text and a list:

- Item one
- Item two

[SUCCESS] All done!
`);
```

### `renderInline(text: string): string`

Parses only inline Markup syntax (bold, italic, links, etc.) within a single line — useful when you want to process individual strings without block-level parsing.

```js
import { renderInline } from 'markup-lang';

const html = renderInline('Hello **world** with a [link](https://example.com)');
// → 'Hello <span class="mu-bold">world</span> with a <a class="mu-link" href="...">link</a>'
```

---

## Styling

The package ships with `markup.css` — a dark-mode reference stylesheet. All classes are namespaced with `mu-` to avoid conflicts.

**Use the default styles:**

```js
import 'markup-lang/markup.css';
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markup-lang/markup.css">
```

**Customise via CSS variables:**

```css
:root {
  --mu-accent:  #7c3aed;  /* purple instead of orange */
  --mu-bg:      #ffffff;
  --mu-ink:     #111111;
  --mu-muted:   #444444;
}
```

**Or write your own styles** targeting the `mu-*` class names.

---

## Output Classes Reference

| Class | Element |
|---|---|
| `.mu-h1` `.mu-h2` `.mu-h3` | Headings |
| `.mu-bold` `.mu-italic` `.mu-strike` | Inline formatting |
| `.mu-highlight` | Highlighted text |
| `.mu-code` | Inline code |
| `.mu-codeblock` | Code block |
| `.mu-kbd` | Keyboard key |
| `.mu-link` | Hyperlink |
| `.mu-sup` | Footnote reference |
| `.mu-quote` | Blockquote |
| `.mu-hr` | Horizontal rule |
| `.mu-li` | Unordered list item |
| `.mu-oli` | Ordered list item |
| `.mu-check` | Task list item |
| `.mu-callout.info/success/warning/error` | Callout boxes |
| `.mu-table` | Table |
| `.mu-img-wrap` `.mu-img` `.mu-img-caption` | Image |
| `.mu-details` `.mu-summary` `.mu-details-body` | Collapsible |
| `.mu-footnotes` `.mu-fn-entry` | Footnote section |

---

## License

MIT
