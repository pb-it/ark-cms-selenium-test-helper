const assert = require('assert');
const webdriver = require('selenium-webdriver');

class ContextMenu {

    _helper
    _driver;

    _target;
    _breadcrumb;

    constructor(helper, target) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._target = target;
    }

    async getEntry(title) {
        var entry;
        var xpath = '/html/body/ul[@class="contextmenu"]';
        if (this._breadcrumb.length > 0) {
            for (var crumb of this._breadcrumb) {
                xpath += `/li/div[1][text()="${crumb}"]/following-sibling::div/ul[@class="contextmenu"]`;
            }
        }
        xpath += `/li/div[1][text()="${title}"]`;
        const elements = await this._driver.findElements(webdriver.By.xpath(xpath));
        if (elements && elements.length == 1)
            entry = elements[0];
        return Promise.resolve(entry);
    }

    async click(title) {
        if (this._breadcrumb && title) {
            const entry = await this.getEntry(title);
            assert.notEqual(entry, null, `Entry '${title}' not found`);
            await entry.click();
            this._breadcrumb.push(title);
        } else {
            this._breadcrumb = [];
            this._driver.actions({ bridge: true }).contextClick(this._target, webdriver.Button.RIGHT).perform();
        }
        return Promise.resolve();
    }
}

module.exports = ContextMenu;