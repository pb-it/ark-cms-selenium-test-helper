//const path = require('path');
const fs = require('fs');

const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');
//const remote = require('selenium-webdriver/remote');

const sleep = require('util').promisify(setTimeout);

class ExtensionController {

    _helper
    _driver;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();
    }

    async addExtension(name, file, bRestartIfRequested) {
        assert(fs.existsSync(file), `File '${file}' not found`);

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
        await sleep(1000);
        var menu = await sidemenu.getEntry(name);
        var bExists = (menu != null);
        await sidemenu.click('Add');
        await sleep(1000);

        var xpath = `//input[@type="file"]`;
        var input = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);
        if (input) {
            input.sendKeys(file);

            var alert;
            if (bExists) {
                await this._driver.wait(webdriver.until.alertIsPresent());
                alert = await this._driver.switchTo().alert();
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
        await sleep(1000);
        await sidemenu.click(name);
        await sleep(1000);
        await sidemenu.click('Delete');
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