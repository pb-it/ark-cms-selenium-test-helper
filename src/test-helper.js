const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');
//const remote = require('selenium-webdriver/remote');

const Browser = require('./browser.js');
const ExtensionController = require('./controller/extension-controller.js');

class TestHelper {

    static delay = ms => new Promise(res => setTimeout(res, ms));

    _config;
    _browser;
    _driver;
    _extensionController;

    constructor(browser) {
        this._browser = browser;
    }

    async setup(config) {
        if (config) {
            this._config = config;
            this._browser = new Browser(this._config['browser']);
        }
        if (this._browser)
            this._driver = await this._browser.setupDriver();
        if (this._config['host'])
            await this._driver.get(this._config['host']);
        this._extensionController = new ExtensionController(this);
        return Promise.resolve();
    }

    getBrowser() {
        return this._browser;
    }

    getExtensionController() {
        return this._extensionController;
    }

    async getTopModal() {
        var modal;
        const elements = await this._driver.findElements(webdriver.By.xpath('/html/body/div[@class="modal"]'));
        if (elements && elements.length > 0)
            modal = elements[elements.length - 1];
        return Promise.resolve(modal);
    }

    async closeModal() {
        var cross;
        const elements = await this._driver.findElements(webdriver.By.xpath('/html/body/div[@class="modal"]/div[@class="modal-content"]/span[@class="close"]'));
        if (elements && elements.length > 0)
            cross = elements[elements.length - 1];
        if (cross)
            await cross.click();
        return Promise.resolve();
    }

    async getForm(element) {
        var form;
        var elements = await element.findElements(webdriver.By.xpath('//form[@class="crudform"]'));
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
            elements = await element.findElements(webdriver.By.xpath(`//button[text()="${text}" and not(ancestor::div[@class="formentry"])]`));
        else
            elements = await element.findElements(webdriver.By.xpath(`//button[text()="${text}"]`));
        if (elements && elements.length == 1)
            button = elements[0];
        return Promise.resolve(button);
    }

    async login() {
        var modal = await this.getTopModal();
        if (modal) {
            var input = modal.findElement(webdriver.By.css('input[id="username"]'));
            if (input)
                input.sendKeys('admin');
            input = modal.findElement(webdriver.By.css('input[id="password"]'));
            if (input)
                input.sendKeys('admin');
            var button = await this.getButton(modal, 'Login');
            if (button)
                await button.click();

            await TestHelper.delay(1000);

            modal = await this.getTopModal();
            if (modal) {
                button = await this.getButton(modal, 'Skip');
                if (button)
                    await button.click();
            }
        }
        return Promise.resolve();
    }

    async reload() {
        await this._driver.navigate().refresh();
        try { // alternative check 'bConfirmOnLeave'
            var tmp = await this._driver.switchTo().alert();
            if (tmp)
                await tmp.accept();
        } catch (error) {
            ;
        }
        await TestHelper.delay(1000);
        return Promise.resolve();
    }

    async checkRestartRequest() {
        const response = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];

            try {
                var res = 1;
                var bRestart = false;
                const controller = app.getController();
                const ac = controller.getApiController();
                const info = await ac.fetchApiInfo();
                if (info)
                    bRestart = (info['state'] === 'openRestartRequest');
                if (bRestart) {
                    await ac.restartApi();
                    await sleep(5000);
                    var bReady = false;
                    var tmp;
                    var i = 1;
                    while (!bReady && i <= 15) {
                        console.log(i);
                        if (i > 1)
                            await sleep(2000);
                        try {
                            tmp = await ac.fetchApiInfo();
                            console.log(tmp);
                            if (tmp['state'] === 'running')
                                bReady = true;
                        } catch (error) {
                            console.log(error);
                            if (error instanceof HttpError && error['response'] && (error['response']['status'] == 401 || error['response']['status'] == 403))
                                bReady = true;
                        }
                        i++;
                    }
                    /*console.log(bReady);
                    if (!bReady) {
                        await sleep(5000);
                        bReady = await ac.waitApiReady();
                    }*/
                    if (bReady)
                        res = 0;
                } else
                    res = 0;
            } catch (error) {
                console.log(error);
            } finally {
                callback(res);
            }
        });
        assert.equal(response, 0, 'Unexpected System State');

        return Promise.resolve();
    }

    async serverEval(cmd) {
        const response = await this._driver.executeAsyncScript(async function (cmd) {
            const callback = arguments[arguments.length - 1];

            const ac = app.getController().getApiController();
            const client = ac.getApiClient();
            const res = await client.request('POST', '/sys/tools/dev/eval?_format=text', { 'cmd': cmd });

            callback(res);
        }, cmd);
        return Promise.resolve(response);
    }
}

module.exports = TestHelper;