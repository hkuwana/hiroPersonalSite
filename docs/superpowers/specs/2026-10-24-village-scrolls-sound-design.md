# Village scrolls, sound and discovery — design

Date: 2026-10-24 · Branch: `feat/village-scrolls-sound` (based on `feat/enterable-windmill-workshop`)

## Intent

Hiro wants visitors to explore the whole site from inside the 3D ink village, in the mood of
Ōkami. The village felt static: visitors did not know that they can paint with the brush, click
places, or walk the akabeko.

## What Hiro asked for

- The 高札 notice board opens a full-screen place, the same way the windmill opens its workshop.
  The essays show on an Ōkami-style emaki (a long picture scroll).
- The izakaya is Hiro's house in the village. It opens a second emaki that shows the whole site.
- Free countryside nature sound for the mood.
- More obvious interactivity, especially the brush.
- A visitor must not enter the windmill while it is still being built.

## Decisions

Hiro's:

- Board and izakaya open full-screen rooms (not the side scroll).
- The interactivity proposal: place markers, a ghost brush demo, a clearer brush button, and sound.

Claude's calls (flagged for review):

- Rooms are plain HTML (`EmakiRoom.svelte`), so lo-fi, keyboards and screen readers get them too.
  The scroll opens from the middle with two rods, as in Ōkami's menus.
- URLs: `?place=board` and `?place=izakaya`, like `?place=windmill`. Room-to-room moves replace
  the history entry, so Back always returns to the village.
- The 書 sail and the 書 tab open the board room. The 橋 and 然 sails keep the side scroll.
- The izakaya scroll has no About panel, because Hiro earlier asked for no profile or /about
  links in the village. The test for that rule covers both emaki.
- Japanese labels and the two intros ("Irasshai · the whole site", "Come in…") are drafts.
- Sound is off by default and starts only after a click. Ambience: CC0 field recordings in
  `static/audio/` (sources in `static/audio/CREDITS.md`). Effects (brush, wood block, wind bell,
  paper, gust) are synthesized with the Web Audio API, so they cost no download. Day and night
  beds follow the theme. The bed fades out as the visitor scrolls past the village.
- Discovery: a seal marker floats over each place (作 Projects, 書 Essays, 家 Whole site,
  筆 Paint) and breathes until visited. On a first visit, after a few quiet seconds, a ghost brush
  paints a circle around the sakura and it blooms, then "Try the brush" points at the 筆 button.
  Reduced motion skips the animation.
- The windmill door waits until the assembly finishes and the kite lands (`isStanding()`).

## Non-goals

- No change to the essay pages themselves.
- No new 3D models.

## Revision (same day): rooms instead of a house scroll

Hiro asked for the house to be a room like the windmill, for a camera that can move, and for
project logos. He also found the back-row projects hard to click.

- `RoomStage.svelte` is the shared frame for both rooms: canvas, shelf of buttons, journal,
  drag to look around, wheel and pinch to zoom, and +/recentre/− buttons. The camera
  (`room-camera.ts`) centres the focus in the space the shelf and journal leave free.
- Workshop: every project stands on a two-tier shelf as its own figure. Otterd, Kaiwa,
  Exonians and Flybyrd are cut-out standees of their logos (`logo-image.ts`, `logoFigure`; the
  first block version looked too pixelated); Reddit Scout is a
  telescope and Pebblr is a pebble cairn. The chosen figure flies onto the front workbench.
  Flybyrd's journal links to its code (`github.com/hkuwana/flybyrd`). Pebblr has no link yet.
- House (`house-scene.ts`, `HouseRoom.svelte`): a tatami room open to a garden. Pinwheel =
  projects, bookshelf = writing, writing desk = AI guides, red arched bridge = Kaiwa, tokonoma
  with sakura = nature, tea table = contact. The board keeps its emaki.
- Another session removed the tools pages on the same day, and with them the house's tools
  panel. The house skips any object whose panel is missing.
