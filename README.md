# Poppet website

The website and user documentation for [Poppet](https://poppet.run), a personal AI
assistant that runs on your computer.

Visit the [documentation](https://poppet.run/docs/) to get started, or see the
[Poppet repository](https://github.com/poppet-run/poppet) for the app source.

The Open Graph image is `static/images/poppet-social-wide.png`, a 1200 × 630 card
sized for link previews. Its source is `assets/images/poppet-social-wide.svg`. The
square 1254 × 1254 card, `static/images/poppet-social.png` from
`assets/images/poppet-social.svg`, is kept for links to the earlier image.

Both embed the still pixel mascot (`static/images/poppet-pixel-transparent.png`)
with `image-rendering: pixelated`, at 14 px per art pixel in the wide card and 22 px
in the square card, beside or above the Avenir Next Heavy wordmark and Avenir Next
Bold domain converted to outlines. Avenir Next is what the site's font stack
resolves to in Chrome on macOS, so the cards match its headings. They match the
feedback cards in the Poppet brand repository. Export each SVG at its native size
in a browser when updating the PNGs, so the pixels stay sharp. For example:

```fish
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot=static/images/poppet-social-wide.png "file://$PWD/assets/images/poppet-social-wide.svg"
```
