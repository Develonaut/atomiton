/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      screens: {
        'sm': '480px',
        'md': '767px', 
        'lg': '1023px',
        'xl': '1259px',
        '2xl': '1419px',
        '3xl': '1719px',
        '4xl': '1899px',
      },
      colors: {
        'shade': {
          '01': 'var(--shade-01)',
          '02': 'var(--shade-02)', 
          '03': 'var(--shade-03)',
          '04': 'var(--shade-04)',
          '05': 'var(--shade-05)',
          '06': 'var(--shade-06)',
          '07': 'var(--shade-07)',
          '08': 'var(--shade-08)',
          '09': 'var(--shade-09)',
        },
        'surface': {
          '01': 'var(--color-surface-01)',
          '02': 'var(--color-surface-02)',
          '03': 'var(--color-surface-03)',
        },
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'tertiary': 'var(--color-tertiary)',
        's': {
          '01': 'var(--color-s-01)',
          '02': 'var(--color-s-02)',
        },
        'green': 'var(--color-green)',
        'orange': 'var(--color-orange)',
        'red': 'var(--color-red)',
        'blue': 'var(--color-blue)',
        'yellow': 'var(--color-yellow)',
        'purple': 'var(--color-purple)',
      },
      boxShadow: {
        'toolbar': 'var(--shadow-toolbar)',
        'prompt-input': 'var(--shadow-prompt-input)',
        'depth-01': 'var(--shadow-depth-01)',
        'popover': 'var(--shadow-popover)',
      },
      fontSize: {
        'h1': ['var(--text-h1)', { lineHeight: 'var(--text-h1--line-height)', letterSpacing: 'var(--text-h1--letter-spacing)', fontWeight: 'var(--text-h1--font-weight)' }],
        'h2': ['var(--text-h2)', { lineHeight: 'var(--text-h2--line-height)', letterSpacing: 'var(--text-h2--letter-spacing)', fontWeight: 'var(--text-h2--font-weight)' }],
        'h3': ['var(--text-h3)', { lineHeight: 'var(--text-h3--line-height)', letterSpacing: 'var(--text-h3--letter-spacing)', fontWeight: 'var(--text-h3--font-weight)' }],
        'h4': ['var(--text-h4)', { lineHeight: 'var(--text-h4--line-height)', letterSpacing: 'var(--text-h4--letter-spacing)', fontWeight: 'var(--text-h4--font-weight)' }],
        'h5': ['var(--text-h5)', { lineHeight: 'var(--text-h5--line-height)', letterSpacing: 'var(--text-h5--letter-spacing)', fontWeight: 'var(--text-h5--font-weight)' }],
        'h6': ['var(--text-h6)', { lineHeight: 'var(--text-h6--line-height)', letterSpacing: 'var(--text-h6--letter-spacing)', fontWeight: 'var(--text-h6--font-weight)' }],
        'body-sm': ['var(--text-body-sm)', { lineHeight: 'var(--text-body-sm--line-height)', letterSpacing: 'var(--text-body-sm--letter-spacing)', fontWeight: 'var(--text-body-sm--font-weight)' }],
        'body-md': ['var(--text-body-md)', { lineHeight: 'var(--text-body-md--line-height)', letterSpacing: 'var(--text-body-md--letter-spacing)', fontWeight: 'var(--text-body-md--font-weight)' }],
        'body-md-str': ['var(--text-body-md-str)', { lineHeight: 'var(--text-body-md-str--line-height)', letterSpacing: 'var(--text-body-md-str--letter-spacing)', fontWeight: 'var(--text-body-md-str--font-weight)' }],
        'body-lg': ['var(--text-body-lg)', { lineHeight: 'var(--text-body-lg--line-height)', letterSpacing: 'var(--text-body-lg--letter-spacing)', fontWeight: 'var(--text-body-lg--font-weight)' }],
        'body-lg-str': ['var(--text-body-lg-str)', { lineHeight: 'var(--text-body-lg-str--line-height)', letterSpacing: 'var(--text-body-lg-str--letter-spacing)', fontWeight: 'var(--text-body-lg-str--font-weight)' }],
        'heading': ['var(--text-heading)', { lineHeight: 'var(--text-heading--line-height)', letterSpacing: 'var(--text-heading--letter-spacing)', fontWeight: 'var(--text-heading--font-weight)' }],
        'heading-str': ['var(--text-heading-str)', { lineHeight: 'var(--text-heading-str--line-height)', letterSpacing: 'var(--text-heading-str--letter-spacing)', fontWeight: 'var(--text-heading-str--font-weight)' }],
        'title': ['var(--text-title)', { lineHeight: 'var(--text-title--line-height)', letterSpacing: 'var(--text-title--letter-spacing)', fontWeight: 'var(--text-title--font-weight)' }],
        'title-str': ['var(--text-title-str)', { lineHeight: 'var(--text-title-str--line-height)', letterSpacing: 'var(--text-title-str--letter-spacing)', fontWeight: 'var(--text-title-str--font-weight)' }],
        'title-lg': ['var(--text-title-lg)', { lineHeight: 'var(--text-title-lg--line-height)', letterSpacing: 'var(--text-title-lg--letter-spacing)', fontWeight: 'var(--text-title-lg--font-weight)' }],
        'p-sm': ['var(--text-p-sm)', { lineHeight: 'var(--text-p-sm--line-height)', letterSpacing: 'var(--text-p-sm--letter-spacing)', fontWeight: 'var(--text-p-sm--font-weight)' }],
        'p-md': ['var(--text-p-md)', { lineHeight: 'var(--text-p-md--line-height)', letterSpacing: 'var(--text-p-md--letter-spacing)', fontWeight: 'var(--text-p-md--font-weight)' }],
      },
      spacing: {
        '55': '13.75rem',
        '280': '70rem',
        '1.25': '0.3125rem',
        '2.25': '0.5625rem',
        '2.75': '0.6875rem',
      },
      maxWidth: {
        '69': '17.25rem',  // 276px
        '89': '22.25rem',  // 356px
        '99': '24.75rem',  // 396px
        '105': '26.25rem', // 420px
        '148.5': '37.125rem', // 594px
      },
      borderRadius: {
        '2.5': '0.625rem',
      },
      transitionDuration: {
        '0': '0ms',
        'default': 'var(--default-transition-duration, 200ms)',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}