# Almanac

A minimal, content-rich personal hub theme for [Kite](https://github.com/kite-plus/kite):
a magazine masthead over a feed of cards, and shelves for projects, books and
films, moments, friend links and a resume, on cream paper by day and warm ink
by night.

English · [简体中文](README.zh-CN.md)

![Almanac's home page, in the example site](screenshot.webp)

An almanac is a yearly book, a record of dates and small markers of the year
past. This theme is the same: a place to leave traces of what you read, watch,
build and write.

## What it draws

- **A home page**: an issue line, your avatar with a status dot, a headline,
  where you are and what you do, an introduction, your social links and a
  motto, under a banner the header floats over. Then the newest posts as
  cards and a link to all of them.
- **Posts** with their category, reading time, word count and the day they
  were updated, a table of contents beside them on a wide screen, and a bar
  under the header that shows how far a reader has read.
- **An archive** at `/posts/`, grouped by year, and tag and category pages.
- **Special pages**, each a page that names a layout in its front matter:
  about, projects, books and films, moments, friend links, a resume that
  prints on A4, a page to subscribe and a page to search.
- **Code blocks** with a bar that names the language and a button that copies
  the code, headings with anchors, pictures that open in a viewer, and tables
  that scroll.
- **Day and night**: the button in the header steps through day, night and
  the reader's system, and the browser remembers the choice.

Every page works without a script, as Kite's preview in the studio shows it,
and nothing is loaded from a third party unless you turn on web fonts or
write an embed yourself.

## Using it

Drop the zip of a release on the upload tile under **Settings → Theme** in
Kite's studio, or unzip it into a site's `themes` folder and set `theme.name`
to `almanac` in `kite.yaml`. Almanac asks for Kite 0.1.4 or later.

Its settings are grouped in the studio as Profile, Look, Navigation, Social,
Home page, Posts, Special pages and Footer.
[The example site's kite.yaml](example/kite.yaml) sets most of them.

The header draws the site's main menu, which Kite keeps in `kite.yaml` and
the studio edits under **Settings → Menus**. A link's `icon` param picks its
icon in the menu of a narrow screen, as `params: {icon: book-open}`, and
otherwise one is guessed from its address. Until the site writes a main menu,
the header shows the links set under Navigation.

### Special pages

A page chooses a layout in its front matter, or from the Template menu in the
editor. The data a layout draws is written in the same front matter:

| Layout | Draws | Front matter |
|---|---|---|
| `about` | Your profile over the page's text, and your social links | none |
| `projects` | Projects grouped by status, with GitHub numbers when `github_user` is set | `projects` |
| `project` | One project's own page, which a projects entry can lead to with `link` | `status`, `summary`, `tech`, `repo`, `homepage`, `demo` |
| `douban` | Books and films on two shelves | `books`, `movies` |
| `moments` | Short entries grouped by day | `moments` |
| `links` | Your site's card to copy, how to ask for a link, and the links | `groups`, `apply` |
| `resume` | A resume laid out to print on A4 | `profile`, `skills`, `experience`, `projects`, `education`, `summary`, `links` |
| `feed` | The feed's address with a button that copies it | none |
| `search` | A button that opens the Search plugin's box | none |

For example, a projects page:

```yaml
---
title: Projects
layout: projects
projects:
  - title: fluxa
    status: active          # maintained, experimental, archived, or any word
    summary: A self-hosted gateway for AI models.
    tech: [Go, TypeScript]
    repo: https://github.com/you/fluxa
    homepage: https://fluxa.dev
---
```

Each layout's template starts with the full list of what it reads, and
[the example site](example/content/pages) has a page for each.

### Writing

A post can ask for the card it is drawn with on the home page with
`cardSize`: `feature`, `standard`, `right`, `compact` or `note`, and give a
`cover`, a picture beside it in its folder or an address. The cover's
`coverMedium` is `photo`, `logo` or `shot`. A post that names no cover is
drawn with the first picture of its text, and one with `cover: false`, which
is what the No cover button in Kite's editor writes, with none. Both need
Kite 0.1.2 or later, whose listings carry a post's front matter.

Pictures in a grid, a grid of logos and players from Bilibili, YouTube or
NetEase Cloud Music are written as HTML in a post, which needs
`markdown.unsafeHTML: true` in `kite.yaml`. Leave a blank line around any
Markdown inside:

```html
<div class="gallery" data-cols="3">

![](one.jpg)
![](two.jpg)
![](three.jpg)

</div>

<div class="embed"><iframe src="https://player.bilibili.com/player.html?bvid=BV1uv411q7Mv&autoplay=0" allowfullscreen></iframe></div>

<div class="embed music"><iframe src="https://music.163.com/outchain/player?type=2&id=1974443814&auto=0&height=66"></iframe></div>

<div class="pic-grid" data-cols="3">
  <div class="cell"><img src="kite.svg" alt="Kite"><span class="name">Kite</span></div>
  <div class="cell"><img src="go.svg" alt="Go"><span class="name">Go</span></div>
  <div class="cell"><img src="tailwind.svg" alt="Tailwind CSS"><span class="name">Tailwind CSS</span></div>
</div>
```

### Plugins

Almanac leaves search and comments to Kite's official plugins. With
[Search](https://github.com/kite-plus/plugin-search) on the site, a search box
appears in the header and opens the plugin's search of every post. With
[Comments](https://github.com/kite-plus/plugin-comments), the thread goes under
a post, drawn in the theme's colors; a post leaves it out with
`comments: false`.

## Developing it

[`example/`](example) is a Kite site that uses the theme through a link,
`themes/almanac` to the root of this repository:

```sh
cd example
kite run
```

The stylesheet is Tailwind CSS, compiled ahead of time into
`static/almanac/almanac.css`, which is committed, so a site needs no Node.
After changing a class in a template or anything in `src/`:

```sh
npm install
npm run build
```

A change is ready when both of these pass:

```sh
kite theme verify .
(cd example && kite build --verify)
```

## Releasing

`scripts/package.sh` packs `dist/almanac-<version>.zip`, one folder named
`almanac` holding `theme.yaml` and what the theme is made of, which the studio
installs as it is. Tag the release and attach the zip.

## Design

The theme's pages, settings and look, and what Kite has to add for the rest of
it, are in [docs/design/README.md](docs/design/README.md).

## License

[MIT](LICENSE).
