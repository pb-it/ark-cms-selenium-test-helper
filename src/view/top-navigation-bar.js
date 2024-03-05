const assert = require('assert');
const webdriver = require('selenium-webdriver');

const SearchBox = require('./search-box.js');

class TopNavigationBar {

    _helper
    _driver;

    _searchBox;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();
    }

    async openAddEntry() {
        const xpathView = `//*[@id="topnav"]/div/div/div/i[contains(@class, 'fa-plus')]`;
        const view = await this._driver.findElements(webdriver.By.xpath(xpathView));
        assert.equal(view.length, 1);
        await view[0].click();
        return Promise.resolve();
    }

    async openApplyFilter() {
        const xpathFilter = `//*[@id="topnav"]/div/div/div/i[contains(@class, 'fa-filter')]`;
        const view = await this._driver.findElements(webdriver.By.xpath(xpathFilter));
        assert.equal(view.length, 1);
        await view[0].click();
        return Promise.resolve();
    }

    async openEditView() {
        const xpathView = `//*[@id="topnav"]/div/div/div/i[contains(@class, 'fa-th')]`;
        const view = await this._driver.findElements(webdriver.By.xpath(xpathView));
        assert.equal(view.length, 1);
        await view[0].click();
        return Promise.resolve();
    }

    getSearchBox() {
        if (!this._searchBox)
            this._searchBox = new SearchBox(this._helper);
        return this._searchBox;
    }
}

module.exports = TopNavigationBar;