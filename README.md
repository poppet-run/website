# Poppet website

A static Hugo placeholder for [poppet.run](https://poppet.run), using the Soft
stitch mascot and its navy, apricot, and cream palette. No theme, JavaScript,
external fonts, or package dependencies are required.

## Development

Hugo 0.167.0 is pinned in `mise.toml`.

```fish
mise install
mise exec -- hugo server --bind 127.0.0.1
```

Open <http://localhost:1313>. To build the production site:

```fish
mise exec -- hugo --minify
```

The generated site is written to `public/`, which is ignored by Git. Deploy that
directory to a static host. The production URL is configured in `hugo.toml`.

## Content and branding

- `content/_index.md` holds the landing page copy and coming-soon message.
- `hugo.toml` holds metadata and the GitHub destination.
- `assets/css/site.css` holds layout and palette variables.
- `static/images/poppet.svg` is the website mascot SVG from the original Soft stitch
  design session, also used as the favicon.
- `static/images/poppet-social.png` is the original feedback image from the mascot
  exploration, used for link previews.

The page describes the project as in development. Its planned capabilities are
based on the Poppet implementation plan.
