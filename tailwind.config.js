const v = (name) => ({ opacityValue }) =>
  opacityValue === undefined || opacityValue === '1'
    ? `var(${name})`
    : `color-mix(in srgb, var(${name}) calc(${opacityValue} * 100%), transparent)`

/** Brand: Mahmoud Bahaa — Ocean Teal. Colours map to CSS variables in src/tokens.css */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ground: v('--surface-100'),
        card: v('--surface-200'),
        deep: v('--surface-deep'),
        ink: v('--ink'),
        muted: v('--ink-muted'),
        hairline: v('--hairline'),
        teal: { 100: v('--teal-100'), 500: v('--teal-500'), 700: v('--teal-700'), 900: v('--teal-900') },
        coral: { 500: v('--coral-500'), 700: v('--coral-700') },
        ondeep: v('--on-deep'),
        'ondeep-muted': v('--on-deep-muted'),
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'Tahoma', 'sans-serif'],
      },
      borderRadius: { tag: '4px', card: '10px', panel: '16px' },
      fontSize: {
        display: ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        h1: ['clamp(2rem, 4vw, 2.5rem)', { lineHeight: '1.15' }],
        h2: ['1.75rem', { lineHeight: '2.125rem' }],
        h3: ['1.25rem', { lineHeight: '1.75rem' }],
        stat: ['3rem', { lineHeight: '3rem' }],
        eyebrow: ['0.75rem', { lineHeight: '1rem', letterSpacing: '2px' }],
      },
    },
  },
  plugins: [],
}
