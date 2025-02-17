const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
    content: ["./pages/**/*.{jsx,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [],
});