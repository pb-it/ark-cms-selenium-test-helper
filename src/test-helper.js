//const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');
//const remote = require('selenium-webdriver/remote');

const Browser = require('./browser.js');

const App = require('./app.js');

class TestHelper {

    static delay = ms => new Promise(res => setTimeout(res, ms));

    _config;
    _browser;
    _driver;

    _app;

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

        this._app = new App(this, this._config['host']);
        await this._app.load();
        return Promise.resolve();
    }

    async teardown() {
        if (this._browser && this._driver) {
            await this._browser.teardown();
            this._driver = null;
        }
        this._app = null;
        return Promise.resolve();
    }

    getConfig() {
        return this._config;
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