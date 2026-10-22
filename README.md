# Poppet website

The Hugo website and setup documentation for [poppet.run](https://poppet.run).
It uses the existing Soft stitch mascot and navy, apricot, and cream palette.
There is no theme, browser JavaScript, external font, or package dependency.

## Development

Hugo 0.167.0 is pinned in `mise.toml`. Initialise the app documentation submodule
before building:

```fish
git submodule update --init --recursive
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

While the app repository is private, Actions needs a `POPPET_SOURCE_TOKEN`
repository secret with read-only contents access to both this repository and
`poppet-run/poppet` for recursive checkout. Without it, the default workflow token
can read only this repository and the submodule checkout fails. Local clones also
need authentication for the app repository.

## Documentation source

`sources/poppet` pins the app repository as a Git submodule. Hugo reads its
Markdown guides as assets. The `app-guide` shortcode inserts them into the website
pages. Edit those guides in the app repository.

This repository holds page metadata, navigation, introductions, and the setup,
web, monitoring, messaging overview, and troubleshooting guides. `data/docs.json`
sets the navigation order for desktop and mobile.

Links to user guides stay on the website. Links to development guides open the
pinned app revision on GitHub and keep their heading fragments. The shortcode
corrects one stale Discord sentence that calls WhatsApp planned. Remove that
correction when the source guide is fixed.

The generated site excludes the app source, credentials, and runtime.

To update the imported documentation, select a reviewed app commit:

```fish
git -C sources/poppet fetch origin
git -C sources/poppet checkout --detach 'replace-with-app-commit'
```

Set `revision` in `data/poppet.json` to the same full commit ID, review the setup
walkthrough against the updated app, then rebuild. Commit the submodule pointer
and revision metadata together.

## Content and branding

- `content/_index.md` holds the homepage copy and capability descriptions.
- `content/docs/` holds the documentation index, walkthrough, and guide metadata.
- `layouts/` holds the shared page, docs navigation, and Markdown render hooks.
- `assets/css/site.css` holds layout, palette, and code styles.
- `static/images/poppet.svg` is the original mascot, also used as the favicon.
- `static/images/poppet-social.png` is the original link-preview image.
