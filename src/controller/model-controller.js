//const path = require('path');
const fs = require('fs');

const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');
//const remote = require('selenium-webdriver/remote');

const sleep = require('util').promisify(setTimeout);

class ModelController {

    _helper
    _driver;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();
    }

    async addModel(model) {
        const response = await this._driver.executeAsyncScript(async (data) => {
            const callback = arguments[arguments.length - 1];

            var res;
            try {
                /*const controller = app.getController();
                const ac = controller.getApiController().getApiClient();
                const version = controller.getVersionController().getAppVersion();
                res = ac.requestData('PUT', '_model?v=' + version, null, model);*/

                const model = new XModel(data);
                res = await model.uploadData(true, true);
            } catch (error) {
                console.log(error);
                res = error;
            } finally {
                callback(res);
            }
        }, model);
        return Promise.resolve(response);
    }
}

module.exports = ModelController;