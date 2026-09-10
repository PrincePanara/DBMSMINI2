export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f8f3',
          100: '#ddefe3',
          200: '#bce0c7',
          300: '#8fc9a2',
          400: '#5cab75',
          500: '#3a8f56',
          600: '#2a7343',
          700: '#235c37',
          800: '#1d492e',
          900: '#163a25',
        },
        ink: {
          50: '#f7f8f8',
          100: '#eceeef',
          200: '#dfe3e4',
          300: '#c3c9cb',
          400: '#8e9799',
          500: '#6b7476',
          600: '#4e5658',
          700: '#3a4143',
          800: '#252a2b',
          900: '#161a1b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(22, 26, 27, 0.04), 0 1px 3px 0 rgba(22, 26, 27, 0.04)',
        pop: '0 8px 24px -8px rgba(22, 26, 27, 0.16), 0 2px 6px -2px rgba(22, 26, 27, 0.08)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
}
