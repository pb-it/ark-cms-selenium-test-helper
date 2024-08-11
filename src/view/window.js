//const assert = require('assert');
const webdriver = require('selenium-webdriver');

const SideMenu = require('./sidemenu.js');
const TopNavigationBar = require('./top-navigation-bar.js');
const ContextMenu = require('./contextmenu.js');
const Canvas = require('./canvas.js');
const Modal = require('./modal.js');
const Form = require('./form.js');

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

    async getCanvas() {
        var canvas;
        const elem = await this._driver.findElement(webdriver.By.xpath('/html/body/div[@id="mainframe"]/main/div[@id="canvas"]'));
        if (elem)
            canvas = new Canvas(this._helper, elem);
        return Promise.resolve(canvas);
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
}

module.exports = Window;