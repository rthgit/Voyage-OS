/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                pdf: {
                    light: '#3182ce',
                    dark: '#2c5282',
                    bg: '#f7fafc',
                    accent: '#e53e3e'
                }
            }
        },
    },
    plugins: [],
}
