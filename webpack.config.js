module.exports = {
    entry: "./built/app.js",
    output: {
        path: __dirname,
        filename: "dist/app.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};