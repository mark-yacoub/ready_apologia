# Through Christian Eyes: bi-fold handout

A folded US Letter handout (two sides, four 5.5" × 8.5" panels) from Orthodox Evangelism
(smsk.ca), with QR codes into ReadyApologia.com. Not part of the website build.

| File | What it does |
|---|---|
| `generate.mjs` | Builds the print PDF (`ThroughChristianEyes_Bifold_Letter.pdf`) and PNG previews. |
| `build_slides.mjs` | Builds the same handout as two editable Google Slides pages with a 0.5" safe margin: writes raw Slides API requests and QR images to an output folder. |
| `sources.md` | Where every quotation on the handout was checked. Update it with any wording change. |

## Rebuild

```bash
NODE=$(ls ~/.vscode-server/cli/servers/*/server/node | head -1)
$NODE handouts/through-christian-eyes/generate.mjs              # PDF + previews (git-ignored)
$NODE handouts/through-christian-eyes/build_slides.mjs /tmp/tce  # Slides requests + QR PNGs
```

Both need `/usr/bin/google-chrome` (headless) and network access for Google Fonts; `generate.mjs`
also uses `pdftoppm`. To apply `build_slides.mjs` output to a deck:

```bash
G=/google/bin/releases/gemini-agents-gslides/gslides
INSERT_AT=<slide index> $NODE handouts/through-christian-eyes/build_slides.mjs /tmp/tce
$G mutate raw-batch <DECK_ID> -f /tmp/tce/requests.json
# then insert each QR from /tmp/tce/qr_placements.json with `mutate insert-image-from-file`
```

The two scripts hold their own copy of the wording; change both (and `sources.md`) together.
Print at 100% / actual size, duplex, flip on short edge.
