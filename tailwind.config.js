/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'med-bg': '#0a1628',
        'med-panel': '#0f2138',
        'med-border': '#1e3a5f',
        'med-text': '#e0e8f0',
        'med-muted': '#78909c',
        'severity-red': '#e53935',
        'severity-yellow': '#fdd835',
        'severity-blue': '#1e88e5',
        'severity-green': '#43a047',
        'tech-cyan': '#00e5ff',
        'tech-blue': '#2196f3',
      },
      fontFamily: {
        'display': ['Orbitron', 'monospace'],
        'body': ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'flow': 'flow 3s linear infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00e5ff, 0 0 10px #00e5ff' },
          '100%': { boxShadow: '0 0 20px #00e5ff, 0 0 30px #00e5ff' },
        },
        flow: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
