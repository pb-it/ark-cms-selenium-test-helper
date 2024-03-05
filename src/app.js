const assert = require('assert');
const webdriver = require('selenium-webdriver');

const sleep = require('util').promisify(setTimeout);

const ApiController = require('./controller/api-controller.js');
const ModelController = require('./controller/model-controller.js');
const ExtensionController = require('./controller/extension-controller.js');
const DataService = require('./controller/data-service.js');
const Window = require('./view/window.js');

class App {

    _helper
    _driver;

    _host;
    _api;

    _apiController;
    _modelController;
    _extensionController;
    _dataService;
    _window;

    constructor(helper, host) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._host = host;

        this._apiController = new ApiController(this._helper);
        this._modelController = new ModelController(this._helper);
        this._extensionController = new ExtensionController(this._helper);
    }

    getApiController() {
        return this._apiController;
    }

    getModelController() {
        return this._modelController;
    }

    getExtensionController() {
        return this._extensionController;
    }

    getDataService() {
        if (!this._dataService)
            this._dataService = new DataService(this._helper);
        return this._dataService;
    }

    getWindow() {
        if (!this._window)
            this._window = new Window(this._helper);
        return this._window;
    }

    async load() {
        if (this._host)
            await this._driver.get(this._host);
        this._api = await this.getApiUrl(true);
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
        this._api = await this.getApiUrl(true);
        return Promise.resolve();
    }

    async navigate(path) {
        const response = await this._driver.executeAsyncScript(async (path) => {
            const callback = arguments[arguments.length - 1];
            await app.getController().navigate(path);
            callback('OK');
        }, path);
        assert.equal(response, 'OK');
        return Promise.resolve();
    }

    async getApiUrl(bVerify) {
        if (!this._api || bVerify) {
            const response = await this._driver.executeAsyncScript(async () => {
                const callback = arguments[arguments.length - 1];
                const api = localStorage.getItem('api');
                callback(api);
            });
            this._api = response;
        }
        return Promise.resolve(this._api);
    }

    async setApiUrl(api) {
        const response = await this._driver.executeAsyncScript(async (api) => {
            const callback = arguments[arguments.length - 1];
            if (api)
                localStorage.setItem('api', api);
            else
                localStorage.removeItem('api')
            callback('OK');
        }, api);
        assert.equal(response, 'OK');
        this._api = api;
        return Promise.resolve();
    }

    async resetLocalStorage() {
        const response = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];
            localStorage.clear();
            callback('OK');
        });
        assert.equal(response, 'OK');
        return Promise.resolve();
    }

    async setDebugMode(bEnable) {
        const response = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];

            localStorage.setItem('debug', JSON.stringify({ bDebug: arguments[0] }));
            const controller = app.getController();
            //controller.reloadApplication(); // will kill this script
            await controller.initController();
            controller.getView().initView();
            //await controller.reloadState();

            callback('OK');
        }, bEnable);
        assert.equal(response, 'OK');
        return Promise.resolve();
    }

    async waitLoadingFinished(timeout = 10) {
        const overlay = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': '//div[@id="overlay"]' }), 1000);
        var display = await overlay.getCssValue('display');
        if (display == 'none')
            await sleep(100);

        var i = 0;
        while (display == 'block' && i < timeout) {
            await sleep(1000);
            display = await overlay.getCssValue('display');
            i++;
        }
        assert.equal(display, 'none');
        return Promise.resolve();
    }

    async prepare(api, username, password) {
        if (api) {
            const current = await this.getApiUrl(true);
            if (current !== api) {
                const response = await this._driver.executeAsyncScript(async (api) => {
                    const callback = arguments[arguments.length - 1];
                    localStorage.setItem('api', api);
                    callback('OK');
                }, api);
                assert.equal(response, 'OK');
                await this.reload();
                await sleep(1000);
            }
        }

        const window = this.getWindow();
        var modal = await window.getTopModal();
        if (modal) {
            var head;
            const xpath = '/html/body/div[@class="modal"]/div[@class="modal-content"]/div[@class="panel"]/div/h2';
            try {
                //head = this._driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);
                head = await this._driver.findElement(webdriver.By.xpath(xpath));
            } catch (error) {
                ;
            }
            if (head) {
                var text = await head.getText();
                if (text === 'Attempt to connect to API failed') {
                    await this.acceptPrivateCertificate();

                    await this.reload();
                    await sleep(1000);

                    head = null;
                    try {
                        head = await this._driver.findElement(webdriver.By.xpath(xpath));
                    } catch (error) {
                        ;
                    }
                    if (head)
                        text = await head.getText();
                }
                if (text === 'Login') {
                    await this.login(username, password);
                    await sleep(1000);
                }
            }

            var alert;
            try {
                alert = await this._driver.switchTo().alert();
            } catch (error) {
                alert = null;
            }
            if (!alert) {
                modal = await window.getTopModal();
                if (modal) {
                    var button;
                    try {
                        button = await modal.findElement(webdriver.By.xpath('//button[text()="Skip"]')); // close tutorial modal
                    } catch (error) {
                        ;
                    }
                    if (!button) {
                        try {
                            button = await modal.findElement(webdriver.By.xpath('//button[text()="OK"]')); // close changelog modal
                        } catch (error) {
                            ;
                        }
                    }
                    if (button)
                        await button.click();
                }
            }
        }
        return Promise.resolve();
    }

    async login(username, password) {
        const window = this.getWindow();
        var modal = await window.getTopModal();
        if (modal) {
            var input = await modal.findElement(webdriver.By.css('input[id="username"]'));
            if (input) {
                await input.clear();
                if (!username)
                    username = 'admin';
                await input.sendKeys(username);
            }
            input = await modal.findElement(webdriver.By.css('input[id="password"]'));
            if (input) {
                await input.clear();
                if (!password)
                    password = 'admin';
                await input.sendKeys(password);
            }
            var button = await modal.findElement(webdriver.By.xpath('//button[text()="Login"]'));
            if (button)
                await button.click();
        }
        return Promise.resolve();
    }

    async login2(username, password) {
        return this.getDataService().request('POST', '/sys/auth/login', { 'user': username, 'pass': password });
    }

    async acceptPrivateCertificate() {
        const api = await this.getApiUrl();
        if (api) {
            const handle = await this._driver.getWindowHandle();
            await this._driver.switchTo().newWindow('tab');

            await this._driver.get(api);

            await sleep(1000);

            const button = await this._driver.findElement(webdriver.By.xpath('//button[@id="details-button"]'));
            assert.notEqual(button, null);
            await button.click();

            const link = await this._driver.findElement(webdriver.By.xpath('//a[@id="proceed-link"]'));
            assert.notEqual(link, null);
            await link.click();

            await sleep(1000);

            await this._driver.close();
            await this._driver.switchTo().window(handle);
        }
        return Promise.resolve();
    }

    async logout() {
        this._driver.executeScript(function () {
            app.getController().getAuthController().logout();
        });
        //await sleep(1000);
        //return this.reload();
        return Promise.resolve();
    }
}

module.exports = App;