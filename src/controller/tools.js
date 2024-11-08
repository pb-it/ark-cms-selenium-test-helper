//const path = require('path');
const fs = require('fs');

const assert = require('assert');
const webdriver = require('selenium-webdriver');

const sleep = require('util').promisify(setTimeout);

//const App = require('../app.js'); // ERROR: circular dependency

class Tools {

    _helper
    _driver;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();
    }

    async serverEval(cmd) {
        const response = await this._driver.executeAsyncScript(async function (cmd) {
            const callback = arguments[arguments.length - 1];

            const ac = app.getController().getApiController();
            const client = ac.getApiClient();
            const res = await client.request('POST', '/sys/tools/dev/eval?_format=text', null, { 'cmd': cmd });

            callback(res);
        }, cmd);
        return Promise.resolve(response);
    }

    async downloadBackup(host) {
        const handle = await this._driver.getWindowHandle();
        await this._driver.switchTo().newWindow('tab');

        var app = this._helper.getApp();
        if (host) {
            if (host != app.getHost()) {
                app = this._helper.getApp(host);
                await app.load();
                await sleep(1000);
                await app.prepare();
                await sleep(1000);
            }
        }
        const api = await app.getApiUrl();
        assert.notEqual(api, null);
        await this._driver.get(api + '/sys/tools/db/backup');

        try { // confirm leave
            var tmp = await this._driver.switchTo().alert();
            if (tmp)
                await tmp.accept();
        } catch (error) {
            ;
        }

        const xpath = `/html/body`;
        const body = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);
        const text = await body.getText();
        assert.ok(!text || text == '!'); // '!' when openRestartRequest active

        await this._driver.close();
        await this._driver.switchTo().window(handle);

        return Promise.resolve();
    }

    async restoreBackup(file) {
        assert(fs.existsSync(file), `File '${file}' not found`);

        const handle = await this._driver.getWindowHandle();
        await this._driver.switchTo().newWindow('tab');

        const api = await this._helper.getApp().getApiUrl();
        await this._driver.get(api + '/sys/tools/db/restore');

        await sleep(1000);

        var xpath = `//input[@type="file"]`;
        var input = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);
        assert.notEqual(input, null);
        await input.sendKeys(file);
        xpath = `//input[@type="submit"]`;
        input = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);
        assert.notEqual(input, null);
        await input.click();

        await sleep(1000);

        xpath = `/html/body`;
        const body = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);
        const text = await body.getText();
        assert.equal(text, 'Restored');

        await this._driver.close();
        await this._driver.switchTo().window(handle);

        return Promise.resolve();
    }
}

module.exports = Tools;