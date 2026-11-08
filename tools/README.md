# Tools

`build-sheets.js` renders the paper sheets in `../paper/` from the data in `../index.html`.

```
cd tools
npm init -y
npm i playwright @fontsource/atkinson-hyperlegible @fontsource/bricolage-grotesque @fontsource/ibm-plex-mono
npx playwright install chromium
node build-sheets.js ../index.html ../paper
```

The script reads the `ROLES`, `GROUPS`, `FIELDS`, `DEFAULT_PERMS` and `SITUATIONS` constants straight out of `index.html`, so changing the record on the site and re-running this is all it takes to update the paper.

`build-make.js` builds `../make/index.html`, the family's sheet-maker, from `make-template.html` and the same constants:

```
node build-make.js ../index.html make-template.html ../make/index.html
```
