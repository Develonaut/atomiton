import { MantineThemeOverride } from "@mantine/core";

// Helper function to generate proper color scales from a base color
function generateColorScale(
  baseColor: string,
): [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
] {
  // For now, we'll use the same color for all shades
  // In the future, this could generate proper lighter/darker variants
  return Array(10).fill(baseColor) as [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
}

/**
 * Brainwave 2.0 Theme - Complete 1:1 translation from Tailwind CSS
 *
 * This theme provides a complete and accurate translation of our existing
 * Tailwind configuration and CSS variables to Mantine theme values.
 */
export const brainwaveTheme: MantineThemeOverride = {
  primaryColor: "shade",

  colors: {
    // Main shade colors from CSS variables (shade-01 through shade-09)
    shade: [
      "#fcfcfc", // shade-01 - Lightest background
      "#f8f7f7", // shade-02 - Secondary background
      "#f1f1f1", // shade-03 - Tertiary background
      "#ececec", // shade-04 - Border color (s-01)
      "#e2e2e2", // shade-05 - Border color (s-02)
      "#7b7b7b", // shade-06 - Secondary text
      "#323232", // shade-07 - Primary text
      "#222222", // shade-08 - Darker text
      "#121212", // shade-09 - Darkest text/primary
      "#000000", // Extra 10th color for Mantine requirement
    ],

    // Surface colors (surface-01, surface-02, surface-03)
    surface: [
      "#fcfcfc", // surface-01 (same as shade-01)
      "#f8f7f7", // surface-02 (same as shade-02)
      "#f1f1f1", // surface-03 (same as shade-03)
      "#ececec",
      "#e2e2e2",
      "#7b7b7b",
      "#323232",
      "#222222",
      "#121212",
      "#000000",
    ],

    // Tertiary color from CSS variables
    tertiary: generateColorScale("#a8a8a8"),

    // Border colors (s-01, s-02)
    border: [
      "#ececec", // s-01 (same as shade-04)
      "#e2e2e2", // s-02 (same as shade-05)
      "#f1f1f1",
      "#f8f7f7",
      "#fcfcfc",
      "#7b7b7b",
      "#323232",
      "#222222",
      "#121212",
      "#000000",
    ],

    // Semantic colors from CSS variables - proper color scales
    green: [
      "#e8f5e3", // Very light green
      "#d1ebb8", // Light green
      "#bbe08d", // Lighter green
      "#a4d662", // Light-medium green
      "#8dcb37", // Medium-light green
      "#55b93e", // Base green (from CSS)
      "#4da538", // Slightly darker
      "#459032", // Darker green
      "#3d7c2c", // Dark green
      "#356826", // Darkest green
    ],
    orange: [
      "#fdf2ed", // Very light orange
      "#fbe5db", // Light orange
      "#f9d8c9", // Lighter orange
      "#f7cab7", // Light-medium orange
      "#f5bda5", // Medium-light orange
      "#e36323", // Base orange (from CSS)
      "#cc5920", // Slightly darker
      "#b54f1c", // Darker orange
      "#9e4619", // Dark orange
      "#873c15", // Darkest orange
    ],
    red: [
      "#fff5f4", // Very light red
      "#ffebe9", // Light red
      "#ffe1de", // Lighter red
      "#ffd7d3", // Light-medium red
      "#ffcdc8", // Medium-light red
      "#fe5938", // Base red (from CSS)
      "#e55032", // Slightly darker
      "#cc472c", // Darker red
      "#b33e26", // Dark red
      "#993520", // Darkest red
    ],
    blue: [
      "#f0f7ff", // Very light blue
      "#e1efff", // Light blue
      "#d2e7ff", // Lighter blue
      "#c3dfff", // Light-medium blue
      "#b4d7ff", // Medium-light blue
      "#3582ff", // Base blue (from CSS)
      "#2f75e6", // Slightly darker
      "#2968cc", // Darker blue
      "#235bb3", // Dark blue
      "#1d4e99", // Darkest blue
    ],
    yellow: [
      "#fffcf0", // Very light yellow
      "#fff9e1", // Light yellow
      "#fff6d2", // Lighter yellow
      "#fff3c3", // Light-medium yellow
      "#fff0b4", // Medium-light yellow
      "#ffb73a", // Base yellow (from CSS)
      "#e6a534", // Slightly darker
      "#cc932e", // Darker yellow
      "#b38228", // Dark yellow
      "#997022", // Darkest yellow
    ],
    purple: [
      "#f6f2ff", // Very light purple
      "#ede5ff", // Light purple
      "#e4d8ff", // Lighter purple
      "#dbcbff", // Light-medium purple
      "#d2beff", // Medium-light purple
      "#8755e9", // Base purple (from CSS)
      "#7a4dd1", // Slightly darker
      "#6d45b9", // Darker purple
      "#603da1", // Dark purple
      "#533589", // Darkest purple
    ],
  },

  fontFamily: "Inter, sans-serif",

  // Typography matching CSS variables exactly with letter-spacing
  headings: {
    fontFamily: "Inter, sans-serif",
    sizes: {
      h1: {
        fontSize: "3rem", // --text-h1: 3rem
        lineHeight: "3.45rem", // --text-h1--line-height: 3.45rem
        fontWeight: "400", // --text-h1--font-weight: 400
      },
      h2: {
        fontSize: "2.5rem", // --text-h2: 2.5rem
        lineHeight: "3rem", // --text-h2--line-height: 3rem
        fontWeight: "400", // --text-h2--font-weight: 400
      },
      h3: {
        fontSize: "2rem", // --text-h3: 2rem
        lineHeight: "2.5rem", // --text-h3--line-height: 2.5rem
        fontWeight: "400", // --text-h3--font-weight: 400
      },
      h4: {
        fontSize: "1.75rem", // --text-h4: 1.75rem
        lineHeight: "2.25rem", // --text-h4--line-height: 2.25rem
        fontWeight: "400", // --text-h4--font-weight: 400
      },
      h5: {
        fontSize: "1.5rem", // --text-h5: 1.5rem
        lineHeight: "2rem", // --text-h5--line-height: 2rem
        fontWeight: "500", // --text-h5--font-weight: 500
      },
      h6: {
        fontSize: "1.25rem", // --text-h6: 1.25rem
        lineHeight: "1.75rem", // --text-h6--line-height: 1.75rem
        fontWeight: "500", // --text-h6--font-weight: 500
      },
    },
  },

  // Font sizes for all text styles from CSS variables
  fontSizes: {
    // Body text styles
    "body-sm": "0.6875rem", // --text-body-sm: 0.6875rem (11px)
    "body-md": "0.75rem", // --text-body-md: 0.75rem (12px)
    "body-md-str": "0.75rem", // --text-body-md-str: 0.75rem (12px)
    "body-lg": "0.8125rem", // --text-body-lg: 0.8125rem (13px)
    "body-lg-str": "0.8125rem", // --text-body-lg-str: 0.8125rem (13px)

    // Heading styles
    heading: "0.875rem", // --text-heading: 0.875rem (14px)
    "heading-str": "0.875rem", // --text-heading-str: 0.875rem (14px)

    // Title styles
    title: "0.9375rem", // --text-title: 0.9375rem (15px)
    "title-str": "0.9375rem", // --text-title-str: 0.9375rem (15px)
    "title-lg": "1.125rem", // --text-title-lg: 1.125rem (18px)

    // Paragraph styles
    "p-sm": "0.8125rem", // --text-p-sm: 0.8125rem (13px)
    "p-md": "0.9375rem", // --text-p-md: 0.9375rem (15px)
  },

  // Line heights for all text styles (supported by Mantine)
  lineHeights: {
    // Body text line heights
    "body-sm": "1rem", // --text-body-sm--line-height: 1rem
    "body-md": "1rem", // --text-body-md--line-height: 1rem
    "body-md-str": "1rem", // --text-body-md-str--line-height: 1rem
    "body-lg": "1rem", // --text-body-lg--line-height: 1rem
    "body-lg-str": "1rem", // --text-body-lg-str--line-height: 1rem

    // Heading line heights
    heading: "1.25rem", // --text-heading--line-height: 1.25rem
    "heading-str": "1.25rem", // --text-heading-str--line-height: 1.25rem

    // Title line heights
    title: "1.5rem", // --text-title--line-height: 1.5rem
    "title-str": "1.5rem", // --text-title-str--line-height: 1.5rem
    "title-lg": "1.6875rem", // --text-title-lg--line-height: 1.6875rem

    // Paragraph line heights
    "p-sm": "1.2188rem", // --text-p-sm--line-height: 1.2188rem
    "p-md": "1.406rem", // --text-p-md--line-height: 1.406rem
  },

  // Shadows from CSS variables
  shadows: {
    // Box shadow definitions from CSS variables
    toolbar:
      "0px 1px 4px -4px rgba(0, 0, 0, 0.075), 0px 8px 16px -12px rgba(0, 0, 0, 0.125)",
    "prompt-input":
      "inset 0 2px 0 0 #ffffff, 0px 18px 24px -20px rgba(0, 0, 0, 0.125), 0px 8px 16px -12px rgba(0, 0, 0, 0.075)",
    "depth-01":
      "0 6px 3px 0 rgba(0, 0, 0, 0.01), 0 3px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 1px 0 rgba(0, 0, 0, 0.02)",
    popover:
      "0 153px 61px 0 rgba(0, 0, 0, 0.01), 0 86px 52px 0 rgba(0, 0, 0, 0.04), 0 38px 38px 0 rgba(0, 0, 0, 0.06), 0 10px 21px 0 rgba(0, 0, 0, 0.07)",
  },

  // Complete spacing from Tailwind config
  spacing: {
    // Standard Mantine spacing
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px

    // Custom spacing values from Tailwind config
    "0.25": "0.0625rem", // 1px
    "0.5": "0.125rem", // 2px
    "0.75": "0.1875rem", // 3px
    "1.25": "0.3125rem", // 5px
    "1.5": "0.375rem", // 6px
    "2.25": "0.5625rem", // 9px
    "2.5": "0.625rem", // 10px
    "2.75": "0.6875rem", // 11px
    "3.5": "0.875rem", // 14px
    "4.75": "1.1875rem", // 19px
    "5.5": "1.375rem", // 22px
    "7.5": "1.875rem", // 30px
    "8.5": "2.125rem", // 34px
    "15": "3.75rem", // 60px
    "18": "4.5rem", // 72px
    "19": "4.75rem", // 76px
    "22": "5.5rem", // 88px
    "23": "5.75rem", // 92px
    "25": "6.25rem", // 100px
    "30": "7.5rem", // 120px
    "32": "8rem", // 128px
    "33": "8.25rem", // 132px
    "34": "8.5rem", // 136px
    "37": "9.25rem", // 148px
    "38": "9.5rem", // 152px
    "40": "10rem", // 160px
    "43": "10.75rem", // 172px
    "45": "11.25rem", // 180px
    "51": "12.75rem", // 204px
    "52": "13rem", // 208px
    "54": "13.5rem", // 216px
    "55": "13.75rem", // 220px
    "59": "14.75rem", // 236px
    "62": "15.5rem", // 248px
    "63": "15.75rem", // 252px
    "64": "16rem", // 256px
    "65": "16.25rem", // 260px
    "66": "16.5rem", // 264px
    "68": "17rem", // 272px
    "69": "17.25rem", // 276px
    "70": "17.5rem", // 280px
    "80": "20rem", // 320px
    "82": "20.5rem", // 328px
    "85": "21.25rem", // 340px
    "87": "21.75rem", // 348px
    "89": "22.25rem", // 356px
    "91": "22.75rem", // 364px
    "92": "23rem", // 368px
    "96": "24rem", // 384px
    "99": "24.75rem", // 396px
    "100": "25rem", // 400px
    "105": "26.25rem", // 420px
    "115": "28.75rem", // 460px
    "124": "31rem", // 496px
    "135": "33.75rem", // 540px
    "137": "34.25rem", // 548px
    "148": "37rem", // 592px
    "160": "40rem", // 640px
    "183": "45.75rem", // 732px
    "280": "70rem", // 1120px
    "300": "75rem", // 1200px
  },

  // Border radius from Tailwind config
  radius: {
    // Standard Mantine radius
    xs: "0.125rem", // 2px
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px

    // Custom radius from Tailwind config
    "2xl": "1.25rem", // 20px - frequently used (was "1.25")
    "3xl": "1.75rem", // 28px - (was "1.75")
    "4xl": "2rem", // 32px - from Tailwind config
    "5xl": "2.5rem", // 40px - equivalent of borderRadius 2.5 -> 10px, but this is 40px
  },

  // Screen breakpoints from Tailwind config
  breakpoints: {
    xs: "480px", // sm in Tailwind
    sm: "767px", // md in Tailwind
    md: "1023px", // lg in Tailwind
    lg: "1259px", // xl in Tailwind
    xl: "1419px", // 2xl in Tailwind
  },

  // Additional theme values
  other: {
    // Transition duration from CSS variables
    transitionDuration: "0.2s", // --default-transition-duration

    // Font weights for text styles (not supported by Mantine theme structure)
    fontWeights: {
      // Body text weights
      "body-sm": 500, // --text-body-sm--font-weight: 500
      "body-md": 500, // --text-body-md--font-weight: 500
      "body-md-str": 600, // --text-body-md-str--font-weight: 600
      "body-lg": 400, // --text-body-lg--font-weight: 400
      "body-lg-str": 600, // --text-body-lg-str--font-weight: 600

      // Heading weights
      heading: 500, // --text-heading--font-weight: 500
      "heading-str": 600, // --text-heading-str--font-weight: 600

      // Title weights
      title: 400, // --text-title--font-weight: 400
      "title-str": 600, // --text-title-str--font-weight: 600
      "title-lg": 400, // --text-title-lg--font-weight: 400

      // Paragraph weights
      "p-sm": 400, // --text-p-sm--font-weight: 400
      "p-md": 400, // --text-p-md--font-weight: 400
    },

    // Letter spacing for text styles (not supported by Mantine theme structure)
    letterSpacings: {
      // Heading letter spacing
      h1: "-0.03em", // --text-h1--letter-spacing: -0.03em
      h2: "-0.03em", // --text-h2--letter-spacing: -0.03em
      h3: "-0.03em", // --text-h3--letter-spacing: -0.03em
      h4: "-0.03em", // --text-h4--letter-spacing: -0.03em
      h5: "-0.03em", // --text-h5--letter-spacing: -0.03em
      h6: "-0.03em", // --text-h6--letter-spacing: -0.03em

      // Body text letter spacing
      "body-sm": "-0.01em", // --text-body-sm--letter-spacing: -0.01em
      "body-md": "-0.01em", // --text-body-md--letter-spacing: -0.01em
      "body-md-str": "-0.01em", // --text-body-md-str--letter-spacing: -0.01em
      "body-lg": "-0.01em", // --text-body-lg--letter-spacing: -0.01em
      "body-lg-str": "-0.01em", // --text-body-lg-str--letter-spacing: -0.01em

      // Heading letter spacing
      heading: "-0.01em", // --text-heading--letter-spacing: -0.01em
      "heading-str": "-0.02em", // --text-heading-str--letter-spacing: -0.02em

      // Title letter spacing
      title: "-0.02em", // --text-title--letter-spacing: -0.02em
      "title-str": "-0.02em", // --text-title-str--letter-spacing: -0.02em
      "title-lg": "-0.02em", // --text-title-lg--letter-spacing: -0.02em

      // Paragraph letter spacing
      "p-sm": "-0.01em", // --text-p-sm--letter-spacing: -0.01em
      "p-md": "-0.015em", // --text-p-md--letter-spacing: -0.015em
    },

    // Surface colors as other properties for easy access
    surfaceColors: {
      "surface-01": "#fcfcfc", // var(--color-surface-01)
      "surface-02": "#f8f7f7", // var(--color-surface-02)
      "surface-03": "#f1f1f1", // var(--color-surface-03)
    },

    // Border colors as other properties
    borderColors: {
      "s-01": "#ececec", // var(--color-s-01) - shade-04
      "s-02": "#e2e2e2", // var(--color-s-02) - shade-05
    },

    // Semantic color mapping for easy access
    semanticColors: {
      primary: "#121212", // var(--color-primary) - shade-09
      secondary: "#7b7b7b", // var(--color-secondary) - shade-06
      tertiary: "#a8a8a8", // var(--color-tertiary)
    },

    // Alpha variants from CSS variables
    alphaVariants: {
      "shade-01_95": "rgba(252, 252, 252, 0.95)",
      "shade-06_30": "rgba(123, 123, 123, 0.3)",
      "shade-06_50": "rgba(123, 123, 123, 0.5)",
      "shade-07_05": "rgba(50, 50, 50, 0.05)",
      "shade-07_10": "rgba(50, 50, 50, 0.1)",
      "shade-08_05": "rgba(34, 34, 34, 0.05)",
      "shade-08_10": "rgba(34, 34, 34, 0.1)",
      "shade-09_05": "rgba(18, 18, 18, 0.05)",
      "shade-09_10": "rgba(18, 18, 18, 0.1)",
      "shade-09_35": "rgba(18, 18, 18, 0.35)",
    },
  },
};

// Export as default for easy importing
export default brainwaveTheme;

// Named exports for specific use cases
export { brainwaveTheme as theme };
export { brainwaveTheme as brainwave };
