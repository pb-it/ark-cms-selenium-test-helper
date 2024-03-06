//const assert = require('assert');
const webdriver = require('selenium-webdriver');

const Panel = require('./panel.js');

class Canvas {

    _helper
    _driver;

    _element;

    constructor(helper, element) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._element = element;
    }

    async getPanels() {
        const panels = [];
        var elements = await this._element.findElements(webdriver.By.xpath('./div[contains(@class, "panel")]'));
        if (!elements || elements.length == 0)
            elements = await this._element.findElements(webdriver.By.xpath('./ul/li/div[contains(@class, "panel")]'));
        if (elements && elements.length > 0) {
            for (var elem of elements) {
                panels.push(new Panel(this._helper, elem));
            }
        }
        return Promise.resolve(panels);
    }
}

module.exports = Canvas;