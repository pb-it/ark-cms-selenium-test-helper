const assert = require('assert');
const webdriver = require('selenium-webdriver');

const Panel = require('./panel.js');

class SideMenu {

    _helper
    _driver;

    _breadcrumb;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._breadcrumb = [];
    }

    async getEntry(title) {
        var button;
        var xpath;
        if (this._breadcrumb.length == 0)
            xpath = `//*[@id="sidenav"]/div[contains(@class, 'menu') and contains(@class, 'iconbar')]/div[contains(@class, 'menuitem') and @title="${title}"]`;
        else
            xpath = `//*[@id="sidepanel"]/div/div[contains(@class, 'menu')][${this._breadcrumb.length}]/div[contains(@class, 'menuitem') and starts-with(text(),"${title}")]`;
        const elements = await this._driver.findElements(webdriver.By.xpath(xpath));
        if (elements && elements.length > 0) {
            var text;
            if (this._breadcrumb.length == 0) {
                if (elements.length == 1)
                    button = elements[0];
            } else {
                if (elements.length == 1) {
                    text = await elements[0].getText();
                    if (text.trim() === title)
                        button = elements[0];
                } else {
                    for (var elem of elements) {
                        text = await elem.getText();
                        if (text.trim() === title) {
                            button = elem;
                            break;
                        }
                    }
                }
            }
        }
        return Promise.resolve(button);
    }

    async click(title) {
        const button = await this.getEntry(title);
        assert.notEqual(button, null, `Menu '${title}' not found`);
        const list = await button.getAttribute('class');
        if (!list.includes('active'))
            await button.click();
        this._breadcrumb.push(title);
        return Promise.resolve();
    }

    async getPanel() {
        var panel;
        const xpath = `//*[@id="sidepanel"]/div/div[contains(@class, 'panel')]`;
        const elements = await this._driver.findElements(webdriver.By.xpath(xpath));
        if (elements && elements.length == 1)
            panel = new Panel(this._helper, elements[0]);
        return Promise.resolve(panel);
    }

    async close() {
        const body = await this._driver.findElement(webdriver.By.xpath('/html/body'));
        assert.notEqual(body, null);
        return body.click();
    }
}

module.exports = SideMenu;