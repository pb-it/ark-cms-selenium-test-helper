//const assert = require('assert');
const webdriver = require('selenium-webdriver');

class Form {

    _helper
    _driver;

    _element;

    constructor(helper, element) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._element = element;
    }

    async getFormInput(name) {
        //var formentries = await form.findElements(webdriver.By.xpath('./child::*'));
        // '//form/child::input[@type='password']'
        // '//form/input[@type='password']'
        var input;
        const xpath = `./div[@class="formentry"]/div[@class="value"]/input[@name="${name}"] | 
        ./div[@class="formentry"]/div[@class="value"]/textarea[@name="${name}"]`;
        var elements = await this._element.findElements(webdriver.By.xpath(xpath));
        if (elements && elements.length == 1)
            input = elements[0];
        return Promise.resolve(input);
    }
}

module.exports = Form;