# Poppet website

The website and user documentation for [Poppet](https://poppet.run), a personal AI
assistant that runs on your computer.

Visit the [documentation](https://poppet.run/docs/) to get started, or see the
[Poppet repository](https://github.com/poppet-run/poppet) for the app source.

The Open Graph image is `static/images/poppet-social-wide.png`, a 1200 × 630 card
sized for link previews. Its source is `assets/images/poppet-social-wide.svg`: the
still pixel mascot (`static/images/poppet-pixel-transparent.png`) embedded at 14 px
per art pixel with `image-rendering: pixelated`, beside the Avenir Next Heavy
wordmark and Avenir Next Bold domain converted to outlines. The site's font stack
starts with Avenir Next, so the card matches its headings on Apple devices. It is
the same image as `poppet-social-card-wide.png` in the Poppet brand repository.
Export the SVG at 1200 × 630 in a browser when updating the PNG, so the pixels
stay sharp:

```fish
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot=static/images/poppet-social-wide.png "file://$PWD/assets/images/poppet-social-wide.svg"
```
