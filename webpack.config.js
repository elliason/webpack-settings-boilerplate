/* global require */
const webpackMerge = require('webpack-merge')

const loadPresets = require('./build-utils/loadPresets')
const commonSettings = require('./build-utils/webpack.common')
// eslint-disable-next-line global-require,import/no-dynamic-require
const modeConfig = env => require(`./build-utils/webpack.${env.mode}.js`)(env)

module.exports = ({ mode, presets } = { mode: 'development', presets: [] }) => {
    return webpackMerge(
        commonSettings(__dirname),
        modeConfig({ mode, presets }),
        loadPresets({ mode, presets }),
    )
}
