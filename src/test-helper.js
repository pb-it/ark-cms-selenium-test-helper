//const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');
//const remote = require('selenium-webdriver/remote');

const BmpClient = require('./proxy/bmp-client.js');
const Browser = require('./browser.js');

const App = require('./app.js');

class TestHelper {

    static delay = ms => new Promise(res => setTimeout(res, ms));

    _config;
    _proxy;
    _browser;
    _driver;

    _app;

    constructor(browser) {
        this._browser = browser;
    }

    async setup(config, bUseProxy) {
        if (config) {
            this._config = config;
            if (this._config['proxy'] && bUseProxy && !this._proxy) {
                if (this._config['proxy']['bmp']) {
                    try {
                        this._proxy = new BmpClient(this._config['proxy']);
                        await this._proxy.setup();
                    } catch (error) {
                        console.error(error);
                        this._proxy = null;
                    }
                }
            }
            if (this._browser)
                await this._browser.teardown();
            this._browser = new Browser(this._config['browser']);
            if (this._proxy && !this._config['browser']['proxy'])
                this._browser.setProxy(this._proxy.getProxyConfig());
        }
        if (this._browser)
            this._driver = await this._browser.setupDriver();

        this._app = new App(this, this._config['host']);
        await this._app.load();
        return Promise.resolve();
    }

    async teardown() {
        if (this._browser && this._driver) {
            await this._browser.teardown();
            this._browser = null;
            this._driver = null;
        }
        if (this._proxy) {
            await this._proxy.teardown();
            this._proxy = null;
        }
        this._app = null;
        return Promise.resolve();
    }

    getConfig() {
        return this._config;
    }

    getProxy() {
        return this._proxy;
    }

    setProxy(proxy) {
        this._proxy = proxy;
    }

    getBrowser() {
        return this._browser;
    }

    getApp(host) {
        if (host)
            return new App(this, host);
        else
            return this._app;
    }
}

module.exports = TestHelper;