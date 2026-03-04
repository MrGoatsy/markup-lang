/**
 * build.mjs — esbuild pipeline for markup-lang
 *
 * Produces three bundles from src/index.js:
 *   dist/markup.esm.js   — ES module (for bundlers, import)
 *   dist/markup.cjs.js   — CommonJS  (for Node require())
 *   dist/markup.umd.js   — UMD       (for browsers / CDN script tag)
 *
 * Run: node build.mjs
 */

import { build } from 'esbuild';

const entryPoints = ['src/index.js'];

const shared = {
  entryPoints,
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2018'],
};

await Promise.all([
  // ── ESM ──────────────────────────────────────────────────────────────────
  build({
    ...shared,
    format: 'esm',
    outfile: 'dist/markup.esm.js',
  }),

  // ── CommonJS ─────────────────────────────────────────────────────────────
  build({
    ...shared,
    format: 'cjs',
    outfile: 'dist/markup.cjs.js',
  }),

  // ── UMD (CDN) ─────────────────────────────────────────────────────────────
  // esbuild doesn't produce UMD natively, so we use IIFE + a small wrapper
  // that attaches to window.MarkupLang in browsers.
  build({
    ...shared,
    format: 'iife',
    globalName: 'MarkupLang',
    outfile: 'dist/markup.umd.js',
    banner: {
      js: `/* markup-lang v1.0.0 | MIT License | https://github.com/YOUR_USERNAME/markup-lang */`,
    },
  }),
]);

console.log('✅  Build complete → dist/');
