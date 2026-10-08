<p align="center">
  <img src="docs/icon.svg" alt="" width="84" height="84">
</p>

<h1 align="center">Search</h1>

<p align="center">
  Let readers search your Kite site in their browser, with nothing to run.
</p>

<p align="center">
  <a href="https://github.com/kite-plus/plugin-search/actions/workflows/ci.yml"><img src="https://github.com/kite-plus/plugin-search/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/kite-plus/plugin-search/releases/latest"><img src="https://img.shields.io/github/v/release/kite-plus/plugin-search?sort=semver&color=4A77D6" alt="Latest release"></a>
  <a href="https://github.com/kite-plus/kite"><img src="https://img.shields.io/badge/Kite-%E2%89%A5%200.1-4A77D6?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGcgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMCAxNC41IEwyNyAyMSBMMjcgMzAgTDEwIDIzLjUgWiIvPjxwYXRoIGQ9Ik0xMCAzMiBMMjcgMzguNSBMMjcgNDkgTDEwIDQyLjUgWiIvPjxwYXRoIGQ9Ik0zNyAyMSBMNTQgMTQuNSBMNTQgNDIuNSBMMzcgNDkgWiIvPjwvZz48L3N2Zz4=" alt="Kite 0.1 or later"></a>
  <img src="https://img.shields.io/badge/WebAssembly-build%20hook-654FF0?logo=webassembly&logoColor=white" alt="Runs WebAssembly while a site is built">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue" alt="Apache License 2.0"></a>
</p>

<p align="center">
  English · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <img src="docs/screenshot.webp" alt="The search dialog of a Kite site, in light and dark mode" width="880">
</p>

Search is an official plugin for [Kite](https://github.com/kite-plus/kite).
The index is written when your site is built and searched in the reader's
browser, so it works wherever the site does, GitHub Pages included.

## Features

- **Nothing to run.** No search server, no service to sign up for and no key
  to keep: one index file, published with the site.
- **Opens from anywhere.** A button in the corner of every page, `/` or
  `Ctrl K` (`⌘ K` on a Mac), or a search button of your theme's own.
- **Finds unspaced languages too.** Words match anywhere in a title, a tag or
  the text, so Chinese and Japanese are found without splitting words.
- **Looks like your site.** It takes the page's font, follows light and dark
  mode, and marks what matched in each result.
- **Indexes what readers read.** Code and markup stay out of the index, and a
  post stays out altogether with `search: false` in its front matter.
- **Costs nothing until used.** The index is fetched the first time a reader
  opens the search, not with every page.

## Install

1. Download `search-<version>.zip` from the
   [latest release](https://github.com/kite-plus/plugin-search/releases/latest).
2. In Kite's studio, open **Plugins**, drop the zip on **Upload plugin**, and
   switch it on.

Or from the command line, inside your site:

```sh
kite plugin add search-0.1.0.zip
kite plugin enable search
```

It needs Kite 0.1 or later.

## Settings

| Setting | Default | What it does |
|---|---|---|
| Search whole posts | On | Indexes the whole text of every post. Turned off, only titles, tags and summaries are searched, which keeps the index small on a large site |
| Search button | On | Shows a search button in the corner of every page. It is left out where the theme has its own |

## For theme authors

Any element marked `data-kite-search` opens the search, and the corner button
is then left out:

```html
<button type="button" data-kite-search>Search</button>
```

## How it works

Once the site is built, the plugin's module, `plugin.wasm`, is handed every
page and writes `plugins/search/index.json`: the address, title, date, tags
and text of each post and page, newest first. `search.js` loads it the first
time a reader opens the search and matches every word they type. The module
runs in Kite's sandbox: no network and no files, only the pages it is handed.

## Development

The module is Go, built for WebAssembly with Go 1.24 or later.

```sh
make test     # the index, on this computer
make build    # plugin.wasm
kite plugin verify .
```

To try it on a site, `kite plugin add /path/to/plugin-search` copies this
folder in, module included.

## Releasing

Set `version` in `plugin.yaml`, commit, and push a tag of the same version,
such as `v0.1.0`. The release workflow tests and builds the module, packs
`dist/search-<version>.zip` without the module's source, and attaches it to a
GitHub release. `make zip` packs the same file locally.

## More official plugins

| Plugin | What it adds |
|---|---|
| [Analytics](https://github.com/kite-plus/plugin-analytics) | Visit counts with Baidu Tongji, Google Analytics, Umami or Plausible |
| [Comments](https://github.com/kite-plus/plugin-comments) | A comment thread under every post, with Giscus, Waline or Twikoo |
| [Math and Diagrams](https://github.com/kite-plus/plugin-math) | TeX math with KaTeX, and mermaid code blocks drawn as diagrams |

## License

[Apache License 2.0](LICENSE).
