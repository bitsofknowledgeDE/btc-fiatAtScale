import bokPreset from '../../CI/web/bok-preset.js';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [bokPreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../CI/web/**/*.tsx',
    '../../CI/*.tsx',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy alias; new usage should prefer `bitcoin-orange` from the preset.
        'btc-orange': 'rgb(var(--bitcoin-orange) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
