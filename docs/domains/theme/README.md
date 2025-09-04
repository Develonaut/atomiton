# Theme Domain

## What This Actually Is

This is where we store our theme object - essentially our design tokens (colors, fonts, spacing, shadows) in a structured format. That's it.

## Current Status: Exploratory

We're still figuring out the best way to:

- Store theme values
- Export them to different formats (CSS variables, Tailwind config, etc.)
- Make them accessible to components

Right now, this is mostly the **Brainwave 2.0** design tokens extracted from our existing Tailwind configuration.

## Brainwave 2.0 Tokens

### Color System

```css
/* Light theme shades */
--shade-01: #fcfcfc; /* Lightest background */
--shade-02: #f8f7f7; /* Secondary background */
--shade-03: #f1f1f1; /* Tertiary background */
--shade-04: #ececec; /* Border color */
--shade-05: #e2e2e2; /* Border color */
--shade-06: #7b7b7b; /* Secondary text */
--shade-07: #323232; /* Primary text */
--shade-08: #222222; /* Darker text */
--shade-09: #121212; /* Darkest text/primary */

/* Semantic colors */
--color-green: #55b93e;
--color-orange: #e36323;
--color-red: #fe5938;
--color-blue: #3582ff;
--color-yellow: #ffb73a;
--color-purple: #8755e9;
```

### Typography

- Font: Inter
- Sizes: Range from 11px to 48px
- Weights: 400 (regular) and 500 (medium)
- Line heights: Carefully tuned for readability

### Shadows

Various elevation shadows from subtle (depth-01) to dramatic (popover)

### Spacing

Complete scale from 1px to 1200px

## Potential Future Ideas

If this exploration proves valuable, we might:

- Create a proper theme package that exports to multiple formats
- Build a theme editor/visualizer
- Support dark mode variants
- Generate documentation from theme values

But for now, it's just a place to store our theme object in an organized way.

## Related Documentation

- [UI Framework](../ui/README.md) - Where these tokens get used
- [Component Building Guide](../ui/COMPONENT_BUILDING_GUIDE.md) - How to use theme values in components
