import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'instagram-gradient': 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
        'linkedin-gradient': 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
        'facebook-gradient': 'linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)',
      },
      colors: {
        'score-excellent': '#28a745',
        'score-good': '#17a2b8',
        'score-average': '#ffc107',
        'score-poor': '#dc3545',
      }
    },
  },
  plugins: [],
}
export default config