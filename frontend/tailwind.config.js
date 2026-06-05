/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints
      screens: {
        'xs': '475px',    // Extra small devices
        'sm': '640px',    // Small devices (landscape phones)
        'md': '768px',    // Medium devices (tablets)
        'lg': '1024px',   // Large devices (desktops)
        'xl': '1280px',   // Extra large devices
        '2xl': '1536px',  // 2X large devices
      },
      // Touch-friendly sizing
      spacing: {
        '18': '4.5rem',   // 72px - good for touch targets
        '22': '5.5rem',   // 88px
      },
      // Minimum touch target size (44px is iOS guideline)
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      // Brand colors (you can customize these based on your logo)
      colors: {
        'tec-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',  // Primary brand color
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
