const assert = require('assert');
const webdriver = require('selenium-webdriver');

const sleep = require('util').promisify(setTimeout);

const Modal = require('./view/modal.js');
const SideMenu = require('./view/sidemenu.js');

class App {

    _helper
    _driver;

    _host;
    _api;

    constructor(helper, host) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._host = host;
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
            localStorage.setItem('api', api);
            callback('OK');
        }, api);
        assert.equal(response, 'OK');
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

    getSideMenu() {
        return new SideMenu(this._helper);
    }

    async getTopModal() {
        var modal;
        const elements = await this._driver.findElements(webdriver.By.xpath('/html/body/div[@class="modal"]'));
        if (elements && elements.length > 0)
            modal = new Modal(this._helper, elements[0]);
        return Promise.resolve(modal);
    }

    async login(api, username, password) {
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

        var modal = await this.getTopModal();
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

            await sleep(1000);

            var alert;
            try {
                alert = await this._driver.switchTo().alert();
            } catch (error) {
                alert = null;
            }
            if (!alert) {
                modal = await this.getTopModal(); // close tutorial modal
                if (modal) {
                    button = await modal.findElement(webdriver.By.xpath('//button[text()="Skip"]'));
                    if (button)
                        await button.click();
                }
            }
        }
        return Promise.resolve();
    }
}

module.exports = App;