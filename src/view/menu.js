const assert = require('assert');
const webdriver = require('selenium-webdriver');

class Menu {

    _helper
    _driver;

    _element;

    constructor(helper, element) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._element = element;
    }

    async open() {
        return this._element.click();
    }

    async click(title) {
        var entry;
        const xpath = `./div[contains(@class, 'menu') and contains(@class, 'submenugroup')]/div[contains(@class, 'menuitem') and text()="${title}"]`;
        entry = await this._element.findElement(webdriver.By.xpath(xpath));
        assert.notEqual(entry, null, `Entry '${title}' not found`);
        return entry.click();
    }
}

module.exports = Menu;