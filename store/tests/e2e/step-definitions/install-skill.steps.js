const { Given, When, Then } = require('@cucumber/cucumber')

Given('я нахожусь на главной странице каталога', async function() {
  await this.getPage().goto('/')
})

When('я кликаю на тег {string}', async function(tag) {
  await this.getPage().getByRole('button', { name: tag }).click()
})

Then('я вижу отфильтрованные скиллы с {string}', async function(skillName) {
  await this.getPage().getByRole('heading', { name: skillName }).waitFor({ state: 'visible' })
})

When('я кликаю на карточку скилла {string}', async function(skillName) {
  const page = this.getPage()
  await page.locator('a', { has: page.getByRole('heading', { name: skillName }) }).click()
})

Then('я вижу страницу скилла с заголовком {string}', async function(title) {
  const page = this.getPage()
  await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
  const heading = await page.getByRole('heading', { level: 1 }).textContent()
  if (!heading?.includes(title)) {
    throw new Error('Expected heading to include "' + title + '", got "' + heading + '"')
  }
})

Then('я вижу кнопку {string}', async function(buttonName) {
  await this.getPage().getByRole('button', { name: buttonName }).waitFor({ state: 'visible' })
})

When('я кликаю на кнопку {string}', async function(buttonName) {
  await this.getPage().getByRole('button', { name: buttonName }).click()
})

Then('браузер переходит по deeplink {string}', async function(deeplink) {
  const page = this.getPage()
  const protocol = deeplink.split('://')[0]
  await page.waitForURL(new RegExp('^' + protocol + '://'))
  const currentUrl = page.url()
  if (!currentUrl.match(new RegExp('^' + protocol + '://'))) {
    throw new Error('Expected URL to match ' + protocol + '://, got ' + currentUrl)
  }
})
