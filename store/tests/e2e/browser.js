const { chromium } = require('playwright')

let browser
let page

module.exports = {
  async initBrowser() {
    browser = await chromium.launch({
      headless: true,
    })
  },

  async initPage() {
    page = await browser.newPage({
      baseURL: process.env.TEST_BASE_URL || 'http://localhost:3001',
    })
  },

  async closeBrowser() {
    await page?.close()
    await browser?.close()
  },

  getPage() {
    return page
  }
}
