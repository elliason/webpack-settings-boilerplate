const path = require('path')
const config = require('./config.json')

module.exports = rootDirectory => {
    return {
        entry: config.entry,
        output: {
            filename: '[name].[contenthash].js',
            chunkFilename: '[name].[contenthash].bundle.js',
            path: path.resolve(rootDirectory, config.outputPath),
        },
        watchOptions: {
            aggregateTimeout: 100,
            poll: 1000,
            ignored: /node_modules/,
        },
    }
}
