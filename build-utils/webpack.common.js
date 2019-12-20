const path = require('path')
const AssetsPlugin = require('assets-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const cssnano = require('cssnano')
const formatter = require('eslint/lib/formatters/stylish')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const webpack = require('webpack')
const config = require('../config.json')

module.exports = rootDirectory => {
    const processOutput = () => assets => {
        const files = assets

        delete files.entrypoints

        Object.keys(files).forEach(asset => {
            Object.keys(files[asset]).forEach(fileType => {
                if (!Array.isArray(fileType)) {
                    files[asset][fileType] = [
                        `${config.outputPath}/${files[asset][fileType]}`,
                    ]
                }
            })
        })

        const manifestContent = { entrypoints: files }

        return JSON.stringify(manifestContent, null, 2)
    }

    const minimizer = [
        new TerserPlugin({
            parallel: true,
            cache: true,
            terserOptions: {
                compress: false,
                output: {
                    ecma: 5,
                    comments: false,
                    ascii_only: true,
                },
            },
        }),
    ]

    const plugins = [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
        new ManifestPlugin(),
        new AssetsPlugin({
            path: path.resolve(rootDirectory, `public/${config.outputPath}`),
            filename: 'entrypoints.json',
            includeAllFileTypes: true,
            // entrypoints: true,
            prettyPrint: true,
            processOutput: processOutput(),
        }),
        new CopyPlugin([
            { from: 'patternlab/source/assets/dist/images', to: '../images' },
        ]),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            React: 'react',
        }),
    ]

    return {
        mode: 'none',
        entry: config.entry,
        output: {
            filename: '[name].[contenthash].js',
            chunkFilename: '[name].[contenthash].bundle.js',
            path: path.resolve(rootDirectory, `public/${config.outputPath}`),
        },
        watchOptions: {
            aggregateTimeout: 100,
            poll: 1000,
            ignored: /node_modules/,
        },
        resolve: {
            extensions: ['.js', '.pcss', '.ts', '.tsx', '.json'],
            plugins: [
                new TsconfigPathsPlugin({
                    /* options: */
                }),
            ],
        },
        plugins,
        optimization: {
            minimizer,
        },
        performance: {
            hints: false,
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules|vendor|public/,
                    use: [
                        {
                            loader: 'babel-loader',
                        },
                        {
                            loader: 'eslint-loader',
                            options: {
                                formatter,
                            },
                        },
                    ],
                },
                {
                    test: /\.ts(x)?$/,
                    exclude: /node_modules|vendor|public/,
                    use: [
                        {
                            loader: 'ts-loader',
                        },
                        {
                            loader: 'eslint-loader',
                            options: {
                                formatter,
                            },
                        },
                    ],
                },
                {
                    test: require.resolve('jquery'),
                    use: [
                        {
                            loader: 'expose-loader',
                            options: '$',
                        },
                        {
                            loader: 'expose-loader',
                            options: 'jQuery',
                        },
                    ],
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                        },
                        'sass-loader',
                    ],
                },
                {
                    test: /\.(p)?css$/,
                    exclude: /node_modules|vendor|public/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    include: /node_modules/,
                    exclude: /assets/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => [cssnano()],
                            },
                        },
                    ],
                },
            ],
        },
    }
}
