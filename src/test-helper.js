//const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');
//const remote = require('selenium-webdriver/remote');

const Browser = require('./browser.js');

const App = require('./app.js');
const ApiController = require('./controller/api-controller.js');
const ModelController = require('./controller/model-controller.js');
const ExtensionController = require('./controller/extension-controller.js');

class TestHelper {

    static delay = ms => new Promise(res => setTimeout(res, ms));

    _config;
    _browser;
    _driver;

    _app;
    _apiController;
    _modelController;
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

        this._app = new App(this, this._config['host']);
        await this._app.load();
        this._apiController = new ApiController(this);
        this._modelController = new ModelController(this);
        this._extensionController = new ExtensionController(this);
        return Promise.resolve();
    }

    getConfig() {
        return this._config;
    }

    getBrowser() {
        return this._browser;
    }

    getApp() {
        return this._app;
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

    async getForm(element) {
        var form;
        var elements = await element.findElements(webdriver.By.xpath('.//form[contains(@class, "crudform")]'));
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
            elements = await element.findElements(webdriver.By.xpath(`.//button[text()="${text}" and not(ancestor::div[@class="formentry"])]`));
        else
            elements = await element.findElements(webdriver.By.xpath(`.//button[text()="${text}"]`));
        if (elements && elements.length == 1)
            button = elements[0];
        return Promise.resolve(button);
    }
}

module.exports = TestHelper;