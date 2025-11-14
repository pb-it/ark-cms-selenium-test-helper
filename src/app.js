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
    _bLoggedIn;

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

    getHost() {
        return this._host;
    }

    setHost(host) {
        this._host = host;
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

    /**
     * INFO: If the browser window already contains a loaded application and you do not need to reload it,
     *       use the 'navigate' method instead
     * @param {*} path 
     * @returns 
     */
    async load(path) {
        var url;
        if (path)
            url = this._host + path;
        else
            url = this._host;
        try {
            await this._driver.get(url);
        } catch (error) {
            if (error['name'] && error['name'] === 'WebDriverError' &&
                error['message'] && error['message'].startsWith('unknown error: net::ERR_CONNECTION_REFUSED\n'))
                throw new Error(`Host '${url}' refused connection`);
            else
                throw error;
        }
        this._api = await this.getApiUrl(true);
        return Promise.resolve();
    }

    async reload(bSoft) {
        if (bSoft) {
            const response = await this._driver.executeAsyncScript(async () => {
                const callback = arguments[arguments.length - 1];
                await app.getController().reloadApplication(true);
                callback('OK');
            });
            assert.equal(response, 'OK');
        } else {
            await this._driver.navigate().refresh();
            try { // alternative check 'bConfirmOnLeave'
                var tmp = await this._driver.switchTo().alert();
                if (tmp)
                    await tmp.accept();
            } catch (error) {
                ;
            }
            this._api = await this.getApiUrl(true);
        }
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

    async getSettings() {
        const response = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];

            const settings = {};
            const controller = app.getController();
            const sc = controller.getStorageController();
            for (var prop of ['api', 'bExperimentalFeatures', 'debug', 'bConfirmOnApply', 'bConfirmOnLeave', 'bAutomaticUpdateCache',
                'bIndexedDB', 'IndexedDB_version', 'IndexedDB_meta', 'bAutomaticUpdateIndexedDB'])
                settings[prop] = sc.loadLocal(prop);

            callback(settings);
        });
        assert.notEqual(response, undefined);
        return Promise.resolve(response);
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

    async isDebugModeActive() {
        const response = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];

            var bDebug;
            const controller = app.getController();
            const cc = controller.getConfigController();
            const dc = cc.getDebugConfig();
            if (dc.hasOwnProperty('bDebug'))
                bDebug = dc['bDebug'];
            else
                bDebug = false;

            callback(bDebug);
        });
        assert.notEqual(response, undefined);
        return Promise.resolve(response);
    }

    async setDebugMode(bEnable) {
        const response = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];

            const controller = app.getController();
            const sc = controller.getStorageController();
            sc.storeLocal('debug', JSON.stringify({ 'bDebug': arguments[0] }));

            //await controller.reloadState();
            await controller.reloadApplication(true); // blocking if modal got opened (outdated cache)
            /*await controller.initController();
            controller.getView().initView();*/

            callback('OK');
        }, bEnable);
        assert.equal(response, 'OK');
        return Promise.resolve();
    }

    /**
     * 
     * @param {*} timeout 
     * @returns 
     */
    async waitLoadingFinished(timeout = 10) {
        var display;
        const start = Date.now();
        do {
            try {
                var overlay = await this._driver.wait(webdriver.until.elementLocated({ 'xpath': '//div[@id="overlay"]' }), 1000);
                display = await overlay.getCssValue('display');
                if (display == 'none') {
                    await sleep(100);
                    display = await overlay.getCssValue('display');
                }
                var duration = (Date.now() - start) / 1000;
                while (display == 'block' && duration < timeout) {
                    await sleep(1000);
                    display = await overlay.getCssValue('display');
                    duration = (Date.now() - start) / 1000;
                }
            } catch (error) {
                if (error['name'] !== 'StaleElementReferenceError') // Loading state(e.g. after login) will cause stale element error -> loop function
                    throw error;
            }
        } while (display !== 'none' && ((Date.now() - start) / 1000) < timeout);
        assert.equal(display, 'none');
        return Promise.resolve();
    }

    async isLoading() {
        const overlay = await this._driver.findElement(webdriver.By.xpath('//div[@id="overlay"]'));
        const display = await overlay.getCssValue('display');
        return Promise.resolve(display == 'block');
    }

    async prepare(api, username, password, bCheck = true, bUpdate = true) {
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
        // '/html/body/div[@class="modal"]/div[@class="modal-content"]/div[@class="panel"]/div/h2'
        const xpathHeader = './div[@class="modal-content"]/div[@class="panel"]/div/h2';
        if (modal) {
            var head;
            try {
                head = await modal.getElement().findElement(webdriver.By.xpath(xpathHeader));
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
                    text = null;
                    modal = await window.getTopModal();
                    if (modal) {
                        try {
                            head = await modal.getElement().findElement(webdriver.By.xpath(xpathHeader));
                        } catch (error) {
                            ;
                        }
                        if (head)
                            text = await head.getText();
                    }
                }
                if (text === 'Login') {
                    await this.login(username, password);
                    await sleep(500);
                    await this.waitLoadingFinished(30); // fetching cache information may take some time
                    await sleep(1000);
                }
            }

            if (bCheck) {
                var alert;
                try {
                    alert = await this._driver.switchTo().alert();
                } catch (error) {
                    alert = null;
                }
                if (!alert) {
                    var head;
                    var text;
                    var button;
                    while (bCheck) {
                        bCheck = false;
                        head = null;
                        modal = await window.getTopModal();
                        if (modal) {
                            try {
                                head = await modal.getElement().findElement(webdriver.By.xpath(xpathHeader));
                            } catch (error) {
                                ;
                            }
                            if (head) {
                                text = await head.getText();
                                if (text === 'Cache') {
                                    try {
                                        if (bUpdate) {
                                            button = await modal.getElement().findElement(webdriver.By.xpath('.//button[text()="Update"]')); // update cache
                                            if (button) {
                                                await button.click();
                                                try { // info dialog popup may dispose alert
                                                    await this._driver.wait(webdriver.until.alertIsPresent(), 300000); // 5 min
                                                    alert = await this._driver.switchTo().alert();
                                                    text = await alert.getText();
                                                    if (text == 'Updated successfully!')
                                                        await alert.accept();
                                                } catch (error) {
                                                    console.log(error);
                                                }
                                                await sleep(1000);
                                                bCheck = true;
                                            }
                                        } else {
                                            button = await modal.getElement().findElement(webdriver.By.xpath('.//button[text()="Skip"]'));
                                            if (button) {
                                                await button.click();
                                                await this.waitLoadingFinished(10);
                                                await sleep(1000);
                                                bCheck = true;
                                            }
                                        }
                                    } catch (error) {
                                        console.error(error);
                                    }
                                } else if (text === 'Info') {
                                    try {
                                        button = await modal.getElement().findElement(webdriver.By.xpath('.//button[text()="OK"]')); // close changelog modal
                                        if (button) {
                                            await button.click();
                                            await sleep(1000);
                                            bCheck = true;
                                        }
                                    } catch (error) {
                                        ;
                                    }
                                } else if (text === 'Integrity check failed') {
                                    try {
                                        button = await modal.getElement().findElement(webdriver.By.xpath('.//button[text()="Delete Copy"]'));
                                        if (button) {
                                            await button.click();
                                            //await this.waitLoadingFinished(10);
                                            try {
                                                await this._driver.wait(webdriver.until.alertIsPresent(), 1000);
                                                alert = await this._driver.switchTo().alert();
                                                text = await alert.getText();
                                                if (text == 'Done')
                                                    await alert.accept();
                                                await this.waitLoadingFinished(10);
                                            } catch (error) {
                                                ;
                                            }
                                            await sleep(1000);
                                            bCheck = true;
                                        }
                                    } catch (error) {
                                        ;
                                    }
                                } else { // text === 'Welcome'
                                    try {
                                        button = await modal.getElement().findElement(webdriver.By.xpath('.//button[text()="Skip"]')); // close tutorial modal
                                        if (button) {
                                            await button.click();
                                            await sleep(1000);
                                            bCheck = true;
                                        }
                                    } catch (error) {
                                        ;
                                    }
                                }
                            }
                        }
                    }
                } else
                    throw new Error('Unexpected alert open');
                modal = await window.getTopModal();
                if (modal)
                    throw new Error('Unexpected modal open');
            }
        }
        return Promise.resolve();
    }

    async login(username, password) {
        const window = this.getWindow();
        var modal = await window.getTopModal();
        if (modal) {
            const xpathHeader = './div[@class="modal-content"]/div[@class="panel"]/div/h2';
            var head;
            try {
                head = await modal.getElement().findElement(webdriver.By.xpath(xpathHeader));
            } catch (error) {
                ;
            }
            if (head) {
                var text = await head.getText();
                if (text === 'Login') {
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
                    var button = await modal.findElement(webdriver.By.xpath('.//button[text()="Login"]'));
                    if (button)
                        await button.click();
                }
            }
        }
        return Promise.resolve();
    }

    async login2(username, password) {
        return this.getDataService().request('POST', '/sys/auth/login', null, { 'user': username, 'pass': password });
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

    async checkSession() {
        const response = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];
            const session = await app.getController().getApiController().fetchSessionInfo();
            callback(session);
        });
        if (response == 'Unauthorized')
            throw new Error('Unauthorized');
        return Promise.resolve();
    }

    async isLoggedIn() {
        try {
            await this.checkSession();
            this._bLoggedIn = true;
        } catch (error) {
            this._bLoggedIn = false;
        }
        return Promise.resolve(this._bLoggedIn);
    }

    async logout() {
        this._driver.executeScript(function () {
            app.getController().getAuthController().logout();
        });
        this._bLoggedIn = false;
        //await sleep(1000);
        //return this.reload();
        return Promise.resolve();
    }
}

module.exports = App;