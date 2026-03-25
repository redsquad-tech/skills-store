const { Before, After, setWorldConstructor, World } = require('@cucumber/cucumber')
const browser = require('./browser')

class CustomWorld extends World {
  constructor(options) {
    super(options)
  }

  getPage() {
    return browser.getPage()
  }
}

setWorldConstructor(CustomWorld)

Before(async function() {
  await browser.initBrowser()
  await browser.initPage()
})

After(async () => {
  await browser.closeBrowser()
})
