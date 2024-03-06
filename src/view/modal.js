//const assert = require('assert');
const webdriver = require('selenium-webdriver');

const Panel = require('./panel.js');

class Modal {

    _helper
    _driver;

    _element;

    constructor(helper, element) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._element = element; // '/html/body/div[@class="modal"]'
    }

    getElement() {
        return this._element;
    }

    async findElement(selector) {
        return this._element.findElement(selector);
    }

    async findElements(selector) {
        return this._element.findElements(selector);
    }

    async getPanel() {
        var panel;
        const elem = await this._element.findElement(webdriver.By.xpath('./div[@class="modal-content"]/div[@class="panel"]'));
        if (elem)
            panel = new Panel(this._helper, elem);
        return Promise.resolve(panel);
    }

    async closeModal() {
        const cross = await this._element.findElement(webdriver.By.xpath('./div[@class="modal-content"]/span[@class="close"]'));
        if (cross)
            await cross.click();
        return Promise.resolve();
    }
}

module.exports = Modal;