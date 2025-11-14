//const path = require('path');
const fs = require('fs');

const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');
//const remote = require('selenium-webdriver/remote');

const sleep = require('util').promisify(setTimeout);

const Menu = require('../view/menu.js');

class ExtensionController {

    _helper
    _driver;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();
    }

    async addExtension(name, file, bRestartIfRequested) {
        assert(fs.existsSync(file), `File '${file}' not found`);
        var index = name.indexOf('@');
        if (index !== -1)
            name = name.substring(0, index);

        //this._driver.setFileDetector(new remote.FileDetector());

        // https://copyprogramming.com/howto/selenium-close-file-picker-dialog
        await this._driver.executeScript(function () {
            HTMLInputElement.prototype.click = function () {
                if (this.type !== 'file') {
                    HTMLElement.prototype.click.call(this);
                }
                else if (!this.parentNode) {
                    this.style.display = 'none';
                    this.ownerDocument.documentElement.appendChild(this);
                    this.addEventListener('change', () => this.remove());
                }
            }
        });

        const app = this._helper.getApp();
        const window = app.getWindow();
        const sidemenu = window.getSideMenu();
        await sidemenu.click('Extensions');
        await app.waitLoadingFinished(10);
        await sleep(1000);

        var canvas = await window.getCanvas();
        assert.notEqual(canvas, null);
        var panel = await canvas.getPanel(name);
        var bExists = (panel != null);

        const tnb = window.getTopNavigationBar();
        await tnb.openAddEntry();
        await sleep(1000);

        var xpath = `//input[@type="file"]`;
        var input = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);
        if (input) {
            input.sendKeys(file);

            var alert;
            if (bExists) {
                await this._driver.wait(webdriver.until.alertIsPresent());
                alert = await this._driver.switchTo().alert();
                var text = await alert.getText();
                assert.equal(text, 'An extension with name \'' + name + '\' already exists!\nDo you want to override it?');
                await alert.accept();
            }

            await this._driver.wait(webdriver.until.alertIsPresent());
            alert = await this._driver.switchTo().alert();
            var text = await alert.getText();
            assert.equal(text.startsWith('Uploaded \'' + name + '\' successfully!'), true);
            await alert.accept();
        } else
            assert.fail("Input not found");

        await sleep(1000);

        if (bRestartIfRequested)
            await app.getApiController().processOpenRestartRequest();

        return Promise.resolve();
    }

    async deleteExtension(name, bRestartIfRequested) {
        const app = this._helper.getApp();
        const window = app.getWindow();
        const sidemenu = window.getSideMenu();
        await sidemenu.click('Extensions');
        await app.waitLoadingFinished(10);
        await sleep(1000);

        var canvas = await window.getCanvas();
        assert.notEqual(canvas, null);
        var panel = await canvas.getPanel(name);
        assert.notEqual(panel, null);
        var xpath = `.//div[contains(@class, 'menuitem') and contains(@class, 'root')]`;
        var element = await panel.getElement().findElement(webdriver.By.xpath(xpath));
        assert.notEqual(element, null);
        var menu = new Menu(this._helper, element);
        await menu.open();
        await sleep(1000);
        await menu.click('Delete');
        await sleep(1000);

        await this._driver.wait(webdriver.until.alertIsPresent());
        var alert = await this._driver.switchTo().alert();
        var text = await alert.getText();
        assert.equal(text.startsWith('Delete extension \'' + name + '\'?'), true);
        await alert.accept();

        await this._driver.wait(webdriver.until.alertIsPresent());
        alert = await this._driver.switchTo().alert();
        text = await alert.getText();
        assert.equal(text.startsWith('Deleted extension successfully!'), true);
        await alert.accept();

        if (bRestartIfRequested)
            await app.getApiController().processOpenRestartRequest();
    }
}

module.exports = ExtensionController;