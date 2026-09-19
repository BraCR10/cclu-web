# Design

The visual language of the interface. Where this document and the tokens in
`src/app/globals.css` disagree, the tokens win: they are what actually renders.

## The one rule

**A component never writes a colour.** It names the job a colour does, and a
token answers. `bg-brand`, not `bg-[#065686]` and not `bg-primary-700`.

That single rule is what makes the palette changeable. Change a token and every
screen follows; write a literal and you have signed up to find it again later,
in every file that copied it.

## Where the colours come from

The logo, in `docs/logo1.jpg` of the workspace. Use that file and not
`logo.jpg`, which carries an overlaid WhatsApp banner that is not part of the
brand.

Three hues carry the mark: a blue for the water and the wordmark, a green for
the hill, an amber for the sun. Each became a ramp generated in OKLCH from the
measured hue, with chroma clipped to the sRGB gamut, so the steps are
perceptually even instead of eyeballed. **Shade 700 of each ramp is the colour
the logo itself uses.**

| Ramp        | Comes from                             | 700       |
| ----------- | -------------------------------------- | --------- |
| `primary`   | The water drop                         | `#065686` |
| `secondary` | The hill                               | `#006325` |
| `accent`    | The sun                                | `#6F4800` |
| `neutral`   | The blue, drained of nearly all chroma | `#4D5256` |

The neutrals are not grey. They carry a trace of the brand hue, which is what
keeps a page from looking like two unrelated palettes sharing a screen.

## The tokens a component uses

| Token            | Holds                                             |
| ---------------- | ------------------------------------------------- |
| `surface`        | The page behind everything                        |
| `surface-raised` | Anything sitting on top of it: a card, a dialog   |
| `content`        | Text                                              |
| `content-muted`  | Secondary text, still readable                    |
| `border`         | Separations                                       |
| `brand`          | The primary action and anything unmistakably ours |
| `on-brand`       | Text and icons placed on `brand`                  |
| `support`        | Confirmation, approval, an active membership      |
| `on-support`     | Text placed on `support`                          |
| `highlight`      | Drawing an eye, never carrying meaning alone      |
| `on-highlight`   | Text placed on `highlight`                        |

Every `on-` token exists because a colour is only half a decision. Putting text
on a filled surface without one is how contrast gets lost.

## Light and dark

Both schemes answer through the same token names, so a component is written
once. The `:root` block holds the light values and a
`prefers-color-scheme: dark` block replaces them.

Dark is not the light palette inverted. `brand` moves from shade 700 to shade
300, because a colour dark enough to read on white disappears on near-black.

## Contrast

Every pairing below was measured, not assumed. WCAG AA asks 4.5 for body text.

| Pairing                            | Ratio |
| ---------------------------------- | ----- |
| `content` on `surface`             | 13.5  |
| `content-muted` on `surface`       | 7.9   |
| `on-brand` on `brand`              | 7.8   |
| `on-support` on `support`          | 7.5   |
| `on-highlight` on `highlight`      | 7.6   |
| Dark: `content` on `surface`       | 14.9  |
| Dark: `content-muted` on `surface` | 6.9   |

**The amber cannot be text on a light background.** At the lightness the sun
actually has, it fails against white. That is why `highlight` is a surface that
carries dark text, and never a text colour of its own.

## Adding a colour

Ask first whether an existing token already does the job. A new token is a new
decision every future screen has to honour.

If one is genuinely missing, add it to `@theme inline` with its `on-` partner,
give it a value in both `:root` and the dark block, measure the contrast, and
record it here. A token nobody documented is a token the next person will
duplicate.

## What this is not

This is the vocabulary, not a component library. Buttons, fields and cards are
born in the story that first needs them, and move to `shared/` when a second
module imports them, as [architecture.md](architecture.md) describes.
