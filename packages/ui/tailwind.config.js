import tailwindScrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./templates/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
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
          '01': 'rgb(var(--shade-01-rgb) / <alpha-value>)',
          '02': 'rgb(var(--shade-02-rgb) / <alpha-value>)', 
          '03': 'rgb(var(--shade-03-rgb) / <alpha-value>)',
          '04': 'rgb(var(--shade-04-rgb) / <alpha-value>)',
          '05': 'rgb(var(--shade-05-rgb) / <alpha-value>)',
          '06': 'rgb(var(--shade-06-rgb) / <alpha-value>)',
          '07': 'rgb(var(--shade-07-rgb) / <alpha-value>)',
          '08': 'rgb(var(--shade-08-rgb) / <alpha-value>)',
          '09': 'rgb(var(--shade-09-rgb) / <alpha-value>)',
        },
        'surface': {
          '01': 'rgb(var(--shade-01-rgb) / <alpha-value>)',
          '02': 'rgb(var(--shade-02-rgb) / <alpha-value>)',
          '03': 'rgb(var(--shade-03-rgb) / <alpha-value>)',
        },
        'primary': 'rgb(var(--shade-09-rgb) / <alpha-value>)',
        'secondary': 'rgb(var(--shade-06-rgb) / <alpha-value>)',
        'tertiary': 'rgb(var(--color-tertiary-rgb) / <alpha-value>)',
        's': {
          '01': 'rgb(var(--shade-04-rgb) / <alpha-value>)',
          '02': 'rgb(var(--shade-05-rgb) / <alpha-value>)',
        },
        'green': 'rgb(var(--color-green-rgb) / <alpha-value>)',
        'orange': 'rgb(var(--color-orange-rgb) / <alpha-value>)',
        'red': 'rgb(var(--color-red-rgb) / <alpha-value>)',
        'blue': 'rgb(var(--color-blue-rgb) / <alpha-value>)',
        'yellow': 'rgb(var(--color-yellow-rgb) / <alpha-value>)',
        'purple': 'rgb(var(--color-purple-rgb) / <alpha-value>)',
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
        '0.25': '0.0625rem',
        '0.5': '0.125rem',
        '0.75': '0.1875rem',
        '1.25': '0.3125rem',
        '1.5': '0.375rem',
        '2.25': '0.5625rem',
        '2.5': '0.625rem',
        '2.75': '0.6875rem',
        '3.5': '0.875rem',
        '4.75': '1.1875rem',
        '5.5': '1.375rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '19': '4.75rem',
        '22': '5.5rem',
        '23': '5.75rem',
        '25': '6.25rem',
        '30': '7.5rem',
        '32': '8rem',
        '33': '8.25rem',
        '34': '8.5rem',
        '37': '9.25rem',
        '38': '9.5rem',
        '39': '9.75rem',
        '40': '10rem',
        '43': '10.75rem',
        '45': '11.25rem',
        '51': '12.75rem',
        '52': '13rem',
        '54': '13.5rem',
        '55': '13.75rem',
        '59': '14.75rem',
        '62': '15.5rem',
        '63': '15.75rem',
        '64': '16rem',
        '65': '16.25rem',
        '66': '16.5rem',
        '68': '17rem',
        '69': '17.25rem',
        '70': '17.5rem',
        '80': '20rem',
        '82': '20.5rem',
        '85': '21.25rem',
        '87': '21.75rem',
        '89': '22.25rem',
        '91': '22.75rem',
        '92': '23rem',
        '96': '24rem',
        '99': '24.75rem',
        '100': '25rem',
        '105': '26.25rem',
        '115': '28.75rem',
        '124': '31rem',
        '135': '33.75rem',
        '137': '34.25rem',
        '148': '37rem',
        '160': '40rem',
        '183': '45.75rem',
        '280': '70rem',
        '300': '75rem',
      },
      borderRadius: {
        '1.25': '1.25rem',   // 20px - frequently used
        '1.75': '1.75rem',   // 28px
        '2.5': '0.625rem',   // 10px
        '4xl': '2rem',       // 32px
      },
      zIndex: {
        '1': '1',
        '2': '2',
        '3': '3',
        '15': '15',
        '19': '19',
        '30': '30',
        '100': '100',
      },
      transitionDuration: {
        '0': '0ms',
        'default': 'var(--default-transition-duration, 200ms)',
      }
    },
  },
  plugins: [
    tailwindScrollbar,
    function({ addVariant }) {
      // HeadlessUI v2 data attributes - These match the actual rendered attributes
      addVariant('data-open', '&[data-open]');
      addVariant('data-closed', '&[data-closed]');
      addVariant('data-focus', '&[data-focus]');
      addVariant('data-hover', '&[data-hover]');
      addVariant('data-selected', '&[data-selected]');
      addVariant('data-active', '&[data-active]');
      addVariant('data-disabled', '&[data-disabled]');
      addVariant('data-checked', '&[data-checked]');
      // Additional variants for nested state checking
      addVariant('group-data-open', ':merge(.group)[data-open] &');
      addVariant('group-data-closed', ':merge(.group)[data-closed] &');
    }
  ],
};

export default config;