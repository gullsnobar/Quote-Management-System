const path = require('node:path')
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    fixturesFolder: 'cypress/fixtures',
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      const cypressPkg = require.resolve('cypress/package.json')
      const cacheRoot = path.resolve(path.dirname(cypressPkg), '..', 'cache')
      const fs = require('node:fs')
      if (fs.existsSync(cacheRoot)) {
        const versions = fs.readdirSync(cacheRoot)
        if (versions.length > 0) {
          const modules = path.join(cacheRoot, versions[0], 'Cypress', 'resources', 'app', 'node_modules')
          const preprocessor = require(path.join(modules, '@cypress', 'webpack-batteries-included-preprocessor'))
          on('file:preprocessor', preprocessor({
          typescript: require.resolve('typescript'),
          webpackOptions: {
          module: {
          rules: [
          {
          test: /\.ts$/,
          use: [
          {
          loader: path.join(modules, 'ts-loader'),
          options: {
          transpileOnly: true,
          configFile: path.resolve(__dirname, 'cypress', 'tsconfig.json'),
          },
          },
          ],
          },
          ],
          },
          },
          }))
        }
      }
      return config
    },
  },
})
