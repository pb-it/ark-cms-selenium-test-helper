const assert = require('assert');
const webdriver = require('selenium-webdriver');

class SearchBox {

    _helper
    _driver;

    _input;
    _button;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();
    }

    async init() {
        var tmp = await this._driver.findElements(webdriver.By.xpath('//form[@id="searchForm"]/div/input[@id="searchField"]'));
        assert.equal(tmp.length, 1);
        this._input = tmp[0];
        tmp = await this._driver.findElements(webdriver.By.xpath('//form[@id="searchForm"]/button[@id="searchButton"]'));
        assert.equal(tmp.length, 1);
        this._button = tmp[0];
    }

    async openConfiguration() {
        const button = await this._driver.findElements(webdriver.By.xpath(
            `//form[@id="searchForm"]/div/div[@class="iconBox"]/div[contains(@class, 'btn')]/i[contains(@class, 'fa-sliders')]`));
        assert.equal(button.length, 1);
        await button[0].click();
        return Promise.resolve();
    }

    async search(str) {
        if (!this._input)
            await this.init();
        await this._input.sendKeys(str);
        await this._button.click();
        return Promise.resolve();
    }

    async clear() {
        /*if (!this._input)
            await this.init();
        await this._input.clear();*/
        const button = await this._driver.findElements(webdriver.By.xpath(
            `//form[@id="searchForm"]/div/div[@class="iconBox"]/div[contains(@class, 'btn')]/i[contains(@class, 'fa-xmark')]`));
        assert.equal(button.length, 1);
        await button[0].click();
        return Promise.resolve();
    }
}

module.exports = SearchBox;