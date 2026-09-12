import daisyui from "daisyui";

/** @type {import("tailwindcss").Config} */
export default {
  darkMode: "class",
  // Compiles every `hover:` utility to `@media (hover: hover)`. Without it a
  // tap on a touch device fires a false hover, so cards and buttons animate
  // on touch and then sit stuck in the hovered state until the next tap
  // elsewhere. One flag gates all ~30 hover transforms across src/.
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Semantic tokens from new Stitch Redesign ---
        surface: '#fff8f2',
        'surface-dim': '#e2d9ca',
        'surface-bright': '#fff8f2',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#fcf2e3',
        'surface-container': '#f7edde',
        'surface-container-high': '#f1e7d8',
        'surface-container-highest': '#ebe1d2',
        'surface-variant': '#dfceb6',
        'surface-tint': '#7b563a',
        background: '#fff8f2',

        'on-surface': '#1f1b12',
        'on-surface-variant': '#50443d',
        'on-background': '#1f1b12',
        'inverse-surface': '#353026',
        'inverse-on-surface': '#faefe0',

        outline: '#82746c',
        'outline-variant': '#d4c3b9',

        primary: '#704c31',
        'primary-container': '#8b6447',
        'on-primary': '#ffffff',
        'on-primary-container': '#ffebe0',
        'inverse-primary': '#edbd9a',
        'primary-fixed': '#ffdcc4',
        'primary-fixed-dim': '#edbd9a',
        'on-primary-fixed': '#2e1501',
        'on-primary-fixed-variant': '#613f25',

        secondary: '#75593c',
        'secondary-container': '#ffd9b4',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#795d40',
        'secondary-fixed': '#ffdcbb',
        'secondary-fixed-dim': '#e4c09d',
        'on-secondary-fixed': '#2a1702',
        'on-secondary-fixed-variant': '#5b4227',

        tertiary: '#60523f',
        'tertiary-container': '#796a56',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#ffecd6',
        'tertiary-fixed': '#f4dfc7',
        'tertiary-fixed-dim': '#d7c4ac',
        'on-tertiary-fixed': '#241a0b',
        'on-tertiary-fixed-variant': '#524533',

        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        success: '#2e7d32',
        
        // --- Legacy fallback aliases to prevent build errors in un-synced components ---
        'outline-gold': '#d4c3b9',
        // Brand tones used throughout the UI. These were previously hardcoded
        // as arbitrary hex values in ~62 places, so a palette change silently
        // missed them.
        sand: "#c8a684",
        "sand-light": "#e6d2ba",
        gold: "#d4af37",
        'heading-espresso': '#1f1b12',
        'success-sage': '#4e6e58',
        'error-crimson': '#9e3f3f',
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
        'display': ['"EB Garamond"', 'serif'],
        'body': ['Montserrat', 'sans-serif'],
        'display-lg': ['"EB Garamond"', 'serif'],
        'display-lg-mobile': ['"EB Garamond"', 'serif'],
        'headline-md': ['"EB Garamond"', 'serif'],
        'headline-sm': ['"EB Garamond"', 'serif'],
        'body-lg': ['Montserrat', 'sans-serif'],
        'body-base': ['Montserrat', 'sans-serif'],
        'label-caps': ['Montserrat', 'sans-serif'],
        'button-text': ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        "display-lg-mobile": ["40px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "body-base": ["15px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "display-lg": ["56px", { "lineHeight": "1.1", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "button-text": ["14px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "label-caps": ["12px", { "lineHeight": "1", "letterSpacing": "0.15em", "fontWeight": "600" }],
        "headline-md": ["32px", { "lineHeight": "1.3", "fontWeight": "500" }],
        "headline-sm": ["24px", { "lineHeight": "1.4", "fontWeight": "500" }]
      },
      spacing: {
        "unit": "4px",
        "gutter": "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        "container-max": "1280px",
        "section-gap-sm": "64px",
        "section-gap-lg": "120px",
      },
      borderRadius: {
        "none": "0px",
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "3rem",
        "full": "9999px",
      },
      boxShadow: {
        "heritage": "0 20px 40px -10px rgba(139, 100, 71, 0.08)",
        "heritage-lg": "0 30px 60px -15px rgba(63, 42, 34, 0.12)",
      },
      // Replaces `transition-all`, which animates every animatable property —
      // including layout ones like width, height and letter-spacing — off the
      // GPU. This list is everything the UI here actually animates, and
      // nothing that triggers layout.
      transitionProperty: {
        ui: "color, background-color, border-color, text-decoration-color, fill, stroke, box-shadow, opacity, transform, filter",
      },
      transitionTimingFunction: {
        "ease-out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
        "ease-in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      animation: {
        "fade-in": "fadeIn 1.2s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "ken-burns": "kenBurns 20s ease-in-out infinite alternate",
        "scale-in": "scaleIn 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "from": { opacity: "0" },
          "to": { opacity: "1" },
        },
        fadeInUp: {
          "from": { opacity: "0", transform: "translateY(20px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        kenBurns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        scaleIn: {
          "from": { opacity: "0", transform: "scale(0.95)" },
          "to": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: { themes: ["light"] },
};
