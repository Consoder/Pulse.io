/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                background: "#020204", // Darker void
                surface: "#0A0A0C",    // Slightly lighter
                primary: "#6366f1",    // Indigo
                neon: "#06b6d4",       // Cyan Accent
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'spotlight': 'spotlight 2s ease .75s 1 forwards',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                spotlight: {
                    '0%': { opacity: 0, transform: 'translate(-72%, -62%) scale(0.5)' },
                    '100%': { opacity: 1, transform: 'translate(-50%,-40%) scale(1)' },
                },
                shimmer: {
                    from: { backgroundPosition: '0 0' },
                    to: { backgroundPosition: '-200% 0' },
                }
            }
        },
    },
    plugins: [],
}