import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        red: {
          100: 'var(--red)',
          200: '#8f3a09',
        },
        yellow: {
          100: 'var(--yellow)',
        },
        neutral: {
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          300: '#59453c',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
