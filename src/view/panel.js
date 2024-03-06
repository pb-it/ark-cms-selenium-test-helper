//const assert = require('assert');
const webdriver = require('selenium-webdriver');

const ContextMenu = require('./contextmenu.js');
const Form = require('./form.js');

class Panel {

    _helper
    _driver;

    _element;

    constructor(helper, element) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._element = element;
    }

    getElement() {
        return this._element;
    }

    async openContextMenu() {
        const menu = new ContextMenu(this._helper, this._element);
        await menu.click();
        return Promise.resolve(menu);
    }

    async getButton(text) {
        var button;
        var elements;
        if (text == 'Create')
            elements = await this._element.findElements(webdriver.By.xpath(`.//button[text()="${text}" and not(ancestor::div[@class="formentry"])]`));
        else
            elements = await this._element.findElements(webdriver.By.xpath(`.//button[text()="${text}"]`));
        if (elements && elements.length == 1)
            button = elements[0];
        return Promise.resolve(button);
    }

    async getForm() {
        var form;
        const elem = await this._element.findElement(webdriver.By.xpath('.//form[contains(@class, "crudform")]'));
        if (elem)
            form = new Form(this._helper, elem);
        return Promise.resolve(form);
    }

    async getForms() {
        var forms;
        const arr = await this._element.findElements(webdriver.By.xpath('.//form[contains(@class, "crudform")]'))
        if (arr) {
            forms = [];
            for (var elem of arr) {
                forms.push(new Form(this._helper, elem));
            }
        }
        return Promise.resolve(forms);
    }
}

module.exports = Panel;