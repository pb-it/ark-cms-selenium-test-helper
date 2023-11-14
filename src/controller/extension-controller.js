const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');
//const remote = require('selenium-webdriver/remote');

class ExtensionController {

    static delay = ms => new Promise(res => setTimeout(res, ms));

    _helper
    _driver;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();
    }

    async addExtension(name, file, bRestartIfRequested) {
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

        var xpath = `//*[@id="sidenav"]/div[contains(@class, 'menu') and contains(@class, 'iconbar')]/div[contains(@class, 'menuitem') and @title="Extensions"]`;
        var button;
        button = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);
        button.click();

        await ExtensionController.delay(1000);

        xpath = `//*[@id="sidepanel"]/div/div[contains(@class, 'menu')]/div[contains(@class, 'menuitem') and starts-with(text(),"${name}")]`;
        var tmp = await this._driver.findElements(webdriver.By.xpath(xpath));
        var bExists = (tmp.length > 0);

        xpath = `//*[@id="sidepanel"]/div/div[contains(@class, 'menu')]/div[contains(@class, 'menuitem') and starts-with(text(),"Add")]`;
        button = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);
        button.click();

        await ExtensionController.delay(1000);

        xpath = `//input[@type="file"]`;
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

        await ExtensionController.delay(1000);

        if (bRestartIfRequested)
            await this._helper.checkRestartRequest();

        return Promise.resolve();
    }
}

module.exports = ExtensionController;