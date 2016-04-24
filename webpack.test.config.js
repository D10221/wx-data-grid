module.exports = {
    entry: "./testSrc/test.ts",
    output: {
        path: __dirname,
        target: "commonjs",
        filename: "test/test.bundle.js"
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    // Source maps support ('inline-source-map' also works)
    devtool: 'source-map',
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    ts:{
        configFileName: './testSrc/tsconfig.json'
    }
};