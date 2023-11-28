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

        var modal = await this.getTopModal();
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
                const text = await head.getText();
                if (text === 'Attempt to connect to API failed') {
                    await this.acceptPrivateCertificate();

                    await this.reload();
                    await sleep(1000);
                }
            }

            await this.login(username, password);
            await sleep(1000);

            var alert;
            try {
                alert = await this._driver.switchTo().alert();
            } catch (error) {
                alert = null;
            }
            if (!alert) {
                modal = await this.getTopModal();
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
        }
        return Promise.resolve();
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