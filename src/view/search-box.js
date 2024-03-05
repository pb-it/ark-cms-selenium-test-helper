const assert = require('assert');
const webdriver = require('selenium-webdriver');

class SearchBox {

    _helper
    _driver;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();
    }

    async search(str) {
        const input = await this._driver.findElements(webdriver.By.xpath('//form[@id="searchForm"]/input[@id="searchField"]'));
        assert.equal(input.length, 1);
        await input[0].sendKeys(str);
        const button = await this._driver.findElements(webdriver.By.xpath('//form[@id="searchForm"]/button[@id="searchButton"]'));
        assert.equal(button.length, 1);
        await button[0].click();
        return Promise.resolve();
    }
}

module.exports = SearchBox;