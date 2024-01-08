const assert = require('assert');
const webdriver = require('selenium-webdriver');

class Modal {

    _helper
    _driver;

    _breadcrumb;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._breadcrumb = [];
    }

    async click(title) {
        var xpath;
        if (this._breadcrumb.length == 0)
            xpath = `//*[@id="sidenav"]/div[contains(@class, 'menu') and contains(@class, 'iconbar')]/div[contains(@class, 'menuitem') and @title="${title}"]`;
        else
            xpath = `//*[@id="sidepanel"]/div/div[contains(@class, 'menu')][${this._breadcrumb.length}]/div[contains(@class, 'menuitem') and starts-with(text(),"${title}")]`;
        // xpath = `//*[@id="sidepanel"]/div/div[contains(@class, 'menu')][${this._breadcrumb.length}]/div[contains(@class, 'menuitem') and .="${title}")]`;
        var button;
        button = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);
        assert.notEqual(button, null, `Menu '${title}' not found`);
        const list = await button.getAttribute('class');
        if (!list.includes('active'))
            await button.click();
        this._breadcrumb.push(title);
        return Promise.resolve();
    }
}

module.exports = Modal;