/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      width: {
        'max-content': 'max-content',
        'min-content': 'min-content',
      },
      backgroundImage: {
        loginBackground: "url('/assets/images/loginBG.webp')",
        avatarBackground: "url('/assets/images/avatarBG.webp')",
        radialGradient:
          'linear-gradient(0deg, transparent, #8A2EFF), radial-gradient( #DF4DBF 0%, #572EFF 100%)',
        radialGray:
          'radial-gradient(92.86% 92.86% at 13.78% 7.14%, #FFFFFF33 0%, #FFFFFF00 100%) ',

        loaderBG: "url('/assets/images/loaderBG.webp')",
      },
      zIndex: {
        hud: '99999999',
        hudOverlay: '999999999',
      },
      height: {
        'max-content': 'max-content',
        'min-content': 'min-content',
      },
      fontFamily: {
        rajdhaniLight: ['RajdhaniLight'],
        rajdhaniRegular: ['RajdhaniRegular'],
        rajdhaniMedium: ['RajdhaniMedium'],
        rajdhaniBold: ['RajdhaniBold'],
        rajdhaniSemiBold: ['RajdhaniSemiBold'],
      }
    },
    screens: {
      short: { raw: '(max-height: 500px)' },
      ...defaultTheme.screens,
    },
  },
  plugins: [],
}
