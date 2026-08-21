# Design — Nine Centres Field Almanac

## Source of truth

The approved visual reference is `HD Reference/Field Almanac.html`. Customer-facing components should match its composition, typography, spacing, borders, colors, section order, and responsive behavior. Platform and payment behavior remain governed by the current source and tests.

## Foundations

| Role | Value |
| --- | --- |
| Page ground | `#E7E9EF` with a subtle horizontal paper grain |
| Paper surface | `#F6F7FA` |
| Primary ink | `#16203C` |
| Defined/cobalt signal | `#2B45C8` |
| Annotation/personality signal | `#B62F49` |
| Rules | `#C3C8D6` and dotted `#B7BECE` |
| Display | Zilla Slab, 400–600 |
| Body | Work Sans, 300–600 |
| Labels/data | DM Mono, 400–500 |

The main measure is `1200px` with `26px` desktop side gutters. Sections use single or double navy rules, square geometry, and approximately `70–78px` bottom rhythm.

## Home composition

1. Dark announcement ribbon.
2. Centered newspaper masthead with edition/navigation row.
3. Two-column lead story and dashed bodygraph coupon.
4. Plate I: centre index, BodyGraph, and activation table.
5. Sections I–VI: vocabulary, types, one-time reading, process, letters, FAQ, and articles.
6. Dark final CTA and double-rule footer.

The one-time offer intentionally replaces the reference’s three booking cards. It presents a single `$99` purchase with no recurring charge while retaining the reference’s almanac grid and typography.

## Responsive behavior

At `900px`, the lead story, plate, and type layouts begin collapsing. At `760px`, publication columns become a single reading stream, navigation wraps, form fields remain touch-friendly, and all content stays within the viewport without horizontal scrolling.

## Interaction and accessibility

- Links and controls retain visible focus states.
- Type and FAQ controls expose expanded state and remain keyboard operable.
- The checkout uses native dialogs and transfers payment entry to Stripe.
- BodyGraph labels use both text and color; purchase and result states are always written explicitly.
- Non-essential animation is disabled under `prefers-reduced-motion`.

## Protected platform layer

Do not theme `BuilderToolbar.astro`, `BuilderStyles.astro`, or `BuilderClient.astro`. Content Studio retains its canonical peacock-teal/copper identity across templates.
