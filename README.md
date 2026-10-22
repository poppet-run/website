# Poppet website

The Hugo website and setup documentation for [poppet.run](https://poppet.run).
It uses the existing Soft stitch mascot and navy, apricot, and cream palette.
There is no theme, browser JavaScript, external font, or package dependency.

## Development

Hugo 0.167.0 is pinned in `mise.toml`:

```fish
mise install
mise exec -- hugo server --bind 127.0.0.1
```

Open <http://localhost:1313>. To build the production site:

```fish
mise exec -- hugo --minify --panicOnWarning
```

Hugo writes the site to `public/`, which Git ignores. The default site URL is
configured in `hugo.toml`.

## GitHub Pages

In the repository's Settings > Pages, select GitHub Actions as the build source.
Set the custom domain to `poppet.run` and configure its DNS before publishing.
The `hugo.yml` workflow builds with the pinned Hugo version, uploads `public/`,
and deploys it on pushes to `main`. You can also run it manually. Deployment is
restricted to `main`; manual runs on other branches only build and upload.
The build uses the site URL supplied by GitHub Pages.

## Documentation

All website documentation lives in `content/docs/`. Edit the Markdown pages here.
The build does not need the Poppet repository, a submodule, or a source-access
secret. `data/docs.json` sets the navigation order for desktop and mobile.

The user guides were copied from Poppet revision
`3e677b0d7b521fef7ec9fab462ac162f2a725363`. They are maintained in this repository
and do not update automatically when Poppet changes. Review the relevant pages
when updating commands, configuration, or supported behavior.

Relative Markdown links resolve to website pages. Links to app development
references are ordinary GitHub links and are not read during the build.

## Content and branding

- `content/_index.md` holds the homepage copy and capability descriptions.
- `content/docs/` holds the documentation index, walkthrough, and guide metadata.
- `layouts/` holds the shared page, docs navigation, and Markdown render hooks.
- `assets/css/site.css` holds layout, palette, and code styles.
- `static/images/poppet.svg` is the original mascot, also used as the favicon.
- `static/images/poppet-social.png` is the original link-preview image.
