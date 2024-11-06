import { defineConfig } from 'cypress';

export default defineConfig({
  watchForFileChanges: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 60000,

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
      options: {
        projectConfig: {
          root: '',
          sourceRoot: '',
          buildOptions: {
            outputPath: 'dist',
            index: 'src/index.html',
            main: 'src/main.ts',
            tsConfig: 'tsconfig.app.json',
            inlineStyleLanguage: 'scss',
            assets: ['src/assets', 'src/public'],
            styles: [
              'src/**/*.scss',
              'src/styles.scss',
              'src/styles/**/*.scss',
            ],
            scripts: [],
            buildOptimizer: false,
            optimization: false,
            vendorChunk: true,
            extractLicenses: false,
            sourceMap: true,
            namedChunks: true,
          },
        },
      },
    },
    specPattern: '**/*.cy.ts',
  },
});
