//const assert = require('assert');
const webdriver = require('selenium-webdriver');

const SideMenu = require('./sidemenu.js');
const TopNavigationBar = require('./top-navigation-bar.js');
const ContextMenu = require('./contextmenu.js');
const Modal = require('./modal.js');

class Window {

    _helper
    _driver;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();
    }

    getSideMenu() {
        return new SideMenu(this._helper);
    }

    getTopNavigationBar() {
        return new TopNavigationBar(this._helper);
    }

    async openContextMenu(target) {
        const menu = new ContextMenu(this._helper, target);
        await menu.click();
        return Promise.resolve(menu);
    }

    async getTopModal() {
        var modal;
        const elements = await this._driver.findElements(webdriver.By.xpath('/html/body/div[@class="modal"]'));
        if (elements && elements.length > 0)
            modal = new Modal(this._helper, elements[elements.length - 1]);
        return Promise.resolve(modal);
    }

    async getForm(element) {
        var form;
        var elements = await element.findElements(webdriver.By.xpath('.//form[contains(@class, "crudform")]'));
        if (elements && elements.length == 1)
            form = elements[0];
        return Promise.resolve(form);
    }

    async getFormInput(form, name) {
        //var formentries = await form.findElements(webdriver.By.xpath('./child::*'));
        // '//form/child::input[@type='password']'
        // '//form/input[@type='password']'
        var input;
        var elements = await form.findElements(webdriver.By.xpath(`./div[@class="formentry"]/div[@class="value"]/input[@name="${name}"]`));
        if (elements && elements.length == 1)
            input = elements[0];
        return Promise.resolve(input);
    }

    async getButton(element, text) {
        var button;
        var elements;
        if (text == 'Create')
            elements = await element.findElements(webdriver.By.xpath(`.//button[text()="${text}" and not(ancestor::div[@class="formentry"])]`));
        else
            elements = await element.findElements(webdriver.By.xpath(`.//button[text()="${text}"]`));
        if (elements && elements.length == 1)
            button = elements[0];
        return Promise.resolve(button);
    }
}

module.exports = Window;