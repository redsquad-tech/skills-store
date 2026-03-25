module.exports = {
  default: {
    require: [
      'tests/e2e/browser.js',
      'tests/e2e/hooks.js',
      'tests/e2e/step-definitions/*.js'
    ],
    publishQuiet: true,
    tags: '@e2e',
  },
}
