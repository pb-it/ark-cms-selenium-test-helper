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

    async getPanel(title) {
        var panel;
        if (title) {
            var elements = await this._element.findElements(webdriver.By.xpath(`.//div[contains(@class, "panel")]/div/p[text()="${title}"]/../..`)); // CrudPanel
            if (!elements || elements.length !== 1)
                elements = await this._element.findElements(webdriver.By.xpath(`.//div[contains(@class, "panel")]/div/div/p[text()="${title}"]/../..`)); // MediaPanel
            if (elements && elements.length === 1)
                panel = new Panel(this._helper, elements[0]);
        } else {
            var panels = await this.getPanels();
            if (panels.length === 1)
                panel = panels[0];
        }
        return Promise.resolve(panel);
    }
}

module.exports = Canvas;